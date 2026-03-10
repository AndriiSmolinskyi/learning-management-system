/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
import {
	css,
} from '@emotion/css'

import {
	montserratMidbold,
	montserratMediumReg,
	montserratSemibold,
} from '../../../shared/styles'

export const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const textNowrap = css`
	white-space: nowrap;
`

export const container = css`
   width: 100%;
   height: 100%;
	min-height: 0;
`

export const upSection = css`
   display: flex; 
   flex-direction: column; 
   width: 100%;
   /* height: calc((100% - 16px)/2); */
	height: calc((65% - 16px));
	min-height: 0; 
   border-radius: 22px;
	overflow: hidden;
`

export const bottomSection = css`
	display: flex;
   gap: 16px;
	margin-top: 16px;
   /* height: calc((100% - 16px)/2); */
	height: calc((35% - 16px));
`

export const bottomLeftSection = css`
    width: calc((100% - 16px)/2);
	 min-height: 0;
	 height: 100%;
    border-radius: 22px;
`

export const bottomRightSection = css`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
   width: calc((100% - 16px)/2);
	min-height: 0;
	height: 100%;
   border-radius: 22px;
`

export const headerCell = css`
   position: sticky;
   top: 0;
   height: 44px;
	min-width: 150px;
	width: 1000px;
   padding: 0 6px;
   text-align: left;
   white-space: nowrap;
   background-color: var(--primary-25);
   border-bottom: 1px solid var(--primary-100);
   border-collapse: collapse;
   border-spacing: 0;
   z-index: 1;
	padding-right: 2px;
`

export const footerTotalCell = css`
   position: sticky;
   top: 0;
   height: 44px;
	min-width: 150px;
	width: 1000px;
   padding: 0 2px;
   text-align: left;
   white-space: nowrap;
   background-color: var(--primary-25);
   border-bottom: 1px solid var(--primary-100);
   border-collapse: collapse;
   border-spacing: 0;
   z-index: 1;
	text-align: right;
`

export const cellWidth80 = css`
	min-width: 80px;
	width: 800px;
`

export const cellWidth90 = css`
	min-width: 90px;
	width: 900px;
`

export const cellWidth100 = css`
	min-width: 100px;
	width: 1000px;
`

export const cellWidth110 = css`
	min-width: 110px;
	width: 1100px;
	padding-left: 2px;
`

export const cellWidth120 = css`
	min-width: 120px;
	width: 1200px;
`

export const cellWidth130 = css`
	min-width: 130px;
	width: 1300px;
`

export const cellWidth140 = css`
	min-width: 140px;
	width: 1400px;
`

export const cellWidth72 = css`
	min-width: 72px;
	width: 720px;
`

export const tableTitle = css`
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16.8px;
	text-align: left;
`

export const tableCell = css`
	${montserratMediumReg}
	height: 44px;
	width: 500px;
	padding: 0 6px;
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

export const tableCellMinimized = css`
	${tableCell}
	width: 80px;
`

export const tableProfitCellMinimized = css`
	${tableCell}
	width: 100px;
`

export const tableSortCellMinimized = css`
	${tableCell}
	width: 130px;
`

export const tableBtnCell = css`
	width: 44px;
	border-bottom: 1px solid var(--primary-100);
`

export const amountColor = (isPositive?: boolean,): string => {
	return css`
	color: ${isPositive ?
		'var(--green-600)' :
		'var(--error-600)'};
`
}

export const cellContent = css`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
`

export const tableRow = (isClicked = false, showSubItems: boolean, isMutating: boolean, isNestedAssets: boolean,): string => {
	return css`
	cursor: pointer;
	${isMutating ?
		css`
					animation: blinkRow 0.75s infinite alternate;
					@keyframes blinkRow {
						from {
							background-color: var(--base-white);
						}
						to {
							background-color: var(--primary-100);
						}
					}
			  ` :
		css`
					background-color: ${isClicked ?
		isNestedAssets ?
			'var(--primary-200)' :
			'var(--primary-100)' :
		'var(--base-white)'};
			  `}
		& > td {
			border-bottom: 1px solid ${showSubItems ?
		'var(--primary-500)' :
		'var(--primary-100)'}
			}
	`
}
export const tableMockupRow = (): string => {
	return css`
		cursor: pointer;
		animation: blinkRow 0.75s infinite alternate;		
		@keyframes blinkRow {
			from {
				background-color: var(--base-white);
			}
			to {
				background-color: var(--primary-100);
			}
		}
	`
}

export const dotAnimation = (): string => {
	return css`
	display: inline-block;
	width: 1.5em;
	overflow: hidden;
	vertical-align: bottom;

	&::after {
		content: '...';
		display: inline-block;
		animation: dots 1.5s steps(4, end) infinite;
	}

	@keyframes dots {
		0% {
			content: '';
		}
		25% {
			content: '.';
		}
		50% {
			content: '..';
		}
		75% {
			content: '...';
		}
		100% {
			content: '';
		}
	}
`
}

export const tableCreatingCell = css`
	padding: 0 8px;
	border-bottom: 1px solid var(--primary-100);
