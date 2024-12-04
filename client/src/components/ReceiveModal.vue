<script setup>
import { ref, watch } from 'vue'
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

watch(
  () => receiveStore.downloadFileItems,
  newValue => {
    reactiveDownloadFileItems.value = newValue
  },
  { deep: true },
)
</script>

<template>
  <div class="download-cluster">
    <div class="download-cluster-title">
      <span class="mdi mdi-download-network"></span>
      <p class="download-cluster-title-text">Download</p>
    </div>
    <p
      v-if="reactiveDownloadFileItems.length === 0"
      class="noting-to-download-text"
    >
      Nothing to download
    </p>
    <ReceiveItem
      v-for="(downloadFileItem, index) in reactiveDownloadFileItems"
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

<style scoped lang="scss">
.download-cluster {
  grid-column: 3 / 4;
  grid-row: 1 / 2;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  height: 100%;
  padding: 1rem;
  border-radius: var(--border-radius);
  overflow-y: auto;

  background-color: var(--secondary-extra-light-color);
  backdrop-filter: var(--blur-effect);
  -webkit-backdrop-filter: var(--blur-effect);

  .download-cluster-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .mdi {
      font-size: 2.5rem;

      color: var(--secondary-color);
    }

    .download-cluster-title-text {
      font-size: 2rem;
      font-weight: 700;

      color: var(--secondary-color);
    }
  }

  .noting-to-download-text {
    font-size: 1.5rem;

    color: var(--secondary-color);
  }
}

@media (max-width: 1440px) {
  .download-cluster {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }
}

@media (max-width: 768px) {
  .download-cluster {
    grid-column: 1 / 2;
    grid-row: 3 / 4;
  }
}
</style>
