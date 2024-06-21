import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../dataStore.js'
import DownloadItem from './DownloadItem.js'

export default {
  data() {
    return {
      fileName: 'Drop file here or click to upload',
      fileSize: 0,
      fileProgress: 0,
      downloadFileItems: ref([]),
      receivedData: [],
      fileNameQueue: [],
      fileSizeQueue: [],
    }
  },

  components: {
    DownloadItem,
  },

  methods: {
    addDownloadFileItem(url, name, size, progress) {
      this.downloadFileItems.push({
        url: url,
        name: name,
        size: size,
        progress: progress,
        success: false,
      })
    },

    modifyProgress(progress) {
      this.downloadFileItems[this.downloadFileItems.length - 1].progress = progress
    },

    modifyUrl(url) {
      this.downloadFileItems[this.downloadFileItems.length - 1].url = url
    },

    modifySuccess() {
      this.downloadFileItems[this.downloadFileItems.length - 1].success = true
    },

    async handleReceiveChannelMsg(event) {
      if (typeof event.data === 'string') {
        if (parseInt(event.data)) {
          console.log(`[INFO] Received file size ${event.data}`);
          this.fileSizeQueue.push(parseInt(event.data));
        } else {
          console.log(`[INFO] Received file ${event.data}`);
          this.fileNameQueue.push(event.data);
        }
      } else {
        // if no file name, pop from queue
        if (!this.fileName && this.fileNameQueue.length > 0) {
          this.fileName = this.fileNameQueue.shift();
          this.fileSize = this.fileSizeQueue.shift();

          // Insert download file HTML
          this.addDownloadFileItem("javascript:void(0)", this.fileName, this.fileSize, 0);
        }

        // receive file
        this.receivedData.push(event.data);
        this.fileProgress += event.data.byteLength;
        this.modifyProgress(this.fileProgress);

        // check if file is fully received
        if (this.fileProgress === this.fileSize) {
          console.log(`[INFO] Received file ${this.fileName} with size ${this.fileSize}`);

          this.modifyUrl(URL.createObjectURL(new Blob(this.receivedData)));
          this.modifySuccess();

          this.receivedData = [];
          this.fileProgress = 0;
          this.fileName = '';
          this.fileSize = 0;
        }
      }
    },

    receiveFiles() {
      this.peerConnection.ondatachannel = (event) => {
        const receiveChannel = event.channel;
        
        this.receivedData = [];
        this.fileProgress = 0;
        this.fileName = '';
        this.fileSize = 0;

        receiveChannel.onopen = () => {
          console.log(`[INFO] Receive channel opened`);
        }
        receiveChannel.onerror = error => {
          console.error(`[ERR] Receive channel error: ${error}`);
        }
        receiveChannel.onclose = () => {
          console.log(`[INFO] Receive channel closed`);
        }

        this.fileNameQueue = [];
        this.fileSizeQueue = [];

        receiveChannel.onmessage = async (event) => {
          await this.handleReceiveChannelMsg(event);
        };
      }
    },
  },

  setup() {
    const dataStore = useDataStore()

    const { peerConnection } = storeToRefs(dataStore);

    return {
      peerConnection,
    }
  },

  mounted() {
    this.receiveFiles();
  },

  template: /*html*/`
    <div class="downloadFile">
      <DownloadItem  v-for="(downloadFileItem, index) in downloadFileItems" :key="index" :url="downloadFileItem.url" :name="downloadFileItem.name" :size="downloadFileItem.size" :progress="downloadFileItem.progress" :success="downloadFileItem.success" />
    </div>
    <!--<button @click="addDownloadFileItem('javascript:void(0)', 'file', 1, 0)">Add item</button>-->
  `
}