import * as React from 'react'

import type {
	THEMES,
} from '../../../types/themes.types'

import {
	classBuilder,
} from '../../../utils/class-builder.util'

import {
	radio,
} from '../theme-switcher.styles'

interface IThemeRadioProps {
	currTheme: THEMES
	radioTheme: THEMES
	handleClick: (theme: THEMES) => () => void
	additionalClass: string
	ariaLabel: string
}

const ThemeRadio: React.FunctionComponent<IThemeRadioProps> = ({
	currTheme, radioTheme, handleClick, additionalClass, ariaLabel,
},) => {
	return (
		<input
			name='color-scheme'
			value={radioTheme}
			className={classBuilder([radio, additionalClass,],)}
			type='radio'
			aria-label={ariaLabel}
			checked={currTheme === radioTheme}
			onChange={handleClick(radioTheme,)}
		/>
	)
}

export default ThemeRadio
