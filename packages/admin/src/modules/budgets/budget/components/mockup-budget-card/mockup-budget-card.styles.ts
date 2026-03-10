/* eslint-disable no-nested-ternary */
import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMidbold,
	montserratMediumReg,
} from '../../../../../shared/styles'

export const cardWrapper = (): string => {
	return css`
	position: relative;
	width: calc((100% - 48px) / 4);
	height: 177px;
	animation: blinkRow 0.75s infinite alternate;
	border: 1px solid var(--primary-500);		
		@keyframes blinkRow {
			from {
				background-color: var(--base-white);
			}
			to {
				background-color: var(--primary-100);
			}
		}
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	border-radius: 22px;
	padding: 12px 16px 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;

	&:hover {
		cursor: pointer;
	}
`
}

export const dotAnimation = (): string => {
	return css`
	display: inline-block;
	width: 1.5em;
	overflow: hidden;
	vertical-align: bottom;

	&::after {
		content: '...';
		display: inline-block;
		animation: dots 1.5s steps(4, end) infinite;
	}

	@keyframes dots {
		0% {
			content: '';
		}
		25% {
			content: '.';
		}
		50% {
			content: '..';
		}
		75% {
			content: '...';
		}
		100% {
			content: '';
		}
	}
`
}

export const cardHeader = (isActivated: boolean,): string => {
	return 	css`
	display: flex;
	align-items: center;
	gap: 4px;
	height: 41px;
	& p {
	${montserratSemibold}		
	font-size: 18px;
	line-height: 25.2px;
	color: ${isActivated ?
		'var(--gray-700)' :
		'var(--gray-500)'};
	}
`
}

export const clientBlock = css`
	display: flex;
	gap: 6px;
	align-items: center;
	height: 36px;
	& p {
	${montserratMidbold}
	font-style: italic;
	font-size: 14px;
	line-height: 19.6px;	
	color: var(--gray-600);
	}
`

export const footerBlock = css`
display: flex;
gap: 16px;
`

export const totalBlock = css`
	width: 164px;
	display: flex;
	flex-direction: column;
	gap: 8px;
`

export const totalManage = (isPositive: boolean, isActivated: boolean,): string => {
	return css`
		color: ${isActivated ?
		isPositive ?
			'var(--green-600)' :
			'var(--error-600)' :
		'var(--gray-500)'};
		${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	`
}

export const totalTitle = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
`

export const totalBanks = (isActivated: boolean,): string => {
	return css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	color: ${isActivated ?
		'var(--gray-800)' :
		'var(--gray-500)'} ;
`
}

export const buttonWrapper = css`
	position: absolute;
	right: 12px;
`

export const dotsButton = (isPopoverShown: boolean,):string => {
	return css`
	${isPopoverShown && `
		position: relative;
		z-index: 100;
	`}
	& svg {
		& path {
			fill: var(--gray-700);
		}
	}
`
}