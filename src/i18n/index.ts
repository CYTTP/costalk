// index.js
import { createI18n } from 'vue-i18n'
import zh from './lang/zh'
import en from './lang/en'

const messages = {
  en,
  zh
}
const language = (navigator.language || 'en').toLocaleLowerCase() // 这是获取浏览器的语言
console.log(language)
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || language.split('-')[0] || 'en', // 首先从缓存里拿，没有的话就用浏览器语言，
  fallbackLocale: 'en', // 设置备用语言
  messages
})

export default i18n
