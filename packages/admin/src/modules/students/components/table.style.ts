/* eslint-disable no-nested-ternary */
import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	montserratMediumReg,
	montserratSemibold,
	spaces,
} from '../../../shared/styles'
import {
	Classes,
} from '@blueprintjs/core'

export const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const tableWrapper = css`
   display: flex;
   flex-direction: column;
	justify-content: space-between;
	height: 100%;
	min-height: 0;
   background-color: var(--base-white);
	/* overflow: hidden; */
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

export const tableContainer = css`
	display: block;
	width: 100%;
	min-height: calc(100vh - 174px);
   max-height: calc(100vh - 174px);
	border-collapse: collapse;
	border-spacing: 0;
	position: relative;
   overflow-y: auto;
	/* min-height: 100vh; */
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

export const headerCell = css`
   position: sticky;
   top: 0;
   height: 44px;
	min-width: 150px;
	width: 1000px;
   padding: 0 12px;
   text-align: left;
   white-space: nowrap;
   background-color: var(--primary-25);
	border-top: 1px solid var(--primary-100);
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
	margin-right: 8px;
	text-align: left;
	display: flex;
	align-items: center;
	gap: 6px;
`

export const smallHeaderCell = css`
	${headerCell}
	min-width: 90px;
	width: 90px;
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

export const menuCell = css`
	position: relative;
	${flex}
	justify-content: flex-start;
	width: 72px;
`

export const tableCell = css`
	${montserratMediumReg}
	height: 44px;
	min-width: 150px;
	padding: 0 12px;
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

export const tableCellFlex = css`
	display: flex;
	align-items: center;
	gap: 5px;
	${montserratMediumReg}
	height: 44px;
	min-width: 150px;
	padding: 0 12px;
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

	svg {
		flex-shrink: 0;
	}
`

export const smallTableCell = css`
	${tableCell}
	min-width: 90px;
	width: 90px;
`

export const orderArrow = (rotate?: boolean,): string => {
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

export const activateBtn = css`
	border-bottom: 1px solid var(--primary-100);
`

export const deactivateBtn = css`
	border-top: 1px solid var(--primary-100);
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

export const parText = css`
	max-width: 368px;
	text-align: center;
	color: var(--gray-500);
`