import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useConnectStore } from './connect.js'

export const useSendStore = defineStore('send', () => {
  const connectStore = useConnectStore()
  const { pubKey, sendChannel, maxBufferedAmount } = storeToRefs(connectStore)

  let sendProgress = 0
  let chunkQueue = []

  async function sendData(data) {
    chunkQueue.push(data)

    await processQueue()
  }

  async function processQueue() {
    while (
      chunkQueue.length > 0 &&
      sendChannel.value.bufferedAmount <= maxBufferedAmount.value
    ) {
      let chunk = chunkQueue.shift()

      if (!(chunk instanceof ArrayBuffer) && !ArrayBuffer.isView(chunk)) {
        chunk = new TextEncoder().encode(chunk)
      }

      const encryptedChunk = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        pubKey.value,
        chunk,
      )

      sendChannel.value.send(encryptedChunk)

      if (chunk.byteLength) {
        sendProgress += chunk.byteLength
      }
    }
  }

  let currentFileType = ''
  const currentFileName = ref('Drop file here or click to upload')
  const currentFileSize = ref(0)
  const chunkSize = 16384
  let fileReader = null
  const offset = ref(0)

  async function sendFiles(files, type) {
    // Send the file meta and content
    console.log(`[INFO] ===Sending ${files.length} files===`)

    console.log(`files: ${files}`)

    const fileNum = files.length

    if (fileNum === 0) {
      console.error(`[ERR] No file selected`)
      return
    }

    for (let i = 0; i < fileNum; i++) {
      await sendFileMeta(files[i], type)
    }

    for (let i = 0; i < fileNum; i++) {
      await sendFileContent(files[i], type)
    }
  }

  async function sendFileMeta(file, type) {
    // Send the type, name, and size of the file
    console.log(`file: ${file}`)
    if (!checkSendFileAvailability(file.size)) return

    await sendData('CONTENT_META' + type)
    await sendData('CONTENT_META' + file.name)
    await sendData('CONTENT_META' + file.size)

    console.log(`[INFO] Sent meta: ${type} | ${file.name} | ${file.size}`)
  }

  async function sendFileContent(file, type) {
    if (!checkSendFileAvailability(file.size)) return

    currentFileType = type
    currentFileName.value = file.name
    currentFileSize.value = file.size

    console.log(`[INFO] Sending file ${currentFileType} | ${currentFileName.value} | ${currentFileSize.value}`)

    if (fileReader === null) {
      await addFileReader()
    }

    const readAndSendSlice = o => {
      return new Promise((resolve, reject) => {
        if (o >= currentFileSize.value) {
          resolve()
          return
        }

        fileReader.onload = async e => {
          try {
            await sendData(e.target.result)
            offset.value += e.target.result.byteLength
            if (offset.value < currentFileSize.value) {
              resolve(readAndSendSlice(offset.value))
            } else {
              resolve()
            }
          } catch (error) {
            console.error(`[ERR] Error sending data: ${error}`)
            reject(error)
          }
        }

        fileReader.onerror = error => {
          console.error(`[ERR] FileReader error: ${error}`)
          reject(error)
        }

        const slice = file.slice(o, o + chunkSize)
        fileReader.readAsArrayBuffer(slice)
      })
    }

    offset.value = 0

    try {
      await readAndSendSlice(0)
    } catch (error) {
      console.error(`[ERR] Error in readAndSendSlice: ${error}`)
    }
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

  function checkSendFileAvailability(size) {
    // Check if the file is empty or the data channel is open
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

  async function sendText(text) {
    // Send the file meta and content
    console.log(`[INFO] ===Sending text===`)

    await sendTextContent(text)
  }

  async function sendTextContent(text) {
    // Send the type, name, and size of the file
    if (!checkSendTextAvailability(text)) return

    await sendData('CONTENT_META' + 'TRANSFER_TYPE_TEXT')
    await sendData('CONTENT_META' + text)
    await sendData('CONTENT_META' + text.length)

    console.log(
      `[INFO] Sent content: ${'TRANSFER_TYPE_TEXT'} | ${text} | ${text.length}`,
    )
  }

  function checkSendTextAvailability(text) { // Check if the text.valuepty or the data channel is open
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
    currentFileName,
    currentFileSize,
    offset,
    sendFiles,
    sendText,
  }
})
