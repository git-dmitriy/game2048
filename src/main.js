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
import {gamePresetKey, tileThemeKey} from './config/injectionKeys.js'
import i18n from './i18n/index.js'

applyUiTheme(normalizeUiThemeId(activePreset.theme))

createApp(App)
    .use(i18n)
    .provide(gamePresetKey, activePreset)
    .provide(tileThemeKey, activePreset.tileTheme)
    .mount('#app')
