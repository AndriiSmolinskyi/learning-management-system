/* eslint-disable max-lines */
/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'

import {
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
} from '../../../shared/styles'

export const container = css`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: calc(100%  - 68px - 16px);
	margin: 0 auto;
	gap: 16px;
	flex-direction: column;
`

export const blocksWrapper = css`
	height: calc((100% - 16px) / 2);
	width: 100%;
	display: flex;
	gap: 16px;
`

export const tableWrapper = css`
	width: calc((100% - 16px)/2);
	background-color: var(--base-white);
	height: 100%;
	border-radius: 22px;
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	overflow: hidden;
`

export const piechartContainer = css`
	width: 22.5%;
	min-width: 260px;
	position: relative;
`

export const largeTableContainer = css`
	width: 42.5%;
	min-width: 491px;
	position: relative;
`

export const smallTableContainer = css`
	width: 35%;
	min-width: 375px;
	position: relative;
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

export const containerButtons = css`
	position: absolute;
	right: 1px;
	top: 1px;
	z-index: 2;
	display: flex;
	gap: 2px;
`

export const clearBtn = css`
	outline: none !important;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
`

export const currencyTableHead = (isTbodyEmpty: boolean,): string => {
	return css`
	height: 44px;
	background-color: var(--primary-25);
	border-bottom: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
	z-index: 0;
	padding-right: ${isTbodyEmpty ? '0px' : '12px'};

`
}

export const currencyHeaderCell = css`
	min-width: 112.5px;
	width: 30%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 12px;
`

export const currencyHeaderCellFC = css`
	min-width: 112.5px;
	width: 30%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 12px;
	display: flex;
	justify-content: flex-end;
	/* padding-right: calc(15% + 36px); */
	padding-right: 7.5%;
`

export const assetHeaderCell = (isCurrencyFC?: boolean,): string => {
	return css`
	${currencyHeaderCell}
	min-width: ${isCurrencyFC ? '143px' : '198px'};
	width: ${isCurrencyFC ? '40%' : '52%'};
`
}

export const assetHeaderCellFC = (isCurrencyFC?: boolean,): string => {
	return css`
	${currencyHeaderCell}
	min-width: ${isCurrencyFC ? '143px' : '198px'};
	width: ${isCurrencyFC ? '40%' : '52%'};
	display: flex;
	justify-content: flex-end;
	padding-right: calc(15% + 8px);
`
}

export const bankHeaderCell = css`
	${currencyHeaderCell}
	min-width: 151px;
	width: 30%;
`

const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const currencyUsdHeaderCell = css`
	${flex}
	justify-content: flex-end;
	min-width: 83px;
	width: 22%;
	gap: 8px;
	padding: 0px 12px;
	padding-right: 12px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const assetUsdHeaderCell = css`
	${currencyUsdHeaderCell}
	min-width: 87px;
	width: 24%;
`

export const bankUsdHeaderCell = css`
	${flex}
	min-width: 83px;
	width: 22%;
	gap: 8px;
	padding-left: 12px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
	min-width: 87px;
	width: 19%;
	display: flex;
	justify-content: flex-end;
	padding-right: 12px;
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

export const currencyPercentHeaderCell = css`
	${flex}
	justify-content: flex-end;
	min-width: 67px;
	width: 18%;
	gap: 8px;
	padding: 0px 12px;
	padding-right: 12px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const bankPercentHeaderCell = css`
	${flex}
	min-width: 67px;
	width: 18%;
	gap: 8px;
	padding-left: 12px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
	min-width: 66px;
	width: 14%;
	display: flex;
	justify-content: flex-end;
	padding-right: 12px;
`

export const assetPercentHeaderCell = css`
	${currencyPercentHeaderCell}
	min-width: 90px;
	width: 24%;
`

export const currencyItemContainer = (active: boolean, isLast?: boolean, showSubItems?: boolean,): string => {
	return css`
	position: relative;
	height: 44px !important;
	width: 100%;
	display: flex;
	align-items: center;
	cursor: pointer;
	/* border-bottom: ${isLast ? '1.5px solid var(--primary-600)' :
		'1px solid var(--primary-100)'}; */
	border-bottom: '1px solid var(--primary-100)';
	background-color: ${active ? 'var(--primary-100)' : 'transparent'};
	border-top: 1px solid ${showSubItems ?
		'var(--primary-600)' :
		'var(--primary-100)'};
	& > p {
		overflow: hidden;
   	white-space: nowrap;
   	text-overflow: ellipsis;
		line-height: 44px;
	}
`
}

