/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'

const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

import {
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
} from '../../../shared/styles'

export const container = css`
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: calc(100% - 68px - 16px);
	flex-wrap: wrap;
	gap: 16px;
`

export const tableHeader = css`
	display: flex;
	height: 46px;
	width: 100%;
	align-items: center;
	justify-content: center;
	background-color: var(--base-white);
	border-bottom: 1px solid var(--primary-100);
	border-top-left-radius: 22px;
  	border-top-right-radius: 22px;
	position: relative;
	z-index: 2;
	& > p {
		${montserratSemibold}
		font-size: 16px;
		line-height: 22.4px;
		color: var(--gray-600);
	}
	`

export const tableWrapper = css`
	width: calc((100% - 16px)/2);
	background-color: var(--base-white);
	height: 100%;
	border-radius: 22px;
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	overflow: hidden;
	position: relative;
`

export const cellStyle = css`
	fill: var(--primary-400);
`

export const crearIcon = css`
	position: absolute;
	top: 5px;
	right: 5px;
	width: 30px;
	height: 30px;
	z-index: 5;
	background-color: red;
	cursor: pointer;
	rotate: 45deg;
	border-radius: 999px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px !important;
	text-align: center;
`

export const tableHead = css`
	height: 44px;
	${montserratMidbold}
	background-color: var(--primary-25);
	border-bottom: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	z-index: 2;
`

export const headerCell = css`
	width: 150px;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 12px;
`

export const sortHeaderCellCash = css`
	${flex}
	width: 150px;
	gap: 10px;
	padding-right: 18px;
	justify-content: flex-end;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const headerCellCash = css`
	min-width: 210px;
	width: 34%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 12px;
`

export const usdHeaderCell = css`
	${flex}
	min-width: 83px;
	width: 18%;
	gap: 10px;
	padding: 0px 12px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const percentHeaderCell = css`
	${flex}
	min-width: 67px;
	width: 14%;
	gap: 10px;
	padding: 0px 12px;
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
	width: 16px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
`
}

export const cashTableWrapper = css`
	height: calc(100% - 46px);
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const cashTableFooter = (isTbodyEmpty: boolean,): string => {
	return css`
	height: 46px;
	${montserratMidbold}
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	padding-right: ${isTbodyEmpty ? '0px' : '20px'};
`
}

export const totalCell = css`
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	padding: 0 16px;
	width: 150px;
`

export const valueCell = css`
	width: 150px;
	${flex}
	justify-content: flex-end;
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	&:hover{
		cursor: pointer;
	}
`

export const cashTable = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100% - 46px - 44px);
	overflow-y: auto;
	&::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }  
   &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
`

export const itemContainer = (active: boolean,): string => {
	return css`
	border-bottom: 1px solid var(--primary-100);
	height: 44px !important;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	background-color: ${active ? 'var(--primary-100)' : 'transparent'};
	& > p {
		overflow: hidden;
   	white-space: nowrap;
   	text-overflow: ellipsis;
	}
`
}

export const tableCell = css`
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	padding: 0 12px;
	height: 44px;
	display: flex;
	align-items: center;
	width: 150px;
`

export const tableCellNumber = css`
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	padding: 0 12px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	width: 150px;
	text-align: right;
`

export const usdTableCell = css`
	min-width: 83px;
	width: 18%;
	font-size: 14px;
	line-height: 20px;
	padding: 0px 12px;
	${montserratMediumReg}
	color: var(--gray-600);
	text-align: right;
`

export const percentTableCell = css`
	min-width: 67px;
	width: 14%;
	padding: 0px 12px;
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	text-align: right;
`

export const containerButtons = css`
	position: absolute;
	right: 1px;
	top: 1px;
	z-index: 10;
`

export const clearBtn = css`
	outline: none !important;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
`

export const chartsWrapper = css`
	height: calc((100% - 16px) / 2);
	width: 100%;
	display: flex;
	gap: 16px;
`

export const emptyState = css`
	transform: translate(-50%, -40%);
`