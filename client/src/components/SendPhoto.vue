<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'

const connectStore = useConnectStore()
const { isConnectSuccess } = storeToRefs(connectStore)
const sendStore = useSendStore()

const photoSent = ref(false)
const showCamera = ref(false)
const showStream = ref(false)

const stream = ref(null)
const photo = ref(null)

function onCameraClick() {
  if (!isConnectSuccess.value) return

  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment',
      },
    })
    .then(mediaStream => {
      window.stream = mediaStream
      stream.value.srcObject = mediaStream
      showCamera.value = true
      showStream.value = true
    })
    .catch(error => {
      console.error(`[ERR] GetUserMedia error: ${error}`)
      showCamera.value = false
      showStream.value = false
      alert('Please allow camera access to use this feature')
    })
}

function onSnapshotClick() {
  console.log('Taking snapshot')
  photo.value.width = stream.value.videoWidth
  photo.value.height = stream.value.videoHeight
  photo.value
    .getContext('2d')
    .drawImage(stream.value, 0, 0, photo.value.width, photo.value.height)
  window.stream.getTracks().forEach(track => track.stop())
  showStream.value = false
}

function onCameraCloseClick() {
  window.stream.getTracks().forEach(track => track.stop())
  showCamera.value = false
  showStream.value = false
}

async function processAndSendPhoto() {
  photo.value.toBlob(async function (blob) {
    const timestamp = new Date().getTime()

    const file = new File([blob], `image_${timestamp}.png`, {
      type: 'image/png',
    })
    console.log(file)

    await sendStore.sendFiles([file], 'TRANSFER_TYPE_PHOTO', sendCore.value)
  }, 'image/png')
}

async function onCameraSendClick() {
  if (!isConnectSuccess.value) return

  await processAndSendPhoto()

  photoSent.value = true
  setTimeout(() => {
    photoSent.value = false
    onCameraCloseClick()
  }, 1000)
}
</script>

<template>
  <div v-show="showCamera" id="cameradisplay" class="cameradisplay">
    <button id="close" class="mdi mdi-close" @click="onCameraCloseClick"></button>
    <video v-show="showStream" id="stream" ref="stream" autoplay playsinline></video>
    <button v-show="showStream" id="snapshot" class="mdi mdi-camera" @click="onSnapshotClick"></button>
    <canvas v-show="!showStream" id="photo" ref="photo"></canvas>
    <button v-show="!showStream" id="send" class="mdi" @click="onCameraSendClick"
      :class="{ 'mdi-send': !photoSent, 'mdi-check-bold': photoSent }"></button>
  </div>
  <div id="camera" class="camera" :class="{ disabled: !isConnectSuccess, active: isConnectSuccess }"
    @click="onCameraClick">
    <span class="mdi mdi-camera"></span>
  </div>
</template>

<style scoped lang="scss">
.camera {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  border-style: solid;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &.disabled {
    border-color: var(--secondary-color);
    background-color: var(--secondary-light-color);
    color: var(--secondary-color);
    cursor: not-allowed;
  }

  &:not(.disabled):hover {
    color: var(--light-color);
    background-color: var(--primary-color);
  }

  span {
    font-size: 6rem;
    line-height: 6rem;
  }
}

.cameradisplay {
  position: fixed;
  padding: 1rem;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  background-color: var(--primary-light-color);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 1rem rgba(0, 0, 0, 0.3),
    0 0 0.5rem rgba(0, 0, 0, 0.5);

  button {
    position: absolute;
    border: none;
    cursor: pointer;
    z-index: 20;
    transition: all 0.3s ease-in-out;
  }

  #close {
    top: 2rem;
    right: 2rem;
    font-size: 2rem;
    background-color: transparent;
    color: var(--prime-color);

    &:hover {
      color: var(--primary-dark-color);
    }
  }

  #stream {
    border-radius: 0.25rem;
    max-width: 94vw;
    max-height: 94vh;
    width: auto;
    height: auto;
  }

  #snapshot {
    width: 4rem;
    height: 4rem;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0;
    border-radius: 50%;
    font-size: 2rem;
    line-height: 0;
    background-color: var(--primary-color);
    color: var(--light-color);

    &:hover {
      background-color: var(--primary-dark-color);
    }
  }

  #photo {
    border-radius: 0.25rem;
    max-width: 94vw;
    max-height: 94vh;
    width: auto;
    height: auto;
  }

  #send {
    width: 6rem;
    height: 3rem;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 0.25rem;
    font-size: 2rem;
    background-color: var(--primary-color);
    color: var(--light-color);

    &:hover {
      background-color: var(--primary-dark-color);
    }

    &.mdi-check-bold {
      background-color: var(--success-color);

      &:hover {
        background-color: var(--success-color);
      }
    }
  }
}

@media (max-width: 768px) {
  .camera {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
}

@media (hover: none) {
  .camera:not(.disabled):hover {
    color: var(--primary-color);
    background-color: var(--light-color);
  }

  .cameradisplay {
    #close:hover {
      color: var(--primary-color);
    }

    #snapshot:hover {
      background-color: var(--primary-color);
    }

    #send:hover {
      background-color: var(--primary-color);
    }
  }
}
</style>
