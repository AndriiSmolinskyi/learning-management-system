import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	montserratMidbold,
	montserratMediumReg,
	spaces,
} from '../../../../../shared/styles'

export const bodyOrderList = css`
    display: grid;
    grid-template-columns: 1.8fr  1.8fr  1.8fr  1.8fr  1.8fr  1.8fr 0.72fr;
    grid-auto-rows: 56px;
    padding: 0px ${spaces.medium};
    border-bottom: 1px solid var(--primary-100);
	// todo: clear if good
    /* &:last-child {
        border-bottom: none;
    } */
`

export const bodyOrderListItem = css`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    margin: 0;

    & div {
        outline: none !important;
    }
    background-color: transparent;
`

export const bodyOrderListItemName = css`
    ${montserratMidbold}
    font-size: 14px;
    color: var(--gray-800);
`

export const bodyOrderListItemText = css`
    ${montserratMediumReg}
    font-size: 14px;
    color: var(--gray-600);
`

export const menuCell = css`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    width: 7%;
    position: relative;
`

export const dotsButton = (isPopoverShown: boolean,): string => {
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
`

export const popoverBackdrop = css`
    outline: none !important;
    background-color: var(--transparency-bg10) !important;
    & div {
        outline: none !important;
    }
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

export const actionBtn = css`
	padding: 0 12px;
	gap: 8px;
	width: 100%;
	justify-content: flex-start;
`

export const orderPDF = css`
	position: fixed;
	top: -100%;
	left: -100%;
	visibility: hidden;
	width: 23%;
	height: auto;
`

export const draftContainer = css`
	width: 100%;
	height: 56px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--gray-25);
	border-bottom: 1px solid var(--primary-100);
`

export const draft = css`
	display: flex;
`

export const draftName = css`
	${montserratMidbold}
	font-size: 14px;
	color: var(--gray-800);
`

export const draftLast = css`
	${montserratMediumReg}
	font-size: 12px;
	color: var(--gray-600);
`

export const draftIcon = css`
	margin-right: ${spaces.medium};
	width: 32px;
	height: 32px;
`

export const draftBtns = css`
	 display: flex;
	 margin-left: ${spaces.mid20};
	 gap: ${spaces.smallMedium}
`