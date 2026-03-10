import {
	css,
} from '@emotion/css'
import {
	spaces,
} from './../../../../../../shared/styles'
import {
	Classes,
} from '@blueprintjs/core'

export const dialog = css`
max-width: 400px;
width: 100%;
border-radius: ${spaces.medium} !important;
margin: 0px !important;
 &.bp5-overlay {
  z-index: 1070 !important;

}
.${Classes.DIALOG_BODY_SCROLL_CONTAINER} {
	border-radius: ${spaces.medium} !important;
}

.${Classes.DIALOG_CLOSE_BUTTON} {
	padding: 0;
	width: 24px;
	height: 24px;
	outline: none !important;
	&:hover {
		background-color: transparent !important;
	}
}
`

export const drawer = css`
	max-width: 760px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
`

export const drawerBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`