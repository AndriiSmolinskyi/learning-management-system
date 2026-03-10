import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
} from '../../../../../../shared/styles'

export const filterWrapper = (isRangeSliderOff: boolean,): string => {
	return css`
	position: absolute;
		width: 400px;
		height: ${isRangeSliderOff ?
		'340px' :
		'477px'};
		background: var(--base-white);
		padding :16px;
		z-index: 32;
		right: 0px;
		top: 60px;
		border-radius: 16px;
		box-shadow: -2px 4px 10px 0px #2A2C731F;
	`
}

export const showText = css`
${montserratMediumReg}
line-height: 19.6px;
font-size: 14px;
color: var(--gray-500);
margin-bottom: 8px !important;
`

export const buttonBlock = css`
	display: flex;
	gap: 12px;
	margin-top: 30px;
	justify-content: end;
	position: relative;
	&::before{
		content: '';
		height: 1px;
		background-color: var(--primary-100);
		width: 400px;
		position: absolute;
		top: -16px;
		left: -16px;
	}
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

export const customCheckbox = (checked: boolean | undefined,): string => {
	return css`
		display: inline-block;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		box-shadow: 0px 2px 6px 0px #1827511A inset;
		position: relative;
		border: ${checked ?
		'1px solid var(--primary-600)' :
		'1px solid var(--gray-200)'};
		&::after {
      content: "";
      position: absolute;
      inset: 3px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: ${checked ?
		'linear-gradient(180deg, #4069FB 0%, #6090F7 20.5%, #0F1AF1 100%)' :
		'transparent'};
      transition: background-color 0.3s ease;
    }
	`
}

export const selectsBlock = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const clearButton = css`
	width: 94px;
	background: linear-gradient(180deg, #F6F6F6 0%, #FFFFFF 9%, #F4F4F4 100%);
	border: 1px solid var(--gray-200);
	box-shadow: 1px 1px 4px 0px #0E0F590F;
	color: var(--gray-800);
`

export const applyButton = css`
	width: 132px;
`

export const activationStatusText = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 22.6px;
	color: var(--gray-800);
`