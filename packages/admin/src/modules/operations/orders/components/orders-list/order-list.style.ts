import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
} from '../../../../../shared/styles'

export const orderList = css`
	width: 100%;
`

export const listBlock = css`
   padding: 0;
	margin: 0;
	margin-left: 1px;
	max-height:  calc(100vh - 200px);
	min-height: calc(100vh - 200px);
	overflow-y: auto;
	${customScrollbar}
	background-color: var(--base-white);
	border-bottom-left-radius: 26px;
`