import {
	css,
} from '@emotion/css'

import {
	montserratRegular,
	spaces,
} from '../../styles'

export const languageSwitchWrapper = css`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: ${spaces.tiny};
`

export const languageSwitchTitle = css`
	margin: 0;
`

export const chooseLangBtn = css`
	all: unset;
	${montserratRegular}
	cursor: pointer;
	color: var(--reverted-accent-color);
`

export const chooseLangBtnActive = css`
	text-decoration: underline;
	color: var(--reverted-accent-color);
`