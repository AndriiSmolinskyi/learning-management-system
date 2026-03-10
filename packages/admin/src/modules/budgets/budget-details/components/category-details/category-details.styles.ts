import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
	montserratMediumReg,
	montserratSemibold,
} from '../../../../../shared/styles'

export const addTransactionWrapper = css`
	width: 600px;
	height: 100%;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;	
	display: flex;
	flex-direction: column;
`

export const header = css`
	width: 100%;
	height: 68px;
	background-color: var(--primary-25);
	padding: 21.5px 24px;
	border-top-left-radius: 26px;
`

export const headerTitle = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--primary-600);
`

export const footer = css`
	width: 100%;
	height: 82px;
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	border-bottom-left-radius: 26px;
	padding: 16px 24px 24px 16px;
	display: flex;
	justify-content: flex-end;
	align-items: center;
`

export const mainBlock = css`
	flex-grow: 1;
	padding: 16px;
	overflow-y: auto;
 ${customScrollbar}
`

export const infoBlock = css`
	border-radius: 12px;
	background-color: var(--gray-25);
`

export const infoRow = css`
	display: flex;
	padding: 16px;
	&:not(:last-child) {
		border-bottom: 1px solid var(--gray-100);
	}
`

export const infoKey = css`
	width: 140px;
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-500);
`

export const infoValue = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-700);
`

export const transactionList = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 16px;
`