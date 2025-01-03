import { IceServer } from '@/types'

export async function checkTurnServer(
  testIceServers: IceServer[],
): Promise<boolean> {
  const testConfiguration = { iceServers: testIceServers }
  const testPeerConnection = new RTCPeerConnection(testConfiguration)

  return new Promise(resolve => {
    testPeerConnection.onicecandidate = event => {
      if (event.candidate && event.candidate.candidate.includes('typ relay')) {
        resolve(true)
        testPeerConnection.close()
      }
    }

    testPeerConnection.onicegatheringstatechange = () => {
      if (testPeerConnection.iceGatheringState === 'complete') {
        resolve(false)
        testPeerConnection.close()
      }
    }

    testPeerConnection.createDataChannel('')
    testPeerConnection
      .createOffer()
      .then(offer => testPeerConnection.setLocalDescription(offer))
      .catch(() => {
        resolve(false)
        testPeerConnection.close()
      })
  })
}
