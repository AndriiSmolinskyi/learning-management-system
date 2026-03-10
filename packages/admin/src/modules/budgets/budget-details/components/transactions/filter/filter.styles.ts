import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	montserratMediumReg,
} from '../../../../../../shared/styles'

export const filterWrapper = css`
	display: flex;
	height: 36px;
	gap: 12px;
`

export const clientHeaderInput = css`
	width: 299px;
	height: 42px;
	div{
		border-radius: 10px;
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

export const clearBtn = css`
	width: 94px;
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

export const activateBlockWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 16px;	

	& :hover {
		cursor: pointer;
	}
`

export const activateWrapper = css`
	display: flex;
	align-items: center;
	gap: 8px;

	& p {
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
	}
`

export const titleText = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-500);
`

export const filterButton = (iFilterShown: boolean,):string => {
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
`
}