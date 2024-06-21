import { storeToRefs } from 'pinia'
import { useDataStore } from '../dataStore.js'

export default {
  data() {
    return {
      fileName: 'Drop file here or click to upload',
      fileSize: 0,
      chunkSize: 16384, // 16KB
      offset: 0,
    }
  },

  methods: {
    async sendFiles() {
      const files = this.$refs.fileInput.files
      if (!files.length) {
        console.error(`[ERR] No file selected`)
        return
      }

      for (const file of files) {
        await this.sendFile(file)
      }
    },

    async sendFile(file) {
      if (file.size === 0) {
        console.error(`[ERR] File is empty`)
        return
      }

      console.log(`[INFO] Sending file ${file.name} with size ${file.size}`)

      if (this.getChannelState() !== 'open') {
        console.error('[ERR] Data channel is not open')
        return
      }

      this.fileName = file.name
      this.fileSize = file.size

      this.sendData(this.fileName)
      this.sendData(this.fileSize)

      const fileReader = new FileReader()
      this.offset = 0

      fileReader.addEventListener('error', (error) => {
        console.error(`[ERR] Error reading file: ${error}`)
      })

      fileReader.addEventListener('abort', (event) => {
        console.log(`[INFO] File reading aborted: ${event}`)
      })

      fileReader.addEventListener('load', async (e) => {
        this.sendData(e.target.result)
        this.offset += e.target.result.byteLength
        fileProgress.value = this.offset
        if (this.offset < this.fileSize) {
          readSlice(this.offset)
        }
      })

      const readSlice = (o) => {
        const slice = file.slice(this.offset, o + this.chunkSize)
        fileReader.readAsArrayBuffer(slice)
      }

      readSlice(0)
    },

    onDrop(event) {
      if (!this.isConnectSuccess) return
      event.preventDefault()
      this.$refs.fileInput.files = event.dataTransfer.files
      this.sendFiles()
    },

    onClick() {
      if (!this.isConnectSuccess) return
      this.$refs.fileInput.click()
    },
  },

  setup() {
    const dataStore = useDataStore()
    const { sendChannel, isConnectSuccess } = storeToRefs(dataStore)

    const getChannelState = () => {
      return dataStore.getChannelState()
    }

    const getChannelAmount = () => {
      return dataStore.getChannelAmount()
    }

    const sendData = (data) => {
      dataStore.sendData(data)
    }

    return {
      sendChannel,
      isConnectSuccess,
      getChannelState,
      getChannelAmount,
      sendData,
    }
  },

  template: /*html*/`
    <div id="dropzone" class="dropzone" @dragover.prevent @drop="onDrop" @click="onClick" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }">
      <input type="file" id="fileInput" title="Choose a file to send" multiple
        @change="sendFiles" ref="fileInput" :disabled="!isConnectSuccess">
      <span class="mdi mdi-cloud-upload-outline"></span>
      <p id="fileName">{{ fileName }}</p>
      <progress id="fileProgress" :value="offset" :max="fileSize"></progress>
    </div>
  `,
}
