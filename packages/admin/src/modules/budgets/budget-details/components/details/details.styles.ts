import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	montserratSemibold,
} from '../../../../../shared/styles'

export const detailsWrapper = css`
	width: 100%;
	background-color: var(--base-white);
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 24px;
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;

`

export const titleName = (isActivated: boolean,): string => {
	return css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;	
	color: ${isActivated ?
		'var(--gray-800)' :
		'var(--gray-500)'};
		display: flex;
		align-items: center;
		gap: 8px;
`
}

export const topBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`
export const buttonsBlock = css`
	display: flex;
	align-items: center;
	gap: 12px;
`

export const button = css`
 & span svg path {
			fill: currentColor;
 }
`

export const infoBlocksWrapper = css`
	display: flex;
	align-items: center;
	gap: 16px;
`

export const firstInfoBlock = (isActivated: boolean,): string => {
	return css`
	width: calc((100% - 32px) / 3);
	height: 63px;
	padding: 20px 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${isActivated ?
		'var(--gradients-green-button)' :
		'var(--gradients-back-link-gray)'};
	border:   ${isActivated ?
		'1px solid var(--green-200)' :
		'1px solid var(--gray-200)'};
	border-radius: 14px;
`
}

export const totalText = (isActivated: boolean,): string => {
	return css`${montserratMidbold}
	font-size: ${isActivated ?
		'16px' :
		'16px'};
	line-height:  ${isActivated ?
		'22.4px' :
		'22.4px'};
 	color: var(--gray-700);
`
}

export const totalManage = (isActivated: boolean,): string => {
	return css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
 	color: ${isActivated ?
		'var(--green-600)' :
		'var(--gray-500)'};
`
}

export const secondInfoBlock = (isActivated: boolean,): string => {
	return css`
	width: calc((100% - 32px) / 3);
	height: 63px;
	padding: 20px 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: var(--gradients-back-link-gray);
	border: 1px solid var(--gray-200);
	border-radius: 14px;
`
}

export const totalBanks = (isActivated: boolean,):string => {
	return css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	color: ${isActivated ?
		'var(--gray-700)' :
		'var(--gray-500)'};
`
}

export const clientNameText = css`
	${montserratMidbold}
	font-size: 16px;
	line-height: 22.4px;
	color: var(--gray-800);

	display: flex;
	align-items: center;
	gap: 8px;
`