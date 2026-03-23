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
	montserratSemibold,
	spaces,
} from '../../../shared/styles'

export const container = css`
	display: flex;
	flex-direction: column;
	gap: ${spaces.medium};
	height: 100%;
	width: 100%;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
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

export const filterWrapper = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 82px;
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

export const clientHeaderInput = css`
	width: 299px;

	div{
		border-radius: 10px;
		height: 42px !important;
	}

	 input {
        height: 42px !important;
    }
`

export const filterButton = (iFilterShown: boolean, hasFilters?: boolean,):string => {
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
	${hasFilters && `
		position: relative;
		z-index: 100;
	`}
	${hasFilters && `&::after {
		content: '';
		position: absolute;
		top: 4px;
		right: 4px;
		width: 10px;
		height: 10px;
		background: radial-gradient(81.82% 81.82% at 34.13% 29.53%, #61DEB0 0%, #44B98E 100%);
		border-radius: 50%;
	  }
	  `}
`
}

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
	height: calc(100% - 82px);
`

export const requestListContainer = (isClient?: boolean,): string => {
	return css`
		height: calc(100% - 44px);
		position: relative;
		overflow-y: ${isClient ? 'hidden' : 'auto'};
		${customScrollbar}
`
}

export const noScroll = css`
	overflow-y: hidden !important;
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

export const idHeaderCell = css`
	${flex}
	min-width: 157px;
	width: calc((100% - 72px)/7);
	gap: 10px;
	padding: 0px 16px;
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
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
`
}

export const headerCell = css`
	min-width: 157px;
	width: calc(93% / 7);
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16px;
	padding: 0 16px;
	`

export const menuCell = css`
	${flex}
	justify-content: center;
	min-width: 72px;
	width: 7%;
	position: relative;
`

export const modalWrapper = css`
	width: 400px;
	background-color: var(--base-white);
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	align-items: center;
`

export const buttonBlock = css`
	display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
	width: 100%;
	& > button {
		width: calc((100% - 12px)/2);
	}
	& path {
		fill: currentColor;
	}
`

export const modalTitle = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25px;
	color: var(--gray-800);
`

export const radioWrapper = css`
	display: flex;
	gap: 24px;
	align-items: center;
	height: 28px;
	width: 100%;
`

export const selectWrapper = css`
	display: flex;
	gap: 12px;
	width: 100%;
	padding-top: 12px;
	border-top: 1px solid var(--primary-100);
	flex-direction: column;
`

export const modalContent = css`
	display: flex;
	width: 100%;
	flex-direction: column;
	gap: 12px;
	align-items: center;
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
`

export const detailsContainer = css`
	width: 1000px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	height: 100vh;
	position: relative;
`

export const detailsHeader = css`
	width: 100%;
	padding: 0px 24px;
	height: 68px;
	display: flex;
	align-items: center;
	${montserratSemibold}
	font-size: 18px;
	line-height: 25px;
	color: var(--primary-600);
	border-bottom: 1px solid var(--primary-100);
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

export const addBtnWrapper = (isCustom: boolean,): string => {
	return css`
   border-bottom-left-radius: 26px;
   height: 82px;
   width: 100%;
   display: flex;
   align-items: center;
   justify-content: ${isCustom ? 'space-beetween' : 'flex-end'};
	gap: 12px;
   padding: ${spaces.medium} ${spaces.midLarge};
   background-color: var(--primary-25);
   border-top: 1px solid var(--primary-100);
	& > div {
		display: flex;
		gap: 12px;
	}
`
}

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

export const reportContainer = css`
	display: flex;
	align-items: center;
	width: 100%;
	border-bottom: 1px solid var(--primary-100);
	height: 56px;
	justify-content: space-between;
`

export const tableCell = css`
	${headerCell}
	${montserratMediumReg}
	font-size: 14px;
	line-height: 20px;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: normal;
	word-wrap: break-word;
	overflow-wrap: break-word;
	padding: 8px 16px;
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
	border-bottom: 1px solid var(--primary-100);
`

export const actionBtn = css`
	padding: 0 12px;
	gap: 8px;
	width: 100%;
	justify-content: flex-start;
	& path {
		fill: currentColor;
	}
`

export const bottomActions = css`
	${menuActions}
	border-bottom: none;
`

export const pdfStyles = css`
	width: 1000px;
	position: absolute;
	left: -9999px;
`