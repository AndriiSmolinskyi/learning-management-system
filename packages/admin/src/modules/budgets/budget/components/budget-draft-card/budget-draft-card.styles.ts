import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	montserratMediumReg,
} from '../../../../../shared/styles'

export const cardWrapper = css`		
	width: calc((100% - 48px) / 4);
	height: 177px;
	background: var(--gray-25);
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	border-radius: 22px;
	padding: 16px;
`

export const infoBlock = css`
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-top: 12px;
	margin-bottom: 26px;
`

export const draftName = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
`

export const draftUpdatedText = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-600);
`

export const buttonBlock = css`
	display: flex;
	align-items: center;
	gap: 12px;
`