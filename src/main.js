import {createApp} from 'vue'
import App from './App.vue'
import './themes/default.css'
import './index.css'
import {defaultPreset} from './config/defaultPreset.js'
import {gamePresetKey, tileThemeKey} from './config/injectionKeys.js'

createApp(App)
    .provide(gamePresetKey, defaultPreset)
    .provide(tileThemeKey, defaultPreset.tileTheme)
    .mount('#app')
