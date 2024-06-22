import { storeToRefs } from 'pinia'
import { useDataStore } from '../dataStore.js'

export default {
  methods: {
    async sendFiles() { // Send the file meta and content
      this.sendFileUtil.sendFiles(this.$refs.fileInput.files, this.sendCore)
    },

    onDrop(event) { // Handle file drop event
      if (!this.isConnectSuccess) return
      event.preventDefault()
      this.$refs.fileInput.files = event.dataTransfer.files
      this.sendFiles()
    },

    onClick() { // Handle file input click event
      if (!this.isConnectSuccess) return
      this.$refs.fileInput.click()
    },
  },

  setup() {
    const dataStore = useDataStore()

    const { sendCore, sendFileUtil, isConnectSuccess } = storeToRefs(dataStore)

    return {
      dataStore,
      sendCore,
      sendFileUtil,
      isConnectSuccess,
    }
  },

  template: /*html*/`
    <div id="dropzone" class="dropzone" @dragover.prevent @drop="onDrop" @click="onClick" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }">
      <input type="file" id="fileInput" title="Choose a file to send" multiple
        @change="sendFiles" ref="fileInput" :disabled="!isConnectSuccess">
      <span class="mdi mdi-cloud-upload-outline"></span>
      <p id="fileName">{{ sendFileUtil.currentFileName }}</p>
      <progress id="fileProgress" :value="sendFileUtil.offset" :max="sendFileUtil.currentFileSize"></progress>
    </div>
  `,
}
