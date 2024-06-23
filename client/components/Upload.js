import { storeToRefs } from 'pinia'
import { useDataStore } from '../dataStore.js'

export default {
  data() {
    return {
      textInput: '',
      textSent: false,
      photoSent: false,
      showCamera: false,
      showStream: false,
    }
  },

  methods: {
    async sendFiles() { // Send the file meta and content
      this.sendFileUtil.sendFiles(this.$refs.fileInput.files, 'TRANSFER_TYPE_FILE', this.sendCore)
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

      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: 'environment' // 'user' for front camera, 'environment' for back camera
          }
        }).then((stream) => {
          window.stream = stream;
          this.$refs.stream.srcObject = stream
          this.showCamera = true
          this.showStream = true
        }).catch((error) => {
          console.error(`[ERR] GetUserMedia error: ${error}`)
          this.showCamera = false
          this.showStream = false
          alert('Please allow camera access to use this feature')
        })
    },

    onSnapshotClick() { // Handle snapshot click event
      console.log('Taking snapshot')
      this.$refs.photo.width = this.$refs.stream.videoWidth
      this.$refs.photo.height = this.$refs.stream.videoHeight
      this.$refs.photo.getContext('2d').drawImage(this.$refs.stream, 0, 0, this.$refs.photo.width, this.$refs.photo.height)
      window.stream.getTracks().forEach(track => track.stop())
      this.showStream = false
    },

    onCameraCloseClick() { // Handle camera close click event
      window.stream.getTracks().forEach(track => track.stop())
      this.showCamera = false
      this.showStream = false
    },

    async processAndSendPhoto() {
      this.$refs.photo.toBlob(async function (blob) {
        const timestamp = new Date().getTime();

        const file = new File(
          [blob], 
          `image_${timestamp}.png`, 
          { type: "image/png" }
        );
        console.log(file);

        await this.sendFileUtil.sendFiles([file], 'TRANSFER_TYPE_PHOTO', this.sendCore);
      }.bind(this), 'image/png');
    },


    async onCameraSendClick() { // Handle camera send click event
      if (!this.isConnectSuccess) return

      this.processAndSendPhoto.call(this);

      this.photoSent = true
      setTimeout(() => {
        this.photoSent = false
        this.onCameraCloseClick()
      }, 1000)
    },

    onTextClick() { // Handle text send event
      if (!this.isConnectSuccess) return
      this.sendTextUtil.sendText(this.textInput, this.sendCore)
      this.textSent = true
      setTimeout(() => {
        this.textSent = false
        this.textInput = ''
      }, 1000)
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
      <div v-show="showCamera" id="cameradisplay" class="cameradisplay">
        <button id="close" class="mdi mdi-close" @click="onCameraCloseClick"></button>
        <video v-show="showStream" id="stream" ref="stream" autoplay playsinline></video>
        <button v-show="showStream" id="snapshot" class="mdi mdi-camera" @click="onSnapshotClick"></button>
        <canvas v-show="!showStream" id="photo" ref="photo"></canvas>
        <button v-show="!showStream" id="send" class="mdi" @click="onCameraSendClick" :class="{ 'mdi-send' : !photoSent, 'mdi-check-bold' : photoSent }"></button>
      </div>

      <div id="dropzone" class="dropzone" @dragover.prevent @drop="onFileDrop" @click="onFileClick" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }">
        <input type="file" id="fileInput" title="Choose a file to send" multiple
          @change="sendFiles" ref="fileInput" :disabled="!isConnectSuccess">
        <span class="mdi mdi-cloud-upload-outline"></span>
        <p id="fileName">{{ sendFileUtil.currentFileName }}</p>
        <progress id="fileProgress" :value="sendFileUtil.offset" :max="sendFileUtil.currentFileSize"></progress>
      </div>
      <div id="camera" class="camera" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }" @click="onCameraClick">
        <span class="mdi mdi-camera"></span>
      </div>
      <div id="text" class="text" :class="{ disabled : !isConnectSuccess, active : isConnectSuccess }">
        <textarea id="textInput" placeholder="Type a message to send" :disabled="!isConnectSuccess" v-model="textInput" ref="textInput"></textarea>
        <button id="sendButton" class="mdi" :class="{ 'mdi-send' : !textSent, 'mdi-check-bold' : textSent }" :disabled="!isConnectSuccess" @click="onTextClick"></button>
      </div>
    </div>
  `,
}
