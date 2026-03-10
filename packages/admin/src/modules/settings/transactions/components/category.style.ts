import {
	css,
} from '@emotion/css'
import {
	montserratSemibold, customScrollbar, montserratMidbold,
} from '../../../../shared/styles'

export const container = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	height: 100vh;
	position: relative;
`

export const header = css`
	width: 100%;
	padding: 0px 24px;
	height: 68px;
	display: flex;
	align-items: center;
	${montserratSemibold}
	font-size: 18px;
	line-height: 25px;
	color: var(--primary-600);
	border-top-left-radius: 26px;
	background-color: var(--primary-25);
`

export const body = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	width: 100%;
	background-color: var(--base-white);
	height: calc(100vh - 68px);
	overflow-y: auto;
	${customScrollbar}
	border-bottom-left-radius: 26px;
`

export const item = (openEdit?: boolean,): string => {
	return css`
		width: 100%;
		padding: 8px;
		border-radius: 12px;
		background-color: ${openEdit ?
		'var(--primary-50)' :
		'var(--gray-25)'};
		flex-shrink: 0;
	`
}

export const itemTop = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

export const itemTitle = css`
	${montserratMidbold}
	font-size: 14px;
	color: var(--gray-800;);
`

export const itemRight = css`
	display: flex;
`

export const inputBlock = css`
	margin-top: 6px;
	padding-right: 36px;
`

export const createCategoryBlock = css`
	display: flex;
	justify-content: flex-end;
`

export const createInput = css`
	width: 90%;
`