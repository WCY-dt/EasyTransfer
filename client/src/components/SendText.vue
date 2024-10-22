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
  <div id="text" class="text" :class="{ disabled: !isConnectSuccess, active: isConnectSuccess }">
    <textarea id="textInput" placeholder="Type a message to send" :disabled="!isConnectSuccess" v-model="textInput"
      ref="textInput.value"></textarea>
    <button id="sendButton" class="mdi" :class="{ 'mdi-send': !textSent, 'mdi-check-bold': textSent }"
      :disabled="!isConnectSuccess" @click="onTextClick"></button>
  </div>
</template>

<style scoped lang="scss">
.text {
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  border-style: solid;

  textarea {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0.25rem;
    background-color: var(--light-color);
    resize: none;
    padding: 0.5rem;
    font-size: 1.2rem;
    font-family: inherit;

    &:focus {
      outline: none;
    }
  }

  button {
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 0.25rem;
    color: var(--light-color);
    background-color: var(--primary-color);
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &.mdi-check-bold {
      background-color: var(--success-color);
    }
  }

  &.disabled {
    button {
      background-color: var(--secondary-color);
      cursor: not-allowed;
    }
  }

  &:not(.disabled) {
    button {
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
  .text {
    grid-column: 1 / 2;
    grid-row: 3 / 4;

    textarea {
      height: 10rem;
    }
  }
}

@media (hover: none) {
  .text:not(.disabled) button:hover {
    background-color: var(--primary-color);
  }
}
</style>
