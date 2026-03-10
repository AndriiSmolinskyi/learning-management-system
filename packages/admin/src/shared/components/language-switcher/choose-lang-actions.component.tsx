import * as React from 'react'
import {
	useTranslation,
} from 'react-i18next'
import {
	cx,
} from '@emotion/css'

import {
	LANGUAGES,
} from '../../../translations/types'
import {
	setLanguage,
} from '../../utils'

import {
	chooseLangBtn, chooseLangBtnActive,
} from './language-switcher.styles'

const ChooseLangActions: React.FunctionComponent = () => {
	const {
		i18n,
	} = useTranslation()

	const isEnglish = i18n.language === LANGUAGES.EN
	const isRussian = i18n.language === LANGUAGES.RU

	return <>
		<button
			className={cx(chooseLangBtn, isEnglish && chooseLangBtnActive,)}
			onClick={setLanguage(LANGUAGES.EN,)}>
			EN
		</button>

		<button
			className={cx(chooseLangBtn, isRussian && chooseLangBtnActive,)}
			onClick={setLanguage(LANGUAGES.RU,)}>
			RU
		</button>
	</>
}

export default ChooseLangActions
