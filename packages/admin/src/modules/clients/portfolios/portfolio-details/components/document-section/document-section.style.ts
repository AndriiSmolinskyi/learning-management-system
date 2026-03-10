import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
	spaces,
} from '../../../../../../shared/styles'
import {
	Classes,
} from '@blueprintjs/core'

export const oldDoc = css`
    width: 100%;
    height: 63px;
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
    width: 210px;
    ${montserratMidbold}
    font-size: 14px;
    color: var(--gray-800);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
	display: flex;
	flex-direction: column;
	gap: 12px;
    max-height: 360px;
    overflow-y: auto;
    ::-webkit-scrollbar {
    	display: none;
  	}
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;
`
export const folderIcon = css`
    width: 16px;
    height: 16px;
    flex-shrink: 0 !important;
`
export const docRoute = css`
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 210px;
`

export const textWrapper = css`
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
export const restoreWrapper = css`
    width: 100%;
    padding: 4px;
    border-bottom: 1px solid var(--primary-100);
    & > button {
        color: var(--green-600);
        & path {
            fill: var(--green-600);
        }
        &:hover {
            color: var(--green-600);
            & path {
                fill: var(--green-600);
            }
        }
    }
`
export const deactivateWrapper = css`
    width: 100%;
    padding: 4px;
    border-top: 1px solid var(--primary-100);
    & > button {
        color: var(--error-600);
        & path {
            fill: var(--error-600);
        }
        &:hover {
            color: var(--error-600);
            & path {
                fill: var(--error-600);
            }
        }
    }
`

export const documentSectionBlock = css`
    background-color: var(--base-white);
    box-shadow: -1px 2px 8px 0 rgba(42, 44, 115, 0.1);
    border-radius: 22px;
    padding: 20px;
`

export const documentHeader = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`

export const documentHeaderTitle = css`
    font-size: 22px;
    color: var(--gray-800);
    ${montserratSemibold}
`

export const footerBtn = css`
    width: 100%;
    margin-top: 20px;
`