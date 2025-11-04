<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectStore } from '@/stores/connect'
import { useSendStore } from '@/stores/send'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCheckBold, mdiSend } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const connectStore = useConnectStore()
const { isConnectSuccess } = storeToRefs(connectStore)
const sendStore = useSendStore()

const textInput = ref<string>('')
const textSent = ref<boolean>(false)

function onTextClick(): void {
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
      class="text-input blur"
      :placeholder="t('upload.sendMessage')"
      :disabled="!isConnectSuccess"
      v-model="textInput"
      ref="textInput.value"
    ></textarea>
    <button
      id="sendButton"
      class="send-button"
      :disabled="!isConnectSuccess"
      @click="onTextClick"
      :aria-label="t('upload.sendMessageButton')"
    >
      <SvgIcon
        type="mdi"
        :path="mdiCheckBold"
        size="1.5rem"
        class="mdi"
        v-if="textSent"
      />
      <SvgIcon type="mdi" :path="mdiSend" size="1.5rem" class="mdi" v-else />
      <p v-if="!textSent" class="upload-text-title">
        {{ t('upload.sendMessageButton') }}
      </p>
      <p v-else class="upload-text-title">
        {{ t('upload.sendMessageSuccess') }}
      </p>
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

  color: var(--primary-color);

  &.disabled {
    color: var(--secondary-color);

    cursor: not-allowed;

    .text-input {
      cursor: not-allowed;
    }

    .send-button {
      border-color: var(--secondary-light-color);

      background-color: var(--secondary-light-color);
      color: var(--secondary-color);

      cursor: not-allowed;
    }
  }

  .text-input {
    width: 100%;
    height: 12rem;
    padding: 0.5rem;
    border-width: 2px 2px 0 2px;
    border-style: solid;
    border: none;
    border-radius: var(--border-radius) var(--border-radius) 0 0;

    color: var(--dark-color);
    background-color: var(--light-blur-color);

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
    border-color: var(--primary-light-color);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    outline: none;

    font-weight: 700;

    background-color: var(--primary-light-color);
    color: var(--primary-color);

    cursor: pointer;

    transition: all 0.1s ease-in-out;

    &:has(.mdi-check-bold) {
      border-color: var(--success-light-color);

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
        border-color: var(--primary-color);

        background-color: var(--primary-color);
        color: var(--light-color);
      }

      &:has(.mdi-check-bold):hover {
        border-color: var(--success-color);

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
