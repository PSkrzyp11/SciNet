import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Montujemy dopiero, gdy router ustali startowy adres (inaczej menu na chwilę podświetla „Start”)
router.isReady().then(() => app.mount('#app'))
