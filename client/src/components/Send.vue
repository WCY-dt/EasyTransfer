<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'
import SendItem from './SendItem.vue'

const connectCore = useConnectStore()
const sendStore = useSendStore()
const { isConnectSuccess } = storeToRefs(connectCore)

const reactiveUploadFileItems = ref([])

watch(() => sendStore.uploadFileItems, (newValue) => {
  reactiveUploadFileItems.value = newValue
}, { deep: true })
</script>

<template>
  <div class="uploadFile">
    <div class="uploadFileHeader">
      <span class="mdi mdi-upload-network"></span>
      <p>Upload</p>
    </div>
    <p v-if="reactiveUploadFileItems.length === 0">Nothing to upload</p>
    <SendItem v-for="(uploadFileItem, index) in reactiveUploadFileItems" :key="index" :url="uploadFileItem.url"
      :name="uploadFileItem.name" :size="uploadFileItem.size" :progress="uploadFileItem.progress"
      :success="uploadFileItem.success" :type="uploadFileItem.type" />
  </div>
</template>

<style scoped lang="scss">
.uploadFile {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-radius: 0.25rem;
  padding: 1rem;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  background-color: var(--secondary-extra-light-color);

  .uploadFileHeader {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    span {
      font-size: 2.5rem;
      color: var(--secondary-color);
    }

    p {
      font-size: 2rem;
      font-weight: 700;
      color: var(--secondary-color);
    }
  }

  p {
    font-size: 1.5rem;
    color: var(--secondary-color);
  }
}

@media (max-width: 1440px) {
  .uploadFile {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
}

@media (max-width: 768px) {
  .uploadFile {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
}
</style>
