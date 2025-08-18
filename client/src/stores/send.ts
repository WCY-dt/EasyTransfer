import { ref, Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { ItemDisplayProps } from '@/types'
import { FileProtocol } from '@/utils/fileProtocol'
import { FileChunkManager } from '@/utils/fileChunk'
import type { SentFileInfo, RetryData } from '@/types/fileTransfer'

export const useSendStore = defineStore('send', () => {
  const connectStore = useConnectStore()
  const { sendChannels } = storeToRefs(connectStore)

  // State variables
  const uploadFileItems: Ref<ItemDisplayProps[]> = ref([])
  const sentFiles = new Map<string, SentFileInfo>()
  let chunkQueue: (ArrayBuffer | Uint8Array | string)[] = []
  let currentSendingFileNo = -1

  // File state variables
  let currentFileType = ''
  const currentFileName: Ref<string> = ref('Drop file here or click to upload')
  const currentFileSize: Ref<number> = ref(0)
  let fileReader: FileReader | null = null

  // UI state management functions
  function addUploadFileItem(
    url: string,
    name: string,
    size: number,
    progress: number,
    type: string,
  ) {
    uploadFileItems.value.push({
      url,
      name,
      size,
      progress,
      type,
    })
    uploadFileItems.value = [...uploadFileItems.value] // trigger reactivity
  }

  async function updateFileItemAttirbute<K extends keyof ItemDisplayProps>(
    index: number,
    key: K,
    value: ItemDisplayProps[K],
  ) {
    uploadFileItems.value[index][key] = value
    uploadFileItems.value = [...uploadFileItems.value] // trigger reactivity
  }

  // Initialize send channel event listening
  for (let i = 0; i < sendChannels.value.length; i++) {
    sendChannels.value[i].onbufferedamountlow = async () => {
      await processQueue()
    }

    // Listen for retry requests from receiver
    sendChannels.value[i].onmessage = (event: MessageEvent) => {
      handleRetryRequest(event)
    }
  }

  // Retry request handling
  function handleRetryRequest(event: MessageEvent) {
    const message = FileProtocol.parseMessage(event.data)

    if (message.type === 'retry') {
      if (typeof message.data === 'string') {
        const retryData = FileProtocol.parseRetryData(message.data)
        if (retryData) {
          console.log(
            `[INFO] Received retry request for file: ${retryData.fileName}`,
          )
          resendMissingChunks(retryData)
        }
      } else {
        console.error('[ERR] Expected string data for retry message')
      }
    }
  }

  // Resend missing chunks
  async function resendMissingChunks(retryData: RetryData) {
    const { fileId, fileName, missingChunks } = retryData

    // Find sent file information
    const sentFileInfo = sentFiles.get(fileId)

    if (!sentFileInfo) {
      console.error(`[ERR] Cannot find sent file info for: ${fileName}`)
      return
    }

    console.log(
      `[INFO] Resending ${missingChunks.length} missing chunks for file: ${fileName}`,
    )

    // Resend missing chunks
    for (const chunkIdx of missingChunks) {
      if (chunkIdx < sentFileInfo.slices.length) {
        const slice = sentFileInfo.slices[chunkIdx]

        const fileReader = new FileReader()
        fileReader.onload = async e => {
          const chunkData = e.target?.result as ArrayBuffer
          const encodedChunk = FileProtocol.encodeFileChunk(
            fileId,
            chunkIdx,
            chunkData,
          )
          await sendData(encodedChunk)
          console.log(`[INFO] Resent chunk ${chunkIdx} for file: ${fileName}`)
        }

        fileReader.readAsArrayBuffer(slice)
      }
    }
  }

  // Data sending and queue management
  async function sendData(
    data: ArrayBuffer | Uint8Array | string,
    meta: boolean = false,
  ) {
    chunkQueue.push(data)
    await processQueue(meta)
  }

  async function processQueue(meta?: boolean) {
    let sendChannel = null
    if (meta) {
      sendChannel = sendChannels.value[0]
    } else {
      const sendChannelIdx = Math.floor(
        Math.random() * sendChannels.value.length,
      )
      sendChannel = sendChannels.value[sendChannelIdx]
    }

    while (
      chunkQueue.length > 0 &&
      sendChannel.bufferedAmount <= connectStore.maxBufferedAmount
    ) {
      let chunk = chunkQueue.shift()

      if (!(chunk instanceof ArrayBuffer) && !ArrayBuffer.isView(chunk)) {
        chunk = new TextEncoder().encode(chunk)
      }

      sendChannel.send(new Uint8Array(chunk as ArrayBuffer))
    }
  }

  // Main file sending function
  async function sendFiles(files: File[], type: string) {
    const fileNum = files.length

    if (fileNum === 0) {
      console.error(`[ERR] No file selected`)
      return
    }

    // First send metadata for all files and collect file IDs
    const fileIds: string[] = []
    for (let i = 0; i < fileNum; i++) {
      if (checkSendFileAvailability(files[i].size)) {
        const fileId = await sendFileMeta(files[i], type)
        fileIds.push(fileId)
      }
    }

    // Then send file content
    for (let i = 0; i < fileNum; i++) {
      if (checkSendFileAvailability(files[i].size) && fileIds[i]) {
        await sendFileContent(files[i], type, fileIds[i])
      }
    }
  }

  // Send file metadata
  async function sendFileMeta(file: File, type: string): Promise<string> {
    // Generate file unique identifier
    const fileId = FileChunkManager.generateFileId(file.name, file.size)

    await sendData(FileProtocol.encodeMetaMessage('t', type), true)
    await sendData(FileProtocol.encodeMetaMessage('n', file.name), true)
    await sendData(
      FileProtocol.encodeMetaMessage('s', file.size.toString()),
      true,
    )
    await sendData(FileProtocol.encodeMetaMessage('i', fileId), true)

    addUploadFileItem('javascript:void(0)', file.name, file.size, 0, type)

    return fileId
  }

  // Send file content
  async function sendFileContent(file: File, type: string, fileId: string) {
    currentSendingFileNo++

    currentFileType = type
    currentFileName.value = file.name
    currentFileSize.value = file.size

    console.log(
      `[INFO] Sending file ${currentFileType} | ${currentFileName.value} | ${currentFileSize.value} | ID: ${fileId}`,
    )

    await addFileReader()

    const slices = FileChunkManager.sliceFile(file)

    // Save file information for retry
    sentFiles.set(fileId, {
      file,
      type,
      slices,
      arrayIndex: currentSendingFileNo,
    })

    await sendSlices(slices, file, fileId)
  }

  // Send file slices
  async function sendSlices(slices: Blob[], file: File, fileId: string) {
    let currentOffset = 0 // Use separate offset counter for each file

    const promises = slices.map((slice, idx) => {
      return new Promise<void>((resolve, reject) => {
        const fileReader = new FileReader()

        fileReader.onload = async e => {
          const chunkData = e.target?.result as ArrayBuffer
          const encodedChunk = FileProtocol.encodeFileChunk(
            fileId,
            idx,
            chunkData,
          )

          await sendData(encodedChunk)
          currentOffset += chunkData.byteLength

          if (currentOffset < file.size) {
            await updateFileItemAttirbute(
              currentSendingFileNo,
              'progress',
              currentOffset,
            )
          } else {
            await updateFileItemAttirbute(
              currentSendingFileNo,
              'progress',
              file.size,
            )
            await updateFileItemAttirbute(
              currentSendingFileNo,
              'url',
              URL.createObjectURL(file),
            )
            await updateFileItemAttirbute(currentSendingFileNo, 'success', true)
          }

          resolve()
        }

        fileReader.onerror = error => {
          reject(error)
        }

        fileReader.readAsArrayBuffer(slice)
      })
    })

    await Promise.all(promises)
  }

  // File reader initialization
  async function addFileReader() {
    fileReader = new FileReader()

    fileReader.addEventListener('error', error => {
      console.error(`[ERR] Error reading file: ${error}`)
    })

    fileReader.addEventListener('abort', event => {
      console.log(`[INFO] File reading aborted: ${event}`)
    })
  }

  // File sending availability check
  function checkSendFileAvailability(size: number): boolean {
    if (size === 0) {
      console.error(`[ERR] File is empty`)
      return false
    }

    if (connectStore.getSendChannelState() !== 'open') {
      console.error('[ERR] Data channel is not open')
      return false
    }

    return true
  }

  // Text sending
  async function sendText(text: string) {
    await sendTextContent(text)
  }

  async function sendTextContent(text: string) {
    if (!checkSendTextAvailability(text)) return

    // Generate text unique identifier
    const textId = FileChunkManager.generateFileId(text, text.length)

    await sendData(
      FileProtocol.encodeMetaMessage('t', 'TRANSFER_TYPE_TEXT'),
      true,
    )
    await sendData(FileProtocol.encodeMetaMessage('n', text), true)
    await sendData(
      FileProtocol.encodeMetaMessage('s', text.length.toString()),
      true,
    )
    await sendData(FileProtocol.encodeMetaMessage('i', textId), true)

    addUploadFileItem(
      'javascript:void(0)',
      text,
      text.length,
      text.length,
      'TRANSFER_TYPE_TEXT',
    )

    currentSendingFileNo++

    updateFileItemAttirbute(currentSendingFileNo, 'success', true)
  }

  function checkSendTextAvailability(text: string): boolean {
    if (text === '') {
      console.error('[ERR] Text is empty')
      return false
    }

    if (connectStore.getSendChannelState() !== 'open') {
      console.error('[ERR] Data channel is not open')
      return false
    }

    return true
  }

  return {
    uploadFileItems,
    sendFiles,
    sendText,
    processQueue,
  }
})
