<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSendStore } from '@/stores/send'
import SendItem from '@/components/SendItem.vue'
import { ItemDisplayProps } from '@/types'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiUploadNetwork } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const sendStore = useSendStore()

const reactiveUploadFileItems = ref<ItemDisplayProps[]>([])

watch(
  () => sendStore.uploadFileItems,
  (newValue: ItemDisplayProps[]) => {
    reactiveUploadFileItems.value = newValue
  },
  { deep: true },
)
</script>

<template>
  <div class="upload-cluster">
    <div class="upload-cluster-title">
      <SvgIcon type="mdi" :path="mdiUploadNetwork" size="2.5rem" class="mdi" />
      <p class="upload-cluster-title-text">{{ t('upload.title') }}</p>
    </div>
    <p
      v-if="reactiveUploadFileItems.length === 0"
      class="noting-to-upload-text"
    >
      {{ t('upload.nothingToUpload') }}
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
  gap: 0.5rem;

  height: 100%;
  width: 100%;
  padding: 1rem;
  border-radius: var(--border-radius);
  overflow-y: auto;

  background-color: var(--secondary-extra-light-color);
  backdrop-filter: var(--blur-effect);
  -webkit-backdrop-filter: var(--blur-effect);

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
