export {}

declare global {
  interface Window {
    stream?: MediaStream
  }
}

declare global {
  namespace NodeJS {
    interface Process {
      package_version?: string
    }
  }
}

export interface IceServer {
  urls: string
  username?: string
  credential?: string
}

export interface PeerConnectionConfig {
  iceServers: IceServer[]
}

export interface RTCSessionDescriptionInit {
  type: RTCSdpType
  sdp: string
}

export interface ItemDisplayProps {
  url: string
  name: string
  size: number
  progress: number
  type: string
  success?: boolean
}
