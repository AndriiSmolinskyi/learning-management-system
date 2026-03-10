
/* eslint-disable max-lines */
import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	montserratMediumReg,
	montserratSemibold,
	customScrollbar,
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
	display: flex;
	position: relative;
   width: 100%;
   height: 100%;
	min-height: 0;
	/* overflow: hidden; */
`

export const leftSection = (isOpen: boolean,): string => {
	return css`
	display: flex; 
	flex-direction: column; 
	width: 100%;	
	min-height: 0;
   height: 100%;
   border-radius: 22px;
   background-color: var(--base-white);
	overflow: hidden;
	transition: all 0.3s ease;
`
}

export const rightSection = (isOpen: boolean,): string => {
	return css`
	overflow: hidden;
	min-height: 0;
   height: 100%;
	margin-left: ${isOpen ?
		'16px' :
		'0px'};
	transform: ${isOpen ?
		'translateX(0%)' :
		'translateX(100%)'};
	width: ${isOpen ?
		'400px' :
		'0px'};
		/* width: 400px; */
	flex-shrink: 0;
	transition: all 0.15s ease;
	flex-direction: column;
   display: ${isOpen ?
		'flex' :
		'none'};	
		display: flex;
`
}

export const visible = css`
    display: flex;
    transform: translateX(0);
	 flex-direction: column;
`

export const openChartBtnContainer = css`
	position: relative;
`

export const openChartBtn = (isOpen: boolean,): string => {
	return css`
	position: absolute;
	top: -14px;
	right: -14px;
	z-index: 10;
	transform: ${isOpen ?
		'rotate(180deg)' :
		'rotate(0deg)'};
	transition: all 0.3s ease;
`
}

export const topRightSection = css`
   width: 100%;
	min-height: 0;
	height: 100%;
   background-color: var(--base-white);
   border-radius: 22px;
	transition: all 0.3s ease;
`

export const bottomRightSection = css`
   width: 100%;
	margin-top: 16px;
   background-color: var(--base-white);
   border-radius: 22px;
	transition: all ease 0.3s;
`

export const headerCell = css`
   position: sticky;
   top: 0;
   height: 44px;
	min-width: 130px;
	width: 1300px;
   padding: 0 6px;
   text-align: left;
   white-space: nowrap;
   background-color: var(--primary-25);
   border-bottom: 1px solid var(--primary-100);
   border-collapse: collapse;
   border-spacing: 0;
   z-index: 1;
`

export const cellWidth100 = css`
	min-width: 100px;
	width: 1000px;
`

export const footerTotalCell = css`
   position: sticky;
   top: 0;
   height: 44px;
	min-width: 150px;
	width: 1000px;
   padding: 0 4px;
   text-align: left;
   white-space: nowrap;
   background-color: var(--primary-25);
   border-bottom: 1px solid var(--primary-100);
   border-collapse: collapse;
   border-spacing: 0;
   z-index: 1;
	text-align: right;
`

export const smallHeaderCell = css`
	${headerCell}
	min-width: 100px;
`

export const bigHeaderCell = css`
	${headerCell}
	min-width: 300px;
`

export const tableTitle = css`
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16.8px;
`

export const tableCell = css`
	${montserratMediumReg}
	height: 44px;
	min-width: 150px;
	padding: 2px 6px;
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

export const smallTableCell = css`
	${tableCell}
	min-width: 100px;
`

export const bigTableCell = css`
	${tableCell}
	min-width: 300px;
`

export const amountColor = (isIncome?: boolean,): string => {
	return css`
	color: ${isIncome ?
		'var(--green-600)' :
		'var(--error-600)'};
`
}

export const totalAmount = (columnPosition: number,): string => {
	return css`
	${totalLabel};
	position: absolute;
	left: ${columnPosition}px;
	padding-left: 20px;
	min-width: 100px;
	`
}

export const tableRow = (isClicked = false,): string => {
	return css`
	cursor: pointer;
	background-color: ${isClicked ?
		'var(--primary-100)' :
		'var(--base-white)'};
	`
}

export const totalRow = css`
	position: sticky;  
   bottom: -1px;
   display: flex;
	width: 100%;
   justify-content: space-between;
   align-items: center;
   height: 46px;
	min-height: 46px;
   padding: 0 160px 0px 16px;
   background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	 z-index: 1; 
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

export const clearBtn = css`
	outline: none !important;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
