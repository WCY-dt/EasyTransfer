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

export const defaultLanguage: string = 'en'

export const defaultSoundNotification: boolean = false

export const defaultTheme: string = 'auto'

export const supportedLanguages: { code: string; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
]

export const supportedThemes: { code: string; name: string }[] = [
  { code: 'light', name: 'Light' },
  { code: 'dark', name: 'Dark' },
  { code: 'auto', name: 'Auto' },
]
