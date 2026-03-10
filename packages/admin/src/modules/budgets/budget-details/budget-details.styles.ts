import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
	montserratSemibold,
} from '../../../shared/styles'

export const pageWrapper = css`
	padding-right: 16px;
	margin-left: -8px;
	padding-left: 8px;
`

export const contentWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 16px;
	max-height: calc(100vh - 108px);
	margin: 8px -8px -8px -8px;
	padding: 8px;
	overflow-y: auto;
	 ${customScrollbar}
	 
  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
    box-shadow: inset 3px 0px 0px 4px var(--primary-100);
  }
	border-bottom-left-radius: 22px;
	border-bottom-right-radius: 22px;
`

export const detailsWrapper = css`
`

export const chartWrapper = css`
	height: 372px;
	
`
export const expenseWrapper = css`
	background-color: var(--base-white);
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	padding: 20px;
	border-radius: 22px;
`

export const expenseEditButton = css`
 & span svg path {
			fill: currentColor;
 }
`

export const expenseHeader = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const expenseTitle = css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	letter-spacing: 0%;
 	color: var(--gray-800);
`

export const expenseList = css`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	margin-top: 20px;
`

export const pngImage = css`
	display: block;
	width: 44px;
	height: 44px;
`

export const headerWrapper = css`
	display: flex;
	justify-content: space-between;
`

export const chartSectionWrapper = css`
	width: 100%;
	background-color: var(--base-white);
	padding: 20px;
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
`