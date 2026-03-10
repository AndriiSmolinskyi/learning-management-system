import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

export const dialog = css`
border-radius: 0px !important;
padding: 0px;
max-width: 770px;
width: auto !important;
margin: 16px;
position: relative;
background: transparent !important;
border: none !important;
box-shadow: none !important;
.${Classes.DIALOG_HEADER} {
	position: absolute;
	background-color: transparent !important;
	box-shadow: none;
	border-radius: 0 !important;
	align-items: flex-start;
	padding: 0px !important;
	right: 12px;
	top: 12px;
	border: none !important;
	width: 36px;
	height: 36px;
	min-height: auto;
	z-index: 3;
	& > h6 {
		display: none;
	}
}
.${Classes.DIALOG_CLOSE_BUTTON} {
	padding: 0;
	min-height: 0px;
	min-width: 0px;
	outline: none !important;
	&:hover {
		background-color: transparent !important;
	}
	& > span {
		width: 22px !important;
		height: 22px !important;
		& > svg {
			width: 22px !important;
			height: 22px !important;
			fill: var(--gray-600) ;
		}
	}
}
`

export const dialogBackdrop = css`
	background-color: var(--transparency-bg10) !important;
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