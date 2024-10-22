<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useReceiveStore } from '@/stores/receive'
import ReceiveItem from './ReceiveItem.vue'

const connectCore = useConnectStore()
const receiveStore = useReceiveStore()
const { isConnectSuccess } = storeToRefs(connectCore)

const downloadFileItems = ref([])

const addDownloadFileItem = (url, name, size, progress, type) => {
  downloadFileItems.value.push({
    url: url,
    name: name,
    size: size,
    progress: progress,
    type: type,
    success: false,
  })
}

const updateFileProgress = (index, progress) => {
  downloadFileItems.value[index].progress = progress
}

const updateFileUrl = (index, url) => {
  downloadFileItems.value[index].url = url
}

const updateFileSuccess = index => {
  downloadFileItems.value[index].success = true
}

watch(isConnectSuccess, newValue => {
  if (newValue) {
    receiveStore.receiveFiles(
      addDownloadFileItem,
      updateFileProgress,
      updateFileUrl,
      updateFileSuccess,
    )
  }
})
</script>

<template>
  <div class="downloadFile">
    <ReceiveItem
      v-for="(downloadFileItem, index) in downloadFileItems"
      :key="index"
      :url="downloadFileItem.url"
      :name="downloadFileItem.name"
      :size="downloadFileItem.size"
      :progress="downloadFileItem.progress"
      :success="downloadFileItem.success"
      :type="downloadFileItem.type"
    />
  </div>
</template>

<style scoped>
.downloadFile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: calc(min(30rem, 100%));
}
</style>
