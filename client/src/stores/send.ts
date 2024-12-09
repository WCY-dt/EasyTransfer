import { ref, Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { ItemDisplayProps } from '@/types'

export const useSendStore = defineStore('send', () => {
  const connectStore = useConnectStore()
  const { sendChannels } = storeToRefs(connectStore)

  const uploadFileItems: Ref<ItemDisplayProps[]> = ref([])

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

  async function updateFileProgress(index: number, progress: number) {
    uploadFileItems.value[index].progress = progress

    uploadFileItems.value = [...uploadFileItems.value] // trigger reactivity
  }

  async function updateFileUrl(index: number, url: string) {
    uploadFileItems.value[index].url = url

    uploadFileItems.value = [...uploadFileItems.value] // trigger reactivity
  }

  async function updateFileSuccess(index: number, success: boolean) {
    uploadFileItems.value[index].success = success

    uploadFileItems.value = [...uploadFileItems.value] // trigger reactivity
  }

  let currentSendingFileNo = -1

  let chunkQueue: (ArrayBuffer | Uint8Array | string)[] = []

  for (let i = 0; i < sendChannels.value.length; i++) {
    sendChannels.value[i].onbufferedamountlow = async () => {
      await processQueue()
    }
  }

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

  let currentFileType = ''
  const currentFileName: Ref<string> = ref('Drop file here or click to upload')
  const currentFileSize: Ref<number> = ref(0)
  const chunkSize = 16384
  let fileReader: FileReader | null = null
  const offset: Ref<number> = ref(0)

  async function sendFiles(files: File[], type: string) {
    const fileNum = files.length

    if (fileNum === 0) {
      console.error(`[ERR] No file selected`)
      return
    }

    for (let i = 0; i < fileNum; i++) {
      if (checkSendFileAvailability(files[i].size)) {
        await sendFileMeta(files[i], type)
      }
    }

    for (let i = 0; i < fileNum; i++) {
      if (checkSendFileAvailability(files[i].size)) {
        await sendFileContent(files[i], type)
      }
    }
  }

  async function sendFileMeta(file: File, type: string) {
    await sendData('CONTENT_META' + type, true)
    await sendData('CONTENT_META' + file.name, true)
    await sendData('CONTENT_META' + file.size, true)

    addUploadFileItem('javascript:void(0)', file.name, file.size, 0, type)
  }

  async function sendFileContent(file: File, type: string) {
    currentSendingFileNo++

    currentFileType = type
    currentFileName.value = file.name
    currentFileSize.value = file.size

    console.log(
      `[INFO] Sending file ${currentFileType} | ${currentFileName.value} | ${currentFileSize.value}`,
    )

    await addFileReader()

    const slices = sliceFile(file)
    await sendSlices(slices, file)
  }

  function sliceFile(file: File): Blob[] {
    const slices: Blob[] = []
    let offset = 0

    while (offset < file.size) {
      const slice = file.slice(offset, offset + chunkSize - 2)
      slices.push(slice)
      offset += chunkSize - 2
    }

    return slices
  }

  async function sendSlices(slices: Blob[], file: File) {
    const promises = slices.map((slice, idx) => {
      return new Promise<void>((resolve, reject) => {
        const fileReader = new FileReader()

        fileReader.onload = async e => {
          const currentChunkIdxArray = new Uint8Array(2)
          currentChunkIdxArray[0] = (idx & 0xff00) >> 8
          currentChunkIdxArray[1] = idx & 0xff

          const dataArray = new Uint8Array(
            (e.target?.result as ArrayBuffer).byteLength + 2,
          )
          dataArray.set(currentChunkIdxArray, 0)
          dataArray.set(new Uint8Array(e.target?.result as ArrayBuffer), 2)

          await sendData(dataArray)
          offset.value =
            offset.value + (e.target?.result as ArrayBuffer).byteLength

          if (offset.value < currentFileSize.value) {
            await updateFileProgress(currentSendingFileNo, offset.value)
          } else {
            await updateFileProgress(
              currentSendingFileNo,
              currentFileSize.value,
            )
            await updateFileUrl(currentSendingFileNo, URL.createObjectURL(file))
            await updateFileSuccess(currentSendingFileNo, true)
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

  async function addFileReader() {
    fileReader = new FileReader()

    fileReader.addEventListener('error', error => {
      console.error(`[ERR] Error reading file: ${error}`)
    })

    fileReader.addEventListener('abort', event => {
      console.log(`[INFO] File reading aborted: ${event}`)
    })
  }

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

  async function sendText(text: string) {
    await sendTextContent(text)
  }

  async function sendTextContent(text: string) {
    if (!checkSendTextAvailability(text)) return

    await sendData('CONTENT_META' + 'TRANSFER_TYPE_TEXT', true)
    await sendData('CONTENT_META' + text, true)
    await sendData('CONTENT_META' + text.length, true)

    addUploadFileItem(
      'javascript:void(0)',
      text,
      text.length,
      text.length,
      'TRANSFER_TYPE_TEXT',
    )

    currentSendingFileNo++

    updateFileSuccess(currentSendingFileNo, true)
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
