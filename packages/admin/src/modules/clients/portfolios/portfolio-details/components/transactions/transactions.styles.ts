import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	montserratMediumReg,
} from '../../../../../../shared/styles'

export const marginBottom2 = css`
	margin-bottom: 2px;
`

export const textColorRed = css`
	${montserratMidbold}
	font-size: 16px;
	line-height: 22.4px;
	color: var(--error-600) !important;
	&:hover {
    color: var(--error-600);
	}
	svg path {
		fill: var(--error-600) !important;
	}
`

export const textColorGreen = css`
	${montserratMidbold}
	font-size: 16px;
	line-height: 22.4px;
	color: var(--green-600);
`

export const container = css`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-height: 100px;
	flex-shrink: 0;
	background-color: var(--base-white);
	border-radius: 22px;
`

export const titleContainer = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
`

export const title = css`
	${montserratMidbold}
	font-size: 22px;
	line-height: 30.8px;
	color: var(--gray-800);
`

export const itemsContainer = (isFetching: boolean,): string => {
	return css`
		padding: 0 20px;
		position: relative;
		${isFetching ?
		'height: 300px;' :
		''}
	`
}

export const transactionItem = css`
	display: flex;
	align-items: center;
	padding: 12px;
	margin-bottom: 12px;
	border-radius: 14px;
	border: 1px solid var(--gray-100);
`

export const amountBlock = css`
	display: flex;
	flex-direction: column;
	width: 150px;
	padding: 0 12px;
	border-right: 1px solid var(--gray-100);
`

export const itemSubTitle = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
`

export const bankBlock = css`
	width: 86px;
	padding: 0 12px;
	margin-right: auto; 
`

export const bankTitleBlock = css`
	display: flex;
	gap: 4px;
	align-items: center;
	
	svg path {
		fill: var(--gray-500);
	}
`

export const bankTitle = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-800);
	margin-top: 2px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const dotsButton = (isPopoverShown: boolean,):string => {
	return css`
	${isPopoverShown && `
		position: relative;
		z-index: 100;
	`
}
	& svg {
		& path {
			fill: var(--gray-700);
		}
	}
`
}

export const btnContainer = css`
	padding: 20px;
`

export const navigateButton = css`
	width: 100%;
	height: 42px !important;
`