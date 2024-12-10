<script setup lang="ts">
import { ref, Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/stores/setting'
import { ItemDisplayProps } from '@/types'

const props = withDefaults(defineProps<ItemDisplayProps>(), {
  url: 'javascript:void(0)',
  name: 'No file to upload',
  size: 1,
  progress: 0,
  type: 'TRANSFER_TYPE_FILE',
  success: false,
})

const settingStore = useSettingStore()
const { autoDisplayImage, directlyOpenLink } = storeToRefs(settingStore)

const copied: Ref<boolean> = ref(false)

function onTextClick(): void {
  navigator.clipboard.writeText(props.name)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1000)
}

function isLinkMessage(text: string): boolean {
  if (props.type === 'TRANSFER_TYPE_TEXT') {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
      'i', // fragment locator
    )
    return !!urlPattern.test(text)
  }
  return false
}

function isImageType(): boolean {
  if (props.type === 'TRANSFER_TYPE_PHOTO') {
    return true
  }

  const imageFormats = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.ico',
  ]
  return imageFormats.some(format => props.name.toLowerCase().endsWith(format))
}

function decideFileType(): string {
  const fileTypeMap: Record<string, string[]> = {
    'mdi-file-image': [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.bmp',
      '.webp',
      '.svg',
      '.ico',
      '.tiff',
      '.tif',
      '.heic',
      '.raw',
    ],
    'mdi-file-word': ['.doc', '.docx', '.odt', '.rtf', '.txt', '.wps', '.wpd'],
    'mdi-file-table': [
      '.xls',
      '.xlsx',
      '.ods',
      '.csv',
      '.tsv',
      '.xlsm',
      '.xlsb',
    ],
    'mdi-file-powerpoint': [
      '.ppt',
      '.pptx',
      '.odp',
      '.pps',
      '.ppsx',
      '.pot',
      '.potx',
    ],
    'mdi-file-music': [
      '.mp3',
      '.wav',
      '.flac',
      '.ogg',
      '.aac',
      '.wma',
      '.m4a',
      '.aiff',
      '.alac',
    ],
    'mdi-file-video': [
      '.mp4',
      '.mkv',
      '.avi',
      '.mov',
      '.wmv',
      '.flv',
      '.webm',
      '.mpeg',
      '.mpg',
      '.m4v',
      '.3gp',
      '.3g2',
    ],
    'mdi-file-code': [
      '.html',
      '.css',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.xml',
      '.yaml',
      '.yml',
      '.md',
      '.markdown',
      '.cpp',
      '.c',
      '.h',
      '.hpp',
      '.java',
      '.py',
      '.rb',
      '.php',
      '.sql',
      '.sh',
      '.bat',
      '.ps1',
      '.psm1',
      '.psd1',
      '.ps1xml',
      '.pssc',
      '.psc1',
      '.pssc',
      '.pl',
      '.perl',
      '.go',
      '.rs',
      '.swift',
      '.kt',
      '.kts',
      '.clj',
      '.cljs',
      '.scala',
      '.groovy',
      '.gradle',
      '.dockerfile',
      '.properties',
      '.ini',
      '.cfg',
      '.conf',
      '.toml',
      '.yaml',
      '.yml',
      '.json',
      '.xml',
      '.csv',
      '.tsv',
      '.log',
      '.r',
      '.sas',
      '.stata',
      '.do',
      '.m',
      '.mat',
      '.rmd',
      '.ipynb',
    ],
    'mdi-folder-zip': [
      '.zip',
      '.rar',
      '.7z',
      '.tar',
      '.gz',
      '.bz2',
      '.xz',
      '.lz',
      '.lzma',
      '.lzo',
      '.zst',
      '.z',
      '.tar.gz',
      '.tgz',
      '.tar.bz2',
      '.tbz2',
      '.tar.xz',
      '.txz',
      '.tar.lz',
      '.tlz',
      '.tar.lzma',
      '.tar.lzo',
      '.tar.zst',
      '.tzst',
    ],
    'mdi-file-cad': [
      '.dwg',
      '.dxf',
      '.dgn',
      '.stl',
      '.obj',
      '.fbx',
      '.3ds',
      '.skp',
      '.step',
      '.stp',
      '.igs',
      '.iges',
      '.x_t',
      '.x_b',
      '.sat',
      '.sab',
      '.3dm',
      '.prt',
      '.asm',
      '.xas',
      '.xpr',
    ],
    'mdi-file-key': [
      '.key',
      '.pem',
      '.pub',
      '.asc',
      '.gpg',
      '.pgp',
      '.p12',
      '.pfx',
      '.cer',
      '.crt',
      '.der',
      '.keychain',
      '.jks',
      '.keystore',
      '.bks',
      '.pkcs12',
      '.p7b',
      '.p7c',
      '.p7r',
      '.p7s',
      '.p8',
    ],
  }

  if (props.type === 'TRANSFER_TYPE_PHOTO') {
    return 'mdi-file-image'
  }

  const fileName = props.name.toLowerCase()
  for (const [icon, formats] of Object.entries(fileTypeMap)) {
    if (formats.some(format => fileName.endsWith(format))) {
      return icon
    }
  }

  return 'mdi-file-document'
}
</script>

