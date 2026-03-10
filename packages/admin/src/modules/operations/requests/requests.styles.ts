/* eslint-disable max-lines */
/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

import {
	customScrollbar,
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold, spaces,
} from '../../../shared/styles'

export const container = css`
	display: flex;
	flex-direction: column;
	height: calc(100% - 68px);
	width: 100%;
	overflow: hidden;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
`

export const newDocumentsText = css`
${montserratMediumReg}
font-size: 14px;
line-height: 19.6px;
color: var(--gray-700);
`

export const formContainer = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	height: 100vh;
	position: relative;
`

export const filterWrapper = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 84px;
	border-top-left-radius: 26px;
	padding: 0 20px;
`

export const filterTitle = css`
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

export const filterActions = css`
	display: flex;
	height: 44px;
	gap: 12px;
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

export const fieldsContainer = (isFullHeight = false,):string => {
	return css`
   height: ${isFullHeight ?
		'calc(100vh - 90px)' :
		'100vh'};
   overflow-y: auto;
	background-color: var(--base-white);
   ${customScrollbar}
`
}

export const addFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0px;
	height: calc(100% - 68px - 82px);
	overflow-y: auto;
	${customScrollbar}
	padding-top: 4px;
`

export const editFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	width: 100%;
	height: 100vh;
	background-color: var(--base-white) !important;
`

export const detailsFormWrapper = css`
	display: flex;
	flex-direction: column;
	padding: 16px;
	width: 100%;
	background-color: var(--base-white);
	height: calc(100vh - 68px - 82px);
	overflow-y: auto;
	${customScrollbar}
`

export const detailsItemWrapper = ({
	hasBorder = false, hasBorderRadiusTop = false, hasBorderRadiusBottom = false,
},
): string => {
	return css`
	min-height: 44px;
	border-bottom: ${hasBorder ? '1px solid var(--gray-100)' : 'none'};
	display: flex;
	align-items: center;
	width: 100%;
	background-color: var(--gray-25);
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
`
}

export const detailsCommentWrapper = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	background-color: var(--gray-25);
	border-bottom-left-radius: 12px;
	border-bottom-right-radius: 12px;
	& p {
		${montserratMediumReg}
		padding: 12px 12px 4px 12px;
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-500);
	}
	& span {
		padding: 4px 12px 12px 12px;
		${montserratMediumReg}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-700);
		display: -webkit-box;
		-webkit-line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
		width: 100%;
	}
`

export const detailsItemTitle = css`
	height: 100%;
	display: flex;
	align-items: center;
	width: 140px;
	${montserratMediumReg}
	font-size: 14px;
	line-height: 20px;
	color: var(--gray-500);
	padding: 12px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	`

export const detailsItemText = css`
	height: 100%;
	display: flex;
	align-items: center;
	width: 228px;
	padding: 12px;
	& p {
		${montserratMediumReg}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-700);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
		width: 100%;
	}
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
	border-bottom-left-radius: 26px;
`

export const addInputBlock = css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 ${spaces.midLarge};
    padding-bottom: 20px;
`

export const fieldTitle = css`
	margin-bottom: 28px;
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const saveDraftBtn = css`
	margin-right: auto;
`

export const emptyContainer = css`
    height: calc(100% - 84px - 44px);
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

export const tableContainer = css`
	height: calc(100% - 84px);
`

export const requestListContainer = css`
	height: calc(100% - 44px);
	position: relative;
	overflow-y: auto;
	${customScrollbar}
`

export const tableHeader = css`
	height: 44px;
	${montserratSemibold}
	background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
	border-bottom: 1px solid var(--primary-100);
	display: flex;
	width: 100%;
	padding-right: 12px;
	align-items: center;
	justify-content: space-between;
`

const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const checkboxCell = css`
	${flex}
	justify-content: center;
	width: 52px;
	width: 5.5%;
	`

export const idHeaderCell = css`
	${flex}
	min-width: 125px;
	width: 10.5%;
	gap: 10px;
	padding: 0px 16px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const idTableCell = css`
	padding: 0px 16px;
	min-width: 125px;
	width: 10.5%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`
export const headerCell = css`
	min-width: 154px;
	width: 13%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 16px;
	`

export const tableCell = css`
	${headerCell}
	${montserratMediumReg}
	font-size: 14px;
	line-height: 20px;
	height: 50px;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: normal;
	word-wrap: break-word;
	overflow-wrap: break-word;
	padding: 8px 16px;
	display: flex;
  	align-items: center;
`

export const badgeCell = css`
	${flex}
	${headerCell}
	.${Classes.POPOVER_TRANSITION_CONTAINER} {
		background-color: transparent;
	}
	& div {
		outline: none !important;
	}
`

export const statusCell = css`
	${flex}
	min-width: 180px;
	width: 15%;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	`

export const updateCell = css`
	${flex}
	padding: 0 16px;
	min-width: 129px;
	width: 12%;
	gap: 10px;
	& p {
		${montserratMidbold}
		color: var(--gray-600);
		font-size: 12px;
		line-height: 16px;
	}
