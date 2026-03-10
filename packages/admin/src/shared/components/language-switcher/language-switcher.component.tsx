import * as React from 'react'
import {
	useTranslation,
} from 'react-i18next'

import ChooseLangActions from './choose-lang-actions.component'

import {
	languageSwitchTitle, languageSwitchWrapper,
} from './language-switcher.styles'

export const LanguageSwitcher: React.FunctionComponent = () => {
	const {
		t,
	} = useTranslation()

	return <>
		<p>{t('test',)}</p>

		<div className={languageSwitchWrapper}>
			<p className={languageSwitchTitle}>{t('chooseLang',)}: </p>

			<ChooseLangActions />
		</div>
	</>
}
