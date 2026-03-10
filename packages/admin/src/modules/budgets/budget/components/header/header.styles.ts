import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
} from '../../../../../shared/styles'

export const headerWrapper = css`
	width: 100%;
	height: 82px;
	background-color: var(--base-white);
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
`

export const titleIconBlock = css`
	display: flex;
	align-items: center;
	gap: 8px;
`

export const headerTitle = css`
	${montserratSemibold}
	font-size: 26px;
	line-height: 36.4px;
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