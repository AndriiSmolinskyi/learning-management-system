import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	spaces,
} from '../../../../../../shared/styles'

export const editHeader = css`
	height: 68px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: ${spaces.midLarge};
	background-color: var(--primary-25);
	border-top-left-radius: 26px;
	border-bottom: 1px solid var(--primary-100);
`

export const editHeaderTitle = css`
	${montserratSemibold}
	font-size: 18px;
	color: var(--primary-600);
`

export const drawer = css`
    max-width: 600px;
    width: 100%;
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`

export const darwerBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`