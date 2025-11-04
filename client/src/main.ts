import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { initTheme } from '@/utils/themeManager'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

// Initialize theme after pinia is set up
initTheme()

app.mount('#app')
