/* eslint-disable max-lines */
import {
	Classes,
} from '@blueprintjs/core'
import {
	css,
} from '@emotion/css'

import {
	customScrollbar,
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
	spaces,
} from '../../../shared/styles'

export const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const flexSpaceBetween = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const cursorPointer = css`
	cursor: pointer;
`

export const marginTop16 = css`
	margin-top: 16px;
`

export const paddingNone = css`
	padding: 0;
`

export const fullWidth = css`
	width: 100%;
`

export const textNowrap = css`
	white-space: nowrap;
`

export const textAreaStyle = css`
	height: 44px;
	&::-webkit-scrollbar {
   	display: none;
	}
`

export const textColorRed = css`
	color: var(--error-600) !important;
	&:hover {
    color: var(--error-600);
	}
	svg path {
		fill: var(--error-600) !important;
}
`

export const textColorGreen = css`
	color: var(--green-600);
`

export const container = css`
	display: flex;
	flex-direction: column;
	height: calc(100% - 84px);
	width: 100%;
	padding-right: 20px;
	position: relative;
	/* padding-bottom: 20px; */
`

export const containerTop = (isOpen: boolean,): string => {
	return css`
	height: calc(100%);
	display: flex;
`
}

export const leftSection = css`
	display: flex; 
	flex-direction: column; 
	width: 100%;
	min-height: 0;
   height: 100%;
   border-radius: 22px;
   background-color: var(--base-white);
	overflow: hidden;
	transition: width 0.3s ease;
`

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
	flex-shrink: 0;
	transition: all 0.15s ease;
	flex-direction: column;
   display: ${isOpen ?
		'flex' :
		'none'};	
		display: flex;
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
	z-index: 2;
	transform: ${isOpen ?
		'rotate(180deg)' :
		'rotate(0deg)'};
	transition: all 0.3s ease;
`
}

export const headerWrapper = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20px;
	margin-bottom: 20px;
	background-color: var(--base-white);
	border-radius: 26px;
	padding: 20px;
	box-shadow: -2px 4px 10px rgba(42, 44, 115, 0.12);
`

export const transactionHeader = css`

`

export const headerTitle = css`
	display: flex;
	gap: 8px;
	align-items: center;
	color: var(--gray-800);

	& > h2 {
		${montserratSemibold}
		font-size: 26px;
		line-height: 36.4px;
		color: currentColor;
	}
`

// export const actionsContainer = css`
// 	position: fixed;
// 	top: calc(100% - 1600px);
// 	right: 0;
// 	height: 42px;
// 	${flex}
// 	gap: 12px;
// `
export const actionsContainer = css`
  position: absolute;
  inset: 0;      
  width: 100vw;
  height: 100vh;
  pointer-events: none;
`

export const actionsInner = css`
  position: absolute;
  top: 20px;
  right: 16px;
  height: 42px;
  display: flex;      
  align-items: center;
  gap: 12px;
  pointer-events: auto; 
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
		width: 5px;
		height: 5px;
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

export const tableHeader = css`
	height: 44px;
	${montserratSemibold}
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	border-bottom: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	align-items: center;
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
	min-width: 350px;
`

export const idCellWidth = css`
	min-width: 145px;
	width: 145px;
`

export const cellWidth72 = css`
	min-width: 72px;
	width: 72px;
`

export const cellWidth88 = css`
	min-width: 88px;
	width: 88px;
`

export const cellWidth110 = css`
	min-width: 110px;
	width:1000px;
`

export const cellWidth150 = css`
	min-width: 150px;
	width: 150px;
`

export const cellWidth300 = css`
	min-width: 300px;
	width: 300px;
`

export const tableTitle = css`
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16.8px;
	margin-right: 8px;
	text-align: left;;
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

export const bigTableCell = css`
	${tableCell}
	min-width: 350px;
`

export const amountColor = (isIncome?: boolean,): string => {
	return css`
	color: ${isIncome ?
		'var(--green-600)' :
		'var(--error-600)'};
`
}

export const smallTableCell = css`
	${tableCell}
	min-width: 100px;
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

export const menuCell = css`
	position: relative;
	${flex}
	justify-content: flex-start;
	width: 72px;
