<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'

const connectStore = useConnectStore()
const { isConnectSuccess } = storeToRefs(connectStore)
const sendStore = useSendStore()

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
    <span class="mdi mdi-file-upload"></span>
    <p>File</p>
  </div>
</template>

<style scoped lang="scss">
.dropzone {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  border-style: solid;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--light-color);
  background-color: var(--primary-color);

  &.disabled {
    border-color: var(--secondary-color);
    background-color: var(--secondary-color);
    color: var(--secondary-light-color);
    cursor: not-allowed;
  }

  input {
    display: none;
  }

  span {
    font-size: 3rem;
    line-height: 3rem;
  }

  p {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.5rem;
    margin: 0;
    text-align: center;
  }

  @media (hover: hover) {
    &:not(.disabled):hover {
      background-color: var(--primary-dark-color);
      border-color: var(--primary-dark-color);
    }
  }
}
</style>
