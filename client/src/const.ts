import { IceServer } from '@/types'

export const defaultMaxConnectionNumber: number = 10

export const defaultIceServers: IceServer[] = [
  {
    urls: 'turn:103.124.107.241:3478',
    username: 'easytransfer',
    credential: 'sharesimplyandstayanonymous',
  },
  {
    urls: 'stun:stun.relay.metered.ca:80',
  },
  {
    urls: 'turn:global.relay.metered.ca:80',
    username: 'cf841207b56ebddc17948dde',
    credential: '0dGvvEm7eq2UaqlW',
  },
  {
    urls: 'stun:stun.l.google.com:19302',
  },
]
