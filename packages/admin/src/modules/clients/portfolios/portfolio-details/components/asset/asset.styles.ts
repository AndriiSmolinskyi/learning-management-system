import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratSemibold,
	montserratMediumReg,
	montserratMidbold,
	customScrollbar,
} from '../../../../../../shared/styles'

export const modalWrapper = css`
position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: ${spaces.medium};
	background-color: var(--base-white);
	border-radius: ${spaces.medium};
`

export const newDocumentsText = css`
${montserratMediumReg}
font-size: 14px;
line-height: 19.6px;
color: var(--gray-700);
`

export const selectText = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--gray-800);
	margin-top: 12px;
	margin-bottom: 6px;
`

export const infoText = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-500);
	width: 344px;
	text-align: center;
	margin-bottom: ${spaces.smallMedium} !important; 
`

export const buttonBlock = css`
	width: 100%;
   display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
   margin-top: ${spaces.medium}; 
`

export const buttonSelect = css`
	width: 50% !important;
`

export const selectWrapper = css`
   width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;
`

export const closeIcon = css`  
	position: absolute;
	top: 20px;
	right: 20px;
	&:hover {
	    cursor: pointer;
	}
`

export const container = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--base-white);
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
	background-color: var(--primary-25);
	border-top-left-radius: 26px;
	background-color: var(--primary-25);
`

export const addFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0px;
	height: calc(100% - 345px);
	padding-bottom: 24px;
	overflow-y: auto;
	${customScrollbar}
	padding-top: 4px;
`

export const fieldsContainer = (isFullHeight = false,): string => {
	return css`
	background-color: var(--base-white);
   height: ${isFullHeight ?
		'calc(100vh - 150px)' :
		'200vh'};
   overflow-y: ${isFullHeight ?
		'auto' :
		'hidden'};
   ${customScrollbar}
`
}

export const editFormWrapper = css`
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
    position: absolute;
	z-index: 30;
    bottom: 0;
	 left: 0;
    height: 82px;
    width: 100%;
   overflow: hidden;
   background-color: var(--base-white);
   border-bottom-left-radius: 26px;
`

export const editBtnInnerWrapper = css`
 display: flex;
    align-items: center;
    justify-content: space-between;
	 gap: 12px;
    padding: 16px 24px 16px 16px;
    border-top: 1px solid var(--primary-100);
    background-color: var(--primary-25);
    border-bottom-left-radius: 26px;
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

export const fieldTitle = css`
	margin-bottom: 8px !important;
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const title = css`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
	min-height: 40px;
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

export const iconsBlockWrapper = css`
	display: flex;
	gap: ${spaces.smallMedium};
`

export const accountIcon = css`
	width: 42px;
	height: 42px;
`

export const transferIcon = css`
	width: 112px;
	height: 42px;
`

export const selectIcon = (isActive: boolean | undefined,): string => {
	return css`
	& path {
		fill: ${isActive ?
		'var(--gray-600)' :
		'var(--gray-300)'};
	}
	`
}

export const portfolioIcon = (isActive: boolean | undefined,): string => {
	return css`
	& path {
		fill: ${isActive ?
		'var(--gray-400)' :
		'var(--gray-300)'};
	}
	`
}

export const editAssetBlock = css`
	margin: 0px -24px;
`

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
	} 

	& > p {
		${montserratMediumReg}
		font-size: 14px;
		line-height: 19.6px;
		color: var(--gray-500);
		width: 320px;
		text-align: center;
		margin-top: 6px !important; 
		& > span {
			font-weight: 700;
		}
	}
`

export const exitModalbuttonBlock = css`
   width: 100%;
   display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
   margin-top: ${spaces.medium}; 
`

export const successTransferButton = css`
	margin-top: ${spaces.medium}; 
	width: 140px;
`

export const exitModalButton = css`
	width: 100%;
`