import { ref, Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { ItemDisplayProps } from '@/types'

export const useReceiveStore = defineStore('receive', () => {
  const connectStore = useConnectStore()

  const { peerConnection } = storeToRefs(connectStore)

  const downloadFileItems: Ref<ItemDisplayProps[]> = ref([])

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

  let receivedDataArray: ArrayBuffer[] = []
  let receivedData: ArrayBuffer[] = []
  let currentFileType = ''
  let currentFileName = ''
  let currentFileSize = 0
  let currentFileProgress = 0
  let currentFileUrl = ''

  let fileTypeQueue: string[] = []
  let fileNameQueue: string[] = []
  let fileSizeQueue: number[] = []

  let currentReceivingFileNo = -1

  function receiveFiles() {
    if (!peerConnection.value) {
      console.error('[ERR] Peer connection not ready')
      return
    }

    peerConnection.value.ondatachannel = (event: RTCDataChannelEvent) => {
      initReceiveBuffer()

      const receiveChannel = event.channel

      receiveChannel.onopen = () => {
        // console.log(`[INFO] Receive channel opened`)
      }

      receiveChannel.onerror = (error: Event) => {
        console.error(`[ERR] Receive channel error: ${error}`)
      }

      receiveChannel.onclose = () => {
        // console.log(`[INFO] Receive channel closed`)
        window.location.reload()
      }

      receiveChannel.onmessage = (event: MessageEvent) => {
        // console.log(`[INFO] Channel received message`)
        handleReceiveChannelMsg(event)
      }
    }
  }

  const metaPrefix = 'CONTENT_META'
  const metaPrefixBytes = new TextEncoder().encode(metaPrefix)

  async function handleReceiveChannelMsg(event: MessageEvent) {
    const dataView = new DataView(event.data)

    let isMeta = true

    // 检查前缀字节是否匹配
    for (let i = 0; i < metaPrefixBytes.length; i++) {
      if (dataView.getUint8(i) !== metaPrefixBytes[i]) {
        isMeta = false
        break
      }
    }

    if (isMeta) {
      const decodedData = new TextDecoder().decode(event.data)
      const data = decodedData.slice(metaPrefix.length)
      await handleFileMeta(data)
    } else {
      handleFileContent(event.data)
    }
  }

  async function handleFileMeta(data: string) {
    const metaType = data[0]
    data = data.slice(1)

    switch (metaType) {
      case 's':
        fileSizeQueue.push(parseInt(data))
        break
      case 't':
        fileTypeQueue.push(data)
        break
      case 'n':
        fileNameQueue.push(data)
        break
      default:
        console.error(`[ERR] Invalid meta type: ${metaType}`)
        break
    }

    if (
      fileNameQueue.length === fileSizeQueue.length &&
      fileNameQueue.length === fileTypeQueue.length
    ) {
      // console.log(
      //   `[INFO] ===New to receive ${fileTypeQueue[fileTypeQueue.length - 1]} | ${fileNameQueue[fileNameQueue.length - 1]} | ${fileSizeQueue[fileSizeQueue.length - 1]}===`,
      // );

      addDownloadFileItem(
        'javascript:void(0)',
        fileNameQueue[fileNameQueue.length - 1],
        fileSizeQueue[fileSizeQueue.length - 1],
        0,
        fileTypeQueue[fileTypeQueue.length - 1],
      )

      if (fileTypeQueue[fileTypeQueue.length - 1] === 'TRANSFER_TYPE_TEXT') {
        fileTypeQueue.shift()
        fileNameQueue.shift()
        fileSizeQueue.shift()
        currentReceivingFileNo++

        updateFileSuccess(currentReceivingFileNo, true)
      }
    }
  }

  function handleFileContent(data: ArrayBuffer) {
    if (!currentFileName && fileNameQueue.length > 0) {
      currentFileType = fileTypeQueue.shift()!
      currentFileName = fileNameQueue.shift()!
      currentFileSize = fileSizeQueue.shift()!
      currentReceivingFileNo++

      console.log(
        `[INFO] ===Receiving file ${currentFileType} | ${currentFileName} | ${currentFileSize}===`,
      )
    }

    // receive file
    // console.log(`[INFO] data: ${data}`);
    const dataView = new DataView(data)
    const currentChunkIdx = dataView.getUint16(0, false)
    const currentChunkData = data.slice(2)

    if (!receivedDataArray[currentChunkIdx]) {
      currentFileProgress += currentChunkData.byteLength
    }

    // console.log(`[INFO] Received ${currentFileProgress} of ${currentFileSize} (chunk: ${currentChunkIdx})`);

    receivedDataArray[currentChunkIdx] = currentChunkData

    updateFileProgress(currentReceivingFileNo, currentFileProgress)

    // console.log(receivedDataArray.map((item, index) => item ? index : null).filter(item => item !== null));

    // console.log(`[INFO] Received ${currentFileProgress} of ${currentFileSize} (chunk: ${currentChunkIdx})`);

    // check if file is fully received
    if (currentFileProgress === currentFileSize) {
      receivedData = receivedDataArray
      currentFileUrl = URL.createObjectURL(new Blob(receivedData))
      // check if is svg file
      if (currentFileName.endsWith('.svg')) {
        currentFileUrl = URL.createObjectURL(
          new Blob(receivedData, { type: 'image/svg+xml' }),
        )
      }
      updateFileUrl(currentReceivingFileNo, currentFileUrl)
      updateFileSuccess(currentReceivingFileNo, true)

      // console.log(`[INFO] File ${currentFileName} received successfully`);

      initReceiveBuffer()
    }
  }

  function initReceiveBuffer() {
    receivedDataArray = []
    receivedData = []

    currentFileType = ''
    currentFileName = ''
    currentFileSize = 0
    currentFileProgress = 0
    currentFileUrl = ''
  }

  return {
    downloadFileItems,
    receiveFiles,
  }
})
