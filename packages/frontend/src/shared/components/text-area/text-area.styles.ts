import {
	css,
} from '@emotion/css'

import {
	montserratMediumReg, montserratMidbold,
} from '../../styles'

export const labelStyles = css`
	${montserratMidbold}
	display: block;
	font-size: 14px;
	line-height: 20px;
	color: var(--gray-600);
	margin-bottom: 8px;
`

export const inputStyles = css`
	${montserratMediumReg}
	padding: 12px;
	border: 1px solid var(--gray-100);
	border-radius: 8px;
	width: 100%;
	resize: none;
	display: block;
	font-size: 14px;
	line-height: 20px;
	color: var(--gray-900);
	outline: none !important;
	background-color: white;
	box-shadow: 0px 2px 6px 0px #1827511A inset;
	
	&::placeholder {
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-400);
	}
`

export const wrapper = css`
	width: 100%;
`