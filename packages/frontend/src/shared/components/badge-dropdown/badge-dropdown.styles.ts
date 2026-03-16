/* eslint-disable multiline-ternary */
import {
	Classes,
} from '@blueprintjs/core'
import {
	css,
} from '@emotion/css'

export const badgeButton = (isOpen: boolean,): string => {
	return css`
		cursor: pointer;
   	background-color: var(--base-white);
   	border: 1px solid var(--gray-200);
		& svg {
			transition: all 300ms ease;
			transform: ${isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
		}
		& path {
			fill: ${isOpen ? 'var(--primary-600)' : 'var(--gray-600)'};
		}
		width: 133px;
		display: flex;
		border-radius: 8px;
		padding: 5px;
		justify-content: space-between;
		align-items: center;
		box-shadow: ${isOpen ? `box-shadow: 0px 0px 0px 4px #EBF2FF, 0px 1px 2px 0px #1018280D` : 'none'};
`
}

export const dropdownContainer = css`
	display: flex;
	flex-direction: column;
	width: 132px;
	border-radius: 8px;
	padding: 4px;
	background-color: var(--base-white);
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	& div, p, span {
		outline: none !important;
	}
`

export const dropdownItem = css`
	cursor: pointer;
	border-radius: 8px;
	padding: 6px;
	height: 33px;
	display: flex;
	width: 100%;
	align-items: center;
	&:hover {
		background-color: var(--gray-50);
	}
`

export const popoverContainer = css`
	background-color: transparent !important;
	border: none !important;
	box-shadow: none !important;
	& div {
		outline: none !important;
	}
	.${Classes.POPOVER_CONTENT} {
			background-color: transparent !important;
			border: none !important;
			border-radius: 0 !important;
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