`

export const updateTableCell = css`
	padding: 0 16px;
	min-width: 129px;
	width: 12%;
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	line-height: 20px;
`

export const menuCell = css`
	${flex}
	justify-content: center;
	min-width: 72px;
	width: 7%;
	position: relative;
`

export const requestContainer = css`
	display: flex;
	align-items: center;
	width: 100%;
	border-bottom: 1px solid var(--primary-100);
	height: 56px;
	justify-content: space-between;
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

export const dotsButton = (isPopoverShown: boolean,):string => {
	return css`
	${isPopoverShown && `
		position: relative;
		z-index: 100;
	`}
	& svg {
		& path {
			fill: var(--gray-700);
		}
	}
`
}

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

export const oldDocBlock = css`
    display: flex;
    flex-direction: column;
    gap:4px;
	max-height: 270px;
    overflow-y: auto;
  	${customScrollbar}
	  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
    box-shadow: inset 3px 3px 0px 4px var(--primary-50);
  }
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

export const infoBlock = css`
	display: flex;
	justify-content: space-between;
	padding: 12px;
	align-items: center;
	background-color: var(--gray-25);
	border-radius: 12px;
	& > div:first-child {
		width: 220px;
		& > span {
			${montserratMediumReg}
			font-size: 12px;
			line-height: 16px;
			color: var(--gray-500);
		}
		& > div {
			display: flex;
			width: 100%;
			${montserratSemibold}
			font-size: 14px;
			line-height: 20px;
			color: var(--gray-800);
			& > p {
				${montserratSemibold}
				max-width: calc(100% - 50px);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				color: currentColor;
			}
		}
	}
`

export const typeWrapper = css`
	display: flex;
	height: 44px;
	border: 1px solid var(--primary-200);
	border-radius: 14px;
	padding: 4px 0px;
	box-shadow: 0px 2px 6px 0px #1827511A inset;
	gap: 1px;
	& > div {
		padding: 0px 4px;
	}
	& > div:not(:last-child) {
		position: relative;
		&::after {
			content: '';
			position: absolute;
			right: -1px;
			top: 4px;
			height: 28px;
			width: 1px;
			background-color: var(--primary-200);
		}
	}
`

export const typeBtn = (active: boolean,): string => {
	return css`
	${montserratMidbold}
	color: ${active ? 'var(--base-white)' : 'var(--gray-700)'};
	display: flex;
	align-items: center;
	height: 36px;
	padding: 0px 16px;
	border-radius: 12px;
	background: ${active ? 'linear-gradient(180deg, #4069FB 0%, #6090F7 20.5%, #0F1AF1 100%) !important' : 'var(--base-white)'};
	&:hover {
		background-color: var(--primary-100);
	}
	border: none;
	outline: none !important;
`
}

export const orderArrow = (rotate?: boolean,): string => {
	return css`
	cursor: pointer;
	rotate: ${rotate ? '180deg' : '0deg'};
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
`
}

export const clientHeaderInput = css`
	width: 299px;
    height: 42px;
	div{
		border-radius: 10px;
	}
`

export const inputSearchIcon = css`
    width: 20px;
    height: 20px;
    cursor: pointer;
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

export const successModalContainer = css`
	display: flex;
	flex-direction: column;
	width: 400px;
	align-items: center;
	justify-content: center;
	padding: 16px;
	gap: 12px;
	background-color: var(--base-white);
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	& > h4 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 25.2px;
		color: var(--gray-800);
		padding-bottom: 4px;
	}
	& > button {
		width: 100%;
	}
`

export const docsBlock = css`
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
`

export const modalWrapper = css`
	position: relative;
   width: 400px;
	display: flex;
	flex-direction: column;
   align-items: center;
   padding: ${spaces.medium};
   background-color: var(--base-white);
   border-radius: ${spaces.medium};
	& > h4 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 25.2px;
		color: var(--gray-800);
		margin-top: 12px;
		margin-bottom: 6px;
	} 

	& > p {
		${montserratMediumReg}
		font-size: 14px;
		line-height: 19.6px;
		color: var(--gray-500);
		width: 320px;
		text-align: center;
		margin-bottom: ${spaces.smallMedium} !important; 
	}
`

export const buttonBlock = css`
   width: 100%;
   display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
   margin-top: ${spaces.medium}; 
`

export const button = css`
    width: 100%;
`

export const exitDialogBackdrop = css`
	background-color: transparent !important;
`

export const depositBlock = css`
	display: flex;
	flex-direction: column;
	gap: 10px;
`

export const exitModalWrapper = css`
position: relative;
	width: 400px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: ${spaces.medium};
	background-color: var(--base-white);
	border-radius: ${spaces.medium};
	& > h4 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 25.2px;
		color: var(--gray-800);
		margin-top: 12px;
		margin-bottom: 6px;
		text-align: center;
	}
`

export const exitModalbuttonBlock = css`
	width: 100%;
	display: flex;
	align-items: center;
	gap: ${spaces.smallMedium};
	margin-top: ${spaces.medium}; 
`

export const viewDetailsButton = css`
	width: 178px;
`

export const addButton = css`
	width: 178px;
	padding: 0px 16px;
`

export const commentField = css`
	height: 150px !important;
`