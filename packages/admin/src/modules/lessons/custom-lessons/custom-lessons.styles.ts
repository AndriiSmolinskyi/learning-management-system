/* eslint-disable max-lines */
/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

import {
	customScrollbar,
	montserratMedium,
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
	spaces,
} from '../../../shared/styles'

export const container = css`
	display: flex;
	gap: ${spaces.medium};
	height: 100%;
	width: 100%;
	padding: 0px 16px 16px 0px;
`

export const builder = css`
	display: flex;
	flex-direction: column;
	width: 400px;
	height: 100%;
	border-radius: 22px;
	background-color: var(--base-white);
	overflow: hidden;
`

export const panel = css`
	display: flex;
	flex-direction: column;
	width: calc(100% - 16px - 400px);
	height: 100%;
	border-radius: 22px;
	background-color: var(--base-white);
	overflow: hidden;
`

export const panelHeager = css`
	height: 65px;
	width: 100%;
	display: flex;
	align-items: center;
	padding: 0 24px;
	gap: 4px;
	color: var(--gray-500);
	&  path {
		color: var(--gray-500);
		fill: currentColor;
	}
	& > p {
		color: currentColor;
		${montserratMediumReg}
		font-size: 12px;
		line-height: 16px;
	}
	& span {
		color: currentColor;
		${montserratMediumReg}
		font-size: 12px;
		line-height: 16px;
		width: max-content;
		max-width: 200px;
		overflow: hidden;
   	white-space: nowrap;
   	text-overflow: ellipsis;
	}
`

export const reportContent = (hasHeader: boolean,): string => {
	return css`
		height: ${hasHeader ? 'calc(100% - 65px)' : '100%'};
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 24px;
		overflow-y: auto;
		 ${customScrollbar};
	`
}

export const builderHeader = css`
	height: 74px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	background-color: var(--primary-25);
	padding: 0 16px;
	border-bottom: 1px solid var(--primary-100);
`

export const constructorHeader = css`
	${builderHeader}
	justify-content: flex-start;
	height: 68px;
	& > p {
		${montserratSemibold}
		color: var(--primary-600);
		font-size: 18px;
		line-height: 25px;
	}
`

export const builderFooter = css`
	height: 74px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: var(--primary-25);
	gap: 12px;
	padding: 0 16px;
	border-top: 1px solid var(--primary-100);
`

export const constructorFooter = css`
	${builderFooter}
	justify-content: flex-end;
`

export const builderContent = css`
	padding: 16px;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100% - 74px - 74px);
	gap: 12px;
	& path {
		fill: currentColor;
	}
	& > p {
		font-size: 16px;
		${montserratMidbold}
		line-height: 30px;
		color: var(--primary-600);
	}
	& > div {
		display: flex;
		width: 100%;
		gap: 12px;
		.${Classes.POPOVER_TRANSITION_CONTAINER} {
			inset: 252px 228px auto auto !important;
			background-color: transparent;
		}
		& > button {
			width: calc((100% - 16px) / 2);
		}
		& > label {
			width: calc((100% - 16px) / 2);
			& > button {
				width: 100%;
			}
		}
		& > span {
			width: calc((100% - 16px) / 2);
			& button {
				width: 100%;
			}
		}
		& div {
			outline: none !important;
		}
	}
	& > span {
		width: 100%;
		height: 1px;
		background-color: var(--primary-100);
	}
	& > button {
		width: 100%;
	}
`

export const constructorContent = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100% - 68px - 74px);
	overflow-y: auto;
	 & > div:first-child {
		padding: 16px;
	 }
	 & > div:last-child {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
 	${customScrollbar}
`

export const modalWrapper = css`
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
		margin-bottom: ${spaces.smallMedium} !important; 
	}
`

export const buttonBlock = css`
   width: 100%;
   display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
   margin-top: ${spaces.medium}; 
`

export const button = css`
    width: 100%;
`

export const exitDialogBackdrop = css`
	background-color: transparent !important;
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

export const actionBtn = css`
	padding: 0 12px;
	gap: 8px;
	width: 100%;
	justify-content: flex-start;
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

export const popoverBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`

export const closeBtn = css`
	position: relative;
	z-index: 100;
	`

export const reportBlockContaliner = css`
	padding-bottom: 24px;
`

export const reportBlockWrapper = (isEditor: boolean,): string => {
	return css`
	position: relative;
	
	& h1,h2,h3,h4,h5,h6,p,pre {
		padding: 12px;
	}
	& div {
		outline: none !important;
	}
	${!isEditor && `
		&:hover {
			outline: 1px solid var(--primary-600);
			box-shadow: 0px 0px 0px 4px #EBF2FF, 0px 1px 2px 0px #1018280D;
			& > div:first-child {
				display: block !important;
			}
			}
		`}
`
}

