<script setup>
import { ref, onMounted } from 'vue'
import { useConnectStore } from '@/stores/connect'

const connectStore = useConnectStore()

const emit = defineEmits(['close'])
const close = () => {
  emit('close')
}

const saveAvailable = ref(true)
const saveText = ref('Save')

const maxConnectionNumberTmp = ref(null)
const iceServersTmp = ref(null)

onMounted(() => {
  maxConnectionNumberTmp.value = connectStore.getMaxConnectionNumber()
  let iceServersObject = connectStore.getIceServers()
  iceServersTmp.value = iceServersObject
    .map(server => JSON.stringify(server))
    .join('\n')
})

function saveSettings() {
  connectStore.setMaxConnectionNumber(maxConnectionNumberTmp.value)
  let iceServersValue
  iceServersValue = JSON.parse(`[${iceServersTmp.value.split('\n').join(',')}]`)
  connectStore.setIceServers(iceServersValue)
  close()
}

const checkSettings = () => {
  saveAvailable.value = false
  saveText.value = 'Checking...'

  if (!maxConnectionNumberTmp.value) {
    saveAvailable.value = false
    saveText.value = 'Max connection number cannot be empty'
    return
  }

  if (maxConnectionNumberTmp.value < 1) {
    saveAvailable.value = false
    saveText.value = 'Max connection number must be greater than 0'
    return
  }

  if (maxConnectionNumberTmp.value > 10) {
    saveAvailable.value = false
    saveText.value = 'Max connection number must be less than 10'
    return
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
        <input
          type="number"
          id="max-connection-number"
          class="blur shadow"
          v-model="maxConnectionNumberTmp"
          @input="checkSettings"
        />
        <label for="ice-servers">ICE Servers</label>
        <textarea
          id="ice-servers"
          class="blur shadow"
          v-model="iceServersTmp"
          spellcheck="false"
          @input="checkSettings"
        ></textarea>
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
    gap: 1rem;

    width: 100%;
    padding: 2rem 1.5rem;

    label {
      font-size: 1.2rem;
      font-weight: 700;

      text-align: right;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.5rem;
      border: none;
      border-radius: var(--border-radius);

      background-color: var(--light-blur-color);

      font-size: 1.2rem;
      font-family: var(--code-font-family);
      word-break: keep-all;
      line-break: keep-all;

      transition: all 0.1s ease-in-out;

      &:focus {
        border: none;
        outline: 2px solid var(--primary-color);
      }
    }

    textarea {
      resize: none;

      min-height: 16rem;
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
