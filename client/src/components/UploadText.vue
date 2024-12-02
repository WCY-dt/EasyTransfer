<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'

const connectStore = useConnectStore()
const { isConnectSuccess } = storeToRefs(connectStore)
const sendStore = useSendStore()

const textInput = ref('')
const textSent = ref(false)

function onTextClick() {
  if (!isConnectSuccess.value) return
  sendStore.sendText(textInput.value)
  textSent.value = true
  setTimeout(() => {
    textSent.value = false
    textInput.value = ''
  }, 1000)
}
</script>

<template>
  <div
    id="text"
    class="upload-text-cluster"
    :class="{ disabled: !isConnectSuccess, active: isConnectSuccess }"
  >
    <textarea
      id="textInput"
      class="text-input"
      placeholder="Send a short message..."
      :disabled="!isConnectSuccess"
      v-model="textInput"
      ref="textInput.value"
    ></textarea>
    <button
      id="sendButton"
      class="send-button"
      :disabled="!isConnectSuccess"
      @click="onTextClick"
    >
      <span
        class="mdi"
        :class="{ 'mdi-send': !textSent, 'mdi-check-bold': textSent }"
      ></span>
      <p v-if="!textSent" class="upload-text-title">Send Message</p>
      <p v-else class="upload-text-title">Succeed</p>
    </button>
  </div>
</template>

<style scoped lang="scss">
.upload-text-cluster {
  grid-column: 1 / 3;
  grid-row: 2 / 3;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  background-color: var(--primary-light-color);
  color: var(--primary-color);

  &.disabled {
    border-color: var(--secondary-color);

    background-color: var(--secondary-light-color);
    color: var(--secondary-color);

    cursor: not-allowed;

    .text-input {
      cursor: not-allowed;
    }

    .send-button {
      border-color: var(--secondary-color);

      background-color: var(--secondary-light-color);
      color: var(--secondary-color);

      cursor: not-allowed;
    }
  }

  .text-input {
    width: 100%;
    height: 12rem;
    padding: 0.5rem;
    border: none;
    border-radius: 0.25rem;

    background-color: var(--light-color);

    font-family: inherit;
    font-size: 1.5rem;

    resize: none;

    &:focus {
      outline: none;
    }
  }

  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    width: 100%;
    padding: 0.5rem;
    border: 2px solid;
    border-color: var(--primary-color);
    border-radius: 0.25rem;
    outline: none;

    font-weight: 700;

    background-color: var(--primary-light-color);
    color: var(--primary-color);

    cursor: pointer;

    transition: all 0.1s ease-in-out;

    &:has(.mdi-check-bold) {
      border-color: var(--success-color);

      background-color: var(--success-light-color);
      color: var(--success-color);
    }

    .mdi {
      font-size: 1.5rem;
      line-height: 1.5rem;
    }

    .upload-text-title {
      margin: 0;

      font-size: 1.5rem;
      line-height: 1.5rem;
    }
  }

  @media (hover: hover) {
    &:not(.disabled) .send-button {
      &:hover {
        background-color: var(--primary-color);
        color: var(--light-color);
      }

      &:has(.mdi-check-bold):hover {
        background-color: var(--success-color);
        color: var(--light-color);
      }
    }
  }
}

@media (max-width: 768px) {
  .upload-text-cluster {
    grid-column: 1 / 2;
    grid-row: 3 / 4;

    .text-input {
      height: 10rem;
    }
  }
}
</style>
