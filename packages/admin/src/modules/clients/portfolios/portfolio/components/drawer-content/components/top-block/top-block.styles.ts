import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
} from '../../../../../../../../shared/styles'

export const topBlockWrapper = css`
    height: 108px;
    width: 100%;
    background-color: var(--primary-25);
    border-bottom: 1px solid var(--primary-100);
    padding-top: 22px;
    flex-shrink: 0;
`

export const addPortfolioText = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--primary-600);
	margin-bottom: 20px !important;
	padding-left: 24px;
`