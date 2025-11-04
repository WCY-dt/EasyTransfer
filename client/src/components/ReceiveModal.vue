<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useReceiveStore } from '@/stores/receive'
import ReceiveItem from '@/components/ReceiveItem.vue'
import { ItemDisplayProps } from '@/types'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiDownloadNetwork } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const connectCore = useConnectStore()
const receiveStore = useReceiveStore()
const { isConnectSuccess } = storeToRefs(connectCore)

const reactiveDownloadFileItems = ref<ItemDisplayProps[]>([])

watch(isConnectSuccess, (newValue: boolean) => {
  if (newValue) {
    receiveStore.receiveFiles()
  }
})

watch(
  () => receiveStore.downloadFileItems,
  (newValue: ItemDisplayProps[]) => {
    reactiveDownloadFileItems.value = newValue
  },
  { deep: true },
)
</script>

<template>
  <div class="download-cluster">
    <div class="download-cluster-title">
      <SvgIcon
        type="mdi"
        :path="mdiDownloadNetwork"
        size="2.5rem"
        class="mdi"
      />
      <p class="download-cluster-title-text">{{ t('download.title') }}</p>
    </div>
    <p
      v-if="reactiveDownloadFileItems.length === 0"
      class="noting-to-download-text"
    >
      {{ t('download.nothingToDownload') }}
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
