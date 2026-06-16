import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { persistPlugin } from './stores/plugins/persist'
import App from './App.vue'
import './assets/styles/main.less'

const app = createApp(App)
const pinia = createPinia()

// 注册持久化插件
pinia.use(persistPlugin)

app.use(pinia)
app.use(router)
app.mount('#app')
