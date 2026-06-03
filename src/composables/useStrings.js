import {inject} from 'vue'
import {stringsKey} from '../config/injectionKeys.js'
import {defaultStrings} from '../config/strings/default.js'

export function useStrings() {
    const strings = inject(stringsKey)
    if (!strings) {
        if (import.meta.env.DEV) {
            console.warn('[useStrings] strings not provided, using defaultStrings')
        }
        return defaultStrings
    }
    return strings
}
