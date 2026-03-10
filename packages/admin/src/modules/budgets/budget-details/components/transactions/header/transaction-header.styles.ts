import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
} from '../../../../../../shared/styles'

export const headerWrapper = css`
	width: 100%;
	height: 82px;
	background-color: var(--base-white);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
	border-top-left-radius: 22px;
	border-top-right-radius: 22px;
`

export const titleIconBlock = css`
	display: flex;
	align-items: center;
	gap: 8px;
`

export const headerTitle = css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	color: var(--gray-800);
`

export const buttonsBlock = css`
	display: flex;
	align-items: center;
	gap: 12px;
`

export const addButton = css`
	min-width: 186px;
	${montserratSemibold}
	font-size: 14px;
	line-height: 19.6px;

`