import { ref, watch, Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useSettingStore } from '@/stores/setting'
import { io, Socket } from 'socket.io-client'
import { PeerConnectionConfig, RTCSessionDescriptionInit } from '@/types'
import { TRANSFER_CONFIG } from '@/config/transferConfig'

export const useConnectStore = defineStore('connect', () => {
  const settingStore = useSettingStore()
  const { maxConnectionNumber, iceServers } = storeToRefs(settingStore)

  const signalServerUrl = process.env.VITE_SIGNAL_SERVER_URL as string
  let socket: Socket | null = null
  const peerConnection: Ref<RTCPeerConnection | null> = ref(null)
  const registered: Ref<boolean> = ref(false)
  const clientId: Ref<string> = ref('LOADING')
  const targetId: Ref<string> = ref('')
  let candidateQueue: RTCIceCandidateInit[] = []
  const isConnectSuccess: Ref<boolean> = ref(false)
  const sendChannels: Ref<RTCDataChannel[]> = ref([])
  const maxBufferedAmount = TRANSFER_CONFIG.maxBufferedAmount
  const maxRetransmits = 10
  const isConnecting = ref(false)

  function initializeConnection() {
    sendChannels.value = []
    const peerConnectionConfiguration: PeerConnectionConfig = {
      iceServers: iceServers.value,
    }

    socket = io(signalServerUrl)
    peerConnection.value = new RTCPeerConnection(peerConnectionConfiguration)

    handleServerMsg()
    establishDataChannel()
  }

  async function registerClient() {
    socket?.emit('register', maxConnectionNumber.value)
  }

  function connectTarget() {
    isConnecting.value = true

    peerConnection.value
      ?.createOffer()
      .then(offer => peerConnection.value?.setLocalDescription(offer))
      .then(() => {
        socket?.emit(
          'offer',
          peerConnection.value?.localDescription,
          clientId.value,
          targetId.value,
        )
      })

    sendIceCandidate()
  }

  function sendIceCandidate() {
    peerConnection.value!.onicecandidate = event => {
      if (event.candidate) {
        socket?.emit('candidate', event.candidate, targetId.value)
      }
    }
  }

  function handleServerMsg() {
    socket?.on('error', (error: string) => {
      console.error(`[ERROR] ${error}`)
      isConnecting.value = false
      isConnectSuccess.value = false
    })

    socket?.on('success', (id: string) => {
      clientId.value = id
      registered.value = true
    })

    socket?.on('disconnect', () => {
      registered.value = false
      window.location.reload()
    })

    socket?.on(
      'offer',
      (sdp: RTCSessionDescriptionInit, id: string, number: number) => {
        targetId.value = id
        maxConnectionNumber.value = number

        isConnecting.value = true

        peerConnection.value
          ?.setRemoteDescription(new RTCSessionDescription(sdp))
          .then(() => peerConnection.value?.createAnswer())
          .then(answer => peerConnection.value?.setLocalDescription(answer))
          .then(() => {
            socket?.emit(
              'answer',
              peerConnection.value?.localDescription,
              clientId.value,
              targetId.value,
            )
          })
          .then(() => {
            addIceCandidate()
          })

        sendIceCandidate()
      },
    )

    socket?.on('answer', (sdp: RTCSessionDescriptionInit, id: string) => {
      if (targetId.value === id) {
        peerConnection.value
          ?.setRemoteDescription(new RTCSessionDescription(sdp))
          .then(() => {
            addIceCandidate()
          })
      } else {
        console.error(`[ERROR] Received answer from unexpected id: ${id}`)
      }
    })

    socket?.on('candidate', (candidate: RTCIceCandidateInit) => {
      if (peerConnection.value?.remoteDescription) {
        peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate))
      } else {
        candidateQueue.push(candidate)
      }
    })
  }

  function addIceCandidate() {
    while (candidateQueue.length) {
      peerConnection.value?.addIceCandidate(
        new RTCIceCandidate(candidateQueue.shift()!),
      )
    }
  }

  function establishDataChannel() {
    for (let index = 0; index < maxConnectionNumber.value; index++) {
      const channel = peerConnection.value?.createDataChannel(
        `fileTransfer${index}`,
        {
          ordered: true,
          maxRetransmits: maxRetransmits,
        },
      )

      if (channel) {
        channel.bufferedAmountLowThreshold = maxBufferedAmount

        channel.onopen = () => {
          isConnecting.value = false
          isConnectSuccess.value = true
        }

        channel.onerror = error => {
          console.error(`[ERR] Data channel error: ${error}`)
          isConnecting.value = false
          isConnectSuccess.value = false
        }

        channel.onclose = () => {
          isConnecting.value = false
          isConnectSuccess.value = false
        }

        sendChannels.value.push(channel)
      }
    }
  }

  function getSendChannelState() {
    const sendChannelState = sendChannels.value.map(channel => {
      return channel.readyState
    })

    if (sendChannelState.every(state => state === 'open')) {
      return 'open'
    } else {
      return 'pending'
    }
  }

  let previousIceServers = iceServers.value
  let previousMaxConnectionNumber = maxConnectionNumber.value

  watch([iceServers, maxConnectionNumber], async () => {
    if (peerConnection.value) {
      if (
        iceServers.value !== previousIceServers ||
        maxConnectionNumber.value !== previousMaxConnectionNumber
      ) {
        console.warn('[INFO] ===Reconnecting===')

        await Promise.all(sendChannels.value.map(channel => channel.close()))

        peerConnection.value.close()
        socket?.disconnect()
        window.location.reload()

        previousIceServers = iceServers.value
        previousMaxConnectionNumber = maxConnectionNumber.value
      }
    }
  })

  return {
    peerConnection,
    isConnectSuccess,
    registered,
    clientId,
    targetId,
    sendChannels,
    maxBufferedAmount,
    isConnecting,
    initializeConnection,
    registerClient,
    connectTarget,
    getSendChannelState,
  }
})
