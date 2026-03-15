import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMediumReg,
	montserratBold,
	montserratMidbold,
} from '../../shared/styles'

export const container = css`
	width: 100vw;
	height: 100vh;
	min-width: 380px;
	margin: 0;
	overflow: hidden;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
`

export const modal = css`
	width: 400px;
	padding: 20px;
	background: rgba(255, 255, 255, 0.7);
	border-radius: 26px;
	box-shadow: 0px 4px 16px rgba(148, 161, 207, 0.2);	
	backdrop-filter: blur(8px);
`

export const textBlock = css`
	text-align: center;
	color: var(--base-white);
	margin-bottom: 24px;
	padding: 0 16px;
`

export const titleModal = css`
	${montserratSemibold}
	font-size: 26px;
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--gray-700);
`

export const textModal = css`
	${montserratMediumReg}
	font-size: 14px;
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--gray-800);
`

export const titleModalMig = css`
	${montserratBold}
	font-size: 26px;
	color: var(--primary-600);
`

export const underTitleModal = css`
	${montserratMediumReg}
	font-size: 14px;
	color: var(--gray-600);
`

export const inputBlock = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
`

export const error = css`
	${montserratMidbold}
	font-size: 12px;
	color: var(--error-400);
	margin-top: 5px;
`

export const submitButton = css`
	width: 100%;
	margin-top: 24px;
`