import { useSettingStore } from '@/stores/setting'

let audioContext: AudioContext | null = null

export function playNotificationSound(): void {
  const settingStore = useSettingStore()

  if (!settingStore.soundNotification) {
    return
  }

  try {
    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (AudioContextClass) {
        audioContext = new AudioContextClass()
      } else {
        console.warn('[WARN] AudioContext not supported')
        return
      }
    }

    // Create a simple notification beep using Web Audio API
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Set the frequency (800 Hz for a pleasant notification sound)
    oscillator.frequency.value = 800

    // Set the volume (0.3 for a moderate volume)
    gainNode.gain.value = 0.3

    // Create an envelope for a smoother sound
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    // Play the sound
    oscillator.start(now)
    oscillator.stop(now + 0.3)
  } catch (error) {
    console.warn('[WARN] Failed to play notification sound:', error)
  }
}
