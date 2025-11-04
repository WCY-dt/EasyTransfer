import { useSettingStore } from '@/stores/setting'
import { watch } from 'vue'

const lightThemeColors = {
  '--primary-color': '#007bff',
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
  '--primary-color': '#0d6efd',
  '--primary-dark-color': '#0a58ca',
  '--primary-semi-light-color': '#6ea8fe',
  '--primary-light-color': '#3d8bfd',
  '--primary-extra-light-color': '#031633',
  '--primary-blur-color': '#0d6efd4f',
  '--secondary-color': '#adb5bd',
  '--secondary-light-color': '#495057',
  '--secondary-extra-light-color': '#ffffff0f',
  '--success-color': '#198754',
  '--success-dark-color': '#146c43',
  '--success-semi-light-color': '#19875450',
  '--success-light-color': '#0f5132',
  '--error-color': '#dc3545',
  '--light-color': '#212529',
  '--light-blur-color': '#2125294f',
  '--dark-color': '#f8f9fa',
  '--gold-color': '#ffc107',
  '--gold-light-color': '#ffcd27',
}

export function applyTheme(theme: string): void {
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

export function initTheme(): void {
  const settingStore = useSettingStore()

  // Apply initial theme
  applyTheme(settingStore.theme)

  // Watch for theme changes
  watch(
    () => settingStore.theme,
    newTheme => {
      applyTheme(newTheme)
    },
  )

  // Watch for system theme changes when in auto mode
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    darkModeQuery.addEventListener('change', () => {
      if (settingStore.theme === 'auto') {
        applyTheme('auto')
      }
    })
  }
}
