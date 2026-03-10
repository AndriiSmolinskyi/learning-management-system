import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
	montserratMidbold,
	montserratSemibold,
} from '../../../../../shared/styles'

export const expenseCategoriesWrapper = css`
	width: 600px;
	height: 100%;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;	
	display: flex;
	flex-direction: column;
`

export const addExpenseCategoryHeader = css`
	width: 100%;
	height: 68px;
	background-color: var(--primary-25);
	padding: 21.5px 24px;
	border-top-left-radius: 26px;
	border-bottom: 1px solid var(--primary-100);
`

export const addExpenseCategoryTitle = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--primary-600);
`

export const addExpenseCategoryFooter = css`
	width: 100%;
	height: 82px;
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	border-bottom-left-radius: 26px;
	padding: 16px 24px 24px 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const expenseCategoriesFormWrapper = css`
	flex-grow: 1;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	height: calc(100vh - 150px);
	overflow-y: auto;
 ${customScrollbar}
`

export const addAnotherButton = (isCreating: boolean,): string => {
	return css`
	width: 147px;
	padding: 0 14px;
	color: ${isCreating ?
		'var(--primary-600)' :
		'var(--primary-200)'};
	& svg path {
		fill: currentColor;
	}
`
}

export const managementAmount = css`
	background: var(--gradients-back-link-gray);
	border: 1px solid var(--gray-200);
	box-shadow: 1px 1px 4px 0px #0E0F590F;
	padding: 12px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	& > span {
		color: var(--primary-600);
		${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	}
`

export const categoryList = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
`

export const addBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const totalBlock = (isEnough: boolean,): string => {
	return css`
	height: 44px;
	width: 209px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px;
	border-radius: 12px;
	background: ${isEnough ?
		'var(--gradients-back-link-gray)' :
		'var(--gradients-red-button)'};
	border:${isEnough ?
		'1px solid var(--gray-200)' :
		'1px solid var(--error-200)'};
		& > p {
			${montserratMidbold}
			font-size: 14px;
			line-height: 19.6px;
			color :${isEnough ?
		'var(--primary-600)' :
		'var(--error-600)'};
		}
`
}

export const errorMessage = css`
	${montserratMidbold}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--error-500);
	padding-left: 8px;
	width: 330px;
`