<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()

const { maxConnectionNumber, iceServers, autoDisplayImage, directlyOpenLink } =
  storeToRefs(settingStore)

const emit = defineEmits(['close'])
const close = () => {
  emit('close')
}

const saveAvailable = ref(true)
const saveText = ref('Save')

const maxConnectionNumberTmp = ref(null)
const iceServersTmp = ref(null)
const autoDisplayImageTmp = ref(null)
const directlyOpenLinkTmp = ref(null)

onMounted(() => {
  maxConnectionNumberTmp.value = maxConnectionNumber.value
  iceServersTmp.value = iceServers.value
    .map(server => JSON.stringify(server))
    .join('\n')

  autoDisplayImageTmp.value = autoDisplayImage.value
  directlyOpenLinkTmp.value = directlyOpenLink.value
})

function saveSettings() {
  if (maxConnectionNumber.value !== maxConnectionNumberTmp.value) {
    maxConnectionNumber.value = maxConnectionNumberTmp.value
  }

  let iceServersValue = JSON.parse(
    `[${iceServersTmp.value.split('\n').join(',')}]`,
  )
  if (JSON.stringify(iceServers.value) !== JSON.stringify(iceServersValue)) {
    iceServers.value = iceServersValue
  }

  if (autoDisplayImage.value !== autoDisplayImageTmp.value) {
    autoDisplayImage.value = autoDisplayImageTmp.value
  }

  if (directlyOpenLink.value !== directlyOpenLinkTmp.value) {
    directlyOpenLink.value = directlyOpenLinkTmp.value
  }

  close()
}

const checkSettings = () => {
  saveAvailable.value = false
  saveText.value = 'Checking...'

  if (maxConnectionNumberTmp.value < 1) {
    maxConnectionNumberTmp.value = 1
  }

  let iceServersValue
  try {
    iceServersValue = JSON.parse(
      `[${iceServersTmp.value.split('\n').join(',')}]`,
    )
  } catch {
    saveAvailable.value = false
    saveText.value = 'ICE Servers format incorrect'
    return
  }

  if (iceServersValue.length === 0) {
    saveAvailable.value = false
    saveText.value = 'ICE Servers cannot be empty'
    return
  }

  for (let server of iceServersValue) {
    if (!server.urls) {
      saveAvailable.value = false
      saveText.value = 'ICE Servers must have urls property'
      return
    }
  }

  saveAvailable.value = true
  saveText.value = 'Save'
}
</script>

<template>
  <div class="overlay blur" @click.self="close">
    <div class="settings-cluster shadow">
      <h2><span class="mdi mdi-cog"></span>Settings</h2>
      <div class="setting-item">
        <label for="max-connection-number">Max connection number</label>
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
        <label for="ice-servers">ICE Servers</label>
        <textarea
          id="ice-servers"
          class="blur shadow"
          v-model="iceServersTmp"
          spellcheck="false"
          @input="checkSettings"
        ></textarea>
        <label for="enable-img-display">Auto display image</label>
        <label class="switch-input blur shadow">
          <input
            class="blur shadow"
            type="checkbox"
            id="enable-img-display"
            v-model="autoDisplayImageTmp"
          />
          <span class="blur shadow"></span>
        </label>
        <label for="enable-open-link">Directly open link</label>
        <label class="switch-input blur shadow">
          <input
            class="blur shadow"
            type="checkbox"
            id="enable-open-link"
            v-model="directlyOpenLinkTmp"
          />
          <span class="blur shadow"></span>
        </label>
      </div>
      <div class="setting-button">
        <button @click="close" class="cancel-button">Cancel</button>
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
  display: felx;
  flex-direction: column;
  gap: 0;

  min-width: min(60rem, 90vw);

  border-radius: var(--border-radius);

  background-color: var(--primary-extra-light-color);
  background-image: linear-gradient(
      to right,
      var(--primary-light-color) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, var(--primary-light-color) 1px, transparent 1px);
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

    width: 100%;
    padding: 2rem 1.5rem;

    label {
      font-size: 1.2rem;
      font-weight: 700;

      text-align: right;
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
