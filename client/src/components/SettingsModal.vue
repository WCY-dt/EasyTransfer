<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/stores/setting'
import { IceServer } from '@/types'
import { supportedLanguages, supportedThemes } from '@/const'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCog } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const settingStore = useSettingStore()

const {
  maxConnectionNumber,
  iceServers,
  autoDisplayImage,
  directlyOpenLink,
  autoDownload,
  language,
  soundNotification,
  theme,
} = storeToRefs(settingStore)

const emit = defineEmits(['close'])
const close = (): void => {
  emit('close')
}

const saveAvailable = ref<boolean>(true)
const saveText = ref<string>(t('settings.save'))

const maxConnectionNumberTmp = ref<number | null>(null)
const iceServersTmp = ref<string | null>(null)
const autoDisplayImageTmp = ref<boolean | null>(null)
const directlyOpenLinkTmp = ref<boolean | null>(null)
const autoDownloadTmp = ref<boolean | null>(null)
const languageTmp = ref<string | null>(null)
const soundNotificationTmp = ref<boolean | null>(null)
const themeTmp = ref<string | null>(null)

onMounted((): void => {
  maxConnectionNumberTmp.value = maxConnectionNumber.value
  iceServersTmp.value = iceServers.value
    .map((server: IceServer) => JSON.stringify(server))
    .join('\n')

  autoDisplayImageTmp.value = autoDisplayImage.value
  directlyOpenLinkTmp.value = directlyOpenLink.value
  autoDownloadTmp.value = autoDownload.value
  languageTmp.value = language.value
  soundNotificationTmp.value = soundNotification.value
  themeTmp.value = theme.value
})

function saveSettings(): void {
  if (
    maxConnectionNumberTmp.value !== null &&
    maxConnectionNumber.value !== maxConnectionNumberTmp.value
  ) {
    maxConnectionNumber.value = maxConnectionNumberTmp.value
  }

  let iceServersValue: IceServer[] = JSON.parse(
    `[${iceServersTmp.value?.split('\n').join(',')}]`,
  )
  if (JSON.stringify(iceServers.value) !== JSON.stringify(iceServersValue)) {
    iceServers.value = iceServersValue
  }

  if (
    autoDisplayImageTmp.value !== null &&
    autoDisplayImage.value !== autoDisplayImageTmp.value
  ) {
    autoDisplayImage.value = autoDisplayImageTmp.value
  }

  if (
    directlyOpenLinkTmp.value !== null &&
    directlyOpenLink.value !== directlyOpenLinkTmp.value
  ) {
    directlyOpenLink.value = directlyOpenLinkTmp.value
  }

  if (
    autoDownloadTmp.value !== null &&
    autoDownload.value !== autoDownloadTmp.value
  ) {
    autoDownload.value = autoDownloadTmp.value
  }

  if (languageTmp.value !== null && language.value !== languageTmp.value) {
    language.value = languageTmp.value
  }

  if (
    soundNotificationTmp.value !== null &&
    soundNotification.value !== soundNotificationTmp.value
  ) {
    soundNotification.value = soundNotificationTmp.value
  }

  if (themeTmp.value !== null && theme.value !== themeTmp.value) {
    theme.value = themeTmp.value
  }

  close()
}

const checkSettings = (): void => {
  saveAvailable.value = false
  saveText.value = t('settings.checking')

  if (
    maxConnectionNumberTmp.value !== null &&
    maxConnectionNumberTmp.value < 1
  ) {
    maxConnectionNumberTmp.value = 1
  }

  let iceServersValue: IceServer[]
  try {
    iceServersValue = JSON.parse(
      `[${iceServersTmp.value?.split('\n').join(',')}]`,
    )
  } catch {
    saveAvailable.value = false
    saveText.value = t('settings.iceServersFormatIncorrect')
    return
  }

  if (iceServersValue.length === 0) {
    saveAvailable.value = false
    saveText.value = t('settings.iceServersCannotBeEmpty')
    return
  }

  for (let server of iceServersValue) {
    if (!server.urls) {
      saveAvailable.value = false
      saveText.value = t('settings.iceServersMustHaveUrls')
      return
    }
  }

  saveAvailable.value = true
  saveText.value = t('settings.save')
}
</script>

