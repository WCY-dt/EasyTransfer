import { IceServer } from '@/types'

export const defaultMaxConnectionNumber: number = 10

export const defaultIceServers: IceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  {
    urls: 'stun:stun.l.google.com:5349',
  },
  {
    urls: 'stun:stun1.l.google.com:3478',
  },
  {
    urls: 'stun:stun1.l.google.com:5349',
  },
  {
    urls: 'stun:stun2.l.google.com:19302',
  },
  {
    urls: 'stun:stun2.l.google.com:5349',
  },
  {
    urls: 'stun:stun3.l.google.com:3478',
  },
  {
    urls: 'stun:stun3.l.google.com:5349',
  },
  {
    urls: 'stun:stun4.l.google.com:19302',
  },
  {
    urls: 'stun:stun4.l.google.com:5349',
  },
  {
    urls: 'turn:turn.ch3nyang.top:3478',
    username: 'easytransfer',
    credential: 'sharesimplyandstayanonymous',
  },
  {
    urls: 'turn:103.124.107.241:3478',
    username: 'easytransfer',
    credential: 'sharesimplyandstayanonymous',
  },
]
