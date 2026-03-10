import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
} from '../../../shared/styles'

export const wrapper = css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	&:hover * {
		cursor: pointer;
	}
`

export const emptyContainer = css`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 12px;
`

export const emptyText = css`
	${montserratMidbold}
	font-size: 12px;
	color: var(--gray-600);
	font-style: italic;
	text-align: center;
`

export const image = css`
	width: 96px;
	height: 96px;

	@media (min-width: 1440px) and (min-height: 1081px) {
		width: 128px;
		height: 128px;
	}

	@media (max-height: 1080px) {
		width: 96px;
		height: 96px;
	}
`