`

export const tableSubRow = (isClicked = false, isLast: boolean,isMutating: boolean,): string => {
	return css`
	cursor: pointer;
	${isMutating ?
		css`
					animation: blinkRow 0.75s infinite alternate;
					@keyframes blinkRow {
						from {
							background-color: var(--base-white);
						}
						to {
							background-color: var(--primary-100);
						}
					}
			  ` :
		css`
					background-color: ${isClicked ?
		'var(--primary-100)' :
		'var(--base-white)'};
			  `}
	& > td {
		border-bottom: 1px solid ${isLast ?
		'var(--primary-500)' :
		'var(--primary-100)'}
		}
	`
}

export const totalsWrapper = css`
	display: flex;
	gap: 30px;
`

export const totalAmount = (columnPosition: number,): string => {
	return css`
	${totalLabel};
	position: absolute;
	left: ${columnPosition}px;
	padding-left: 20px;
	`
}

export const chartByBankContainer = css`
	min-height: 0;
	height: 100%;
	border-radius: 22px;
	background-color: var(--base-white);
	position: relative;
	`

export const chartByCurrencyContainer = css`
	min-height: 0;
	height: calc(100% - 62px);
	margin-bottom: 16px;
	border-radius: 22px;
	background-color: var(--base-white);
	position: relative;
`

export const chartHeader = css`
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

export const resetButton = css`
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

export const clearIcon = css`
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

export const sortArrows = (rotate?: boolean,): string => {
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

export const annualIncomeBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
	padding: 12px 24px;
	background: var(--gradients-download-button);
	border: 1px solid var(--primary-200);
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	border-radius: 22px;
	& > p {
		${montserratMidbold}
		font-size: 16px;
		line-height: 22.4px;
		color: var(--primary-600);
	}
`

export const containerButtons = css`
	position: absolute;
	right: 1px;
	top: 1px;
	z-index: 10;
	display: flex;
`

export const tableWrapper = css`
   display: flex;
   flex-direction: column;
	justify-content: space-between;
	height: 100%;
	min-height: 0;
   background-color: var(--base-white);
   border-radius: 22px;
	overflow: hidden;
	position: relative;
	overflow-x: auto;
   overflow-y: auto;
`

export const scrollPadding = css`
	position: absolute;
	right: 0px;
	top: 0px;
	height: 45px;
	width: 12px;
	background-color: var(--primary-25);
	z-index: 2;
`

export const tableContainer = (items: boolean,): string => {
	return css`
	display: block;
	width: 100%;
	min-height: calc(100%);
   max-height: calc(100%);
	border-collapse: collapse;
	border-spacing: 0;
	position: relative;
	overflow-x: auto;
   overflow-y: ${items ?
		'auto' :
		'hidden'};
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
	 margin-top: 38px;
  }
  
   &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
`
}

export const tableFooter = (items: boolean,): string => {
	return css`
	position: ${items ?
		'sticky' :
		'absolute'};
	bottom: -1px;
	height: 46px;
	background-color: var(--primary-25);
   border-top: 1px solid var(--primary-100);
	width: 100%;
`
}

export const footerBorder = css`
	 border-top: 1px solid var(--primary-100);
`

export const totalLabel = css`
	${montserratMidbold}
	font-size: 16px;
   color: var(--primary-600);
	padding-left: 4px;
	&:hover{
		cursor: pointer;
	}
`

export const tableBtnContainer = (isHorizontalScroll: boolean,): string => {
	return css`
	position: absolute;
	display: flex;
	align-items: center;
	right: 0px;
	bottom: ${isHorizontalScroll ?
		'11.5px' :
		'6.5px'};
	height: ${isHorizontalScroll ?
		'43.5px' :
		'39px'};
	background: var(--primary-25);
	z-index: 2;
`
}

export const tableNumberField = css`
	text-align: right;
`

export const flexNumber = css`
	display: flex;
	align-items: center;
	height: 100%;
	justify-content: flex-end;;
`

export const tableTitleNumber = css`
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16.8px;
	text-align: right;
	padding-right: 4px;

`

export const headerCellSortRight = css`
	${headerCell}
	padding-right: 8px;
`

export const chevronIcon = (isOpen: boolean,): string => {
	return css`
	cursor: pointer;
	transform: ${isOpen ?
		'rotate(180deg)' :
		'rotate(0deg)'};
	transition: all ease 0.3s;
	&:hover {
		& path {
	fill: var(--primary-500);
	}}
`
}

export const chevronContainer = css`
padding-left: 10px;
`

export const popoverBtn = css`
	&:hover {
		background-color: var(--primary-100);
	}
`
export const cellWidth44 = css`
	min-width: 44px;
	width: 44px;
`

export const cellWidth141 = css`
	min-width: 141px;
	width: 141px;
`

export const empty = css`
  /* display: block;
  width: fit-content;
  margin: 0 auto;  */
`

export const transferIcon = css`
	position: absolute;
	top: 2px;
	right: 2px;
	& path {
		stroke: var(--gray-400);
	}
`