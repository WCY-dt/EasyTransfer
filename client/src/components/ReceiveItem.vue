<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/stores/setting'
import { ItemDisplayProps } from '@/types'
import {
  isLinkMessage,
  isImageType,
  isVideoType,
  decideFileType,
} from '@/utils/msgType'
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiDownload,
  mdiMessageText,
  mdiCheckBold,
  mdiContentCopy,
  mdiLinkVariant,
  mdiOpenInNew,
} from '@mdi/js'

const props = withDefaults(defineProps<ItemDisplayProps>(), {
  url: 'javascript:void(0)',
  name: 'No file to download',
  size: 1,
  progress: 0,
  type: 'TRANSFER_TYPE_FILE',
  success: false,
})

const settingStore = useSettingStore()
const { autoDisplayImage, directlyOpenLink, autoDownload } =
  storeToRefs(settingStore)

const copied = ref(false)

function onTextClick(): void {
  navigator.clipboard.writeText(props.name)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1000)
}

const supportsHover = window.matchMedia('(hover: hover)').matches

const downloadLink = ref<HTMLAnchorElement | null>(null)

// Auto download may be restricted in some environments, such as iOS and DuckDuckGo desktop.
const isRestrictedEnv = () => {
  const ua = navigator.userAgent
  return (
    /(iPhone|iPod|iPad).*AppleWebKit/i.test(ua) ||
    /DuckDuckGo\/\d+\.\d+/.test(ua)
  )
}

watch(
  () => props.success,
  success => {
    if (
      success &&
      autoDownload.value &&
      props.type === 'TRANSFER_TYPE_FILE' &&
      !isRestrictedEnv()
    ) {
      setTimeout(() => {
        if (downloadLink.value) {
          downloadLink.value.click()
        }
      }, 1000)
    }
  },
)
</script>

<template>
  <a
    v-if="props.type === 'TRANSFER_TYPE_FILE'"
    ref="downloadLink"
    :href="props.url"
    class="download-item file shadow"
    :download="props.name"
    :class="{ success: props.success, loading: !props.success }"
  >
    <SvgIcon
      type="mdi"
      :path="decideFileType(props.name)"
      size="2.5rem"
      class="mdi"
    />
    <div class="download-item-detail">
      <p class="download-item-name">{{ props.name }}</p>
      <progress
        class="download-item-progress"
        :value="props.progress"
        :max="props.size"
      ></progress>
      <img
        v-if="isImageType(props.name) && props.success && autoDisplayImage"
        class="download-item-content"
        :src="props.url"
        alt="Photo"
      />
      <video
        v-if="isVideoType(props.name) && props.success && autoDisplayImage"
        class="download-item-content"
        :src="props.url"
        :controls="!supportsHover"
        muted
        autoplay
        loop
      ></video>
    </div>
    <div
      v-if="props.success"
      :class="{
        'copy-cover blur': supportsHover,
        'none-hover': !supportsHover,
      }"
    >
      <SvgIcon type="mdi" :path="mdiDownload" size="2.5rem" class="mdi" />
    </div>
  </a>
  <div
    v-if="
      props.type === 'TRANSFER_TYPE_TEXT' &&
      (!isLinkMessage(props.name) || !directlyOpenLink)
    "
    class="download-item text shadow"
    :class="{ success: props.success, loading: !props.success }"
    @click="onTextClick"
  >
    <SvgIcon type="mdi" :path="mdiMessageText" size="2.5rem" class="mdi" />
    <div class="download-item-detail">
      <p class="download-item-content">{{ props.name }}</p>
    </div>
    <div
      v-if="props.success"
      :class="{
        'copy-cover blur': supportsHover,
        'none-hover': !supportsHover,
      }"
    >
      <SvgIcon
        type="mdi"
        :path="mdiCheckBold"
        size="2.5rem"
        class="mdi"
        v-if="copied"
      />
      <SvgIcon
        type="mdi"
        :path="mdiContentCopy"
        size="2.5rem"
        class="mdi"
        v-else
      />
    </div>
  </div>
  <a
    v-if="
      props.type === 'TRANSFER_TYPE_TEXT' &&
      isLinkMessage(props.name) &&
      directlyOpenLink
    "
    class="download-item text shadow"
    :class="{ success: props.success, loading: !props.success }"
    @click="onTextClick"
    :href="props.name"
    target="_blank"
    rel="noopener noreferrer"
  >
    <SvgIcon type="mdi" :path="mdiLinkVariant" size="2.5rem" class="mdi" />
    <div class="download-item-detail">
      <p class="download-item-content">{{ props.name }}</p>
    </div>
    <div
      v-if="props.success"
      :class="{
        'copy-cover blur': supportsHover,
        'none-hover': !supportsHover,
      }"
    >
      <SvgIcon type="mdi" :path="mdiOpenInNew" size="2.5rem" class="mdi" />
    </div>
  </a>
</template>

<style scoped lang="scss">
.download-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: var(--small-border-radius);

  text-decoration: none;

  cursor: pointer;

  transition: all 0.1s ease-in-out;

  .mdi {
    align-self: flex-start;
    font-size: 2.5rem;

    transition: all 0.1s ease-in-out;
  }

  .download-item-detail {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    margin: 0 auto;
    width: 100%;

    p {
      margin: 0;

      transition: all 0.1s ease-in-out;

      &.download-item-name {
        font-size: 1.5rem;
        font-weight: 700;

        word-break: break-all;
        line-break: anywhere;
      }

      &.download-item-content {
        font-size: 1.2rem;
        font-weight: 500;

        word-break: break-all;
        line-break: anywhere;
      }
    }

    .download-item-progress {
      width: 100%;
      height: 0.5rem;
      border: none;
      border-radius: var(--small-border-radius);
    }

    img,
    video {
      width: 100%;
      height: auto;
      border-radius: var(--small-border-radius);
      opacity: 1;

      transition: all 0.1s ease-in-out;
    }
  }

  &.success {
    background-color: var(--success-light-color);
    color: var(--success-color);

    .download-item-detail {
      .download-item-progress {
        &::-webkit-progress-value {
          background-color: var(--success-color);
          border-radius: 0.25rem;

          transition: all 0.1s ease-in-out;
        }

        &::-webkit-progress-bar {
          background-color: transparent;
          border-radius: 0.25rem;

          transition: all 0.1s ease-in-out;
        }
      }
    }

    &.text,
    &.file {
      position: relative;

      @media (hover: hover) {
        &:hover {
          color: var(--success-semi-light-color);

          .download-item-detail {
            .download-item-progress {
              &::-webkit-progress-value {
                background-color: var(--success-semi-light-color);
              }
            }

            img {
              opacity: 0.3;
            }
          }

          .copy-cover {
            opacity: 1;
          }
        }
      }
    }
  }

  &.loading {
    background-color: var(--primary-light-color);
    color: var(--primary-color);

    cursor: not-allowed;

    .download-item-detail {
      .download-item-progress {
        &::-webkit-progress-value {
          background-color: var(--primary-color);
          border-radius: 0.25rem;

          transition: all 0.1s ease-in-out;
        }

        &::-webkit-progress-bar {
          background-color: var(--light-color);
          border-radius: 0.25rem;
        }
      }
    }
  }
}

.copy-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  opacity: 0;
  display: grid;
  place-content: center;

  font-size: 1.5rem;

  background-color: transparent;
  color: var(--success-color);

  transition: all 0.1s ease-in-out;

  .mdi {
    height: 100%;

    &::before {
      display: grid;
      place-content: center;

      height: 100%;
    }
  }
}

.none-hover {
  align-self: flex-start;
}
</style>
