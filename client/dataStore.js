import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io'
import ConnectCore from './e2e/connectCore.js'
import SendCore from './e2e/sendCore.js'
import SendFileUtil from './e2e/sendFileUtil.js'
import SendTextUtil from './e2e/sendTextUtil.js'
import ReceiveUtil from './e2e/receiveUtil.js'

export const useDataStore = defineStore('data', {
  state: () => ({
    connectCore: ref(null),
    sendCore: ref(null),
    sendFileUtil: ref(null),
    sendTextUtil: ref(null),
    receiveUtil: ref(null),

    clientId: ref('LOADING'),

    pubKey: ref(null), // Public key of the peer
    privKey: ref(null), // Private key of itself

    isConnectSuccess: ref(false),
    registered: ref(false),
  }),
  actions: {
    establishPeerConnection() { // Establish the peer connection
      this.connectCore = new ConnectCore(
        this.setClientId,
        this.setPubKey,
        this.setPrivKey,
        this.setRegistered
      )
      this.sendCore = new SendCore(
        this.connectCore.peerConnection, 
        this.setConnectSuccess,
        this.getPubKey
      )
      this.sendFileUtil = new SendFileUtil()
      this.sendTextUtil = new SendTextUtil()
      this.receiveUtil = new ReceiveUtil(
        this.getPrivKey
      )
    },

    setClientId(id) { // Set the client ID
      this.clientId = id
    },

    getPubKey() { // Get the public key
      return this.pubKey
    },

    setPubKey(key) { // Set the public key
      this.pubKey = key
    },

    getPrivKey() { // Get the private key
      return this.privKey
    },

    setPrivKey(key) { // Set the private key
      this.privKey = key
    },

    setRegistered(status) { // Set the registration status
      this.registered = status
    },

    setConnectSuccess(status) { // Set the connection status
      this.isConnectSuccess = status
    },
  },
})
