import { ref, Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { ItemDisplayProps } from '@/types'
import { FileProtocol } from '@/utils/fileProtocol'
import { FileChunkManager } from '@/utils/fileChunk'
import { RetryManager } from '@/utils/retryManager'
import { playNotificationSound } from '@/utils/soundNotification'
import type {
  FileReceiveState,
  PendingMeta,
  RetryData,
} from '@/types/fileTransfer'

export const useReceiveStore = defineStore('receive', () => {
  const connectStore = useConnectStore()
  const { peerConnection } = storeToRefs(connectStore)

  // State variables
  const downloadFileItems: Ref<ItemDisplayProps[]> = ref([])
  const activeFiles = new Map<string, FileReceiveState>()
  const pendingMeta: PendingMeta = {
    types: [],
    names: [],
    sizes: [],
    ids: [],
  }

  let receiveChannel: RTCDataChannel | null = null
  let retryManager: RetryManager | null = null

  // UI state management functions
  function addDownloadFileItem(
    url: string,
    name: string,
    size: number,
    progress: number,
    type: string,
  ) {
    downloadFileItems.value.push({
      url,
      name,
      size,
      progress,
      type,
    })
    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  function updateFileProgress(index: number, progress: number) {
    downloadFileItems.value[index].progress = progress
    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  function updateFileUrl(index: number, url: string) {
    downloadFileItems.value[index].url = url
    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  function updateFileSuccess(index: number, success: boolean) {
    downloadFileItems.value[index].success = success
    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  // Retry request sending function
  function sendRetryRequest(retryData: RetryData): void {
    if (receiveChannel && receiveChannel.readyState === 'open') {
      const message = FileProtocol.encodeRetryMessage(retryData)
      receiveChannel.send(message)
    }
  }

  // Main receive function
  function receiveFiles() {
    if (!peerConnection.value) {
      console.error('[ERR] Peer connection not ready')
      return
    }

    peerConnection.value.ondatachannel = (event: RTCDataChannelEvent) => {
      initReceiveBuffer()

      receiveChannel = event.channel

      // Initialize retry manager
      retryManager = new RetryManager(activeFiles, sendRetryRequest)
      retryManager.startTimeoutCheck()

      receiveChannel.onopen = () => {
        console.log(`[INFO] Receive channel opened`)
      }

      receiveChannel.onerror = (error: Event) => {
        console.error(`[ERR] Receive channel error: ${error}`)
      }

      receiveChannel.onclose = () => {
        console.log(`[INFO] Receive channel closed`)
        if (retryManager) {
          retryManager.destroy()
        }
        window.location.reload()
      }

      receiveChannel.onmessage = (event: MessageEvent) => {
        handleReceiveChannelMsg(event)
      }
    }
  }

  // Message handling function
  async function handleReceiveChannelMsg(event: MessageEvent) {
    const message = FileProtocol.parseMessage(event.data)

    switch (message.type) {
      case 'meta':
        if (typeof message.data === 'string') {
          await handleFileMeta(message.data)
        } else {
          console.error('[ERR] Expected string data for meta message')
        }
        break
      case 'retry':
        if (typeof message.data === 'string') {
          handleRetryRequest(message.data)
        } else {
          console.error('[ERR] Expected string data for retry message')
        }
        break
      case 'content':
        if (message.data instanceof ArrayBuffer) {
          handleFileContent(message.data)
        } else {
          console.error('[ERR] Expected ArrayBuffer data for content message')
        }
        break
    }
  }

  // Retry request handling
  function handleRetryRequest(data: string) {
    const retryData = FileProtocol.parseRetryData(data)
    if (retryData) {
      console.log(
        `[INFO] Received retry request for file: ${retryData.fileName}`,
      )
      // This is temporarily only logged, the actual resend logic should be implemented on the sender side
    }
  }

  // File metadata handling
  async function handleFileMeta(data: string) {
    const metaType = data[0] as 's' | 't' | 'n' | 'i'
    const metaValue = data.slice(1)

    switch (metaType) {
      case 's':
        pendingMeta.sizes.push(parseInt(metaValue))
        break
      case 't':
        pendingMeta.types.push(metaValue)
        break
      case 'n':
        pendingMeta.names.push(metaValue)
        break
      case 'i':
        pendingMeta.ids.push(metaValue)
        break
      default:
        console.error(`[ERR] Invalid meta type: ${metaType}`)
        break
    }

    // When complete file metadata is collected, create new file receive state
    if (
      pendingMeta.names.length === pendingMeta.sizes.length &&
      pendingMeta.names.length === pendingMeta.types.length &&
      pendingMeta.names.length === pendingMeta.ids.length &&
      pendingMeta.names.length > 0
    ) {
      const type = pendingMeta.types.shift()!
      const name = pendingMeta.names.shift()!
      const size = pendingMeta.sizes.shift()!
      const fileId = pendingMeta.ids.shift()!

      console.log(
        `[INFO] ===New file to receive: ${type} | ${name} | ${size} | ID: ${fileId}===`,
      )

      // Add to display list
      addDownloadFileItem('javascript:void(0)', name, size, 0, type)

      const arrayIndex = downloadFileItems.value.length - 1

      // Create file receive state
      const expectedChunks = FileChunkManager.calculateExpectedChunks(size)
      const fileState: FileReceiveState = {
        id: fileId,
        type,
        name,
        size,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex,
        expectedChunks,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      activeFiles.set(fileId, fileState)

      // If it's text type, mark as successful directly
      if (type === 'TRANSFER_TYPE_TEXT') {
        fileState.isComplete = true
        updateFileSuccess(arrayIndex, true)
      }
    }
  }

  // File content handling
  function handleFileContent(data: ArrayBuffer) {
    const chunkData = FileProtocol.parseFileChunk(data)
    const currentFile = activeFiles.get(chunkData.fileId)

    if (!currentFile) {
      console.error(`[ERR] Cannot find file state for ID: ${chunkData.fileId}`)
      return
    }

    if (currentFile.isComplete) {
      console.warn(
        `[WARN] Received chunk for already completed file: ${currentFile.name}`,
      )
      return
    }

    // Update last activity time
    if (retryManager) {
      retryManager.updateFileActivity(currentFile)
    }

    console.log(
      `[INFO] ===Receiving chunk ${chunkData.chunkIndex} for file ${currentFile.name} (ID: ${chunkData.fileId})===`,
    )

    // Add chunk data (avoid duplicate progress calculation)
    if (!currentFile.receivedChunks[chunkData.chunkIndex]) {
      currentFile.progress += chunkData.data.byteLength
    }

    currentFile.receivedChunks[chunkData.chunkIndex] = chunkData.data

    // Update display progress
    updateFileProgress(currentFile.arrayIndex, currentFile.progress)

    // Check if file reception is complete
    if (currentFile.progress === currentFile.size) {
      // Check if all chunks have been received
      const allChunksReceived = FileChunkManager.checkChunksComplete(
        currentFile.receivedChunks,
        currentFile.expectedChunks,
      )

      if (allChunksReceived) {
        // Merge all chunks
        const receivedData = currentFile.receivedChunks
        let fileUrl: string

        // Check if it's an SVG file
        if (currentFile.name.endsWith('.svg')) {
          const blob = FileChunkManager.mergeChunksWithType(
            receivedData,
            'image/svg+xml',
          )
          fileUrl = URL.createObjectURL(blob)
        } else {
          const blob = FileChunkManager.mergeChunks(receivedData)
          fileUrl = URL.createObjectURL(blob)
        }

        currentFile.url = fileUrl
        currentFile.isComplete = true

        updateFileUrl(currentFile.arrayIndex, fileUrl)
        updateFileSuccess(currentFile.arrayIndex, true)

        console.log(`[INFO] File ${currentFile.name} received successfully`)

        // Play notification sound when file is received
        playNotificationSound()
      } else if (retryManager) {
        // Although size matches but chunks are missing, request retry
        console.warn(
          `[WARN] File ${currentFile.name} size matches but chunks are missing`,
        )
        retryManager.requestMissingChunks(currentFile)
      }
    }
  }

  // Initialize receive buffer
  function initReceiveBuffer() {
    // Clean up all active file states
    activeFiles.clear()

    // Clean up pending metadata
    pendingMeta.types = []
    pendingMeta.names = []
    pendingMeta.sizes = []
    pendingMeta.ids = []

    // Clean up retry manager
    if (retryManager) {
      retryManager.destroy()
      retryManager = null
    }
  }

  return {
    downloadFileItems,
    receiveFiles,
  }
})
