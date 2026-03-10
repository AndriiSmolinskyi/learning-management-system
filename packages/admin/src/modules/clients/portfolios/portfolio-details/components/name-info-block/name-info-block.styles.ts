import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratMidbold,
} from '../../../../../../shared/styles'

export const mainWrapper = css`
	padding: 21px 20px;
	border-radius: 22px;
	background-color: var(--base-white);
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	
`

export const nameBlock = css`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
`

export const nameText = css`
	${montserratMidbold}
	font-size: 16px;
	line-height: 22.4px;
	color: var(--gray-800);
	max-width: 220px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const conditionalText = css`
	margin-top: ${spaces.smallMedium};
`