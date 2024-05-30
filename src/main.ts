import './assets/style/main.scss'

import { createApp } from 'vue'

import App from './App.vue'
// 引入路由守卫
import '@/router/permission'
import router from './router'
//国际化
import i18n from '@/i18n/index'

// 主题色
import '@/assets/style/theme'
import '@/assets/style/theme.scss'

// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import pinia from '@/store/index'

// socketio 监听事件只能在main中, 触发可以在组件内
import socket from '@/socket/index'
// 监听socket事件
import '@/socket/listen-socket'
// windows右上角按钮
import WindowsBtn from '@/components/WindowsBtn/index.vue'
//引入baseUrl
import { baseUrl } from '@/api/baseUrl'
// 判断系统
import process from 'process'
const isMac = process.platform === 'darwin'

// 将用户信息存pinia
import { useUserInfoStore } from '@/store/modules/user'
const userInfoStore = useUserInfoStore(pinia)
let userInfo = localStorage.getItem('userInfo')
if (userInfo) {
  let obj = JSON.parse(userInfo)
  userInfoStore.login(obj)
}
const app = createApp(App)

app.config.globalProperties.$baseUrl = baseUrl
app.config.globalProperties.socket = socket
// 判断系统是mac还是win
app.config.globalProperties.isMac = isMac

app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.use(i18n)
app.component('WindowsBtn', WindowsBtn) //挂载
app.mount('#app')
