/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

import {
	montserratMidbold,
	montserratSemibold,
} from '../../../../../../shared/styles'

export const listWrapper = css`
	width: 100%;
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	background-color: var(--base-white);
	border-radius: 22px;
	`

export const headerTitle = css`
	padding: 20px;
	& > h3 {
		${montserratSemibold}
		font-size: 22px;
		line-height: 30.8px;
		color: var(--gray-800);
		}
`

export const buttonWrapper = css`
	padding: 20px;
	& > button {
		width: 100%;
	}
`

export const tableHeader = css`
	display: flex;
	width: 100%;
	height: 44px;
	border-top: 1px solid var(--primary-100);
	border-bottom: 1px solid var(--primary-100);
	background-color: var(--primary-25);
	height: 44px;
	align-items: center;
`

const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const idHeaderCell = css`
	${flex}
	min-width: 178.5px;
	width: 22.5%;
	gap: 10px;
	padding: 0px 16px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const orderArrow = (rotate?: boolean,): string => {
	return css`
	cursor: pointer;
	rotate: ${rotate ? '180deg' : '0deg'};
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
`
}

export const headerCell = css`
	min-width: 178.5px;
	width: 22.5%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 16px;
	`

export const updateCell = css`
	${flex}
	padding: 0 16px;
	min-width: 178.5px;
	width: 22.5%;
	gap: 10px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const menuCell = css`
	${flex}
	justify-content: center;
	min-width: 68px;
	width: 10%;
	position: relative;
`

export const requestContainer = css`
	display: flex;
	align-items: center;
	width: 100%;
	border-bottom: 1px solid var(--primary-100);
	height: 56px;
`

export const tableCell = css`
	padding: 0px 16px;
	min-width: 178.5px;
	width: 22.5%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	`

export const badgeCell = css`
	${flex}
	min-width: 178.5px;
	width: 22.5%;
	padding: 0px 16px;
	.${Classes.POPOVER_TRANSITION_CONTAINER} {
		background-color: transparent;
	}
	& div {
		outline: none !important;
	}
`

export const dotsButton = css`
	& svg {
		& path {
			fill: var(--gray-700);
		}
	}
`

export const actionBtn = css`
	padding: 0 12px;
	gap: 8px;
	width: 100%;
	justify-content: flex-start;
`

export const dialogContainer = css`
	background-color: var(--base-white) !important;
	backdrop-filter: blur(2px) !important;
	border-radius: 16px !important;
	border: none !important;
	width: 232px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	display: flex;
	flex-direction: column;
`

export const menuActions = css`
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 4px;
	width: 100%;
`

export const popoverBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`

export const popoverContainer = css`
	background-color: transparent !important;
	border: none !important;
	box-shadow: none !important;
	.${Classes.POPOVER_CONTENT} {
			background-color: transparent !important;
			border: none !important;
			border-radius: 0 !important;	
			opacity: 0.97;	
	}
	.${Classes.POPOVER_ARROW} {
			background-color: transparent !important;
			border: none !important;
			width: 0px !important;
			height: 0px !important;
			&::before {
				box-shadow: none !important;
			}
	}
`

export const badgeWidth = css`
	width: 132px;
`