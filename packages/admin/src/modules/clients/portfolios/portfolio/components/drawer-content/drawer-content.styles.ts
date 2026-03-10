import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

import {
	spaces,
	montserratMidbold,
	customScrollbar,
} from './../../../../../../shared/styles'

export const drawerWrapper = css`
    display: flex;
    height: 100%;
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
    position: relative;
	 width: 760px;
`

export const leftBlockWrapper = css`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
    width: 159px;
    height: 100%;
    padding: ${spaces.medium};
    background-color: var(--primary-50);
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`

export const rightBlockWrapper = css`
    width: 600px;
    display: flex;
    flex-direction: column;
  `

export const nameBlock = css`
    width: 127px;
    height: 68px;
    border: 1px solid var(--primary-200);
    background: var(--gradients-download-button);
    padding: ${spaces.small} ${spaces.smallMedium};
    border-radius: ${spaces.smallMedium};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
	 text-align: center;
`

export const nameSurnameText = css`
	${montserratMidbold}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-800);
	width: 100px;
	white-space: nowrap;
	overflow: hidden;
   text-overflow: ellipsis;
`

export const buttonsList = css`
    list-style: none;
    margin-top: 24px;
    padding: 0px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    align-items: center;
`

export const closeIcon = css`  
    position: absolute;
    top: 24px;
    right: 32px;
    &:hover {
        cursor: pointer;
    }
`

export const formWrapper = css`
    flex-grow: 1;
    height: calc(100% - 190px);
    overflow-y: auto;
    background-color: var(--base-white);
   ${customScrollbar}
`

export const saveDraftButton = css`
${montserratMidbold}
font-size: 14px;
line-height: 19.6px;
color: var(--primary-600);
padding: 12px 18px;
outline: none !important;
border: none;
border-radius: 16px;
background-color: transparent;
transition: all 0.3s ease;

&:hover{
    background-color: var(--primary-100);
}
`

export const dialog = css`
max-width: 400px;
width: 100%;
border-radius: ${spaces.medium} !important;
margin: 0px !important;
.${Classes.DIALOG_BODY_SCROLL_CONTAINER} {
    border-radius: ${spaces.medium} !important;
}
.${Classes.DIALOG_CLOSE_BUTTON} {
	padding: 0;
	width: 24px;
	height: 24px;
	outline: none !important;
	&:hover {
		background-color: transparent !important;
	}
}
`
