import { storeToRefs } from 'pinia';
import { io } from 'socket.io'
import { useDataStore } from '../dataStore.js'

export default {
  data() {
    return {
      targetId: '',
      enableConnect: false,
      isConnecting: false,
      copied: false,
    }
  },

  computed: {
    buttonStatus() {
      return {
        disabled: (!this.enableConnect && !this.isConnectSuccess) || !this.registered,
        ready: this.enableConnect && !this.isConnectSuccess && this.registered,
        success: !this.enableConnect && this.isConnectSuccess && this.registered,
      }
    }
  },

  watch: {    
    targetId(newVal) {
      this.validateInput(newVal);
    },

    connectCore: {
      deep: true,
      handler(newVal) {
        if (newVal.targetId !== newVal.targetId.toUpperCase()) {
          this.connectCore.targetId = newVal.targetId.toUpperCase();
        }
        this.targetId = newVal.targetId;
      }
    },

    isConnectSuccess(newValue) {
      if (newValue) {
        this.enableConnect = false;
      }
      this.isConnecting = false
    }
  },

  methods: {
    validateInput(value) { // Check if the input is 4 characters long
      this.enableConnect = (value.length === 4)
      this.isConnectSuccess = false
    },

    copyId() { // Copy the clientId to the clipboard
      navigator.clipboard.writeText(this.clientId)
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1000);
    },

    connectTarget() { // Connect to the targetId
      this.isConnecting = true
      this.dataStore.connectCore.connectTarget(this.targetId)
    },
  },

  setup() {
    const dataStore = useDataStore()
    
    dataStore.establishPeerConnection()

    const { connectCore, clientId, isConnectSuccess, registered } = storeToRefs(dataStore)

    return {
      dataStore,
      connectCore,
      clientId,
      isConnectSuccess,
      registered
    }
  },

  mounted() {
    this.connectCore.registerClient()
  },

  template: /*html*/`
    <div class="id">
      <div id="clientId" @click="copyId" :class="this.clientId === 'LOADING' ? 'disabled' : 'ready'">
        {{ this.clientId }}
        <div class="cover">
          <span class="mdi mdi-check-bold" v-if="copied"></span>
          <span class="mdi mdi-content-copy" v-else></span>
        </div>
      </div>
      <div id="targetId" :class="buttonStatus">
        <span class="info">Enter the peer's code</span>
        <input type="text" id="targetIdInput" placeholder="code" maxlength="4"
          v-model="connectCore.targetId">
        <button id="connectButton"
          :disabled="!enableConnect || !registered" @click="connectTarget">
          <span v-if="isConnecting" class="mdi mdi-dots-horizontal"></span>
          <span v-else class="mdi mdi-connection"></span>
        </button>
      </div>
    </div>
  `
}