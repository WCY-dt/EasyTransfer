<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'

const connectStore = useConnectStore()
connectStore.initializeConnection()

const { isConnectSuccess, registered, clientId, targetId } =
  storeToRefs(connectStore)

const enableConnect = ref(false)
const isConnecting = ref(false)
const copied = ref(false)

const buttonStatus = computed(() => ({
  disabled:
    (!enableConnect.value && !isConnectSuccess.value) || !registered.value,
  ready: enableConnect.value && !isConnectSuccess.value && registered.value,
  success: !enableConnect.value && isConnectSuccess.value && registered.value,
}))

watch(targetId, newVal => {
  if (newVal !== newVal.toUpperCase()) {
    targetId.value = newVal.toUpperCase()
  }
  validateInput(newVal)
})

watch(isConnectSuccess, newValue => {
  if (newValue) {
    enableConnect.value = false
  }
  isConnecting.value = false
})

function validateInput(value) {
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
  isConnecting.value = true
  targetId.value = targetId.value.toUpperCase()
  connectStore.connectTarget()
}

onMounted(async () => {
  await connectStore.registerClient()
})
</script>

<template>
  <div class="id-cluster">
    <div
      class="clientId-cluster"
      @click="copyId"
      :class="clientId === 'LOADING' ? 'disabled' : 'ready'"
    >
      {{ clientId }}
      <div class="cover">
        <span class="mdi mdi-check-bold" v-if="copied"></span>
        <span class="mdi mdi-content-copy" v-else></span>
      </div>
    </div>
    <div class="targetId-cluster" :class="buttonStatus">
      <span class="input-hint">Enter the peer's code</span>
      <input
        type="text"
        id="targetIdInput"
        class="targetId-input"
        placeholder="code"
        maxlength="4"
        v-model="targetId"
      />
      <button
        id="connectButton"
        class="connect-button"
        :disabled="!enableConnect || !registered"
        @click="connectTarget"
      >
        <span v-if="isConnecting" class="mdi mdi-dots-horizontal"></span>
        <span v-else class="mdi mdi-connection"></span>
      </button>
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

    border: 2px solid;
    border-radius: 0.25rem;

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
      border: 2px solid var(--primary-color);
      border-radius: 0.25rem;
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
      border-radius: 0.25rem 0 0 0.25rem;

      font-family: var(--code-font-family);
      font-size: 4rem;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;

      color: var(--dark-color);

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
      border-radius: 0;

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
}
</style>
