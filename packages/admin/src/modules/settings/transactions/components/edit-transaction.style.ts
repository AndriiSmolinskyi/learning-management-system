import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMediumReg,
} from '../../../../shared/styles'
import {
	customScrollbar,
} from '../../../../shared/styles'

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

export const fieldsContainer = (isFullHeight = false,):string => {
	return css`
   height: ${isFullHeight ?
		'calc(100vh - 90px)' :
		'100vh'};
   overflow-y: auto;
	background-color: var(--base-white);
   ${customScrollbar}
`
}

export const editFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	width: 100%;
	height: 100vh;
	background-color: var(--base-white) !important;
`

export const fieldTitle = css`
	${montserratSemibold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const fieldBlock = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
`

export const historyBlock = css`
	display: flex;
	flex-direction: column;
	gap: 24px;
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
	border-bottom-left-radius: 26px;
`

export const activateLabel = css`
	display:flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 16px !important;
	&:hover {
	cursor: pointer;
	}
`

export const activationStatusText = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 22.6px;
	color: var(--gray-800);
`