import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
} from '../../../../../../shared/styles'

export const transactionWrapper = css`
	height: 65px;
	width: 100%;
	background-color: var(--base-white);
	border: 1px solid var(--gray-100);
	box-shadow: 0px 1px 2px 0px #1018280D;
	padding: 12px;
	border-radius: 14px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
`

export const infotextBlock = css`
	display: flex;
	flex-direction: column;
	gap: 2px;
`

export const amount = (isPositive: boolean,): string => {
	return css`
	${montserratMidbold}
	font-size: 16px;
	line-height: 22.4px;
	color: ${isPositive ?
		'var(--green-500)' :
		'var(--error-500)'};
`
}

export const dataText = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
`

export const dotsButton = css`
	position: absolute;
	top: 12px;
	right: 12px;
`