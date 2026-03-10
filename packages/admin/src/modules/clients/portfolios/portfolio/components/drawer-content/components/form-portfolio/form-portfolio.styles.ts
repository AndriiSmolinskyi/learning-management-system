import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
} from '../../../../../../../../shared/styles'

export const formPortfolioWrapper = css`
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

export const infoBadge = css`
	 padding: 2px 10px;
	 border-radius: 16px;
	  ${montserratMidbold}
	  color: var(--base-white);
	  font-size: 14px;
	  font-style: italic;
	  display: inline-block !important;
`

export const corporateBadge = css`
  background: linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);
  border: 1px solid var(--green-200);
`

export const privateBadge = css`
 background: linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%);
  border: 1px solid var(--primary-200);
`

export const jointBadge = css`
 background: linear-gradient(180deg, rgba(254, 97, 35, 0.7) 70%, rgba(224, 79, 22, 0) 100%);
  border: 1px solid var(--orange-200);
`