export const markupPopoverWrapper = css`
	padding-top: 30px;
	padding-left: 120px;
	display: none;
	z-index: 100;
	position: absolute;
	top: -38px;
	right: -8px;
	& path {
		fill: currentColor;
	}
`

export const textEditorWrapper = (height: number,): string => {
	return css`
		position: relative;
		height: ${height}px;
		margin-bottom: 24px;
		.tox-edit-area::before {
			border: none !important;
		}
		.tox-toolbar__primary {
			max-width: calc(100% - 200px);
		}
	`
}

export const tableEditorWrapper = (height: number,): string => {
	return css`
		${textEditorWrapper(height,)}
	`
}

export const tableEditorButtons = css`
	position: absolute;
	z-index: 10;
	display: flex;
	gap: 16px;
	right: 7px;
	top: 7px;
`

export const imageMarkupLoader = (hasPreview: boolean,): string => {
	return css`
	position: relative;
	display: flex;
	width: 100%;
	min-height: calc(100vh / 3);
	max-height: calc(100vh / 3 * 2);
	justify-content: center;
	align-items: center;
	background-color: ${hasPreview ? 'transparent' : 'var(--primary-50)'};
	overflow: hidden;
	& > img {
		object-fit: contain;
		object-position: center;
		width: 100%;
	}
`
}

export const formWrapper = css`
	display: flex;
	width: 100%;
	flex-direction: column;
	gap: 16px;
	border-radius: 12px;
	background-color: var(--primary-25);
	padding: 8px;
	& > span {
		width: 100%;
		height: 1px;
		background-color: var(--primary-100);
	}
`

export const checkboxWrapper = css`
	display: flex;
	width: 100%;
	align-items: center;
	height: 28px;
`

export const radioWrapper = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 8px;
	& > p {
		${montserratMediumReg}
		font-size: 14px;
		line-height: 19.6px;
		color: var(--gray-500);
	}
	& > div {
		display: flex;
		gap: 24px;
		align-items: center;
		height: 28px;
	}
`

export const inputHeadWrapper = css`
	display: flex;
	width: 100%;
	height: 44px;
	align-items: center;
	border-top: 1px solid var(--primary-100);
	border-bottom: 1px solid var(--primary-100);
	background-color: var(--primary-25);
	& > div {
		display: flex;
		width: calc(100% / 4);
		height: 100%;
		align-items: center;
		padding: 0 12px;
		& p {
			${montserratMidbold}
			font-size: 12px;
			line-height: 16.8px;
			color: var(--gray-600);
			width: 100%;
		}
	}
	& > div:not(:last-child) {
		border-right: 1px solid var(--primary-100);
	}
`

export const horizontalHeadWrapper = css`
	${inputHeadWrapper}
	& > div {
		display: flex;
		width: calc(100% / 3);
	}
`

export const pieHeadWrapper = css`
	${inputHeadWrapper}
	& > div {
		display: flex;
		width: calc(100% / 2);
	}
`

export const bubbleInputHeadWrapper = css`
	display: flex;
	width: 100%;
	height: 44px;
	align-items: center;
	border-top: 1px solid var(--primary-100);
	border-bottom: 1px solid var(--primary-100);
	background-color: var(--primary-25);
	& > div {
		display: flex;
		width: 25%;
		height: 100%;
		align-items: center;
		padding: 0 12px;
		& p {
			${montserratMidbold}
			font-size: 12px;
			line-height: 16.8px;
			color: var(--gray-600);
			width: 100%;
		}
	}
	& > div:not(:last-child) {
		border-right: 1px solid var(--primary-100);
	}
`

export const inputWrapper = css`
	position: relative;
	display: flex;
	width: 100%;
	height: 56px;
	align-items: center;
	border-bottom: 1px solid var(--primary-100);
	&:hover {
		& > span {
			display: flex !important;
		}
	}
	& > div {
		display: flex;
		width: 50%;
		height: 100%;
		align-items: center;
		& > input {
			width: 100%;
			padding: 0 30px 0 15px;
			outline: none;
			border: 1px solid transparent;
			${montserratMediumReg}
			font-size: 14px;
			line-height: 20px;
			color: var(--gray-900);
			height: 100%;
			& ::placeholder {
				${montserratMediumReg}
				font-size: 14px;
				line-height: 20px;
				color: var(--gray-400);
			}
			&:focus-within {
				border: 1px solid var(--primary-600) !important;
			}
		}
	}
	& > div:not(:last-child) {
		border-right: 1px solid var(--primary-100);
	}