export const currencySubItemContainer = (active: boolean, isFirst: boolean,): string => {
	return css`
	height: 44px !important;
	width: 100%;
	display: flex;
	align-items: center;
	cursor: pointer;
	border-bottom: 1px solid ${isFirst ?
		'var(--primary-600)' :
		'var(--primary-100)'};
	background-color: ${active ? 'var(--primary-100)' : 'transparent'};
	& > p {
		overflow: hidden;
   	white-space: nowrap;
   	text-overflow: ellipsis;
		line-height: 44px;
	}
`
}

export const zeroCurrencyItemContainer = css`
	height: 44px !important;
	width: 100%;
	display: flex;
	align-items: center;
	cursor: pointer;
	border-bottom: 1px solid var(--primary-100);
	background-color: transparent;
	& > p {
		overflow: hidden;
   	white-space: nowrap;
   	text-overflow: ellipsis;
		line-height: 44px;
	}
`

export const currencyTableCell = css`
	/* min-width: 112.5px; */
	width: 30%;
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	padding: 0 12px;
`

export const currencyTableCellFC = css`
	min-width: 112.5px;
	width: 30%;
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	padding: 0 12px;
	/* display: flex;
	justify-content: flex-end; */
	text-align: right;
	padding-right: 7.5%;
`

export const bankTableCell = (showSubItems?: boolean,): string => {
	return css`
	${currencyTableCell}
	min-width: 151px;
	width: 30%;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: normal;
	word-wrap: break-word;
	overflow-wrap: break-word;
		border-top: 1px solid ${showSubItems ?
		'var(--primary-600)' :
		'var(--primary-100)'};
`
}
export const firstBankTableCell = css`
	${bankTableCell()}
	padding-left: 0px;

`

export const assetTableCell = (isCurrencyFC?: boolean,): string => {
	return css`
	${bankTableCell()}
	min-width: ${isCurrencyFC ? '143px' : '198px'};
	width: ${isCurrencyFC ? '39%' : '52%'};
`
}

export const assetTableCellFC = (isCurrencyFC?: boolean,): string => {
	return css`
	${bankTableCell()}
	min-width: ${isCurrencyFC ? '143px' : '198px'};
	width: ${isCurrencyFC ? '39%' : '52%'};
	display: flex;
	justify-content: flex-end;
	padding-right: 15%;
`
}

export const currencyUsdTableCell = css`
	min-width: 83px;
	width: 22%;
	font-size: 14px;
	line-height: 20px;
	padding: 0px 12px;
	${montserratMediumReg}
	color: var(--gray-600);
	text-align: right;
`

export const assetUsdTableCell = css`
	${currencyUsdTableCell}
	min-width: 87px;
	width: 24%;
`

export const bankUsdTableCell = (showSubItems?: boolean,): string => {
	return css`
	${currencyUsdTableCell}
	min-width: 87px;
	width: 19%;
	border-top: 1px solid ${showSubItems ?
		'var(--primary-600)' :
		'var(--primary-100)'};
	text-align: right;
`
}

export const currencyPercentTableCell = css`
	min-width: 67px;
	width: 18%;
	padding: 0px 12px;
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	text-align: right;
`

export const bankPercentTableCell = (showSubItems?: boolean,): string => {
	return css`
		${currencyPercentTableCell}
		min-width: 66px;
		width: 14%;
		border-top: 1px solid ${showSubItems ?
		'var(--primary-600)' :
		'var(--primary-100)'};
	`
}

export const bankButtonTableCell = (showSubItems?: boolean,): string => {
	return css`
		${currencyPercentTableCell}
		min-width: 36px;
		width: 7%;
		padding: 0;
		height: 100%;
		justify-content: center;
		align-items: center;
		padding-left: 12px;
		margin-top: -2px;
		border-top: 1px solid ${showSubItems ?
		'var(--primary-600)' :
		'var(--primary-100)'};
	`
}

export const assetPercentTableCell = css`
	${currencyPercentTableCell}
	min-width: 90px;
	width: 24%;
`

export const currencyTableWrapper = css`
	height: calc(100% - 46px);
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const currencyTable = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100% - 44px);
	& > div:not(:last-child){
		border-bottom: 1px solid var(--primary-100);
	}
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

export const bankTableWrapper = css`
	height: calc(100% - 46px);
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const bankTableFooter = css`
	height: 46px;
	${montserratMidbold}
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
`

export const bankValueCell = css`
	width: 46%;
	min-width: 177px;
	${flex}
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	`

export const entityValueCell = (isTbodyEmpty: boolean,): string => {
	return css`
	width: ${isTbodyEmpty ? '38%' : '39%'};
	${flex}
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	&:hover{
		cursor: pointer;
	}
	`
}

export const assetValueCell = css`
	width: 47%;
	min-width: 177px;
	${flex}
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	&:hover{
		cursor: pointer;
	}
`
export const bankTable = css`
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
export const emptyState = css`
	transform: translate(-50%, -40%);
