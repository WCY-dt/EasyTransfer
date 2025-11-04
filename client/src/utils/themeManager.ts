import { useSettingStore } from '@/stores/setting'
import { watch } from 'vue'

const lightThemeColors = {
  '--primary-color': '#007bff',
  '--primary-semi-dark-color': '#0069d9',
  '--primary-dark-color': '#0056b3',
  '--primary-semi-light-color': '#b6d9ff',
  '--primary-light-color': '#dcecfc',
  '--primary-extra-light-color': '#f0f8ff',
  '--primary-blur-color': '#007bff4f',
  '--secondary-color': '#6c757d',
  '--secondary-light-color': '#f0f0f0',
  '--secondary-extra-light-color': '#0000000f',
  '--success-color': '#28a745',
  '--success-dark-color': '#218838',
  '--success-semi-light-color': '#28a74650',
  '--success-light-color': '#d4edda',
  '--error-color': '#dc3545',
  '--light-color': '#f8f9fa',
  '--light-blur-color': '#f8f9fa4f',
  '--dark-color': '#343a40',
  '--gold-color': '#ffc107',
  '--gold-light-color': '#ffcd27',
}

const darkThemeColors = {
  '--primary-color': '#007bff',
  '--primary-semi-dark-color': '#0069d9',
  '--primary-dark-color': '#2d7dd2',
  '--primary-semi-light-color': '#7ab8ff',
  '--primary-light-color': '#2d3748',
  '--primary-extra-light-color': '#0a1929',
  '--primary-blur-color': '#007bff4f',
  '--secondary-color': '#b8c2cc',
  '--secondary-light-color': '#4a5568',
  '--secondary-extra-light-color': '#ffffff1a',
  '--success-color': '#26b56e',
  '--success-dark-color': '#1e8e56',
  '--success-semi-light-color': '#26b56e50',
  '--success-light-color': '#1a6d47',
  '--error-color': '#f05252',
  '--light-color': '#1a202c',
  '--light-blur-color': '#1a202c4f',
  '--dark-color': '#e2e8f0',
  '--gold-color': '#d6a31e',
  '--gold-light-color': '#d1ac4b',
}

export function applyTheme(theme: 'light' | 'dark' | 'auto'): void {
  const root = document.documentElement
  let colors: Record<string, string>

  if (theme === 'dark') {
    colors = darkThemeColors
  } else if (theme === 'light') {
    colors = lightThemeColors
  } else {
    // Auto mode - detect system preference
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    colors = prefersDark ? darkThemeColors : lightThemeColors
  }

  // Apply theme colors
  Object.entries(colors).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

export function initTheme(): () => void {
  const settingStore = useSettingStore()

  // Apply initial theme
  applyTheme(settingStore.theme as 'light' | 'dark' | 'auto')

  // Watch for theme changes
  const unwatch = watch(
    () => settingStore.theme,
    newTheme => {
      applyTheme(newTheme as 'light' | 'dark' | 'auto')
    },
  )

  // Watch for system theme changes when in auto mode
  let cleanupMediaQuery: (() => void) | null = null
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (settingStore.theme === 'auto') {
        applyTheme('auto')
      }
    }
    darkModeQuery.addEventListener('change', handleChange)
    cleanupMediaQuery = () =>
      darkModeQuery.removeEventListener('change', handleChange)
  }

  // Return cleanup function
  return () => {
    unwatch()
    if (cleanupMediaQuery) {
      cleanupMediaQuery()
    }
  }
}
