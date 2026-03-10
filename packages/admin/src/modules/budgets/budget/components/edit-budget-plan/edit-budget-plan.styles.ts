import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
	montserratMidbold,
	montserratSemibold,
} from '../../../../../shared/styles'

export const budgetPlanWrapper = css`
	width: 600px;
	height: 100%;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;	
	display: flex;
	flex-direction: column;
`

export const addBudgetHeader = css`
	width: 100%;
	height: 68px;
	background-color: var(--primary-25);
	padding: 21.5px 24px;
	border-top-left-radius: 26px;
`

export const addHeaderTitle = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--primary-600);
`

export const addFooterWrapper = css`
	width: 100%;
	height: 138px;
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	display: flex;
	flex-direction: column;
	gap: 12px;
	border-bottom-left-radius: 26px;
	padding: 16px 24px 24px 16px;
`

export const footerTootalBlock = css`
	border-radius: 12px;
	width: 100%;
	height: 44px;
	border: 1px solid var(--gray-200);
	background: var(--gradients-back-link-gray);
	box-shadow: 1px 1px 4px 0px #0E0F590F;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px;
`

export const footerButtonsBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const footerTotalText = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--primary-600);
`

export const editFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	height: 100%;
	overflow-y: auto;
 ${customScrollbar}
`

export const collapseText = css`
	margin-bottom: -8px !important;		
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
	`

export const manageAmount = (isWarning: boolean,): string => {
	return css`
	position: relative;
	z-index: 0;
		background-color: ${isWarning ?
		'var(--warning-50)' :
		''};
	`
}

export const warningIcon = css`
	position: absolute;
	top: 8px;
	left: 176px;
	z-index: 199;
`

export const warningBlock = css`
	position: relative;
`