`

export const tableCellBorder = css`
	border-bottom: 1px solid var(--primary-100);
`

export const transactionListContainer = css`
	height: calc(100% - 44px);
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

export const dialogContainer = css`
	background-color: var(--base-white) !important;
	backdrop-filter: blur(2px) !important;
	border-radius: 16px !important;
	border: none !important;
	width: 232px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
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

export const emptyContainer = css`
    height: calc(100% - 84px - 44px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 16px;
	 position: absolute;
	 right: 40%;
`

export const emptyText = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-600);
    font-style: italic;
`

export const skipBtn = css`
 	${montserratMidbold}
	padding: 11px 18px;
	margin-right: 12px;
	color: var(--primary-600);
	cursor: pointer;
`

export const formFieldPadding = css`
	padding: 0 24px;
`

export const saveDraftBtn = css`
	margin-right: auto;
`

export const formContainer = css`
	position: relative;
	width: 600px;
	height: 100%;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	z-index: 999;
`

export const formHeader = css`
	width: 100%;
	padding: 0px 24px;
	height: 68px;
	display: flex;
	align-items: center;
	${montserratSemibold}
	font-size: 18px;
	line-height: 25px;
	color: var(--primary-600);
	border-top-left-radius: 26px;
	background-color: var(--primary-25);
`

export const addFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0px;
	height: calc(100vh - 330px);
	overflow-y: auto;
	${customScrollbar}
	padding-top: 4px;
`

export const fieldsContainer = (isFullHeight = false,):string => {
	return css`
	background-color: var(--base-white);
  	height: ${isFullHeight ?
		'calc(100vh - 90px)' :
		'120vh'};
   overflow-y: auto;
   ${customScrollbar}
`
}

export const addRadioInputBlock = css`
    display: flex;
    gap: 24px;
    padding: 0 ${spaces.midLarge};
    padding-bottom: 20px;
`

export const radioBtnLabel = css`
	${montserratMediumReg}
	margin-left: 8px;

`

export const addInputBlock = css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 ${spaces.midLarge};
    padding-bottom: 20px;
`

export const addBtnWrapper = css`
    border-bottom-left-radius: 26px;
    position: absolute;
    bottom: 0;
    height: 82px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
	 gap: 12px;
    padding: ${spaces.medium} ${spaces.midLarge};
    background-color: var(--primary-25);
    border-top: 1px solid var(--primary-100);
`

export const fieldTitle = css`
	${montserratMidbold}
	margin-bottom: 8px;
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const amountBalance = css`
	${fieldTitle}
	color: var(--gray-500);
`

export const oldDocBlock = css`
    display: flex;
    flex-direction: column;
    gap:4px;
	 margin-bottom: 16px;
    max-height: 270px;
    overflow-y: auto;
    ${customScrollbar}
	`

export const oldDoc = css`
    width: 100%;
    border-radius: 14px;
    border: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--base-white);
    padding: ${spaces.smallMedium};
    box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
    height: 60px;
`

export const oldDocLeft = css`
    display:flex;
    gap: ${spaces.smallMedium};
    align-items: center;
`

export const oldDocTextBlock = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 260px;
`

export const oldDocTextType = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-800);
    width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

export const oldDocTextFormat = css`
    ${montserratMediumReg}
    font-size: 12px;
    color: var(--gray-500);
`

export const oldDocDelete = css`
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
`

export const docsIcon = css`
    width: 32px;
    height: 32px;
    flex-shrink: 0;
`

export const draftContainer = css`
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--gray-25);
	border-bottom:  1px solid  var(--primary-100);
	height: 56px;
	gap: 24px;
`

export const draftInfoWrapper = css`
	display: flex;
	gap: 12px;
	height: 100%;
	align-items: center;
	& > div {
		justify-content: center;
		height: 100%;
		display: flex;
		flex-direction: column;
		width: 200px;
	}
	& p {
		${montserratMidbold}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-800);
		width: 100%;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	& span {
		${montserratMediumReg}
		font-size: 12px;
		line-height: 16px;
		color: var(--gray-600);
	}
`