<template>
  <div class="overlay blur" @click.self="close">
    <div class="settings-cluster shadow">
      <h2>
        <SvgIcon type="mdi" :path="mdiCog" size="2rem" class="mdi" />{{
          t('settings.title')
        }}
      </h2>
      <div class="setting-item">
        <label for="language">{{ t('settings.language') }}</label>
        <select id="language" class="blur shadow" v-model="languageTmp">
          <option
            v-for="lang in supportedLanguages"
            :key="lang.code"
            :value="lang.code"
          >
            {{ lang.name }}
          </option>
        </select>
        <label for="theme">{{ t('settings.theme') }}</label>
        <select id="theme" class="blur shadow" v-model="themeTmp">
          <option
            v-for="themeOption in supportedThemes"
            :key="themeOption.code"
            :value="themeOption.code"
          >
            {{ t(`theme.${themeOption.code}`) }}
          </option>
        </select>
        <label for="max-connection-number">{{
          t('settings.maxConnectionNumber')
        }}</label>
        <div class="range-input">
          <input
            type="range"
            id="max-connection-number"
            class="blur shadow"
            v-model="maxConnectionNumberTmp"
            @input="checkSettings"
            min="0"
            max="16"
            step="1"
          />
          <div class="range-input-label">
            <span>0</span><span>4</span><span>8</span><span>12</span
            ><span>16</span>
          </div>
        </div>
        <label for="ice-servers">{{ t('settings.iceServers') }}</label>
        <textarea
          id="ice-servers"
          class="blur shadow"
          v-model="iceServersTmp"
          spellcheck="false"
          @input="checkSettings"
        ></textarea>
        <label for="enable-img-display" class="label-for-switch">{{
          t('settings.autoDisplayImage')
        }}</label>
        <label class="switch-input blur shadow">
          <input
            class="blur shadow"
            type="checkbox"
            id="enable-img-display"
            v-model="autoDisplayImageTmp"
          />
          <span class="blur shadow"></span>
        </label>
        <label for="enable-open-link" class="label-for-switch">{{
          t('settings.directlyOpenLink')
        }}</label>
        <label class="switch-input blur shadow">
          <input
            class="blur shadow"
            type="checkbox"
            id="enable-open-link"
            v-model="directlyOpenLinkTmp"
          />
          <span class="blur shadow"></span>
        </label>
        <label for="auto-download" class="label-for-switch">{{
          t('settings.autoDownload')
        }}</label>
        <label class="switch-input blur shadow">
          <input
            class="blur shadow"
            type="checkbox"
            id="auto-download"
            v-model="autoDownloadTmp"
          />
          <span class="blur shadow"></span>
        </label>
        <!-- <label for="sound-notification" class="label-for-switch">{{
          t('settings.soundNotification')
          }}</label>
        <label class="switch-input blur shadow">
          <input class="blur shadow" type="checkbox" id="sound-notification" v-model="soundNotificationTmp" />
          <span class="blur shadow"></span>
        </label> -->
      </div>
      <div class="setting-button">
        <button @click="close" class="cancel-button">
          {{ t('settings.cancel') }}
        </button>
        <button
          @click="saveSettings()"
          class="save-button"
          :class="{ error: !saveAvailable }"
          :disabled="!saveAvailable"
        >
          {{ saveText }}
        </button>
      </div>
    </div>
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

