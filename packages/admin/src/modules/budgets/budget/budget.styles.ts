import {
	css,
} from '@emotion/css'
import {
	customScrollbar, montserratMidbold,
} from '../../../shared/styles'

export const pageWrapper = css`
	padding-right: 16px;
	height: 100%;
`

export const listWrapper = css`
	height: calc(100% - 100px);
	overflow-y: auto;
	margin-left: -8px;
	padding-left: 8px;
	 ${customScrollbar}
	 	   &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
    box-shadow: inset -3px 0px 0px 4px var(--primary-100);
	}
`
export const budgetList = css`
	padding: 0;
	margin-top: 16px;
	display: flex;
	gap: 16px;
	flex-wrap: wrap;	
`

export const exitDialogBackdrop = css`
	background-color: transparent !important;
`

export const emptyContainer = css`
	height: 69vh;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 16px;
`

export const emptyText = css`
	${montserratMidbold}
	font-size: 12px;
	color: var(--gray-600);
	font-style: italic;
`