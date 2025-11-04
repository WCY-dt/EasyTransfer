import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { initTheme } from '@/utils/themeManager'
import { i18n, setLocale } from '@/i18n'
import { useSettingStore } from '@/stores/setting'
import { watch } from 'vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18n)

// Initialize theme after pinia is set up
initTheme()

// Initialize i18n locale from settings
const settingStore = useSettingStore()
setLocale(settingStore.language)

// Watch for language changes
watch(
  () => settingStore.language,
  newLanguage => {
    setLocale(newLanguage)
  },
)

app.mount('#app')
