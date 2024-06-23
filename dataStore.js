import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io'
import ConnectCore from './e2e/connectCore.js'
import SendCore from './e2e/sendCore.js'
import SendFileUtil from './e2e/sendFileUtil.js'
import SendTextUtil from './e2e/sendTextUtil.js'
import ReceiveFileUtil from './e2e/receiveFileUtil.js'

export const useDataStore = defineStore('data', {
  state: () => ({
    connectCore: ref(null),
    sendCore: ref(null),
    sendFileUtil: ref(null),
    sendTextUtil: ref(null),
    receiveFileUtil: ref(null),

    clientId: ref('LOADING'),

    isConnectSuccess: ref(false),
    registered: ref(false),
  }),
  actions: {
    establishPeerConnection() { // Establish the peer connection
      this.connectCore = new ConnectCore(
        this.setClientId,
        this.setRegistered
      )
      this.sendCore = new SendCore(
        this.connectCore.peerConnection, 
        this.setConnectSuccess
      )
      this.sendFileUtil = new SendFileUtil()
      this.sendTextUtil = new SendTextUtil()
      this.receiveFileUtil = new ReceiveFileUtil()
    },

    setClientId(id) { // Set the client ID
      this.clientId = id
    },

    setRegistered(status) { // Set the registration status
      this.registered = status
    },

    setConnectSuccess(status) { // Set the connection status
      this.isConnectSuccess = status
    },
  },
})
