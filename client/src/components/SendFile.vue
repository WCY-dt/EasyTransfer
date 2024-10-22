<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'

const connectStore = useConnectStore()
const { isConnectSuccess } = storeToRefs(connectStore)
const sendStore = useSendStore()
const { currentFileName, currentFileSize, offset } = storeToRefs(sendStore)

const fileInput = ref(null)

async function sendFiles() {
  sendStore.sendFiles(fileInput.value.files, 'TRANSFER_TYPE_FILE')
}

function onFileDrop(event) {
  if (!isConnectSuccess.value) return
  event.preventDefault()
  fileInput.value.files = event.dataTransfer.files
  sendFiles()
}

function onFileClick() {
  if (!isConnectSuccess.value) return
  fileInput.value.click()
}
</script>

<template>
  <div id="dropzone" class="dropzone" @dragover.prevent @drop="onFileDrop" @click="onFileClick"
    :class="{ disabled: !isConnectSuccess, active: isConnectSuccess }">
    <input type="file" id="fileInput" title="Choose a file to send" multiple @change="sendFiles" ref="fileInput"
      :disabled="!isConnectSuccess" />
    <span class="mdi mdi-cloud-upload-outline"></span>
    <p id="fileName">{{ currentFileName }}</p>
    <progress id="fileProgress" :value="offset" :max="currentFileSize"></progress>
  </div>
</template>

<style scoped lang="scss">
.dropzone {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  border-style: dashed;
  cursor: pointer;

  input {
    display: none;
  }

  span {
    font-size: 6rem;
    line-height: 6rem;
  }

  p {
    font-size: 1.5rem;
    line-height: 1.8rem;
    margin: 0;
    text-align: center;
  }

  progress {
    width: 100%;
    height: 1rem;
    border: none;
    border-radius: 0.25rem;
    background-color: var(--light-color);

    &::-webkit-progress-bar {
      background-color: var(--light-color);
    }

    &::-webkit-progress-value {
      background-color: var(--primary-color);
    }
  }
}

@media (max-width: 768px) {
  .dropzone {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
}
</style>
