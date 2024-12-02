<script setup>
import { ref, watch } from 'vue'
import { useSendStore } from '@/stores/send'
import SendItem from './SendItem.vue'

const sendStore = useSendStore()

const reactiveUploadFileItems = ref([])

watch(
  () => sendStore.uploadFileItems,
  newValue => {
    reactiveUploadFileItems.value = newValue
  },
  { deep: true },
)
</script>

<template>
  <div class="upload-cluster">
    <div class="upload-cluster-title">
      <span class="mdi mdi-upload-network"></span>
      <p class="upload-cluster-title-text">Upload</p>
    </div>
    <p
      v-if="reactiveUploadFileItems.length === 0"
      class="noting-to-upload-text"
    >
      Nothing to upload
    </p>
    <SendItem
      v-for="(uploadFileItem, index) in reactiveUploadFileItems"
      :key="index"
      :url="uploadFileItem.url"
      :name="uploadFileItem.name"
      :size="uploadFileItem.size"
      :progress="uploadFileItem.progress"
      :success="uploadFileItem.success"
      :type="uploadFileItem.type"
    />
  </div>
</template>

<style scoped lang="scss">
.upload-cluster {
  grid-column: 2 / 3;
  grid-row: 1 / 2;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  height: 100%;
  width: 100%;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-y: auto;

  background-color: var(--secondary-extra-light-color);

  .upload-cluster-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .mdi {
      font-size: 2.5rem;

      color: var(--secondary-color);
    }

    .upload-cluster-title-text {
      font-size: 2rem;
      font-weight: 700;

      color: var(--secondary-color);
    }
  }

  .noting-to-upload-text {
    font-size: 1.5rem;

    color: var(--secondary-color);
  }
}

@media (max-width: 1440px) {
  .upload-cluster {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
}

@media (max-width: 768px) {
  .upload-cluster {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
}
</style>
