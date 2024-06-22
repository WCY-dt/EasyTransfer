import { storeToRefs } from 'pinia';
import { io } from 'socket.io'
import { useDataStore } from '../dataStore.js'

export default {
  data() {
    return {
      clientId: '',
      targetId: '',
      enableConnect: false,
      copied: false,
    }
  },

  computed: {
    buttonStatus() {
      return {
        disabled: !this.enableConnect && !this.isConnectSuccess,
        ready: this.enableConnect && !this.isConnectSuccess,
        success: !this.enableConnect && this.isConnectSuccess,
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
        this.targetId = newVal.targetId;
      }
    },

    isConnectSuccess(newValue) {
      if (newValue) {
        this.enableConnect = false;
      }
    }
  },

  methods: {
    generateId() { // Generate a random 4 character string
      let id;
      do {
        id = Math.random().toString(36).substring(2, 6).toUpperCase();
      } while (id.includes('0') || id.includes('1') || id.includes('O') || id.includes('I') || id.includes('L'));
      return id;
    },

    validateInput(value) { // Check if the input is 4 characters long
      this.enableConnect = (value.length === 4)
      this.isConnectSuccess = false;
    },

    copyId() { // Copy the clientId to the clipboard
      navigator.clipboard.writeText(this.clientId)
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },

    connectTarget() { // Connect to the targetId
      this.dataStore.connectCore.connectTarget(this.targetId)
    },
  },

  setup() {
    const dataStore = useDataStore()
    
    dataStore.establishPeerConnection()

    const { connectCore, isConnectSuccess } = storeToRefs(dataStore)

    return {
      dataStore,
      connectCore,
      isConnectSuccess,
    }
  },

  mounted() {
    this.clientId = this.generateId()
    this.connectCore.registerClient(this.clientId)
  },

  template: /*html*/`
    <div class="id">
      <div id="clientId" @click="copyId">
        {{ connectCore.clientId }}
        <div class="cover">
          <span class="mdi mdi-check-bold" v-if="copied"></span>
          <span class="mdi mdi-content-copy" v-else></span>
        </div>
      </div>
      <div id="targetId" :class="buttonStatus">
          <input type="text" id="targetIdInput" placeholder="code" maxlength="4"
            v-model="connectCore.targetId">
          <button id="connectButton"
            :disabled="!enableConnect" @click="connectTarget">
            <span class="mdi mdi-connection"></span>
          </button>
      </div>
    </div>
  `
}