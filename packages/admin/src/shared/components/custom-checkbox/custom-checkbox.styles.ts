import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
} from '../../styles'

export const checkboxWrapperStyles = css`
	position: relative;
`

export const labelStyles = css`
	display: flex;
	gap: 8px;
	align-items: center;
	&:hover{
		cursor: pointer;
	}
`

export const checkboxStyles = css`
	clip: rect(0 0 0 0); 
	clip-path: inset(50%);
	height: 1px;
	overflow: hidden;
	position: absolute;
	white-space: nowrap; 
	width: 1px;
`

export const customCheckboxStyles = css`	
	position: relative;
	width: 24px;
	height: 24px;
	border: 1px solid var(--gray-200);
	box-shadow: 0px 2px 6px 0px #1827511A inset;
	border-radius: 6px;
	cursor: pointer;
`

export const disabledInput = css`
	border: 1px solid var(--gray-disabled);
	cursor: default;
`

export const customCheckboxCheckedStyles = css`
	background: var(--gradients-blue-button);
	border: 1px solid var(--primary-600);
	display: flex;
	justify-content: center;
	align-items: center;
`

export const textStyles = css`
	line-height: 20px;
   font-size: 14px;
	color: var(--gray-800);
	${montserratMediumReg}
`

