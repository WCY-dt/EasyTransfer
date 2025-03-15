<script setup lang="ts">
import { ref, Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiClose, mdiCamera, mdiSend, mdiCheckBold } from '@mdi/js'

const connectStore = useConnectStore()
const { isConnectSuccess } = storeToRefs(connectStore)
const sendStore = useSendStore()

const photoSent: Ref<boolean> = ref(false)
const showCamera: Ref<boolean> = ref(false)
const showStream: Ref<boolean> = ref(false)

const stream: Ref<HTMLVideoElement | null> = ref(null)
const photo: Ref<HTMLCanvasElement | null> = ref(null)

function onCameraClick(): void {
  if (!isConnectSuccess.value) return

  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment',
      },
    })
    .then((mediaStream: MediaStream) => {
      window.stream = mediaStream
      if (stream.value) {
        stream.value.srcObject = mediaStream
      }
      showCamera.value = true
      showStream.value = true
    })
    .catch((error: Error) => {
      console.error(`[ERR] GetUserMedia error: ${error}`)
      showCamera.value = false
      showStream.value = false
      alert('Please allow camera access to use this feature')
    })
}

function onSnapshotClick(): void {
  if (photo.value && stream.value) {
    photo.value.width = stream.value.videoWidth
    photo.value.height = stream.value.videoHeight
    const context = photo.value.getContext('2d')
    if (context) {
      context.drawImage(
        stream.value,
        0,
        0,
        photo.value.width,
        photo.value.height,
      )
    }
    window.stream
      ?.getTracks()
      .forEach((track: MediaStreamTrack) => track.stop())
    showStream.value = false
  }
}

function onCameraCloseClick(): void {
  window.stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop())
  showCamera.value = false
  showStream.value = false
}

async function processAndSendPhoto(): Promise<void> {
  if (photo.value) {
    photo.value.toBlob(async function (blob: Blob | null) {
      if (blob) {
        const timestamp = new Date().getTime()
        const file = new File([blob], `image_${timestamp}.png`, {
          type: 'image/png',
        })
        await sendStore.sendFiles([file], 'TRANSFER_TYPE_FILE')
      }
    }, 'image/png')
  }
}

async function onCameraSendClick(): Promise<void> {
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
  <div
    v-show="showCamera"
    class="overlay blur"
    @click.self="onCameraCloseClick"
  >
    <div id="cameradisplay" class="camera-display-cluster shadow">
      <button class="close-button" @click="onCameraCloseClick">
        <SvgIcon type="mdi" :path="mdiClose" size="2rem" class="mdi" />
      </button>
      <video
        v-show="showStream"
        class="stream-display"
        ref="stream"
        autoplay
        playsinline
      ></video>
      <button
        v-show="showStream"
        class="snapshot-button"
        @click="onSnapshotClick"
      >
        <SvgIcon type="mdi" :path="mdiCamera" size="2rem" class="mdi" />
      </button>
      <canvas v-show="!showStream" class="photo-display" ref="photo"></canvas>
      <button
        v-show="!showStream"
        class="send-button"
        @click="onCameraSendClick"
      >
        <SvgIcon
          type="mdi"
          :path="mdiCheckBold"
          size="2rem"
          class="mdi"
          v-if="photoSent"
        />
        <SvgIcon type="mdi" :path="mdiSend" size="2rem" class="mdi" v-else />
      </button>
    </div>
  </div>
  <div
    id="camera"
    class="upload-photo-cluster"
    :class="{ disabled: !isConnectSuccess, active: isConnectSuccess }"
    @click="onCameraClick"
  >
    <SvgIcon type="mdi" :path="mdiCamera" size="3rem" class="mdi" />
    <p class="upload-photo-title">Photo</p>
  </div>
</template>

<style scoped lang="scss">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1000;
}

.upload-photo-cluster {
  grid-column: 2 / 3;
  grid-row: 1 / 2;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  padding: 0.5rem 1rem !important;

  border-color: var(--primary-light-color);
  border-width: 2px;
  border-radius: var(--border-radius);
  border-style: solid;

  background-color: var(--primary-light-color);
  color: var(--primary-color);

  cursor: pointer;

  transition: all 0.1s ease-in-out;

  &.disabled {
    border-color: var(--secondary-light-color);

    background-color: var(--secondary-light-color);
    color: var(--secondary-color);

    cursor: not-allowed;
  }

  @media (hover: hover) {
    &:not(.disabled):hover {
      border-color: var(--primary-color);

      background-color: var(--primary-color);
      color: var(--light-color);
    }
  }

  .mdi {
    font-size: 3rem;
    font-weight: 700;
    line-height: 3rem;
  }

  .upload-photo-title {
    display: none;

    margin: 0;

    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.5rem;
    text-align: center;
  }
}

.camera-display-cluster {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  align-items: center;
  justify-content: center;

  width: calc(min(94vw, 40rem)) !important;
  border-radius: var(--border-radius);

  background-color: var(--primary-light-color);

  z-index: 500;

  button {
    position: absolute;

    border: none;
    z-index: 20;

    cursor: pointer;

    transition: all 0.1s ease-in-out;
  }

  .close-button {
    top: 2rem;
    right: 1.5rem;

    font-size: 2rem;

    background-color: transparent;
    color: var(--prime-color);

    z-index: 504;

    @media (hover: hover) {
      &:hover {
        color: var(--primary-dark-color);
      }
    }
  }

  .stream-display {
    width: auto;
    height: auto;
    max-width: 94vw;
    max-height: 94vh;
    border-radius: var(--border-radius);

    z-index: 502;
  }

  .snapshot-button {
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

    z-index: 504;

    @media (hover: hover) {
      &:hover {
        background-color: var(--primary-dark-color);
      }
    }
  }

  .photo-display {
    width: auto;
    height: auto;
    max-width: 94vw;
    max-height: 94vh;
    border-radius: var(--border-radius);

    z-index: 506;
  }

  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 6rem;
    height: 3rem;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);

    border-radius: var(--border-radius);

    font-size: 2rem;

    background-color: var(--primary-color);
    color: var(--light-color);

    z-index: 508;

    &.mdi-check-bold {
      background-color: var(--success-color);
    }

    @media (hover: hover) {
      &:hover {
        background-color: var(--primary-dark-color);
      }

      &.mdi-check-bold:hover {
        background-color: var(--success-color);
      }
    }
  }
}

@media (max-width: 768px) {
  .upload-photo-cluster {
    grid-column: 1 / 2;
    grid-row: 2 / 3;

    .upload-photo-title {
      display: block;
    }
  }
}
</style>