`

export const barInputWrapper = css`
	position: relative;
	display: flex;
	width: 100%;
	height: 56px;
	align-items: center;
	border-bottom: 1px solid var(--primary-100);
	&:hover {
		& > span {
			display: flex !important;
		}
	}
	& > div {
		display: flex;
		width: calc(100% / 4);
		height: 100%;
		align-items: center;
		& > input {
			width: 100%;
			padding: 0 15px;
			outline: none;
			border: 1px solid transparent;
			${montserratMediumReg}
			font-size: 14px;
			line-height: 20px;
			color: var(--gray-900);
			height: 100%;
			& ::placeholder {
				${montserratMediumReg}
				font-size: 14px;
				line-height: 20px;
				color: var(--gray-400);
			}
			&:focus-within {
				border: 1px solid var(--primary-600) !important;
			}
		}
		& > input:last-child {
			padding: 0 30px 0 15px;
		}
	}
	& > div:not(:last-child) {
		border-right: 1px solid var(--primary-100);
	}
`

export const horizontalInputWrapper = css`
	${barInputWrapper}
		& > div {
		display: flex;
		width: calc(100% / 3);
		}
`

export const bubbleInputWrapper = css`
	position: relative;
	display: flex;
	width: 100%;
	height: 56px;
	align-items: center;
	border-bottom: 1px solid var(--primary-100);
	&:hover {
		& > span {
			display: flex !important;
		}
	}
	& > div {
		display: flex;
		width: calc(100% / 4);
		height: 100%;
		align-items: center;
		& > input {
			width: 100%;
			padding: 0 15px;
			outline: none;
			border: 1px solid transparent;
			${montserratMediumReg}
			font-size: 14px;
			line-height: 20px;
			color: var(--gray-900);
			height: 100%;
			& ::placeholder {
				${montserratMediumReg}
				font-size: 14px;
				line-height: 20px;
				color: var(--gray-400);
			}
			&:focus-within {
				border: 1px solid var(--primary-600) !important;
			}
		}
		& > input:last-child {
			padding: 0 30px 0 15px;
		}
	}
	& > div:not(:last-child) {
		border-right: 1px solid var(--primary-100);
	}
`

export const addInputBtn = css`
	display: flex;
	width: 100%;
	justify-content: center;
	cursor: pointer;
`

export const pieChartWrapper = (isEditor: boolean,): string => {
	return css`
	position: relative;
	width:   100%;
	padding: 18px 0 6px;
	outline: ${isEditor ? '1px solid var(--primary-600)' : 'none'};
	margin-bottom: 24px;
	.recharts-legend-item-text {
		color: var(--gray-600) !important;
		${montserratMediumReg}
		font-size: 12px;
	}
	min-height: calc(100vh / 5 * 3);
	max-height: calc(100vh / 5 * 4);
	height: 100%;
	background-color: var(--gray-25);
	border: 1px solid var(--gray-50);
	&:hover {
		border: 1px solid var(--gray-25);
		border-radius: 0px;
	}
	& > h5 {
		top: 6px;
		position: absolute;
		width: 100%;
		text-align: center;
		font-style: italic;
		font-size: 14px;
		${montserratMidbold}
		color: var(--gray-700);
	}
	${!isEditor &&	`
		border-radius: 6px;
		& div {
		outline: none !important;
		}
		margin-bottom: 24px;
		&:hover {
			box-shadow: 0px 0px 0px 4px #EBF2FF, 0px 1px 2px 0px #1018280D;
			outline: 1px solid var(--primary-600);
			& > div:first-child {
				display: block !important;
			}
			}
		& > div:first-child {
			display: none;
			z-index: 100;
			position: absolute;
			top: -8px;
			right: -8px;
			& path {
				fill: currentColor;
			}
			}
	`}
`
}

export const barChartWrapper = (isEditor: boolean,): string => {
	return css`
	position: relative;
	width:   100%;
	outline: ${isEditor ? '1px solid var(--primary-600)' : 'none'};
	.recharts-legend-item-text {
		color: var(--gray-600) !important;
		${montserratMediumReg}
		font-size: 12px;
	}
	margin-bottom: 24px;
	min-height: calc(100vh / 5 * 3);
	max-height: calc(100vh / 5 * 4);
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--gray-25);
	border: 1px solid var(--gray-50);
	&:hover {
		border: 1px solid var(--gray-25);
		border-radius: 0px;
	}
	& > h5 {
		top: 6px;
		position: absolute;
		width: 100%;
		text-align: center;
		font-style: italic;
		font-size: 14px;
		${montserratMidbold}
		color: var(--gray-700);
	}
	${!isEditor &&	`
		border-radius: 6px;
		& div {
			outline: none !important;
			}
			margin-bottom: 24px;
			&:hover {
			box-shadow: 0px 0px 0px 4px #EBF2FF, 0px 1px 2px 0px #1018280D;
			outline: 1px solid var(--primary-600);
			& > div:first-child {
				display: block !important;
			}
		}
		& > div:first-child {
			display: none;
			z-index: 100;
			position: absolute;
			top: -8px;
			right: -8px;
			& path {
				fill: currentColor;
			}
		}
	`}
