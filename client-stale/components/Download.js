import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../dataStore.js'
import DownloadItem from './DownloadItem.js'

export default {
  data() {
    return {
      downloadFileItems: ref([]),
    }
  },

  components: {
    DownloadItem,
  },

  methods: {
    addDownloadFileItem(url, name, size, progress, type) {
      this.downloadFileItems.push({
        url: url,
        name: name,
        size: size,
        progress: progress,
        type: type,
        success: false,
      })
    },

    updateFileProgress(index, progress) {
      this.downloadFileItems[index].progress = progress
    },

    updateFileUrl(index, url) {
      this.downloadFileItems[index].url = url
    },

    updateFileSuccess(index) {
      this.downloadFileItems[index].success = true
    },
  },

  watch: {
    isConnectSuccess(newValue) {
      if (newValue) {
        this.receiveUtil.receiveFiles(this.connectCore, this.addDownloadFileItem, this.updateFileProgress, this.updateFileUrl, this.updateFileSuccess)
      }
    }
  },

  setup() {
    const dataStore = useDataStore()

    const { connectCore, receiveUtil, isConnectSuccess } = storeToRefs(dataStore)

    return {
      dataStore,
      connectCore,
      receiveUtil,
      isConnectSuccess,
    }
  },

  template: /*html*/`
    <div class="downloadFile">
      <DownloadItem  v-for="(downloadFileItem, index) in downloadFileItems" :key="index" :url="downloadFileItem.url" :name="downloadFileItem.name" :size="downloadFileItem.size" :progress="downloadFileItem.progress" :success="downloadFileItem.success" :type="downloadFileItem.type" />
    </div>
  `
}