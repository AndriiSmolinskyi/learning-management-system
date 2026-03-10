import {
	css,
} from '@emotion/css'

import {
	montserratSemibold,
	spaces,
} from '../../../../../shared/styles'

export const exitModalWrapper = css`
position: relative;
	width: 400px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: ${spaces.medium};
	background-color: var(--base-white);
	border-radius: ${spaces.medium};
	& > h4 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 25.2px;
		color: var(--gray-800);
		margin-top: 12px;
		margin-bottom: 6px;
		text-align: center;
	}
`

export const exitModalbuttonBlock = css`
	width: 100%;
	display: flex;
	align-items: center;
	gap: ${spaces.smallMedium};
	margin-top: ${spaces.medium}; 
`

export const viewDetailsButton = css`
	width: 178px;
`

export const addButton = css`
	width: 178px;
	padding: 0px 16px;
`