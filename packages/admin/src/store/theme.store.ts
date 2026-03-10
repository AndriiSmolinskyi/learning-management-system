import {
	create,
} from 'zustand'

import {
	LOCAL_STORAGE_KEYS,
} from '../shared/types/local-storage.types'
import {
	THEMES,
} from '../shared/types/themes.types'

interface IThemeState {
	theme: THEMES;
	setPreferedTheme: () => void;
	setTheme: (newTheme: THEMES) => () => void
}

const setPreferedTheme = (): void => {
	if (matchMedia('(prefers-color-scheme: dark)',).matches) {
		document.documentElement.setAttribute('data-theme', THEMES.DARK,)
	} else {
		document.documentElement.setAttribute('data-theme', THEMES.LIGHT,)
	}

	localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, THEMES.AUTO,)
}

export const useTheme = create<IThemeState>((set,) => {
	return {
		theme:            (localStorage.getItem(LOCAL_STORAGE_KEYS.THEME,) as THEMES | undefined) ?? THEMES.AUTO,
		setPreferedTheme: (): void => {
			setPreferedTheme()
		},
		setTheme: 		  (newTheme: THEMES,): () => void => {
			return (): void => {
				set(() => {
					return {
						theme: newTheme,
					}
				},)

				if (newTheme === THEMES.AUTO) {
					setPreferedTheme()

					return
				}

				document.documentElement.setAttribute('data-theme', newTheme,)
				localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme,)
			}
		},
	}
},)