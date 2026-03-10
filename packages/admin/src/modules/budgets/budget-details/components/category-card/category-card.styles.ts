import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold,
} from '../../../../../shared/styles'

export const cardWrapper = css`
	height: 154px;
	width: 267px;
	border-radius: 14px;
	border: 1px solid var(--gray-100);
	box-shadow: 0px 1px 2px 0px #1018280D;
	background-color: var(--base-white);
	position: relative;
	padding: 8px 12px 12px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`

export const dotsButton = css`
	& svg {
		& path {
			fill: var(--gray-700);
		}
	}
`

export const buttonWrapper = css`
	position: absolute;
	right: 12px;
	top: 12px;
`

export const categoryName = css`
	${montserratMidbold}
	font-style: italic;
	font-size: 14px;
	line-height: 36px;
	color: var(--gray-700);
`

export const infoWrapper = css`
	display: flex;
	gap: 16px;
`

export const infoBlock = css`
	width: 114px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`

export const infoText = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
`

export const allocatedNumber = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--gray-800);
`

export const availableNumber = (isPositive: boolean,): string => {
	return css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: ${isPositive ?
		'var(--error-600)' :
		'var(--green-600)'};
`
}