export const draftBtnWrapper = css`
	display: flex;
	gap: 12px;
	height: 100%;
	align-items: center;
`

export const trashIcon = css`
	width: 20px;
	height: 20px;
	& path {
		fill: var(--error-600);
	}
`

export const detailsFormWrapper = css`
	display: flex;
	flex-direction: column;
	padding: 12px;
	width: 100%;
	background-color: var(--base-white);
	height: calc(100vh - 68px - 82px);
	overflow-y: auto;
	 ${customScrollbar}
`

export const detailsItemWrapper = ({
	hasBorder = false, hasBorderRadiusTop = false, hasBorderRadiusBottom = false,
},): string => {
	return css`
	display: flex;
	align-items: flex-start;
	width: 100%;
	padding: 12px;
	border-top-left-radius: ${hasBorderRadiusTop ?
		'12px' :
		'0'};
	border-top-right-radius: ${hasBorderRadiusTop ?
		'12px' :
		'0'};
	border-bottom-left-radius: ${hasBorderRadiusBottom ?
		'12px' :
		'0'};
	border-bottom-right-radius: ${hasBorderRadiusBottom ?
		'12px' :
		'0'};
	background-color: var(--gray-25);
	border-bottom: ${hasBorder ?
		'1px solid var(--gray-100)' :
		'none'};
`
}

export const detailsItemTitle = css`
	width: 40%;	
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-500);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;	 
`

export const detailsItemText = css`
	${detailsItemTitle}
	width: 60%;
	color: var(--gray-700);
`

export const detailsCommentItem = css`
	${detailsItemText}
	width: 100%;
	margin-top: 4px;
	overflow: visible;
	text-overflow: clip;  
	white-space: normal;
`

export const docsBlock = css`
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
`

export const detailsBtnsBlock = css`
	${flexSpaceBetween}
	padding: 12px 24px;
`

export const emptyDrawer = css`
	width: 600px; 
	height: 100%;
	background-color: var(--base-white);
`

export const editFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	width: 100%;
	padding-bottom: 70px;
	background-color: var(--base-white);
`

export const editBtnWrapper = css`
    border-bottom-left-radius: 26px;
    position: absolute;
    bottom: 0;
	 left: 0;
    height: 82px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
	 gap: 12px;
    padding: 16px 24px 16px 16px;
    background-color: var(--primary-25);
    border-top: 1px solid var(--primary-100);
`

export const filterDialogContainer = css`
	background-color: var(--base-white) !important;
	backdrop-filter: blur(2px) !important;
	border-radius: 16px !important;
	border: none !important;
	width: 400px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	display: flex;
	flex-direction: column;
`

export const filterButton = (iFilterShown: boolean,):string => {
	return css`
	${iFilterShown && `
		position: relative;
		z-index: 100;
	`}
	& svg {
		& path {
			fill: var(--primary-600);
		}
	}
`
}

export const filterDialogWrapper = css`
	display: flex;
	flex-direction: column;
	padding: 16px;
	gap: 16px;
	& h3 {
		${montserratMidbold}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-800);
	}
`

export const filterBtnWrapper = css`
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	align-items: center;
	border-top: 1px solid var(--primary-100);
	padding: 16px;
`

export const applyBtn = css`
	width: 132px;
`

export const clearBtn = css`
	width: 94px;
`

export const clientHeaderInput = css`
	width: 299px;
   height: 42px;
	div {
		border-radius: 10px;
	}
`

export const newDocumentsText = css`
	${montserratMediumReg}
	margin: 16px 0;
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-700);
`

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
		width: 15px;
		height: ${isHorizontalScroll ?
		'43.5px' :
		'39px'};
		position: absolute;
		display: flex;
		align-items: center;
		right: 0px;
		bottom: 6.5px;

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
`

export const tableRow = (isClicked = false,): string => {
	return css`
	cursor: pointer;
	background-color: ${isClicked ?
		'var(--primary-100)' :
		'var(--base-white)'};
	`
}

export const additionalLeftPadding24 = css`
	padding-left: 24px;
`

export const empty = css`
  /* display: block;
  width: fit-content;
  margin: 0 auto;  */
`