`
}

export const pieStyle = css`
	outline: none !important;
	& * {
		outline: none !important;
	}
`

export const labelStyle = css`
	pointer-events: none;
	${montserratMediumReg}
	font-size: 12px;
`

export const trashBtn = css`
	width: 36px;
	height: 36px;
	position: absolute;
	justify-content: center;
	align-items: center;
	right: 0px;
	top: 10px;
	display: none;
	z-index: 10;
	cursor: pointer;
`
export const axisInputWrapper = css`
	display: flex;
	gap: 16px;
	width: 100%;
	& > div {
		overflow: hidden;
		width: calc((100% - 16px) / 2);
		& input {
			width: 100%;
		}
	}
`

export const labelBar = css`
	${montserratMediumReg}
	font-size: 12px;
	fill: var(--gray-700);
`

export const asisStyleHorizontal = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	text-align: center;
	word-wrap: break-word;
	& text {
		fill: var(--gray-700);
	}
`
export const xAxisStyle = css`
	position: absolute;
	bottom: 8px;
	left: 0px;
	width: 100%;
	text-align: center;
	${montserratMedium}
	font-size: 12px;
	line-height: 18px;
	color: var(--gray-600);
`

export const yAxisStyle = css`
	position: absolute;
	top: 0;
	left: 8px;
	writing-mode: vertical-lr;
	transform: rotate(180deg);
	text-orientation: mixed;  
	text-align: center;
	${montserratMedium}
	font-size: 12px;
	line-height: 18px;
	color: var(--gray-600);
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`

export const lineItemWrapper = css`
	padding: 8px;
	height: 52px;
	display: flex;
	width: 100%;
	background-color: var(--gray-50);
	border-radius: 12px;
	align-items: center;
	justify-content: space-between;
	& > p {
		${montserratMidbold}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-800);
		width: 70%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	& > div {
		display: flex;
		gap: 4px;
		& path {
			fill: currentColor;
		}
	}
`

export const lineSetupWpapper = css`
	padding: 0 16px 16px 16px;
	& > div {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 16px;
		padding: 8px;
		border-radius: 12px;
		background-color: var(--primary-50);
		& label {
			${montserratMidbold}
			font-size: 14px;
			line-height: 20px;
			color: var(--gray-600);
			margin-bottom: 8px;
			display: block;
		}
		& > p {
			padding: 0 6px;
			${montserratMidbold}
			font-size: 14px;
			line-height: 20px;
			color: var(--gray-800);
		}
		& > div {
			display: flex;
			gap: 12px;
		}
	}
`

export const lineItemsContainer = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	padding: 0 16px 16px 16px;
	gap: 12px;
`

export const addLineWrapper = css`
	padding: 0 16px 16px 16px;
	& button {
		margin-left: auto;
	}
`

export const reorderHeader = css`
	display: flex;
	width: 100%;
	align-items: center;
	padding-bottom: 16px;
	height: 40px;
	& > h3 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 24px;
		color: var(--gray-800);
	}
`

export const reorderButtonBlock = css`
	display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
	width: 100%;
	padding-top: 16px;
	height: 58px;
	& > button {
		width: calc((100% - 12px)/2);
	}
	& path {
		fill: currentColor;
	}
`

export const reorderContentBlock = css`
	height: calc(100% - 58px - 40px);
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 8px;
	& > div {
		height: 52px;
		display: flex;
		width: 100%;
		align-items: center;
		gap: 16px;
		border: 1px solid var(--primary-50);
		background-color: var(--primary-25);
		border-radius: 12px;
		cursor: pointer;
		& > div {
			display: flex;
		}
		& > p {
			${montserratMidbold}
			font-size: 14px;
			line-height: 18px;
			color: var(--gray-700);
		}
		&:hover {
			border: 1px solid var(--primary-500);
			box-shadow: 0px 0px 0px 4px #EBF2FF, 0px 1px 2px 0px #1018280D;
			& path {
				fill: var(--primary-500);
			}
		}
		&:focus {
			outline: none;
		}
	}
`

export const cursor = css`
	cursor: url('../../../src/assets/icons/cursor-drag.svg'), grab !important;
`

export const bottomBlock = css`
	min-height: 150px;
	max-height: 250px;
	width: 100%;
	pointer-events: none;
`