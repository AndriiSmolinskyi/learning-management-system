/* eslint-disable complexity */
import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	montserratSemibold,
	montserratMediumReg,
	montserratMidbold,
	spaces,
} from './../../../../../../shared/styles'
import {
	PortfolioType,
} from '../../../../../../shared/types'

export const liItemWrapper = (
	isActive: boolean | undefined,
	isMutating?: boolean,
): string => {
	return css`
		position: relative;
		width: calc((100% - 48px) / 4);
		height: 177px;
		border-radius: 22px;
		padding: 16px;
		background: ${isActive ?
		'var(--base-white)' :
		'var(--gray-50)'};
		box-shadow: -2px 4px 10px 0px #2A2C731F;
		cursor: pointer;

		${isMutating &&
		css`
			animation: blinkRow 0.75s infinite alternate;
			border: 1px solid var(--primary-500);
		`}

		@keyframes blinkRow {
			from {
				background-color: var(--base-white);
			}
			to {
				background-color: var(--primary-100);
			}
		}
	`
}

export const topBlock = css`
	display: flex;
	align-items: center;
	gap: 8px;
`

export const portfolioType = (type: PortfolioType, isActive: boolean | undefined,): string => {
	return css`
	background: ${((): string => {
		switch (type) {
		case PortfolioType.CORPORATE:
			return isActive ?
				`linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);` :
				`linear-gradient(180deg, rgba(22, 179, 100, 0.6) 00%, rgba(22, 179, 100, 0) 100%);`
		case PortfolioType.PRIVATE:
			return isActive ?
				`linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%)` :
				`linear-gradient(180deg, rgba(34, 54, 243, 0.7) 0%, rgba(34, 54, 243, 0) 100%)`
		case PortfolioType.JOINT:
			return isActive ?
				'linear-gradient(180deg, rgba(254, 97, 35, 0.7) 70%, rgba(224, 79, 22, 0) 100%)' :
				`linear-gradient(180deg, rgba(254, 97, 35, 0.7) 0%, rgba(224, 79, 22, 0) 100%)`
		default:
			return '#D3D3D3'
		}
	})()};
	padding: 2px 11px;
	border-radius: 16px;
	${montserratMidbold}
	text-transform: capitalize;
	font-style: italic;
	line-height: 19.6px;
	color: var(--base-white);
`
}

export const portfolioName = (isActive: boolean | undefined,): string => {
	return css`
	${montserratSemibold}
		font-size: 18px;
		line-height: 25.2px;
		color: ${isActive ?
		'var(--gray-700)' :
		'var(--gray-500)'};
		margin-top: 22px;
		width: 240px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	`
}

export const totalAssets = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
	margin-top: 16px;
`

export const quantityAssets = (isActive: boolean | undefined,): string => {
	return css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	color: ${isActive ?
		'var(--gray-800)' :
		'var(--gray-500)'};
	margin-top: 8px;
`
}

export const buttonWrapper = css`
	position: absolute;
	right: 12px;
`

export const draftName = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
	margin-top: 12px;
	
`

export const updatedDate = css`
${montserratMediumReg}
font-size: 12px;
line-height: 16.8px;
color: var(--gray-600);
margin-top: 2px;
`

export const buttonBlock = css`
	display: flex;
	gap: 12px;
	margin-top: 22px;
`

export const trashIcon = css`
width: 20px;
height: 20px;
	& path {
		fill: var(--error-600);
	}
`

export const drawer = css`
    max-width: 560px;
    width: 100%;
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`

export const dialog = css`
max-width: 400px;
width: 100%;
border-radius: ${spaces.medium} !important;
margin: 0px !important;
 &.bp5-overlay {
  z-index: 1070 !important;
}
.${Classes.DIALOG_BODY_SCROLL_CONTAINER} {
	border-radius: ${spaces.medium} !important;
}

.${Classes.DIALOG_CLOSE_BUTTON} {
	padding: 0;
	width: 24px;
	height: 24px;
	outline: none !important;
	&:hover {
		background-color: transparent !important;
	}
}
`

export const editHeader = css`
	height: 68px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: ${spaces.midLarge};
	background-color: var(--primary-25);
	border-top-left-radius: 26px;
	border-bottom: 1px solid var(--primary-100);
`

export const editHeaderTitle = css`
	${montserratSemibold}
	font-size: 18px;
	color: var(--primary-600);
`

export const drawerBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
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

export const resumeButton = css`
	padding-left: 13px;
	padding-right: 13px;
`

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