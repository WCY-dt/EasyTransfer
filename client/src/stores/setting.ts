import { ref, watch, Ref } from 'vue'
import { defineStore } from 'pinia'
import { IceServer } from '@/types'
import {
  defaultMaxConnectionNumber,
  defaultIceServers,
  defaultLanguage,
  defaultSoundNotification,
  defaultTheme,
} from '@/const'

export const useSettingStore = defineStore('setting', () => {
  // autoDisplayImage
  const autoDisplayImage: Ref<boolean> = ref(true)

  if (localStorage.getItem('autoDisplayImage')) {
    autoDisplayImage.value = JSON.parse(
      localStorage.getItem('autoDisplayImage') as string,
    )
  }

  watch(autoDisplayImage, () => {
    localStorage.setItem(
      'autoDisplayImage',
      JSON.stringify(autoDisplayImage.value),
    )
  })

  // directlyOpenLink
  const directlyOpenLink: Ref<boolean> = ref(true)

  if (localStorage.getItem('directlyOpenLink')) {
    directlyOpenLink.value = JSON.parse(
      localStorage.getItem('directlyOpenLink') as string,
    )
  }

  watch(directlyOpenLink, () => {
    localStorage.setItem(
      'directlyOpenLink',
      JSON.stringify(directlyOpenLink.value),
    )
  })

  // autoDownload
  const autoDownload: Ref<boolean> = ref(true)

  if (localStorage.getItem('autoDownload')) {
    autoDownload.value = JSON.parse(
      localStorage.getItem('autoDownload') as string,
    )
  }

  watch(autoDownload, () => {
    localStorage.setItem('autoDownload', JSON.stringify(autoDownload.value))
  })

  // maxConnectionNumber
  const maxConnectionNumberStorageName =
    'maxConnectionNumber-' + (process.package_version as string)
  const maxConnectionNumber: Ref<number> = ref(defaultMaxConnectionNumber)

  if (localStorage.getItem(maxConnectionNumberStorageName)) {
    maxConnectionNumber.value = JSON.parse(
      localStorage.getItem(maxConnectionNumberStorageName) as string,
    )
  }

  watch(maxConnectionNumber, () => {
    localStorage.setItem(
      maxConnectionNumberStorageName,
      JSON.stringify(maxConnectionNumber.value),
    )
  })

  // iceServers
  const iceServersStorageName =
    'iceServers-' + (process.package_version as string)
  const iceServers: Ref<IceServer[]> = ref(defaultIceServers)

  if (localStorage.getItem(iceServersStorageName)) {
    const existingIceServers = JSON.parse(
      localStorage.getItem(iceServersStorageName) as string,
    )
    const newIceServers = [...iceServers.value, ...existingIceServers]
    const uniqueIceServers = Array.from(
      new Set(newIceServers.map(server => JSON.stringify(server))),
    ).map(server => JSON.parse(server))
    iceServers.value = uniqueIceServers
  }

  watch(iceServers, () => {
    localStorage.setItem(
      iceServersStorageName,
      JSON.stringify(iceServers.value),
    )
  })

  // language
  // Note: This setting is stored and ready for future i18n implementation.
  // Currently stores user preference but translation implementation is pending.
  const language: Ref<string> = ref(defaultLanguage)

  const storedLanguage = localStorage.getItem('language')
  if (storedLanguage) {
    language.value = storedLanguage
  }

  watch(language, () => {
    localStorage.setItem('language', language.value)
  })

  // soundNotification
  const soundNotification: Ref<boolean> = ref(defaultSoundNotification)

  const storedSoundNotification = localStorage.getItem('soundNotification')
  if (storedSoundNotification) {
    soundNotification.value = JSON.parse(storedSoundNotification)
  }

  watch(soundNotification, () => {
    localStorage.setItem(
      'soundNotification',
      JSON.stringify(soundNotification.value),
    )
  })

  // theme
  const theme: Ref<string> = ref(defaultTheme)

  const storedTheme = localStorage.getItem('theme')
  if (storedTheme) {
    theme.value = storedTheme
  }

  watch(theme, () => {
    localStorage.setItem('theme', theme.value)
  })

  return {
    autoDisplayImage,
    directlyOpenLink,
    autoDownload,
    maxConnectionNumber,
    iceServers,
    language,
    soundNotification,
    theme,
  }
})
