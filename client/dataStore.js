import { ref } from 'vue';
import { defineStore } from 'pinia'
import { io } from 'socket.io'

export const useDataStore = defineStore('data', {
  state: () => ({
    peerConnection: ref(null),
    candidateQueue: [],
    sendChannel: null,
    isConnectSuccess: ref(false),
  }),
  actions: {
    getChannelState() {
      return this.sendChannel.readyState
    },

    setPeerConnection(newConnection) {
      this.peerConnection = newConnection
    },

    setConnectSuccess(status) {
      this.isConnectSuccess = status;
    },

    sendOffer(clientId, targetId, socket) {
      this.peerConnection.createOffer().then((offer) => {
        return this.peerConnection.setLocalDescription(offer)
      }).then(() => {
        console.log(`[INFO] Sending offer to ${targetId}`)
        socket.emit('offer', this.peerConnection.localDescription, clientId, targetId)
      })
    },

    sendIceCandidate(targetId, socket) {
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`[INFO] Sending candidate to ${targetId}`)
          socket.emit('candidate', event.candidate, targetId)
        }
      };
    },

    sendData(data) {
      this.sendChannel.send(data)
    },

    addIceCandidate() {
      while (this.candidateQueue.length) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(this.candidateQueue.shift()));
      }
    },

    addDataChannel() {
      this.sendChannel = this.peerConnection.createDataChannel('fileTransfer')

      this.sendChannel.onopen = () => {
        console.log(`[INFO] Data channel opened`)
        this.setConnectSuccess(true)
      }

      this.sendChannel.onerror = (error) => { }

      this.sendChannel.onclose = () => {
        console.log(`[INFO] Data channel closed`)
        this.setConnectSuccess(false)
      }
    },

    handleOffer(sdp, clientId, targetId, socket) {
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
        return this.peerConnection.createAnswer();
      }).then((answer) => {
        return this.peerConnection.setLocalDescription(answer);
      }).then(() => {
        socket.emit('answer', this.peerConnection.localDescription, clientId, targetId)
      }).then(() => {
        this.addIceCandidate()
      });
    },

    handleAnswer(sdp) {
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
        this.addIceCandidate()
      })
    },

    handleCandidate(candidate) {
      if (this.peerConnection.remoteDescription) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } else {
        this.candidateQueue.push(candidate);
      }
    },
  }
})