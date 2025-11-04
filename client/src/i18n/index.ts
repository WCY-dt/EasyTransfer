import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'
import ja from './locales/ja'
import ko from './locales/ko'
import es from './locales/es'
import fr from './locales/fr'
import de from './locales/de'
import ru from './locales/ru'

const messages = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
  es,
  fr,
  de,
  ru,
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export function setLocale(locale: string) {
  if (i18n.global.availableLocales.includes(locale)) {
    i18n.global.locale.value = locale
  }
}
