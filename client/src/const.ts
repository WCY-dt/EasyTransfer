import { IceServer } from '@/types'

const turnUrl = process.env.VITE_TURN_URL || 'turn:turn.ch3nyang.top:3478'
const turnUsername = process.env.VITE_TURN_USERNAME || 'easytransfer'
const turnCredential =
  process.env.VITE_TURN_CREDENTIAL || 'change-this-turn-password'
const stunUrl = process.env.VITE_STUN_URL || 'stun:turn.ch3nyang.top:3478'

export const defaultMaxConnectionNumber: number = 10

export const defaultIceServers: IceServer[] = [
  {
    urls: turnUrl,
    username: turnUsername,
    credential: turnCredential,
  },
  {
    urls: stunUrl,
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
