import {createApp} from 'vue'
import App from './App.vue'
import './index.css'
import {defaultPreset} from './config/defaultPreset.js'
import {gamePresetKey} from './config/injectionKeys.js'

createApp(App)
    .provide(gamePresetKey, defaultPreset)
    .mount('#app')
