import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useConnectStore } from './connect.js'

export const useReceiveStore = defineStore('receive', () => {
  const connectStore = useConnectStore()

  const { peerConnection } = storeToRefs(connectStore)

  const downloadFileItems = ref([])

  function addDownloadFileItem(url, name, size, progress, type) {
    downloadFileItems.value.push({
      url,
      name,
      size,
      progress,
      type,
    })

    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  function updateFileProgress(index, progress) {
    downloadFileItems.value[index].progress = progress

    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  function updateFileUrl(index, url) {
    downloadFileItems.value[index].url = url

    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  function updateFileSuccess(index, success) {
    downloadFileItems.value[index].success = success

    downloadFileItems.value = [...downloadFileItems.value] // trigger reactivity
  }

  let receivedDataArray = []
  let receivedData = []
  let currentFileType = ''
  let currentFileName = ''
  let currentFileSize = 0
  let currentFileProgress = 0
  let currentFileUrl = ''

  let fileTypeQueue = []
  let fileNameQueue = []
  let fileSizeQueue = []

  let currentReceivingFileNo = -1

  function receiveFiles() {
    peerConnection.value.ondatachannel = event => {
      initReceiveBuffer()

      const receiveChannel = event.channel

      receiveChannel.onopen = () => {
        // console.log(`[INFO] Receive channel opened`)
      }

      receiveChannel.onerror = error => {
        console.error(`[ERR] Receive channel error: ${error}`)
      }

      receiveChannel.onclose = () => {
        // console.log(`[INFO] Receive channel closed`)
        window.location.reload()
      }

      receiveChannel.onmessage = event => {
        // console.log(`[INFO] Channel received message`)
        handleReceiveChannelMsg(event)
      }
    }
  }

  const metaPrefix = 'CONTENT_META'
  const metaPrefixBytes = new TextEncoder().encode(metaPrefix)

  async function handleReceiveChannelMsg(event) {
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

  async function handleFileMeta(data) {
    if (parseInt(data)) {
      // console.log(`[INFO] Received size: ${data}`);
      fileSizeQueue.push(parseInt(data))
    } else {
      if (
        data === 'TRANSFER_TYPE_FILE' ||
        data === 'TRANSFER_TYPE_TEXT' ||
        data === 'TRANSFER_TYPE_PHOTO'
      ) {
        // console.log(`[INFO] Received type: ${data}`);
        fileTypeQueue.push(data)
      } else {
        // console.log(`[INFO] Received name: ${data}`);
        fileNameQueue.push(data)
      }
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

  function handleFileContent(data) {
    if (!currentFileName && fileNameQueue.length > 0) {
      currentFileType = fileTypeQueue.shift()
      currentFileName = fileNameQueue.shift()
      currentFileSize = fileSizeQueue.shift()
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
