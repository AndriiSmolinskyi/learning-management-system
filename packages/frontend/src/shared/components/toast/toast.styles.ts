import {
	css,
} from '@emotion/css'

export const container = css`
	display: flex;
`

export const info = css`
	display: flex;
	flex-direction: column;
	& > p {
		line-height: 20px;
		white-space: normal;
	}
	& > span {
		white-space: normal;
		line-height: 20px;
	}
`
export const iconWrapper = css`
	width: 36px;
	height: 36px;
	display: flex;
	justify-content: center;
	align-items: center;
`