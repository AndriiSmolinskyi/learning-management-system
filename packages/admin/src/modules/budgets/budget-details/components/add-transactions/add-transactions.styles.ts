import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
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
`

export const allocatedBlock = css`
	width: 100%;
	height: 63px;
	background: var(--gradients-back-link-gray);
	border: 1px solid var(--gray-200);
	box-shadow: 1px 1px 4px 0px #0E0F590F;
	padding: 12px;
	border-radius: 12px;
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-bottom: 12px;
`

export const categoryName = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
`

export const budgetBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	& > span {
		${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--primary-600);
	}
`

export const formWrapper = css`
	width: 100%;
	margin-top: 12px;
`