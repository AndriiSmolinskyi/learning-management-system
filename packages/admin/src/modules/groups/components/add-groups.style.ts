import {
	css,
} from '@emotion/css'
import {
	spaces,
} from '../../../shared/styles'
import {
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
} from '../../../shared/styles'
import {
	customScrollbar,
} from '../../../shared/styles'

export const exitDialogBackdrop = css`
	background-color: transparent !important;
`

export const modalWrapper = css`
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
		margin-bottom: ${spaces.smallMedium} !important; 
	}
`

export const buttonBlock = css`
   width: 100%;
   display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
   margin-top: ${spaces.medium}; 
`

export const button = css`
    width: 100%;
`

export const buttonOk = css`
    width: 50%;
	 
`

export const formContainer = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	height: 100vh;
	position: relative;
`

export const formHeader = css`
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

export const addFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0px;
	height: calc(100% - 68px - 82px);
	overflow-y: auto;
	${customScrollbar}
	padding-top: 4px;
`

export const addInputBlock = css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 ${spaces.midLarge};
    padding-bottom: 20px;
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

export const fieldTitle = css`
	margin-bottom: 28px;
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const depositBlock = css`
	display: flex;
	flex-direction: column;
	gap: 10px;
`

export const radioBlock = css`
	display: flex;
	align-items: center;
	gap: 32px;
`

export const annualBlockHeader = css`
	height: 52px;
	display: flex;
	align-items: center;
	justify-content: space-between;;
	gap: 32px;
`

export const annualBlock = css`
	padding: 8px;
	border-radius: 12px;
	background-color: var(--gray-25);
`
export const successModalContainer = css`
	display: flex;
	flex-direction: column;
	width: 400px;
	align-items: center;
	justify-content: center;
	padding: 16px;
	gap: 12px;
	background-color: var(--base-white);
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	& > h4 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 25.2px;
		color: var(--gray-800);
		padding-bottom: 4px;
	}
	& > button {
		width: 100%;
	}
`

export const relationIcons = css`
	display: flex;
	align-items: center;
	gap: 6px;
`

export const linkIcon = css`
	path{
		fill: var(--gray-400) !important;
	}
`

export const subText = css`
	font-size: 14px;
	color: var(--gray-500);
	text-align: center;
	${montserratMediumReg}
	width: 270px;
`

export const selectBlock = css`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 6px;
`

export const selectLabel = css`
	${montserratSemibold}
	font-size: 14px;
	color: var(--gray-600);
`

export const modalButtonBlock = css`
	width: 100%;
	display: flex;
	gap: 12px;
`

export const modalButtonBlockItem = css`
	width: 50% !important;
`

export const parText = css`
	max-width: 320px;
	text-align: center;
	color: var(--gray-500);
`