import * as React from 'react'

import {
	THEMES,
} from '../../../types/themes.types'

import ThemeLegend from './theme-legend.component'
import ThemeRadio from './theme-radio-btn'
import ThemeStatus from './theme-status'

import {
	radioAuto, radioDark, radioLight, switcher,
} from '../theme-switcher.styles'

interface IThemeRadioGroupProps {
	currTheme: THEMES
	handleClick: (theme: THEMES) => () => void
}

const ThemeRadioGroup: React.FunctionComponent<IThemeRadioGroupProps> = ({
	currTheme, handleClick,
},) => {
	return (
		<fieldset className={switcher}>
			<ThemeLegend />

			<ThemeRadio
				currTheme={currTheme}
				radioTheme={THEMES.LIGHT}
				handleClick={handleClick}
				additionalClass={radioLight}
				ariaLabel='light'
			/>

			<ThemeRadio
				currTheme={currTheme}
				radioTheme={THEMES.AUTO}
				handleClick={handleClick}
				additionalClass={radioAuto}
				ariaLabel='auto'
			/>

			<ThemeRadio
				currTheme={currTheme}
				radioTheme={THEMES.DARK}
				handleClick={handleClick}
				additionalClass={radioDark}
				ariaLabel='dark'
			/>

			<ThemeStatus />
		</fieldset>
	)
}

export default ThemeRadioGroup