<template>
  <a v-if="
    props.type === 'TRANSFER_TYPE_FILE' ||
    props.type === 'TRANSFER_TYPE_PHOTO'
  " ref="uploadLink" :href="props.url" class="upload-item file shadow" :download="props.name"
    :class="{ success: props.success, loading: !props.success }">
    <span class="mdi" :class="decideFileType()"></span>
    <div class="upload-item-detail">
      <p class="upload-item-name">{{ props.name }}</p>
      <progress class="upload-item-progress" :value="props.progress" :max="props.size"></progress>
      <img v-if="isImageType() && props.success && autoDisplayImage" class="upload-item-content" :src="props.url"
        alt="Photo" />
      <div class="copy-cover blur">
        <span class="mdi mdi-download"></span>
      </div>
    </div>
  </a>
  <div v-if="
    props.type === 'TRANSFER_TYPE_TEXT' &&
    (!isLinkMessage(props.name) || !directlyOpenLink)
  " class="upload-item text shadow" :class="{ success: props.success, loading: !props.success }"
    @click="onTextClick">
    <span class="mdi mdi-message-text"></span>
    <div class="upload-item-detail">
      <p class="upload-item-content">{{ props.name }}</p>
      <div class="copy-cover blur">
        <span class="mdi mdi-check-bold" v-if="copied"></span>
        <span class="mdi mdi-content-copy" v-else></span>
      </div>
    </div>
  </div>
  <a v-if="
    props.type === 'TRANSFER_TYPE_TEXT' &&
    isLinkMessage(props.name) &&
    directlyOpenLink
  " class="upload-item text shadow" :class="{ success: props.success, loading: !props.success }" @click="onTextClick"
    :href="props.name" target="_blank" rel="noopener noreferrer">
    <span class="mdi mdi-link-variant"></span>
    <div class="upload-item-detail">
      <p class="upload-item-content">{{ props.name }}</p>
      <div class="copy-cover blur">
        <span class="mdi mdi-open-in-new"></span>
      </div>
    </div>
  </a>
</template>

<style scoped lang="scss">
.upload-item {
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

  .upload-item-detail {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    margin: 0 auto;
    width: 100%;

    p {
      margin: 0;

      transition: all 0.1s ease-in-out;

      &.upload-item-name {
        font-size: 1.5rem;
        font-weight: 700;

        word-break: break-all;
        line-break: anywhere;
      }

      &.upload-item-content {
        font-size: 1.2rem;
        font-weight: 500;

        word-break: break-all;
        line-break: anywhere;
      }
    }

    .upload-item-progress {
      width: 100%;
      height: 0.5rem;
      border: none;
      border-radius: var(--small-border-radius);
    }

    img {
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

    .upload-item-detail {
      .upload-item-progress {
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

          .upload-item-detail {
            .upload-item-progress {
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

    .upload-item-detail {
      .upload-item-progress {
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
</style>
