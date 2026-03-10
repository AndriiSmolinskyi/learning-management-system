import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
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

export const formWrapper = css`
	padding: 4px 16px 16px;
	margin-top: -4px;
	height: 100%;
	overflow-y: auto;
	 ${customScrollbar}
`

export const exitDialogBackdrop = css`
	background-color: transparent !important;
`

