import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	montserratMediumReg,
	montserratMidbold,
} from '../../../../../shared/styles'

export const filterContainer = (isHistoryDate?: boolean,): string => {
	return css`
		height: ${isHistoryDate ?
		'78px' :
		'100%'};
		width: 180px;
		background-color: var(--base-white);
		border-radius: 22px;
		box-shadow: -1px 2px 8px 0px #2A2C731A;
		padding: 12px;
		display: flex;
		gap: 12px;
		position: absolute;
		top: 0;            /* ⬅️ ЯКІР */
		right: 0;
		
`
}

export const filterButton = (iFilterShown: boolean, hasFilters: boolean,):string => {
	return css`
	${iFilterShown && `
		position: relative;
		z-index: 100;
	`}
	& svg {
		& path {
			fill: var(--primary-600);
		}
	}
	${hasFilters && `
		position: relative;
		z-index: 1;
	`}
	${hasFilters && `&::after {
		content: '';
		position: absolute;
		top: 4px;
		right: 4px;
		width: 10px;
		height: 10px;
		background: radial-gradient(81.82% 81.82% at 34.13% 29.53%, #61DEB0 0%, #44B98E 100%);
		border-radius: 50%;
	  }
	  `}
`
}

export const filterBtnWrapper = css`
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	align-items: center;
	border-top: 1px solid var(--primary-100);
	padding: 16px;
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

export const filterDialogContainer = css`
	background-color: var(--base-white) !important;
	backdrop-filter: blur(2px) !important;
	border-radius: 16px !important;
	border: none !important;
	width: 400px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	display: flex;
	flex-direction: column;
`

export const filterDialogWrapper = css`
	display: flex;
	flex-direction: column;
	padding: 16px;
	gap: 16px;
`

export const applyBtn = css`
	width: 132px;
`

export const clearBtn = css`
	width: 94px;
`

export const historyWrapper = css`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-content: center;
`

export const historyLeftBlock = css`
	display: flex;
	flex-direction: column;
`

export const iconBlock = css`
	display:flex;
	gap: 4px;
	align-items: center;
`

export const iconText = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
`

export const historyInfoText = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
`

export const historyRightBlock = (isActive: boolean,): string => {
	return css`
	width: 51px;
	height: 31px;
	border-radius: 100px;
	background-color: ${isActive ?
		'var(--primary-500)' :
		'var(--gray-400)'};
	position: relative;
	transition: all ease 0.3s;
	margin-left: 76px;
	&:hover {
		cursor: pointer;
	}
`
}

export const historySwitcherItem = (isActive: boolean, isDate?: string,): string => {
	return css`
		position: absolute;
		top: 2px;
		left: ${isActive ?
		'22px' :
		'2px'};
		width: 27px;
		height: 27px;
		border-radius: 100px;
		background-color: ${isDate ?
		'var(--success-200)' :
		'var(--base-white)'};
		transition: all ease 0.3s;
	`
}

export const historyDate = css`
${montserratMediumReg}
	position: absolute;
	bottom: 2px;
	left: 16px;
	display: flex;
	gap: 2px;
	align-items: center;
`

export const dateClearButton = css`
	cursor: pointer;
	margin-left: 8px;
`