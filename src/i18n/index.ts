import {createI18n, type Composer} from 'vue-i18n'
import type {WritableComputedRef} from 'vue'
import en from '../locales/en'
import ru from '../locales/ru'
import de from '../locales/de'
import it from '../locales/it'
import es from '../locales/es'
import type {LocaleId} from '../types/game'
import type {MessageSchema} from '../types/messages'

export const DEFAULT_LOCALE: LocaleId = 'en'

export const SUPPORTED_LOCALES: readonly LocaleId[] = ['ru', 'en', 'de', 'it', 'es']

export const LOCALE_OPTIONS = SUPPORTED_LOCALES

const STORAGE_KEY = 'game2048-state'

export function normalizeLocale(locale: string): LocaleId {
    const code = String(locale || '').split('-')[0].toLowerCase() as LocaleId
    return SUPPORTED_LOCALES.includes(code) ? code : DEFAULT_LOCALE
}

function readPersistedLocale(): LocaleId | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null

        const state = JSON.parse(raw) as { settings?: { locale?: string } }
        const locale = state?.settings?.locale
        return typeof locale === 'string' ? normalizeLocale(locale) : null
    } catch {
        return null
    }
}

function detectBrowserLocale(): LocaleId | null {
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

export function detectLocale(): LocaleId {
    return readPersistedLocale() ?? detectBrowserLocale() ?? DEFAULT_LOCALE
}

export function setDocumentLang(locale: string): void {
    document.documentElement.lang = normalizeLocale(locale)
}

const initialLocale = detectLocale()

const messages: Record<LocaleId, MessageSchema> = {en, ru, de, it, es}

const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
})

setDocumentLang(initialLocale)

export function setAppLocale(locale: string): LocaleId {
    const normalized = normalizeLocale(locale)
    const globalLocale = (i18n.global as Composer).locale as WritableComputedRef<LocaleId>
    globalLocale.value = normalized
    setDocumentLang(normalized)
    return normalized
}

export default i18n
