/* eslint-disable no-nested-ternary */
import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMidbold,
	spaces,
	montserratMediumReg,
} from '../../../../../../shared/styles'

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

export const addFooterWrapper = (isTotal: boolean,): string => {
	return css`
	width: 100%;
	height: ${isTotal ?
		'138px' :
		'82px'};
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	display: flex;
	flex-direction: column;
	gap: 12px;
	border-bottom-left-radius: 26px;
	padding: 16px 24px 24px 16px;
`
}

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

export const footerButtonsBlock = (isSingle: boolean,): string => {
	return css`
	display: flex;
	align-items: center;
	justify-content: ${isSingle ?
		'flex-end' :
		'space-between'};
`
}

export const footerTotalText = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--primary-600);
`

export const rightButtonsWrapper = css`
	display: flex;
	align-items: center;
	gap: 12px;
`

export const saveAsDraftBtn = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--primary-600);
`

export const exitModalWrapper = css`
position: relative;
   width: 400px;
	display: flex;
	flex-direction: column;
   align-items: center;
   padding: ${spaces.medium};
   background-color: var(--base-white);
   border-radius: ${spaces.medium};
	& > h4 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 25.2px;
		color: var(--gray-800);
		margin-top: 12px;
		margin-bottom: 6px;
	} 

	& > p {
		${montserratMediumReg}
		font-size: 14px;
		line-height: 19.6px;
		color: var(--gray-500);
		width: 320px;
		text-align: center;
		margin-top: 6px !important; 
	}
`

export const exitModalbuttonBlock = css`
   width: 100%;
   display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
   margin-top: ${spaces.medium}; 
`

export const exitModalButton = css`
	width: 100%;
`

export const formStepWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
`

export const accountCollapseWrapper = (isOpen: boolean, isValid: boolean,):string => {
	return css`
	padding: 8px;
	border-radius: 12px;
	background-color: ${isOpen ?
		'var(--primary-50)' :
		isValid ?
			'var(--green-25)' :
			'var(--gray-25)'};
	`
}
export const collapseNameButtonBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const collapseNamesBlock = css`
	display: flex;
	flex-direction: column;
	gap: 2px;
`

export const collapseBankNameBlock = css`
	display: flex;
	align-items: center;
	gap: 4px;	
`

export const collapseBankName = css`
${montserratMediumReg}
	font-size: 12px;
	line-height: 19.6px;
	color: var(--gray-500);
`

export const collapseAccountName = css`
	display: flex;
	align-items: center;
	gap: 2px;

	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
`

export const collapseAccountIndicatorWrapper = css`
	width: 18px;
	height: 18px;	
	display: flex;
	align-items: center;
	justify-content: center;
`

export const collapseAccountIndicator = (isOpen: boolean, isAccountValid: boolean,): string => {
	return css`
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: ${isAccountValid ?
		'radial-gradient(81.82% 81.82% at 34.13% 29.53%, #95B8F9 0%, #2F6FE4 100%)' :
		'radial-gradient(81.82% 81.82% at 34.13% 29.53%, #F7B27A 0%, #E04F16 100%)'};
	`
}

export const collapseAccountChevronIcons = (isOpen: boolean,): string => {
	return css`	
			transition: all 0.3s ease;
			transform: ${isOpen ?
		'rotate(180deg)' :
		''};
			 &  path {
				 fill: ${isOpen ?
		'var(--primary-600)' :
		'var(--gray-500)'};	
			 }
	`
}

export const collapse = css`
	margin-top: 16px !important;
	display: flex;
	flex-direction: column;
	gap: 20px;
`

export const collapseAmountCurrencyText = css`
	margin-bottom: 8px !important;		
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`