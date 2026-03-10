/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	spaces,
	montserratSemibold,
	montserratMediumReg,
	montserratMidbold,
	customScrollbar,
} from '../../../../../../shared/styles'

export const clientDetail = css`
	position: relative;
   width: 100%;
   max-width: 93vw;
	padding-bottom: 20px;
   padding-right: ${spaces.medium};
   background-color: var(--primary-100);
	border-radius: 22px;
`

export const clientDetailsBlock = css`
	max-height: calc(100vh - 188px);
	overflow-y: auto;
   ${customScrollbar}
   &::-webkit-scrollbar-thumb {
      background-color: var(--gray-300);
      border-radius: 10px;
      box-shadow: inset -3px 0px 0px 4px var(--primary-100);
   }
`

export const BillingPortfolioContainer = css`
    width: 100%;
    max-width: 100vw;
    min-height: 257px;
    display: flex;
    gap: ${spaces.medium};
    justify-content: space-between;
     overflow-x: hidden;
`

export const clientDetailHeader = css`
    width: 100%;
    height: 76px;
    box-sizing: border-box;
    background-color: var(--base-white);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 26px;
    padding: 0px ${spaces.mid20};
    margin-bottom: ${spaces.medium};
`

export const clientDetailHeaderLeft = css`
    display: flex;
    align-items: center;
    gap: 8px;
`
export const clientDetailHeaderRight = css`
    display: flex;
    align-items: center;
    gap: 12px;
`
export const clientDetailHeaderTitle = (isActivated: boolean,): string => {
	return css`
    ${montserratSemibold}
    color: ${isActivated ? 'var(--gray-800)' : 'var(--gray-500)'};
    font-size: 22px;
	 	max-width: 400px;
	white-space: nowrap;
	overflow: hidden;
   text-overflow: ellipsis;
`
}

export const ClientDetailBilling = css`
    position: relative;
    width: 50%;
    max-width: 50vw;
    min-height: 257px;
    box-sizing: border-box;
    background-color: var(--base-white);
    display: flex;
    flex-direction: column;
    border-radius: 26px;
    padding: ${spaces.mid20} 0px;
    ${montserratMediumReg}
    font-size: 14px;
    color: var(--gray-800);
`

export const ClientDetailBillingMain = css`
    padding:  0px ${spaces.mid20};
    display: flex;
    flex-direction: column;
    gap: 20px;
`

export const resendCredsPos = css`
    position: absolute;
    top: 20px;
    right: 20px;
`

export const resetPasswordPos = css`
    position: absolute;
    top: 20px;
    right: 170px;
`

export const ClientDetailBillingItem = css`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
`
export const ClientDetailBiilingInfoTitle = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-600);
    line-height: 17px;
`

export const ClientDetailBiilingInfo = css`
    display: flex;
    flex-wrap: wrap;
    ${montserratMediumReg}
    font-size: 14px;
    color: var(--gray-800);
    margin-top: 4px;
`

export const ClientDetailBiilingFlex = css`
    display: flex;
    flex-direction: column;
    gap: 10px;
`

export const ClientDetailMoreContainer = css`

`

export const ClientDetailMore = css`
    background: var(--gradients-button-secondary-blue);
    border: 1px solid var(--primary-100);
    border-radius: 14px;
    padding: 6px;
    position: absolute;
    top: -200%;
    left: 50%;
    ${montserratMediumReg}
    font-size: 14px;
    color: var(--gray-800);
`

export const ClientDetailMoreButton = css`
    color: var(--primary-700);
    ${montserratMidbold}
    font-size: 14px;
    margin-left: 8px;
    cursor: pointer;
    &:focus {
        outline: none; 
        box-shadow: none;
    }
    
`

export const ClientDetailPortfolio = css`
    width: 50%;
    max-width: 50vw;
    min-height: 257px;
    box-sizing: border-box;
    background-color: var(--base-white);
    display: flex;
    flex-direction: column;
    border-radius: 26px;
    overflow: hidden;
`

export const ClientDetailPortfolioHeader = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${spaces.mid20} ${spaces.mid20} 0px;
`

export const ClientDetailPortfolioTitle = css`
    ${montserratSemibold}
    font-size: 22px;
    color: var(--gray-800);
`

export const ClientDetailPortfolioCards = css`
    max-width: 100%;
    display: flex;
    height: 100%;
    gap: 16px;
	overflow-x: auto;
	${customScrollbar}
    padding: 20px ${spaces.mid20} ${spaces.mid20} ${spaces.mid20} ;
    > * {
        flex: 0 0 257px;
        max-width: 257px !important;
        min-width: 257px;
        
    }
	 position: relative;
`

export const deactivateBtnStyle = css`
    color: var(--error-600);
    border: 1px solid var(--error-200);
    background: var(--gradients-button-secondary-error);
    height: 36px;
    gap: 12px;
    line-height: 20px;
`

export const addPortfolioBtn = css`
    height: 36px;
    gap: 12px;
    line-height: 20px;
`

export const commentWrapper = css`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 2px;

    & > p {
        ${montserratMidbold}
        font-size: 12px;
        line-height: 17px;
        color: var(--gray-600);
    }
    & > span {
        ${montserratMediumReg}
        font-size: 14px;
        line-height: 20px;
        color: var(--gray-800);
        word-break: break-all;
    }
`

export const tooltip = css`
    background-color: transparent !important;
    box-shadow: none !important;
    padding-left: 9px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;

    & > div {
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        border: 1px solid var(--primary-100) !important;
        border-radius: 14px !important;
        background: var(--gradients-button-secondary-blue) !important;
        box-shadow: 0px 1px 2px 0px #1018280D !important;
    }

    & > div > span {
        font-family: 'Montserrat', sans-serif;
        color: black !important;
        font-size: 12px;
        line-height: 17px;
    }

    & > div:not(:last-child) {
        margin-bottom: 4px;
    }
`

export const tooltipFlex = css`
    display: flex !important;
    flex-direction: column !important;
`

export const tooltipText = css`
    color: var(--gray-600) !important;
    font-size: 12px;
    ${montserratMediumReg}
`

export const drawer = css`
    max-width: 560px;
    width: 100%;
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`
export const dialog = css`
    max-width: 400px;
    width: 100%;
    border-radius: ${spaces.medium} !important;
    margin: 0px !important;
    &.bp5-overlay {
    z-index: 1070 !important;
    }
    .${Classes.DIALOG_BODY_SCROLL_CONTAINER} {
        border-radius: ${spaces.medium} !important;
    }
`

export const button = css`
 & span svg path {
			fill: currentColor;
 }
`

export const redirectUrl = css`
 	position: absolute;
	right: 16px;
	top: 5px;
	display: block;
	height: 42px;
	padding: 0px 16px;
	border-radius: 14px;
 	background: linear-gradient(180deg, #6DF0FF 0%, #3E44BE 20.5%, #17A3C6 100%);
	border: 1px solid #89CEF0;
	text-decoration: none !important;
	outline: none !important;
	&:hover {
		background: linear-gradient(180deg, #6DF0FF 0%, #3E44BE 50%, #17A3C6 100%);
		color: white;
	}
	color: white;
	line-height: 42px;
	${montserratMidbold}
   font-size: 14px;
`

export const loaderStyle = css`
	min-width: auto !important;
	max-width: auto !important;
`