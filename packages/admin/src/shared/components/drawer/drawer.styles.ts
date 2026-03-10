import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

export const drawer = css`
	border-radius: 0px !important;
	padding: 0px;
	width: max-content !important;
	margin: 0 !important;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
	outline: none !important;

	.${Classes.DRAWER_HEADER} {
		box-shadow: none !important;
		position: absolute;
		background-color: transparent !important;
		box-shadow: none;
		border-radius: 0 !important;
		align-items: flex-start;
		padding: 0px !important;
		right: 24px;
		top: 16px;
		border: none !important;
		width: 36px !important;
		height: 36px !important;
		min-height: auto;
		z-index: 3000;
		& > h4 {
			box-shadow: none !important;
			display: none;
		}
	}
	& div {
		outline: none !important;
	}
	.${Classes.DIALOG_CLOSE_BUTTON} {
		display: none !important;
	}
	`

export const darwerBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`

export const closeBtnStyle = css`
	border: none;
	outline: none !important;
	background-color: transparent;
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
`