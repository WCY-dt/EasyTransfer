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
  navigator.clipboard.writeText(clientId.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1000)
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
  <div class="id">
    <div
      id="clientId"
      @click="copyId"
      :class="clientId === 'LOADING' ? 'disabled' : 'ready'"
    >
      {{ clientId }}
      <div class="cover">
        <span class="mdi mdi-check-bold" v-if="copied"></span>
        <span class="mdi mdi-content-copy" v-else></span>
      </div>
    </div>
    <div id="targetId" :class="buttonStatus">
      <span class="info">Enter the peer's code</span>
      <input
        type="text"
        id="targetIdInput"
        placeholder="code"
        maxlength="4"
        v-model="targetId"
      />
      <button
        id="connectButton"
        :disabled="!enableConnect || !registered"
        @click="connectTarget"
      >
        <span v-if="isConnecting" class="mdi mdi-dots-horizontal"></span>
        <span v-else class="mdi mdi-connection"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.id {
  font-family: var(--code-font-family);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.id #clientId {
  position: relative;
  font-size: 6rem;
  font-weight: 900;
  text-align: center;
  transition: all 0.1s ease-in-out;
}

.id #clientId .cover {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  color: var(--primary-color);
  font-size: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease-in-out;
}

.id #clientId:hover .cover {
  opacity: 1;
}

.id #clientId.ready {
  color: var(--primary-color);
}

.id #clientId.ready:hover {
  color: var(--primary-light-color);
}

.id #clientId.disabled {
  color: var(--secondary-color);
}

.id #clientId.disabled:hover {
  color: var(--secondary-color);
}

.id #clientId.disabled:hover .cover {
  opacity: 0;
}

.id #targetId {
  position: relative;
  display: flex;
  justify-content: center;
  border: 2px solid;
  border-radius: 0.25rem;
  gap: 0;
  transition: all 0.3s ease-in-out;
}

.id #targetId .info {
  opacity: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(80%);
  text-align: center;
  border: 2px solid var(--primary-color);
  border-radius: 0.25rem;
  padding: 0.2rem 0.5rem;
  background-color: var(--primary-light-color);
  color: var(--primary-color);
  z-index: -1;
  transition: all 0.3s ease-in-out;
}

.id #targetId.disabled {
  border-color: var(--secondary-color);
}

.id #targetId.disabled:hover .info {
  opacity: 1;
  transform: translateY(110%);
}

.id #targetId.ready {
  border-color: var(--primary-color);
}

.id #targetId.success {
  border-color: var(--success-color);
}

.id #targetId input {
  font-family: var(--code-font-family);
  font-size: 4rem;
  font-weight: 700;
  text-align: center;
  width: 12rem;
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem 0 0 0.25rem;
  border-right: none;
  text-transform: uppercase;
  color: var(--dark-color);
}

.id #targetId.success input {
  color: var(--success-color);
}

.id #targetId input::placeholder {
  color: var(--secondary-color);
}

.id #targetId input:focus {
  outline: none;
}

.id #targetId button {
  font-family: var(--normal-font-family);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0;
  border-left: none;
  color: var(--light-color);
  cursor: pointer;
}

.id #targetId.disabled button {
  cursor: not-allowed;
  background-color: var(--secondary-color);
}

.id #targetId.ready button {
  background-color: var(--primary-color);
  transition: all 0.3s ease-in-out;
}

.id #targetId.ready button:hover {
  background-color: var(--primary-dark-color);
}

.id #targetId.success button {
  cursor: not-allowed;
  background-color: var(--success-color);
}

.id #targetId button span {
  font-size: 3rem;
  line-height: 3rem;
  margin: auto;
}

@media (hover: none) {
  .id #clientId:hover {
    color: var(--primary-color);
  }

  .id #clientId .cover {
    display: none;
  }

  .id #targetId.disabled .info {
    opacity: 1;
    transform: translateY(110%);
  }

  .id #targetId.ready button:hover {
    background-color: var(--primary-color);
  }
}
</style>
