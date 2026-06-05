import {createApp} from 'vue'
import App from './App.vue'
import './themes/default.css'
import './themes/classic.css'
import './themes/classic-dark.css'
import './themes/chips.css'
import './index.css'
import {activePreset} from './config/activePreset.js'
import {applyUiTheme, normalizeUiThemeId} from './config/themes.js'
import {gamePresetKey, tileThemeKey, stringsKey} from './config/injectionKeys.js'

applyUiTheme(normalizeUiThemeId(activePreset.theme))

createApp(App)
    .provide(gamePresetKey, activePreset)
    .provide(tileThemeKey, activePreset.tileTheme)
    .provide(stringsKey, activePreset.strings)
    .mount('#app')
