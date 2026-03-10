import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	spaces,
	montserratSemibold,
	customScrollbar,
} from '../../../../../shared/styles'

export const drawerContainer = css`
	width: 600px;
	background-color: var(--base-white);
	height: 100vh;
	border-top-left-radius: 26px;
	border-top-right-radius: 0px;
	border-bottom-right-radius: 0px;
	border-bottom-left-radius: 26px;
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
    max-height: 78vh;
    overflow-y: auto;
		 ${customScrollbar}
`
export const drawerTextBlock = css`
    padding: 12px;
    display: flex;
    width: 100%;
    background-color: var(--gray-25);
`
export const drawerTypeText = css`
    width: 140px;
    ${montserratMediumReg}
    font-size: 14px;
    color: var(--gray-500);
    padding-right: 10px;
`
export const drawerText = css`	
    ${montserratMediumReg}
    font-size: 14px;
    color: var(--gray-700);
`
export const drawerBorderBottom = css`
    border-bottom: 1px solid var(--gray-100);
`
export const drawerFooter = css`
    width: 100%;
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

export const addAnotherBtn = css`
    display: flex;
    justify-content: flex-end;
`

export const addOrdersFooter = css`
    border-bottom-left-radius: 26px;
    position: absolute;
    bottom: 0;
    padding: ${spaces.midLarge};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--primary-25);
    border-top: 1px solid var(--primary-100);
`

export const requestAdd = css`
	 padding: 16px 16px 0px 16px;
	 display: flex;
	 align-items: center;
	 gap: 5px;
	 ${montserratMediumReg}
	 color: var(--gray-500);
	 font-size: 12px;
`