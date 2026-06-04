import {createApp} from 'vue'
import App from './App.vue'
import './themes/default.css'
import './index.css'
import {activePreset} from './config/activePreset.js'
import {gamePresetKey, tileThemeKey, stringsKey} from './config/injectionKeys.js'

createApp(App)
    .provide(gamePresetKey, activePreset)
    .provide(tileThemeKey, activePreset.tileTheme)
    .provide(stringsKey, activePreset.strings)
    .mount('#app')
