/* eslint-disable max-lines */
/* eslint-disable no-nested-ternary */
import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
	spaces,
	montserratSemibold,
	customScrollbar,
} from '../../../../../../shared/styles'
import {
	Classes,
} from '@blueprintjs/core'

export const subItemList = css`
    width: 100%;
    padding: ${spaces.mid20};
	background: var(--base-white);
	border-radius: 22px;
	display: flex;
	flex-direction: column;
	gap: 12px;
`

export const subItemListBlock = css`
    width: 100%;
	display: flex;
	align-items: center;
	gap: 12px;
	background: var(--base-white);
	padding-left: 20px;
`

export const subAccountItemListBlock = css`
   ${subItemListBlock}
	padding-left: 12px;
`

export const subEntityItemListItem = css`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 2;
		&:hover{
		cursor: pointer;
	}
`

export const subItemListItem = (isHovered: boolean,):string => {
	return css`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: ${isHovered ?
		'1px solid var(--primary-500)' :
		'1px solid var(--gray-100)'};
	border-radius: 14px;
	box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
	padding: 6px 12px;
	cursor: pointer;

	background: ${isHovered ?
		'var(--primary-100)' :
		''};
		transition: all ease 0.5s;
`
}

export const chevronButton = css`
	flex-shrink: 0;
`

export const chevronBottomButton = css`
	position: absolute;
	bottom: 4px;
	right: 4px;
`

export const subItemListItemInside = css`
	display: flex;
	align-items: center;
	gap: 12px;
	/* width: 550px; */
	padding: 4px 0px;
`

export const subItemListItemName = css`
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
`

export const subItemMoney = css`
	${montserratMidbold}
	font-size: 16px;
	color: var(--gray-800);
`

export const subItemFlex = (isHovered: boolean,): string => {
	return css`
	display: flex;
	flex-direction: column;
	gap: 32px;
	background: var(--base-white);
	border: ${isHovered ?
		'1px solid var(--primary-500)' :
		'1px solid var(--gray-100)'};
	border-radius: 14px;
	box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
	padding: 20px;
	position: relative;
	transition: all ease 0.5s;
`
}

export const borderBig = (isHovered: boolean,): string => {
	return css`
	border-left: ${isHovered ?
		'2px solid var(--primary-500)' :
		'2px solid var(--gray-200)'};
	padding-left: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	transition: all ease 0.5s;
`
}

export const borderAccountBig = css`
	border-left: 2px solid var(--primary-200);
	padding-left: 24px;
	display: flex;
	flex-direction: column;
	gap: 12px;
`

export const accounts = css`
	margin-top: 12px;
	margin-left: 52px;
`

export const banksBlock = css`
	margin-left: 12px;
`

export const assetsBlock = css`
	margin-top: 12px;
	margin-left: 40px;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 12px;
	padding-left: 24px;
`

