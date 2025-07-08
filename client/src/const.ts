import { IceServer } from '@/types'

export const defaultMaxConnectionNumber: number = 10

export const defaultIceServers: IceServer[] = [
  {
    urls: 'turn:82.29.67.202:3478',
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
