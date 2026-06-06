import {createI18n} from 'vue-i18n'
import en from '../locales/en.js'
import ru from '../locales/ru.js'
import de from '../locales/de.js'
import it from '../locales/it.js'
import es from '../locales/es.js'

export const DEFAULT_LOCALE = 'en'

/** @type {readonly string[]} */
export const SUPPORTED_LOCALES = ['ru', 'en', 'de', 'it', 'es']

/** @type {readonly string[]} */
export const LOCALE_OPTIONS = SUPPORTED_LOCALES

const STORAGE_KEY = 'game2048-state'

/**
 * @param {string} locale
 * @returns {string}
 */
export function normalizeLocale(locale) {
    const code = String(locale || '').split('-')[0].toLowerCase()
    return SUPPORTED_LOCALES.includes(code) ? code : DEFAULT_LOCALE
}

/**
 * @returns {string | null}
 */
function readPersistedLocale() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null

        const state = JSON.parse(raw)
        const locale = state?.settings?.locale
        return typeof locale === 'string' ? normalizeLocale(locale) : null
    } catch {
        return null
    }
}

/**
 * @returns {string | null}
 */
function detectBrowserLocale() {
    const languages = navigator.languages?.length
        ? navigator.languages
        : [navigator.language]

    for (const lang of languages) {
        if (!lang) continue
        const normalized = normalizeLocale(lang)
        if (SUPPORTED_LOCALES.includes(normalized)) {
            return normalized
        }
    }

    return null
}

export function detectLocale() {
    return readPersistedLocale() ?? detectBrowserLocale() ?? DEFAULT_LOCALE
}

/**
 * @param {string} locale
 */
export function setDocumentLang(locale) {
    document.documentElement.lang = normalizeLocale(locale)
}

const initialLocale = detectLocale()

const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: {en, ru, de, it, es},
})

setDocumentLang(initialLocale)

/**
 * @param {string} locale
 * @returns {string}
 */
export function setAppLocale(locale) {
    const normalized = normalizeLocale(locale)
    i18n.global.locale.value = normalized
    setDocumentLang(normalized)
    return normalized
}

export default i18n