export const asset = (isMutating: boolean | undefined, isHovered: boolean,): string => {
	return css`
	width: 225px;
	height: 64px;
	padding: 12px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: ${isHovered ?
		'1px solid var(--primary-500)' :
		'1px solid var(--gray-100)'};
	border-radius: 14px;
	box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
	background: ${isMutating ?
		'var(--gray-200)' :
		isHovered ?
			'var(--primary-100)' :
			''};
			transition: all ease 0.5s;
		&:hover {
			cursor: pointer;
		}
	${isMutating &&
		css`
			animation: blinkRow 0.75s infinite alternate;
			border: 1px solid var(--primary-500);
		`}

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

export const assetLeft = css`
	display: flex;
	align-items: center;
	gap: 8px;
`
export const assetIcon = css`
	border: 1px solid var(--primary-100);
	border-radius: 8px;
	background: var(--gradients-button-secondary-blue);
	width: 32px;
	height: 32px;
	display: flex;
	justify-content: center;
	align-items: center;
	& svg {
		& path {
			fill: var(--primary-500);
		}
	}
`
export const assetType = css`
	${montserratMediumReg}
	color: var(--gray-600);
	font-size: 14px;
	overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 120px;
    display: block;
`
export const assetMoney = css`
	${montserratMidbold}
	color: var(--gray-800);
	font-size: 14px;
`

export const drawerHeader = css`
	height: 68px;
    display: flex;
	justify-content: space-between;
    align-items: center;
    padding: ${spaces.midLarge};
    background-color: var(--primary-25);
    border-top-left-radius: 26px;
    border-bottom: 1px solid var(--primary-100);
`
export const drawerHeaderTitle = css`
	${montserratSemibold}
	font-size: 18px;
	color: var(--primary-600);
`
export const drawerContent = css`
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`

export const drawerBlock = css`
	background-color: var(--base-white);
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	height: 100vh;
	position: relative;
`

export const drawerContainer = css`
	max-height: calc(100% - 68px - 82px);
	padding-bottom: 20px;
   overflow-y: auto;
	${customScrollbar}
`

export const drawerTextBlock = css`
	padding: 12px;
	display: flex;
	width: 100%;
`
export const drawerTypeText = css`
	width: 160px;
	${montserratMediumReg}
	font-size: 14px;
	color: var(--gray-500);
	padding-right: 10px;
	flex-shrink: 0;
`
export const drawerText = css`	
	${montserratMediumReg}
	font-size: 14px;
	color: var(--gray-700);
	width: 390px;
`
export const drawerBorderBottom = css`
	border-bottom: 1px solid var(--gray-100);
`
export const drawerFooter = css`
	width: 100%;
	height: 82px;
    display: flex;
	gap: 12px;
    justify-content: flex-end;
    border-bottom-left-radius: 26px;
    border-top: 1px solid var(--primary-100);
    background-color: var(--primary-25);
    position: absolute;
    bottom: 0;
    padding: 16px 24px 24px 16px;
`

export const oldDoc = css`
    width: 100%;
    height: 60px;
    border-radius: 14px;
    border: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--base-white);
    padding: ${spaces.smallMedium};
    box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
    flex-shrink: 0;
`

export const oldDocLeft = css`
    display: flex;
    gap: ${spaces.smallMedium};
    align-items: center;
`

export const oldDocTextBlock = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export const oldDocTextType = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-800);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 250px;
    display: block;
`

export const oldDocTextFormat = css`
    ${montserratMediumReg}
    font-size: 12px;
    color: var(--gray-500);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export const docsIcon = css`
    width: 33px;
    height: 33px;
    flex-shrink: 0 !important;
`
export const docsBlock = css`
	padding: 0px 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
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

export const lastPopover = css`
	.${Classes.POPOVER_CONTENT} {
		transform: translateX(-290px) !important;
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

export const accountIconStyle = css`
	display: block;
	width: 32px;
	height: 32px;
`

export const drawerBody = css`
	max-height: calc(100% - 68px - 82px);
	overflow-y: auto;
	${customScrollbar}
`

export const commentBlock = css`
	display: flex;
	flex-direction: column;
`

export const docsBlockAssets = css`
	padding: 0px 16px;
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
`

export const docsAssets = css`
	flex: 0 0 auto;
	width: 225px;
	height: 60px;
    border-radius: 14px;
    border: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--base-white);
    padding: ${spaces.smallMedium};
    box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
`

export const assetDocTextType = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-800);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 250px;
    display: block;
`

export const listItemFull = css`
	width: 100%;
`

export const drawerItemBorder = css`
	border-radius: 12px;
	background-color: var(--gray-25);
`

export const buttonRightBlock = css`
	display: flex;
	gap: 12px;
	align-items: center;
`

export const mockupEntityBlock = (isHovered: boolean,):string => {
	return css`
	position: absolute;
	top: 0px;
	left: 0px;
	border-top-left-radius: 14px;
	border-top-right-radius: 14px;
	width: 100%;
	height: 91px;
	background: ${isHovered ?
		'var(--primary-100)' :
		''};
	border-bottom: ${isHovered ?
		'1px solid var(--primary-500)' :
		'1px solid transparent'};
	transition: all ease 0.5s;
`
}