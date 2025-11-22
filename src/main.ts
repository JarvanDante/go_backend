import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { setupStore } from './store'

import '@/styles/index.scss'
import vPermission from './directive/permission/index' // permission control
import SvgIcon from './icons' // icon
import './permission' // permission control
import { checkEnableLogs } from './utils/error-log' // error log
//抑制警告日志
const originalWarn = console.warn
console.warn = function (...args) {
  if (typeof args[0] === 'string' && args[0].includes('No match found for location')) {
    return
  }
  originalWarn.apply(console, args)
}

const app = createApp(App)
setupStore(app)
app.use(router)
app.component('svg-icon', SvgIcon)
app.directive('permission', vPermission)
checkEnableLogs(app)

app.mount('#app')
