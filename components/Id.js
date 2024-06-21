import { storeToRefs } from 'pinia';
import { io } from 'socket.io'
import { useDataStore } from '../dataStore.js'

export default {
  data() {
    return {
      signalServer: 'https://easy-transfer.glitch.me/',
      socket: null,
      configuration: {
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
          },
        ]
      },
      clientId: '',
      targetId: '',
      enableConnect: false,
      copied: false,
    }
  },

  computed: {
    buttonStatus() {
      return {
        disabled: !this.enableConnect,
        ready: this.enableConnect && !this.isConnectSuccess,
        success: this.enableConnect && this.isConnectSuccess,
      }
    }
  },

  watch: {    
    targetId(newVal, oldVal) {
      this.validateInput(newVal);
    },
  },

  methods: {
    generateId() { // Generate a random 4 character string
      let id;
      do {
        id = Math.random().toString(36).substring(2, 6).toUpperCase();
      } while (id.includes('0') || id.includes('1') || id.includes('O') || id.includes('I') || id.includes('L'));
      return id;
    },

    connectSignalServer(server) { // Connect to the signal server
      this.socket = io.connect(server)
    },

    registerId(id) { // Register the id with the signal server
      console.log(`[INFO] Registering id: ${id}`)
      this.socket.emit('register', id)
    },

    validateInput(value) { // Check if the input is 4 characters long
      this.enableConnect = (value.length === 4)
      this.isConnectSuccess = false;
    },

    connect() { // Emit a connect event with the targetId
      this.sendOffer(this.clientId, this.targetId, this.socket)
      this.sendIceCandidate(this.targetId, this.socket)
    },

    handleServerMsg() { // Handle messages from the signal server
      this.socket.on('offer', (sdp, id) => {
        this.targetId = id
        console.log(`[INFO] Sending answer to ${this.targetId}`)
        this.handleOffer(sdp, this.clientId, this.targetId, this.socket)
        this.sendIceCandidate(this.targetId, this.socket)
      })

      this.socket.on('answer', (sdp, id) => {
        console.log(`[INFO] Received answer from ${this.targetId}`)
        this.handleAnswer(sdp)
      })

      this.socket.on('candidate', (candidate) => {
        console.log(`[INFO] Received candidate from ${this.targetId}`)
        this.handleCandidate(candidate)
      });
    },

    copyId() { // Copy the clientId to the clipboard
      navigator.clipboard.writeText(this.clientId)
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },
  },

  setup() {
    const dataStore = useDataStore()

    const { peerConnection, candidateQueue, sendChannel, isConnectSuccess } = storeToRefs(dataStore);

    const setPeerConnection = (newConnection) => {
      dataStore.setPeerConnection(newConnection)
    }

    const sendOffer = (clientId, targetId, socket) => {
      dataStore.sendOffer(clientId, targetId, socket)
    }

    const sendIceCandidate = (targetId, socket) => {
      dataStore.sendIceCandidate(targetId, socket)
    }

    const addIceCandidate = () => {
      dataStore.addIceCandidate()
    }

    const addDataChannel = () => {
      dataStore.addDataChannel()
    }

    const handleOffer = (sdp, clientId, targetId, socket) => {
      dataStore.handleOffer(sdp, clientId, targetId, socket)
    }

    const handleAnswer = (sdp) => {
      dataStore.handleAnswer(sdp)
    }

    const handleCandidate = (candidate) => {
      dataStore.handleCandidate(candidate)
    }

    return {
      isConnectSuccess,
      setPeerConnection,
      sendOffer,
      sendIceCandidate,
      addIceCandidate,
      addDataChannel,
      handleOffer,
      handleAnswer,
      handleCandidate,
    }
  },

  mounted() {
    this.clientId = this.generateId()
    this.connectSignalServer(this.signalServer)
    this.registerId(this.clientId)
    this.setPeerConnection(new RTCPeerConnection(this.configuration))
    this.handleServerMsg()
    this.addDataChannel()
  },

  template: /*html*/`
    <div class="id">
      <div id="clientId" @click="copyId">
        {{ clientId }}
        <div class="cover">
          <span class="mdi mdi-check-bold" v-if="copied"></span>
          <span class="mdi mdi-content-copy" v-else></span>
        </div>
      </div>
      <div id="targetId" :class="buttonStatus">
          <input type="text" id="targetIdInput" placeholder="code" maxlength="4"
            v-model="targetId">
          <button id="connectButton"
            :disabled="!enableConnect" @click="connect">
            <span class="mdi mdi-connection"></span>
          </button>
      </div>
    </div>
  `
}