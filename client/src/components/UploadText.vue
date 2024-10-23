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
    <textarea id="textInput" placeholder="Send a short message..." :disabled="!isConnectSuccess" v-model="textInput"
      ref="textInput.value"></textarea>
    <button id="sendButton" :disabled="!isConnectSuccess" @click="onTextClick">
      <span class="mdi" :class="{ 'mdi-send': !textSent, 'mdi-check-bold': textSent }"></span>
      <p v-if="!textSent">Send Message</p>
      <p v-else>Succeed</p>
    </button>
  </div>
</template>

<style scoped lang="scss">
.text {
  grid-column: 1 / 3;
  grid-row: 2 / 3;
  border-style: solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--primary-color);
  background-color: var(--primary-light-color);

  &.disabled {
    border-color: var(--secondary-color);
    background-color: var(--secondary-light-color);
    color: var(--secondary-color);
    cursor: not-allowed;

    textarea {
      cursor: not-allowed;
    }

    button {
      border-color: var(--secondary-color);
      background-color: var(--secondary-light-color);
      color: var(--secondary-color);
      cursor: not-allowed;
    }
  }

  textarea {
    width: 100%;
    height: 12rem;
    border: none;
    border-radius: 0.25rem;
    background-color: var(--light-color);
    resize: none;
    padding: 0.5rem;
    font-size: 1.5rem;
    font-family: inherit;

    &:focus {
      outline: none;
    }
  }

  button {
    outline: none;
    font-weight: 700;
    width: 100%;
    padding: 0.5rem;
    border: 2px solid;
    border-color: var(--primary-color);
    border-radius: 0.25rem;
    color: var(--primary-color);
    background-color: var(--primary-light-color);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:has(.mdi-check-bold) {
      color: var(--success-color);
      background-color: var(--success-light-color);
      border-color: var(--success-color);
    }

    span {
      font-size: 1.5rem;
      line-height: 1.5rem;
    }

    p {
      font-size: 1.5rem;
      line-height: 1.5rem;
      margin: 0;
    }
  }

  @media (hover: hover) {
    &:not(.disabled) button {
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
  .text {
    grid-column: 1 / 2;
    grid-row: 3 / 4;

    textarea {
      height: 10rem;
    }
  }
}
</style>
