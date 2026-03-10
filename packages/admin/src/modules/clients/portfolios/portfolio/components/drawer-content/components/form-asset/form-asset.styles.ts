import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
} from '../../../../../../../../shared/styles'

export const formBankWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0px 24px;
`

export const formEquityInsideCrypto = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
`

export const fieldTitle = css`
	margin-bottom: 8px !important;
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const errorText = (errorColor: boolean,): string => {
	return css`
		margin-top: 5px;
		color: ${errorColor ?
		'red' :
		'black'};
  `
}