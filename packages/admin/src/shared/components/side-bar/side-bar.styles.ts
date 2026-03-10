import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

export const container = css`
	position: relative;
	z-index: 3;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 24px 11px;
	width: 74px;
	height: calc(100% - 16px);
	background-color: var(--base-white);
	border-radius: 22px;
	box-shadow: -1px 2px 8px 0px #2A2C731A;
`

export const buttonWrapper = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6px;
	width: 100%;
	border-top: 1px solid var(--primary-100);
	padding: 8px 0px;
`

export const profileBtnWrapper = css`
	margin-bottom: 16px;
	.${Classes.POPOVER_TRANSITION_CONTAINER} {
			inset: 0px auto auto 90px !important;
			background-color: transparent;
	}
	& div {
		outline: none !important;
	}
`

export const clientsBtnWrapper = css`
	.${Classes.POPOVER_TRANSITION_CONTAINER} {
			inset: 140px auto auto 90px !important;
			background-color: transparent;
	}
	& div {
		outline: none !important;
	}
`

export const profileBtn = (open: boolean,): string => {
	return css`
	position: relative;
	width: 40px;
	height: 40px;
	background: var(--primary-100);
	border-color: var(--primary-200);
	& path {
		fill: var(--primary-600) !important;
	}
	&:hover {
		background: var(--primary-100);
		border-color: var(--primary-200);
		box-shadow: 0px 1px 2px 0px #1018280D, 0px 0px 0px 4px #EBF2FF;
	}
	${open &&	`
		background: var(--gradients-button-primary-blue) !important;
		box-shadow: none !important;
		border-color: var(--primary-600) !important;
		& path {
			fill: var(--base-white) !important;
		}
		
		&::after {
		content: '';
		width: 6px;
		height: 6px;
		position: absolute;
		z-index: 2;
		right: -10px;
		top: calc(100% / 2 - 3px);
		border-radius: 999px;
		background-color: var(--primary-600);}`
}
	`
}

export const sidebarBtn = css`
	width: 42px;
	height: 42px;
	background: transparent;
	border: 1px solid transparent;
	& path {
		fill: var(--primary-600) !important;
	}
	&:hover {
		background: var(--primary-50);
		border-color: var(--primary-200);
		box-shadow: 0px 0px 0px 4px #EBF2FF, 0px 1px 2px 0px #1018280D;
	}
`

export const clientsBtn = (open: boolean,): string => {
	return css`
	position: relative;
	& path {
		fill: var(--primary-600) !important;
	}
	${open && `
		position: relative;
		z-index: 100;
	`}
	${open && `
		& path {
			fill: var(--base-white) !important;
		}
			background: var(--gradients-button-primary-blue) !important;
			box-shadow: none !important;
			border-color: var(--primary-600) !important;
			
			&::after {
			content: '';
			width: 6px;
			height: 6px;
			position: absolute;
			z-index: 2;
			right: -10px;
			top: calc(100% / 2 - 3px);
			border-radius: 999px;
			background-color: var(--primary-600);
			}
		`}
	`
}

export const currentBtn = css`
	background: var(--gradients-button-primary-blue) !important;
	border-color: var(--primary-600) !important;
	& path {
		fill: var(--base-white) !important;
	}
`

export const buttonWrapperDown = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6px;
	width: 100%;
	padding: 8px 0px;
	position: absolute;
	bottom: 10px;
`