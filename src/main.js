import '@fontsource/noto-serif-jp/latin-300.css'
import '@fontsource/noto-serif-jp/latin-400.css'
import '@fontsource/noto-serif-jp/latin-500.css'
import '@fontsource/zen-kaku-gothic-new/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-500.css'
import './styles/main.css'
import { initWeather } from './controllers/weatherController.js'

initWeather()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`)
}