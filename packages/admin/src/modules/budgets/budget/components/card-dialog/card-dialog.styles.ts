import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

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
	background-color: #FFFFFFEB !important;
	border-radius: 16px !important;
	border: none !important;
	width: 232px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	backdrop-filter: blur(2px) !important;
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

export const restoreWrapper = css`
	width: 100%;
	padding: 4px;
	border-bottom: 1px solid var(--primary-100);
`

export const deactivateWrapper = css`
	width: 100%;
	padding: 4px;
	border-top: 1px solid var(--primary-100);
`

export const deactivateButton = css`
	color: var(--error-600);
`

export const activateButton = css`
	color: var(--green-600);
`