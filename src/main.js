import {createApp} from 'vue'
import App from './App.vue'
import './themes/classic.css'
import './themes/classic-dark.css'
import './themes/ocean.css'
import './themes/ocean-dark.css'
import './themes/forest.css'
import './themes/forest-dark.css'
import './themes/sunset.css'
import './themes/sunset-dark.css'
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