`
export const toggleBtn = css`
	width: 100%;
	justify-content: center;
	height: 100%;
`

export const assetTableHead = (isTbodyEmpty: boolean,): string => {
	return css`
	height: 44px;
	background-color: var(--primary-25);
	border-bottom: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	z-index: 0;
	padding-right: ${isTbodyEmpty ? '0px' : '12px'};
`
}

export const bankTotalCell = css`
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	padding: 0 16px;
`

export const bankTableValueCell = (isTbodyEmpty: boolean,): string => {
	return css`
		width: 50%;
		display: flex;
		justify-content: flex-end;
		padding-right: ${isTbodyEmpty ? '23%' : 'calc(23% + 16px)'};
		/* padding-left: ${isTbodyEmpty ? '12px' : '0px'}; */
		${flex}
		${montserratMidbold}
		color: var(--primary-600);
		font-size: 16px;
		line-height: 22px;
		&:hover{
			cursor: pointer;
		}
	`
}

export const entityTableFooter = css`
	height: 46px;
	${montserratMidbold}
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
`

export const entityTotalCell = css`
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	padding: 0 16px;
`

export const entityTableValueCell = (isTbodyEmpty: boolean,): string => {
	return css`
		width: 50%;
		display: flex;
		justify-content: flex-end;
		padding-right: ${isTbodyEmpty ? '24%' : 'calc(24% + 12px)'};
		/* padding-left: ${isTbodyEmpty ? '12px' : '0px'}; */
		${flex}
		${montserratMidbold}
		color: var(--primary-600);
		font-size: 16px;
		line-height: 22px;
		&:hover{
			cursor: pointer;
		}
	`
}

export const assetTableFooter = css`
	height: 46px;
	${montserratMidbold}
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
`

export const assetTotalCell = css`
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 16px;
	line-height: 22px;
	padding: 0 16px;
`

export const assetTableValueCell = (isTbodyEmpty: boolean,): string => {
	return css`
		width: 50%;
		display: flex;
		justify-content: flex-end;
		padding-right: ${isTbodyEmpty ? '26%' : 'calc(26% + 12px)'};
		/* padding-left: ${isTbodyEmpty ? '12px' : '0px'}; */
		${flex}
		${montserratMidbold}
		color: var(--primary-600);
		font-size: 16px;
		line-height: 22px;
		&:hover{
			cursor: pointer;
		}
	`
}

export const smallTableWrapper = css`
	height: calc(100% - 46px);
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const smallTable = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100% - 44px);
	& > div:not(:last-child){
		border-bottom: 1px solid var(--primary-100);
	}
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

export const smallTableHead = (isTbodyEmpty: boolean,): string => {
	return css`
		width: 100%;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--primary-25);
		border-bottom: 1px solid var(--primary-100);
		z-index: 0;
		padding-right: ${isTbodyEmpty ? '0px' : '12px'};

	`
}

export const smallHeaderCell = css`
	width: 25%;
	display: flex;
	align-items: center;
	gap: 5px;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 12px;
`

export const smallHeaderCellNumber = css`
	${smallHeaderCell}
	justify-content: flex-end;
`

export const smallItemContainer = (active: boolean, isLast?: boolean, showSubItems?: boolean,): string => {
	return css`
	position: relative;
	height: 44px !important;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	border-bottom: ${isLast ? '1.5px solid var(--primary-600)' :
		'1px solid var(--primary-100)'};
	background-color: ${active ? 'var(--primary-100)' : 'transparent'};
	border-top: 1px solid ${showSubItems ?
		'var(--primary-600)' :
		'var(--primary-100)'};
	& > p {
		overflow: hidden;
   	white-space: nowrap;
   	text-overflow: ellipsis;
		line-height: 44px;
	}
`
}

export const smallTableCell = css`
	width: 25%;
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	padding: 0 12px;
`

export const smallTableCellNumber = css`
	${smallTableCell}
	justify-content: flex-end;
	text-align: right;
`

export const bigHeaderCell = css`
	${currencyHeaderCell}
	width: 23.25%;
`

export const bigHeaderCellNumber = css`
	${bigHeaderCell}
	display: flex;
	gap: 5px;
	justify-content: flex-end;
	align-items: center;
`

export const bigTableCell = (showSubItems?: boolean,): string => {
	return css`
	${currencyTableCell}
	width: 23.25%;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: normal;
	word-wrap: break-word;
	overflow-wrap: break-word;
		border-top: 1px solid ${showSubItems ?
		'var(--primary-600)' :
		'var(--primary-100)'};
`
}

export const bigTableCellNumber = (showSubItems?: boolean,): string => {
	return css`
		${bigTableCell(showSubItems,)}
		text-align: right;
	`
}