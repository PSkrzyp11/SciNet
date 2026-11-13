import '@fontsource-variable/archivo'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/jetbrains-mono'
import './styles/tokens.css'
import './styles/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { initMotion } from './motion'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Montujemy dopiero, gdy router ustali startowy adres (inaczej menu na chwilę podświetla „Start”)
router.isReady().then(() => {
  app.mount('#app')

  // Płynny scroll startuje w wolnej chwili po wyświetleniu strony
  const whenIdle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 200))
  whenIdle(() => void initMotion())
})
