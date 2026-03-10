import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	spaces,
	montserratSemibold,
	customScrollbar,
} from '../../../../../../shared/styles'

export const listWrapper = css`
	width: 100%;
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	background-color: var(--base-white);
	border-radius: 22px;
	padding: ${spaces.mid20};
	`

export const listHeader = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

export const headerTitle = css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	color: var(--gray-800);
`

export const subportfolioList = css`
	padding: 0;
	list-style: none;
	display: flex;
	gap: ${spaces.smallMedium};
	margin-top: ${spaces.mid20};
	overflow-x: auto;
	${customScrollbar}
`

export const drawer = css`
	max-width: 760px;
	width: 100%;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
`

export const dialog = css`
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