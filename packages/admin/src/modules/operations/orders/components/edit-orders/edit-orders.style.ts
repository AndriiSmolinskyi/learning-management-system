import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	spaces,
	montserratSemibold,
	montserratMidbold,
	customScrollbar,
} from '../../../../../shared/styles'

export const drawerWrapper = css`
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
	max-height: calc(100vh - 100px);
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

export const info = css`
	 background-color: var(--gray-25);
	 border-radius: 12px;
	 display: flex;
	 justify-content: space-between;
	 align-items: center;
	 height: 63px;
	 padding: 12px;
`

export const infoLeftTitle = css`
	 ${montserratMediumReg}
	 font-size: 12px;
	 color: var(--gray-500);	 
`

export const infoLeftText = css`
	 ${montserratMidbold}
	 font-size: 14px;
	 color: var(--gray-800);	 
`

export const infoBadge = css`
	 padding: 2px 8px;
	 border-radius: 16px;
	  ${montserratMidbold}
	  color: var(--base-white);
	  font-size: 12px;
	  font-style: italic;
`

export const approvedBadge = css`
  background: linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);
  border: 1px solid var(--green-200);
`

export const canceledBadge = css`
 background: linear-gradient(180deg, rgba(217, 45, 32, 0.7) 70%, rgba(217, 45, 32, 0) 100%);
  border: 1px solid var(--error-200);
`

export const inProgressBadge = css`
 background: linear-gradient(180deg, rgba(234, 170, 8, 0.7) 70%, rgba(234, 170, 8, 0) 100%);
  border: 1px solid var(--yellow-200);
`
