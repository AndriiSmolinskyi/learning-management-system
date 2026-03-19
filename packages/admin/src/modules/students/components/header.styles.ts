import {
	css,
} from '@emotion/css'
import {
	montserratSemibold, montserratMidbold, montserratMediumReg,
} from '../../../shared/styles'
import {
	Classes,
} from '@blueprintjs/core'
import checkIcon from '../../../assets/icons/li_check.png'

export const headerWrapper = css`
	width: 100%;
	height: 82px;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
`

export const titleIconBlock = css`
	display: flex;
	align-items: center;
	gap: 8px;
	
`

export const headerTitle = css`
	${montserratSemibold}
	font-size: 26px;
	line-height: 36.4px;
	color: var(--gray-800);
`

export const buttonsBlock = css`
	display: flex;
	align-items: center;
	gap: 12px;
`

export const addButton = css`
	min-width: 186px;
	${montserratSemibold}
	font-size: 14px;
	line-height: 19.6px;

`

export const clientHeaderInput = css`
	width: 299px;

	div{
		border-radius: 10px;
		height: 42px !important;
	}

	 input {
        height: 42px !important;
    }
`

export const filterDialogContainer = css`
	background-color: var(--base-white) !important;
	backdrop-filter: blur(2px) !important;
	border-radius: 16px !important;
	border: none !important;
	width: 400px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	display: flex;
	flex-direction: column;
`

export const filterDialogWrapper = css`
	display: flex;
	flex-direction: column;
	padding: 16px;
	gap: 16px;
	& h3 {
		${montserratMidbold}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-800);
	}
`

export const filterBtnWrapper = css`
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	align-items: center;
	border-top: 1px solid var(--primary-100);
	padding: 16px;
`

export const applyBtn = css`
	width: 132px;
`

export const popoverContainer = css`
	background-color: transparent !important;
	border: none !important;
	box-shadow: none !important;
	.${Classes.POPOVER_CONTENT} {
			background-color: transparent !important;
			border: none !important;
			border-radius: 0 !important;	
			opacity: 0.97;	
	}
	.${Classes.POPOVER_ARROW} {
			background-color: transparent !important;
			border: none !important;
			width: 0px !important;
			height: 0px !important;
			&::before {
				box-shadow: none !important;
			}
	}
`

export const popoverBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`

export const clearBtn = css`
	width: 94px;
`

export const filterButton = (iFilterShown: boolean, hasFilters?: boolean,):string => {
	return css`
	${iFilterShown && `
		position: relative;
		z-index: 100;
	`}
	& svg {
		& path {
			fill: var(--primary-600);
		}
	}
	${hasFilters && `
		position: relative;
		// z-index: 100;
	`}
	${hasFilters && `&::after {
		content: '';
		position: absolute;
		top: 4px;
		right: 4px;
		width: 10px;
		height: 10px;
		background: radial-gradient(81.82% 81.82% at 34.13% 29.53%, #61DEB0 0%, #44B98E 100%);
		border-radius: 50%;
	  }
	  `}
`
}

export const titleCheckbox = css`
	padding-bottom: 12px;
	font-size: 14px;
	color: var(--gray-500);
	${montserratMediumReg}
`

export const hiddenCheckbox = css`
  display: none;
`

export const customCheckbox = css`
	display: inline-block;
	width: 20px;
	height: 20px;
	border-radius: 4px;
	border: 1px solid var(--gray-200);
	background-color: var(--base-white);
   box-shadow: inset 0px 2px 6px rgba(24, 39, 81, 0.1);
	position: relative; 
	display: flex;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background: url(${checkIcon}) no-repeat center;
		background-size: 16px 16px;
		opacity: 0;
		transition: opacity 0.15s ease-in-out;
	}

	input:checked + & {
		background: var(--gradients-button-primary-blue);
		border-color: var(--primary-600);
		box-shadow: none;
	}

		input:checked + &::before {
		opacity: 1;
	}
`

export const checkboxBlock = css`
	display: flex;
	align-items: center;
	gap: 6px;
	${montserratMediumReg}
	color: var(--gray-800);
	font-size: 14px;
	cursor: pointer;
`

export const checkboxFlex = css`
	display: flex;
	gap: 12px;
`

export const showText = css`
	${montserratMediumReg}
	line-height: 19.6px;
	font-size: 14px;
	color: var(--gray-500);
	margin-bottom: 8px !important;
`

export const activationStatusText = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 22.6px;
	color: var(--gray-800);
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