`

export const chartContainer = (isOpen: boolean,): string => {
	return css`
	height: ${isOpen ?
		'147px' :
		'47px'};
	/* width: ${isOpen ?
		'100%' :
		'0px'}; */
	border-radius: 22px;
	padding: 12px;
	transition: all ease 0.3s;
`
}

export const collapse = (isOpen: boolean,): string => {
	return css`
	overflow: hidden;
	max-height: ${isOpen ?
		'120px' :
		'0px'};
	transition: max-height 0.3s ease-in-out;
`
}

export const chartHeader = css`
	display: flex;
	height: 22px;
	width: 100%;
	align-items: center;
	justify-content: center;
	background-color: var(--base-white);
	position: relative;
	/* border-top-left-radius: 22px;
  	border-top-right-radius: 22px; */
	& > p {
		${montserratSemibold}
		font-size: 16px;
		line-height: 22.4px;
		color: var(--gray-600);
	}
`

export const chartWrapper = css`
	position: relative;
	width:   100%;
	height: 100px;
	/* overflow-x: auto;
	overflow-y: auto; */
	${customScrollbar}
`

export const barHeight = css`
	height: 50%;
`

export const xAxisStyle = css`
	${montserratMediumReg}
	font-size: 18px;
`

export const axisTextStyle = (isIncome?: boolean,): string => {
	return css`
	  fill: ${isIncome ?
		'var(--green-600)' :
		'var(--error-600)'};
	  ${montserratMediumReg}
	  font-size: 12px;
	  line-height: 16.8px;
	  text-align: center;
	`
}

export const cellStyle = (isIncome?: boolean,): string => {
	return css`
		fill: ${isIncome ?
		'var(--green-400)' :
		'var(--error-400)'} ;
`
}

export const settingsContainer = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
	transition: all ease 0.3s;
`

export const settingsTitleBox = css`
	${flex}
	justify-content: center;
	min-height: 46px;	
	height: 46px;
	border-bottom: 1px solid var(--primary-100);
`

export const settingsTitle = css`
	${montserratMidbold}
	font-size: 16px;
	line-height: 22.4px;
	color: var(--gray-600);
`

export const settingsFlex = css`
	display: flex;
	flex-direction: column;
	min-height: 0;
	height: 100%;
	padding: 16px;
	padding-right: 8px;
	overflow: auto;
	&::-webkit-scrollbar {
		width: 8px;
		height: 8px;
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

export const selectsContainer = css`
	display: flex;
	flex-direction: column;
	gap: 16px;
`

export const saveBtn = css`
	outline: none !important;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
`

export const rangeFieldsWrapper = css`
	display: flex;
	gap: 8px;
	align-items:  center;
	margin-top: 8px;
`

export const rangeButtonsWrapper = css`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	flex-grow: 1;
	margin-top: 16px;
`

export const settingsClearButton = css`
	width: 94px;
	flex-shrink: 0;
`

export const selectText = css`
	${montserratMediumReg};
	margin-top: 16px;
`

export const calendarIcon = css`
	flex-shrink: 0;
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

export const additionalLeftPadding24 = css`
	padding-left: 24px;
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
`
}

export const footerBorder = css`
	 border-top: 1px solid var(--primary-100);
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

export const totalLabel = css`
	${montserratMidbold}
	font-size: 16px;
   color: var(--primary-600);
	padding-left: 4px;
	&:hover{
		cursor: pointer;
	}
`

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
`

export const chevronButton = (isOpen: boolean,): string => {
	return css`
		cursor: pointer;
		transform: ${isOpen ?
		'rotate(180deg)' :
		'rotate(0deg)'};
		transition: transform ease 0.3s;
	`
}

export const clearBlock = css`
	display: flex;
	justify-content: space-between;
	gap: 30px;
	align-items: center;
	padding: 16px;
	flex-shrink: 0;
`

export const historyWrapper = css`
	width: 170px;
	display: flex;
	justify-content: space-between;
	align-content: center;
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
	&:hover {
		cursor: pointer;
	}
`
}

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

export const empty = css`
  /* display: block;
  width: fit-content;
  margin: 0 auto;  */
`