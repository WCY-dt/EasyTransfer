<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useReceiveStore } from '@/stores/receive'
import ReceiveItem from './ReceiveItem.vue'

const connectCore = useConnectStore()
const receiveStore = useReceiveStore()
const { isConnectSuccess } = storeToRefs(connectCore)

const reactiveDownloadFileItems = ref([])

watch(isConnectSuccess, newValue => {
  if (newValue) {
    receiveStore.receiveFiles()
  }
})

watch(() => receiveStore.downloadFileItems, (newValue) => {
  reactiveDownloadFileItems.value = newValue
}, { deep: true })
</script>

<template>
  <div class="downloadFile">
    <ReceiveItem v-for="(downloadFileItem, index) in reactiveDownloadFileItems" :key="index" :url="downloadFileItem.url"
      :name="downloadFileItem.name" :size="downloadFileItem.size" :progress="downloadFileItem.progress"
      :success="downloadFileItem.success" :type="downloadFileItem.type" />
  </div>
</template>

<style scoped lang="scss">
.downloadFile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: calc(min(30rem, 100%));
}
</style>
