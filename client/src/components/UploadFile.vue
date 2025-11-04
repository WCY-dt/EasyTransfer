<script setup lang="ts">
import { ref, Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiFileUpload } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const connectStore = useConnectStore()
const { isConnectSuccess } = storeToRefs(connectStore)
const sendStore = useSendStore()

const fileInput: Ref<HTMLInputElement | null> = ref(null)

async function sendFiles() {
  if (fileInput.value && fileInput.value.files) {
    await sendStore.sendFiles(
      Array.from(fileInput.value.files),
      'TRANSFER_TYPE_FILE',
    )
  }
}

async function onFileDrop(event: DragEvent) {
  if (!isConnectSuccess.value) return
  event.preventDefault()
  if (fileInput.value) {
    fileInput.value.files = event.dataTransfer?.files ?? null
    await sendFiles()
  }
}

function onFileClick() {
  if (!isConnectSuccess.value) return
  if (fileInput.value) {
    fileInput.value.click()
  }
}
</script>

<template>
  <div
    id="dropzone"
    class="upload-file-cluster"
    @dragover.prevent
    @drop="onFileDrop"
    @click="onFileClick"
    :class="{ disabled: !isConnectSuccess, active: isConnectSuccess }"
  >
    <input
      type="file"
      id="fileInput"
      class="file-input"
      title="Choose a file to send"
      multiple
      @change="sendFiles"
      ref="fileInput"
      :disabled="!isConnectSuccess"
    />
    <SvgIcon type="mdi" :path="mdiFileUpload" size="3rem" class="mdi" />
    <p class="file-input-title">{{ t('upload.file') }}</p>
  </div>
</template>

<style scoped lang="scss">
.upload-file-cluster {
  grid-column: 1 / 2;
  grid-row: 1 / 2;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  padding: 0.5rem;
  border-color: var(--primary-color);
  border-width: 2px;
  border-radius: var(--border-radius);
  border-style: solid;

  background-color: var(--primary-color);
  color: var(--light-color);

  cursor: pointer;

  &.disabled {
    border-color: var(--secondary-color);

    background-color: var(--secondary-color);
    color: var(--secondary-light-color);

    cursor: not-allowed;
  }

  .file-input {
    display: none;
  }

  .mdi {
    font-size: 3rem;
    line-height: 3rem;
  }

  .file-input-title {
    margin: 0;

    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.5rem;
    text-align: center;
  }

  @media (hover: hover) {
    &:not(.disabled):hover {
      border-color: var(--primary-dark-color);

      background-color: var(--primary-dark-color);
    }
  }
}
</style>
