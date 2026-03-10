import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
} from '../../../../../../shared/styles'

export const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const tableWrapper = css`
	border-bottom-left-radius: 22px;
	border-bottom-right-radius: 22px;
	overflow: hidden;
	`

export const tableContainer = css`
	border-collapse: collapse;
	border-spacing: 0;
	width: 100%;
	border-radius: 22px;
`

export const headerCell = css`
   position: sticky;
   top: 0;
   height: 44px;
   padding: 0 12px;
   text-align: left;
   white-space: nowrap;
   background-color: var(--primary-25);
   border-bottom: 1px solid var(--primary-100);
   border-collapse: collapse;
   border-spacing: 0;
   z-index: 1;
`

export const tableTitle = css`
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16.8px;
`

export const tableCell = css`
	${montserratMediumReg}
	height: 56px;
	max-width: 200px;
	padding: 0 16px;
	text-align: left;
	font-size: 14px;
	line-height: 19.6px;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	border-bottom: 1px solid var(--primary-100);
	white-space: normal;
	word-wrap: break-word;
`

export const tableButtonCell = css`
	${montserratMediumReg}
	height: 44px;
	width: 72px;
	padding: 0 16px;
	border-bottom: 1px solid var(--primary-100);
`

export const itemWrapper = css`
	background-color: var(--base-white);
`

export const sortArrow = (rotate?: boolean,): string => {
	return css`
	cursor: pointer;
	rotate: ${rotate ?
		'180deg' :
		'0deg'};
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
`
}

export const tableAmountCell = (isPositive: boolean,): string => {
	return css`
	${montserratMediumReg}
	height: 56px;
	max-width: 200px;
	padding: 0 16px;
	text-align: left;
	font-size: 14px;
	line-height: 19.6px;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	border-bottom: 1px solid var(--primary-100);
	white-space: normal;
	word-wrap: break-word;
	color: ${isPositive ?
		'var(--green-600)' :
		'var(--error-600)'};
`
}