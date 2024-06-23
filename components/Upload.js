import { storeToRefs } from 'pinia'
import { useDataStore } from '../dataStore.js'

export default {
  data() {
    return {
      textInput: '',
      textSent: false,
    }
  },

  methods: {
    async sendFiles() { // Send the file meta and content
      this.sendFileUtil.sendFiles(this.$refs.fileInput.files, this.sendCore)
    },

    onFileDrop(event) { // Handle file drop event
      if (!this.isConnectSuccess) return
      event.preventDefault()
      this.$refs.fileInput.files = event.dataTransfer.files
      this.sendFiles()
    },

    onFileClick() { // Handle file input click event
      if (!this.isConnectSuccess) return
      this.$refs.fileInput.click()
    },

    onCameraClick() { // Handle camera click event
      if (!this.isConnectSuccess) return
      this.sendFileUtil.takePhoto(this.sendCore)
    },

    onTextClick() { // Handle text send event
      if (!this.isConnectSuccess) return
      this.sendTextUtil.sendText(this.textInput, this.sendCore)
      this.textSent = true
      setTimeout(() => {
        this.textSent = false
        this.textInput = ''
      }, 2000)
    },
  },

  setup() {
    const dataStore = useDataStore()

    const { sendCore, sendFileUtil, sendTextUtil, isConnectSuccess } = storeToRefs(dataStore)

    return {
      dataStore,
      sendCore,
      sendFileUtil,
      sendTextUtil,
      isConnectSuccess,
    }
  },

  template: /*html*/`
    <div id="upload" class="upload">
      <div id="dropzone" class="dropzone" @dragover.prevent @drop="onFileDrop" @click="onFileClick" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }">
        <input type="file" id="fileInput" title="Choose a file to send" multiple
          @change="sendFiles" ref="fileInput" :disabled="!isConnectSuccess">
        <span class="mdi mdi-cloud-upload-outline"></span>
        <p id="fileName">{{ sendFileUtil.currentFileName }}</p>
        <progress id="fileProgress" :value="sendFileUtil.offset" :max="sendFileUtil.currentFileSize"></progress>
      </div>
      <div id="camera" class="camera disabled" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }" @click="onCameraClick">
        <span class="mdi mdi-camera"></span>
      </div>
      <div id="text" class="text" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }">
        <textarea id="textInput" placeholder="Type a message to send" :disabled="!isConnectSuccess" v-model="textInput" ref="textInput"></textarea>
        <button id="sendButton" class="mdi" :class="{ 'mdi-send' : !textSent, 'mdi-check-bold' : textSent }" :disabled="!isConnectSuccess" @click="onTextClick"></button>
      </div>
    </div>
  `,
}
