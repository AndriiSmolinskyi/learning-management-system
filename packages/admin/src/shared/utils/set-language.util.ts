import i18next from 'i18next'

import type {
	LANGUAGES,
} from '../../translations/types'

export const setLanguage = (lang: LANGUAGES,) => {
	return async(): Promise<void> => {
		await i18next.changeLanguage(lang,)
	}
}