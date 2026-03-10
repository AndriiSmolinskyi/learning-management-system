import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratMidbold,
	montserratMediumReg,
} from '../../../../../../shared/styles'
import {
	Classes,
} from '@blueprintjs/core'

export const checkboxItemWrapper = css`
    padding: ${spaces.smallMedium};
    border-radius:  14px;
    border: 1px solid var(--gray-100);
    box-shadow: 0px 1px 2px 0px #1018280D;
    background-color: var(--base-white);
`

export const checkboxItemWrapperNew = css`
    border: 1px solid var(--primary-200);
`

export const checkboxItemWrapperDoc = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

export const dotsMenuButton = css`
    border-radius: 10px;
    padding: ${spaces.small};
    outline: none !important;
    border: 1px solid var(--gray-200);
    background: var(--gradients-back-link-gray);
    box-shadow: 1px 1px 4px 0px #0E0F590F;
`

export const detailsBackdrop = (isOpen: boolean,): string => {
	return css`
        display: flex;
    justify-content: flex-end;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #0018461A;
    backdrop-filter: blur(2px);
    z-index: 19;
    transition: all 0.4s ease;
    pointer-events: none;
    pointer-events: ${isOpen ?
		'all' :
		'none'};
  opacity: ${isOpen ?
		1 :
		0};
    `
}

export const checkboxLabelBlock = css`
    display: flex;
    align-items: center;
    gap: ${spaces.smallMedium};
    position: relative;
`

export const documentIconWrapper = css`
    width: 32px;
    height:32px;
    border-radius: ${spaces.small};
    background: var(--gradients-download-button);
    display: flex;
    justify-content: center;
    align-items: center;
`

export const documentIcon = css`
    width: 18px;
    height: 18px;
`

export const typeFormatBlock = css`
    display: flex;
    flex-direction: column;
`

export const documentType = css`
${montserratMidbold}
font-size: 12px;
line-height: 16.8px;
color: var(--gray-800);
user-select: none;
`

export const documentFormat = css`
${montserratMediumReg}
font-size: 12px;
line-height: 16.8px;
text-transform: uppercase;
user-select: none;
`

export const newDocument = css`
    background: linear-gradient(180deg, rgba(100, 120, 255, 1) 70%, rgba(100, 120, 255, 0) 100%);
    border: 1px solid var(--primary-200);
    border-radius: 16px;
    padding: 2px 9px 2px 7px;
    color: var(--base-white);
    font-style: italic;
    font-size: 12px;
    ${montserratMidbold}
    position: absolute;
    top: -75%;
    left: 4%;
    z-index: 100;
`

export const commentBlock = css`
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
`

export const commentBlockText = css`
    ${montserratMediumReg}
    font-size: 12px;
    color: var(--gray-800);
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