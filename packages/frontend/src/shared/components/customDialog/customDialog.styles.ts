import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMediumReg,
} from '../../styles'

export const mainWrapper = css`
	width: 400px;
	display: flex;
	flex-direction: column;
	padding: 16px;
	border-radius: 16px;
	background-color: var(--base-white);
`

export const contentWrapper = css`
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const title = css`
	${montserratSemibold}
	font-size: 16px;
	line-height: 22.5px;
	margin-top: 12px;
`

export const description = css`
	${montserratMediumReg}
	margin-top: 6px;
	font-size: 14px;
	line-height: 19.6px;
	text-align: center;
`

export const buttonWrapper = css`
	display: flex;
	justify-content: center;
	margin-top: 16px;
	gap: 12px;
`

export const buttonStyle = css`
	 width: 100%;
	 font-size: 14px;
	 line-height: 20px;
`

export const marginBottom12px = css`
	margin-bottom: 12px;
`