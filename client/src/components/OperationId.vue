<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSettingStore } from '@/stores/setting'
import { checkTurnServer } from '@/utils/connectionTest'
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiCheckBold,
  mdiContentCopy,
  mdiDotsHorizontal,
  mdiConnection,
} from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const connectStore = useConnectStore()
connectStore.initializeConnection()

const settingStore = useSettingStore()

const { isConnectSuccess, registered, clientId, targetId, isConnecting } =
  storeToRefs(connectStore)

const { iceServers } = storeToRefs(settingStore)

const enableConnect = ref<boolean>(false)
const copied = ref<boolean>(false)

const buttonStatus = computed(() => ({
  disabled:
    (!enableConnect.value && !isConnectSuccess.value) || !registered.value,
  ready: enableConnect.value && !isConnectSuccess.value && registered.value,
  success: !enableConnect.value && isConnectSuccess.value && registered.value,
}))

const isTurnServerAvailable = ref<boolean>(false)

watch(targetId, (newVal: string) => {
  if (newVal !== newVal.toUpperCase()) {
    targetId.value = newVal.toUpperCase()
  }
  validateInput(newVal)
})

watch(isConnectSuccess, (newValue: boolean) => {
  if (newValue) {
    enableConnect.value = false
  }
})

function validateInput(value: string) {
  enableConnect.value = value.length === 4
  isConnectSuccess.value = false
}

function copyId() {
  if (registered.value) {
    navigator.clipboard.writeText(clientId.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1000)
  }
}

function connectTarget() {
  targetId.value = targetId.value.toUpperCase()
  connectStore.connectTarget()
}

onMounted(async () => {
  await connectStore.registerClient()

  isTurnServerAvailable.value = await checkTurnServer(iceServers.value)
})
</script>

<template>
  <div class="id-cluster">
    <div
      class="clientId-cluster"
      @click="copyId"
      :class="clientId === t('operation.loading') ? 'disabled' : 'ready'"
    >
      {{ clientId }}
      <div class="cover blur">
        <SvgIcon type="mdi" :path="mdiCheckBold" size="4rem" v-if="copied" />
        <SvgIcon type="mdi" :path="mdiContentCopy" size="4rem" v-else />
      </div>
    </div>
    <div class="targetId-cluster shadow" :class="buttonStatus">
      <span class="input-hint shadow">{{ t('operation.enterPeerCode') }}</span>
      <input
        type="text"
        id="targetIdInput"
        class="targetId-input blur"
        :placeholder="t('operation.code').toLowerCase()"
        maxlength="4"
        v-model="targetId"
      />
      <button
        id="connectButton"
        class="connect-button"
        :disabled="!enableConnect || !registered"
        @click="connectTarget"
        :aria-label="t('operation.connect')"
      >
        <SvgIcon
          type="mdi"
          :path="mdiDotsHorizontal"
          size="3rem"
          class="mdi"
          v-if="isConnecting"
        />
        <SvgIcon
          type="mdi"
          :path="mdiConnection"
          size="3rem"
          class="mdi"
          v-else
        />
      </button>
    </div>
    <div class="isTurnServerAvailable">
      <span
        class="dot"
        :class="{ green: isTurnServerAvailable, red: !isTurnServerAvailable }"
      ></span>
      <span class="notice">{{
        isTurnServerAvailable
          ? t('operation.turnServerAvailable')
          : t('operation.turnServerNotAvailable')
      }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.id-cluster {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  font-family: var(--code-font-family);

  .clientId-cluster {
    position: relative;

    font-size: 6rem;
    line-height: 6rem;
    font-weight: 900;
    text-align: center;

    transition: all 0.1s ease-in-out;

    .cover {
      display: grid;
      place-content: center;

      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      color: var(--primary-color);
      background-color: transparent;
      opacity: 0;

      font-size: 4rem;

      cursor: pointer;

      transition: all 0.1s ease-in-out;
    }

    &.ready {
      color: var(--primary-color);
    }

    &.disabled {
      color: var(--secondary-color);

      cursor: not-allowed;
    }

    @media (hover: hover) {
      &:hover .cover {
        opacity: 1;
      }

      &.ready:hover {
        color: var(--primary-light-color);
      }

      &.disabled:hover {
        color: var(--secondary-color);

        .cover {
          opacity: 0;

          cursor: not-allowed;
        }
      }
    }
  }

  .targetId-cluster {
    display: flex;
    justify-content: center;

    position: relative;

    border-radius: var(--border-radius);

    transition: all 0.1s ease-in-out;

    .input-hint {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      transform: translateY(80%);

      background-color: var(--primary-light-color);
      color: var(--primary-color);
      opacity: 0;

      text-align: center;

      padding: 0.2rem 0.5rem;
      border-radius: var(--border-radius);
      z-index: -1;

      transition: all 0.1s ease-in-out;
    }

    &.disabled {
      border-color: var(--secondary-color);

      @media (hover: hover) {
        &:hover .input-hint {
          opacity: 1;
          transform: translateY(110%);
        }
      }

      .connect-button {
        display: flex;
        align-items: center;
        justify-content: center;

        background-color: var(--secondary-color);

        cursor: not-allowed;
      }
    }

    &.ready {
      border-color: var(--primary-color);

      .connect-button {
        background-color: var(--primary-color);

        transition: all 0.1s ease-in-out;

        @media (hover: hover) {
          &:hover {
            background-color: var(--primary-dark-color);
          }
        }
      }
    }

    &.success {
      border-color: var(--success-color);

      .targetId-input {
        color: var(--success-color);
      }

      .connect-button {
        background-color: var(--success-color);

        cursor: not-allowed;
      }
    }

    .targetId-input {
      width: 12rem;
      padding: 0.5rem;
      border: none;
      border-radius: var(--border-radius) 0 0 var(--border-radius);

      font-family: var(--code-font-family);
      font-size: 4rem;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;

      color: var(--dark-color);
      background-color: var(--light-blur-color);

      &::placeholder {
        color: var(--secondary-color);
      }

      &:focus {
        outline: none;
      }
    }

    .connect-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0 var(--border-radius) var(--border-radius) 0;

      font-family: var(--normal-font-family);
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;

      color: var(--light-color);

      cursor: pointer;

      .mdi {
        margin: auto;

        font-size: 3rem;
        line-height: 3rem;
      }
    }
  }

  .isTurnServerAvailable {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    margin-top: 2rem;

    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;

    .dot {
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 50%;

      &.green {
        background-color: var(--success-color);
      }

      &.red {
        background-color: var(--error-color);
      }
    }

    .notice {
      color: var(--dark-color);
    }
  }
}
</style>
