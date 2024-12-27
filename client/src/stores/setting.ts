import { ref, watch, Ref } from 'vue'
import { defineStore } from 'pinia'
import { IceServer } from '@/types'

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

  // maxConnectionNumber
  const maxConnectionNumber: Ref<number> = ref(10)

  if (localStorage.getItem('maxConnectionNumber')) {
    maxConnectionNumber.value = JSON.parse(
      localStorage.getItem('maxConnectionNumber') as string,
    )
  }

  watch(maxConnectionNumber, () => {
    localStorage.setItem(
      'maxConnectionNumber',
      JSON.stringify(maxConnectionNumber.value),
    )
  })

  // iceServers
  const iceServers: Ref<IceServer[]> = ref([
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
  ])

  if (localStorage.getItem('iceServers')) {
    const existingIceServers = JSON.parse(
      localStorage.getItem('iceServers') as string,
    )
    const newIceServers = [...iceServers.value, ...existingIceServers]
    const uniqueIceServers = Array.from(
      new Set(newIceServers.map(server => JSON.stringify(server))),
    ).map(server => JSON.parse(server))
    iceServers.value = uniqueIceServers
  }

  watch(iceServers, () => {
    localStorage.setItem('iceServers', JSON.stringify(iceServers.value))
  })

  return {
    autoDisplayImage,
    directlyOpenLink,
    maxConnectionNumber,
    iceServers,
  }
})
