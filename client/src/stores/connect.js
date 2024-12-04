import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useConnectStore = defineStore('connect', () => {
  const signalServerUrl = process.env.VITE_SIGNAL_SERVER_URL
  let iceServers = [
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
  ]
  let maxConnectionNumber = 5
  if (localStorage.getItem('iceServers')) {
    iceServers = JSON.parse(localStorage.getItem('iceServers'))
  }
  if (localStorage.getItem('maxConnectionNumber')) {
    maxConnectionNumber = JSON.parse(
      localStorage.getItem('maxConnectionNumber'),
    )
  }

  let peerConnectionConfiguration = {
    iceServers: iceServers,
  }
  let socket = null
  const peerConnection = ref(null)
  const registered = ref(false)
  const clientId = ref('LOADING')
  const targetId = ref('')
  let candidateQueue = []
  const isConnectSuccess = ref(false)
  const sendChannels = ref([])
  const maxBufferedAmount = 1024 * 16
  const maxRetransmits = 2

  function initializeConnection() {
    socket = io.connect(signalServerUrl)
    peerConnection.value = new RTCPeerConnection(peerConnectionConfiguration)
    handleServerMsg()
    establishDataChannel()
    // console.log('[INFO] ===Connection core initialized===')
  }

  function getIceServers() {
    return iceServers
  }

  function setIceServers(servers) {
    localStorage.setItem('iceServers', JSON.stringify(servers))

    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  function getMaxConnectionNumber() {
    return maxConnectionNumber
  }

  function setMaxConnectionNumber(number) {
    localStorage.setItem('maxConnectionNumber', JSON.stringify(number))

    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  async function registerClient() {
    socket.emit('register', maxConnectionNumber)

    // console.log(`[INFO] ===Registering client===`)
  }

  function connectTarget() {
    // console.log(`[INFO] ===Connecting to ${targetId.value}===`)

    // console.log(`[INFO] Sending offer to ${targetId.value}`)
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
    // console.log('[INFO] ===Sending ICE candidate===')
    peerConnection.value.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('candidate', event.candidate, targetId.value)

        // console.log(`[INFO] Sending candidate to ${targetId.value}`)
      }
    }
  }

  function handleServerMsg() {
    // Handle messages from the signal server
    socket.on('success', id => {
      // console.log(`[INFO] ===Client registered with id ${id}===`)
      clientId.value = id
      registered.value = true
    })

    socket.on('disconnect', () => {
      // console.log('[INFO] ===Disconnected from the signal server===')
      registered.value = false
      window.location.reload()
    })

    socket.on('offer', (sdp, id, number) => {
      // console.log(`[INFO] ===Connecting to ${id}===`)

      targetId.value = id

      localStorage.setItem('maxConnectionNumber', JSON.stringify(number))
      maxConnectionNumber = number

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

          // console.log(`[INFO] Sending answer to ${targetId.value}`)
        })
        .then(() => {
          addIceCandidate()
        })

      sendIceCandidate()

      // console.log(`[INFO] Received offer from ${targetId.value}`)
    })

    socket.on('answer', (sdp, id) => {
      if (targetId.value === id) {
        peerConnection.value
          .setRemoteDescription(new RTCSessionDescription(sdp))
          .then(() => {
            addIceCandidate()
          })

        // console.log(`[INFO] Received answer from ${targetId.value}`)
      } else {
        console.error(`[ERROR] Received answer from unexpected id: ${id}`)
      }
    })

    socket.on('candidate', candidate => {
      // console.log(`[INFO] Received candidate from ${targetId.value}`)

      if (peerConnection.value.remoteDescription) {
        peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate))

        // console.log(`[INFO] Added ${targetId.value} to ICE candidate`)
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

    // console.log(`[INFO] Added ${targetId.value} to ICE candidate`)
  }

  function establishDataChannel() {
    for (let i = 0; i < maxConnectionNumber; i++) {
      sendChannels.value.push(ref(null))
    }

    sendChannels.value.forEach((channel, index) => {
      channel.value = peerConnection.value.createDataChannel(
        `fileTransfer${index}`,
        {
          ordered: true,
          maxRetransmits: maxRetransmits,
        },
      )

      channel.value.bufferedAmountLowThreshold = maxBufferedAmount

      channel.value.onopen = () => {
        // console.log(`[INFO] Data channel opened`)
        isConnectSuccess.value = true
      }

      channel.value.onerror = error => {
        console.error(`[ERR] Data channel error: ${error}`)
        isConnectSuccess.value = false
      }

      channel.value.onclose = () => {
        // console.log(`[INFO] Data channel closed`)
        isConnectSuccess.value = false
      }
    })
  }

  function getSendChannelState() {
    const sendChannelState = sendChannels.value.map(channel => {
      return channel.value.readyState
    })

    // console.log(`[INFO] Send channel state: ${sendChannelState}`)

    if (sendChannelState.every(state => state === 'open')) {
      return 'open'
    } else {
      return 'pending'
    }
  }

  return {
    peerConnection,
    isConnectSuccess,
    getIceServers,
    setIceServers,
    getMaxConnectionNumber,
    setMaxConnectionNumber,
    registered,
    clientId,
    targetId,
    sendChannels,
    maxBufferedAmount,
    initializeConnection,
    registerClient,
    connectTarget,
    getSendChannelState,
  }
})
