import {
	css,
} from '@emotion/css'

import {
	customScrollbar,
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
	spaces,
} from '../../../../../../shared/styles'

export const container = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--base-white) !important;
	height: 100vh;
	position: relative;
	`

export const header = css`
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

export const fieldsContainer = css`
    height: calc(100vh - 150px);
    overflow-y: auto;
    ${customScrollbar};
`

export const newDocumentsText = css`
${montserratMediumReg}
font-size: 14px;
line-height: 19.6px;
color: var(--gray-700);
`

export const addFormEntityWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0px;
`

export const editFormEntityWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	width: 100%;
	background-color: var(--base-white);
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
`

export const addInputBlock = css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 ${spaces.midLarge};
    padding-bottom: 20px;
`

export const editInputBlock = css`
    display: flex;
    flex-direction: column;
    padding: 8px;
`

export const title = css`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
	min-height: 18px;
	& p {
		color: var(--gray-500);
		${montserratMediumReg}
		font-size: 12px;
		line-height: 18px;
	}
	& path {
		fill: var(--gray-500);
	}
`

export const entityName = css`
	max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

export const oldDocBlock = css`
    display: flex;
    flex-direction: column;
    gap:4px;
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