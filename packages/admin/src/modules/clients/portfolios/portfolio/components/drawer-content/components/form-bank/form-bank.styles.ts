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
export const fieldTitle = css`
	margin-bottom: 8px !important;
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const additionalStepProgressBar = css`
    padding: 20px 0px 0px;
`