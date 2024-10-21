import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useConnectStore = defineStore('connect', () => {
  const signalServerUrl = 'https://easy-transfer.glitch.me/'
  const peerConnectionConfiguration = {
    iceServers: [
      {
        urls: 'stun:stun.relay.metered.ca:80',
      },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: 'cf841207b56ebddc17948dde',
        credential: '0dGvvEm7eq2UaqlW',
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: 'cf841207b56ebddc17948dde',
        credential: '0dGvvEm7eq2UaqlW',
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: 'cf841207b56ebddc17948dde',
        credential: '0dGvvEm7eq2UaqlW',
      },
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: 'cf841207b56ebddc17948dde',
        credential: '0dGvvEm7eq2UaqlW',
      },
    ],
  }
  let socket = null
  const peerConnection = ref(null)
  const registered = ref(false)
  const clientId = ref('LOADING')
  const targetId = ref('')
  const pubKey = ref('')
  const privKey = ref('')
  let candidateQueue = []
  const isConnectSuccess = ref(false)
  const sendChannel = ref(null)
  const maxBufferedAmount = ref(1024 * 16)
  const maxRetransmits = 2

  function initializeConnection() {
    socket = io.connect(signalServerUrl)
    peerConnection.value = new RTCPeerConnection(peerConnectionConfiguration)
    handleServerMsg()
    establishDataChannel()
    console.log('[INFO] ===Connection core initialized===')
  }

  async function registerClient() {
    // Generate public-private key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    )

    const tmpPubKey = keyPair.publicKey
    privKey.value = keyPair.privateKey

    // Export the public key to send to the server
    const exportedPubKey = await window.crypto.subtle.exportKey(
      'spki',
      tmpPubKey,
    )

    // Convert the exported key to a base64 string
    const pubKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(exportedPubKey)),
    )

    // Emit the public key to the signal server
    socket.emit('register', pubKeyBase64)

    console.log(`[INFO] ===Registering client===`)
    console.log(`[INFO] Public key: ${pubKeyBase64}`)
  }

  function connectTarget() {
    console.log(`[INFO] ===Connecting to ${targetId.value}===`)

    console.log(`[INFO] Sending offer to ${targetId.value}`)
    peerConnection.value
      .createOffer()
      .then(offer => {
        return peerConnection.value.setLocalDescription(offer)
      })
      .then(() => {
        socket.emit(
          'offer',
          peerConnection.value.localDescription,
          clientId.value,
          targetId.value,
        )
      })

    sendIceCandidate()
  }

  function sendIceCandidate() {
    // Send the ICE candidate to the target peer
    console.log('[INFO] ===Sending ICE candidate===')
    peerConnection.value.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('candidate', event.candidate, targetId.value)

        console.log(`[INFO] Sending candidate to ${targetId.value}`)
      }
    }
  }

  function handleServerMsg() {
    // Handle messages from the signal server
    socket.on('success', id => {
      console.log(`[INFO] ===Client registered with id ${id}===`)
      clientId.value = id
      registered.value = true
    })

    socket.on('disconnect', () => {
      console.log('[INFO] ===Disconnected from the signal server===')
      registered.value = false
      window.location.reload()
    })

    socket.on('offer', (sdp, id, keyBase64) => {
      console.log(`[INFO] ===Connecting to ${id}===`)
      console.log(`[INFO] Peer public key: ${keyBase64}`)

      const keyArray = new Uint8Array(
        atob(keyBase64)
          .split('')
          .map(c => c.charCodeAt(0)),
      )
      convertToCryptoKey(keyArray)
        .then(key => {
          targetId.value = id
          pubKey.value = key

          peerConnection.value
            .setRemoteDescription(new RTCSessionDescription(sdp))
            .then(() => {
              return peerConnection.value.createAnswer()
            })
            .then(answer => {
              return peerConnection.value.setLocalDescription(answer)
            })
            .then(() => {
              socket.emit(
                'answer',
                peerConnection.value.localDescription,
                clientId.value,
                targetId.value,
              )

              console.log(`[INFO] Sending answer to ${targetId.value}`)
            })
            .then(() => {
              addIceCandidate()
            })

          sendIceCandidate()

          console.log(`[INFO] Received offer from ${targetId.value}`)
        })
        .catch(error => {
          console.error(`[ERR] Error converting key: ${error}`)
        })
    })

    socket.on('answer', (sdp, id, keyBase64) => {
      console.log(`[INFO] Peer public key: ${keyBase64}`)

      const keyArray = new Uint8Array(
        atob(keyBase64)
          .split('')
          .map(c => c.charCodeAt(0)),
      )
      convertToCryptoKey(keyArray)
        .then(key => {
          pubKey.value = key

          peerConnection.value
            .setRemoteDescription(new RTCSessionDescription(sdp))
            .then(() => {
              addIceCandidate()
            })

          console.log(`[INFO] Received answer from ${targetId.value}`)
        })
        .catch(error => {
          console.error(`[ERR] Error converting key: ${error}`)
        })
    })

    socket.on('candidate', candidate => {
      console.log(`[INFO] Received candidate from ${targetId.value}`)

      if (peerConnection.value.remoteDescription) {
        peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate))

        console.log(`[INFO] Added ${targetId.value} to ICE candidate`)
      } else {
        candidateQueue.push(candidate)
      }
    })
  }

  function addIceCandidate() {
    // Add the ICE candidate to the peer connection
    while (candidateQueue.length) {
      peerConnection.value.addIceCandidate(
        new RTCIceCandidate(candidateQueue.shift()),
      )
    }

    console.log(`[INFO] Added ${targetId.value} to ICE candidate`)
  }

  async function convertToCryptoKey(keyArray) {
    return window.crypto.subtle.importKey(
      'spki',
      keyArray,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt'],
    )
  }

  function establishDataChannel() {
    sendChannel.value = peerConnection.value.createDataChannel('fileTransfer', {
      ordered: true,
      maxRetransmits: maxRetransmits,
    })

    sendChannel.value.bufferedAmountLowThreshold = maxBufferedAmount.value

    sendChannel.value.onopen = () => {
      console.log(`[INFO] Data channel opened`)
      isConnectSuccess.value = true
    }

    sendChannel.value.onerror = error => {
      console.error(`[ERR] Data channel error: ${error}`)
      isConnectSuccess.value = false
    }

    sendChannel.value.onclose = () => {
      console.log(`[INFO] Data channel closed`)
      isConnectSuccess.value = false
    }

    sendChannel.value.onbufferedamountlow = async () => {
      await processQueue()
    }
  }

  function getSendChannelState() {
    return sendChannel.value.readyState
  }

  return {
    peerConnection,
    isConnectSuccess,
    registered,
    clientId,
    targetId,
    pubKey,
    privKey,
    sendChannel,
    maxBufferedAmount,
    initializeConnection,
    registerClient,
    connectTarget,
    getSendChannelState,
  }
})