.settings-cluster {
  display: flex;
  flex-direction: column;
  gap: 0;

  min-width: min(60rem, 90vw);
  max-height: 90vh;
  overflow: hidden;

  border-radius: var(--border-radius);

  background-color: var(--light-color);
  background-image: radial-gradient(
    var(--primary-light-color) 1px,
    transparent 1px
  );
  background-size: 20px 20px;

  z-index: 1002;

  h2 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    color: var(--light-color);
    background-color: var(--primary-color);

    width: 100%;
    padding: 1rem;
    margin: 0;

    border-radius: var(--border-radius) var(--border-radius) 0 0;

    font-size: 2rem;
    font-weight: 700;
  }

  .setting-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.5rem;
    align-items: center;

    width: 100%;
    padding: 2rem 1.5rem;
    overflow-y: auto;
    overflow-x: hidden;

    label {
      font-size: 1.2rem;
      font-weight: 700;

      text-align: right;
      align-self: start;
      padding-top: 0.4rem;

      &.label-for-switch {
        padding-top: 0;
        align-self: center;
      }
    }

    .switch-input {
      position: relative;
      display: inline-block;
      width: 4rem;
      height: 2rem;

      input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      span {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: var(--border-radius);
        background-color: var(--secondary-color);
        transition: all 0.1s ease-in-out;

        &:before {
          position: absolute;
          content: '';
          height: 1.5rem;
          width: 1.5rem;
          left: 0.25rem;
          bottom: 0.25rem;
          border-radius: var(--small-border-radius);
          background-color: var(--light-color);
          transition: all 0.1s ease-in-out;
        }
      }

      input:checked + span {
        background-color: var(--success-color);

        &:before {
          transform: translateX(calc(4rem - 2 * 0.25rem - 1.5rem));
        }
      }
    }

    .range-input {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;

      input[type='range'] {
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        outline: 0;
        background-color: transparent;
        border-radius: var(--border-radius);
        cursor: pointer;

        &::-webkit-slider-runnable-track {
          height: 1.5rem;
          background-color: var(--light-blur-color);
          border-radius: var(--border-radius);
        }

        &::-moz-range-track {
          height: 1.5rem;
          background-color: var(--light-blur-color);
          outline: none;
          border-radius: var(--border-radius);
        }

        &::-webkit-slider-container {
          width: 100%;
          height: 1.5rem;
          overflow: hidden;
          background-color: transparent;
          border-radius: var(--border-radius);
        }

        &::-moz-range-progress {
          width: 100%;
          height: 1.5rem;
          overflow: hidden;
          background-color: transparent;
          border-radius: var(--border-radius);
        }

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;

          width: 0rem;
          height: 1.5rem;

          border-image: linear-gradient(
              var(--primary-color),
              var(--primary-color)
            )
            0 fill / 8 20 8 0 / 0 0 0 2000px;
        }

        &::-moz-range-thumb {
          width: 0rem;
          height: 1.5rem;

          border-image: linear-gradient(
              var(--primary-color),
              var(--primary-color)
            )
            0 fill / 8 20 8 0 / 0 0 0 2000px;
        }

        &:focus {
          outline: none;
        }
      }

      .range-input-label {
        display: flex;
        justify-content: space-between;

        width: calc(100% + 1rem);

        font-size: 1rem;
        font-weight: 700;

        span {
          width: 1rem;
          text-align: center;
          font-family: var(--code-font-family);
          font-size: 1rem;
          color: var(--secondary-color);
        }
      }
    }

    textarea {
      width: 100%;
      padding: 0.5rem;
      border: none;
      border-radius: var(--border-radius);
      min-height: 16rem;

      color: var(--dark-color);
      background-color: var(--light-blur-color);

      font-size: 1.2rem;
      font-family: var(--code-font-family);
      word-break: keep-all;
      line-break: keep-all;

      resize: none;

      transition: all 0.1s ease-in-out;

      &:focus {
        border: none;
        outline: 2px solid var(--primary-color);
      }
    }

    select {
      appearance: base-select;

      width: 100%;
      padding: 0.5rem;
      border: none;
      border-radius: var(--border-radius);

      color: var(--dark-color);
      background-color: var(--light-blur-color);

      font-size: 1.2rem;
      font-family: inherit;

      cursor: pointer;

      transition: all 0.1s ease-in-out;

      &:focus {
        border: none;
        outline: 2px solid var(--primary-color);
      }

      &::picker(select) {
        appearance: base-select;

        color: var(--dark-color);
        background-color: var(--light-color);

        border-color: var(--primary-color);
        border-radius: var(--border-radius);
      }

      option {
        padding: 0.5rem 1rem;

        &::checkmark {
          display: none;
        }
      }
    }
  }

  .setting-button {
    display: grid;
    grid-template-columns: 1fr 1fr;

    width: 100%;

    border-radius: 0 0 var(--border-radius) var(--border-radius);

    button {
      width: 100%;
      padding: 1rem;
      border: none;

      font-size: 1.2rem;

      cursor: pointer;

      transition: all 0.1s ease-in-out;

      &.cancel-button {
        background-color: var(--primary-light-color);
        color: var(--primary-color);

        border-radius: 0 0 0 var(--border-radius);

        @media (hover: hover) {
          &:hover {
            background-color: var(--primary-color);
            color: var(--light-color);
          }
        }
      }

      &.save-button {
        background-color: var(--success-color);
        color: var(--light-color);

        border-radius: 0 0 var(--border-radius) 0;

        font-weight: 700;

        @media (hover: hover) {
          &:hover {
            background-color: var(--success-dark-color);
          }
        }

        &.error {
          background-color: var(--secondary-light-color);
          color: var(--secondary-color);

          cursor: not-allowed;

          @media (hover: hover) {
            &:hover {
              background-color: var(--secondary-light-color);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .settings-cluster {
    .setting-item {
      grid-template-columns: 1fr;
      gap: 0.5rem;

      label {
        text-align: left;
      }
    }

    .setting-button {
      grid-template-columns: 1fr;

      button {
        &.cancel-button {
          border-radius: 0;
        }

        &.save-button {
          border-radius: 0 0 var(--border-radius) var(--border-radius);
        }
      }
    }
  }
}
</style>
