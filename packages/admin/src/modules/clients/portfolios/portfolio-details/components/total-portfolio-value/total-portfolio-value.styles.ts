import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratMidbold,
	montserratBold,
} from './../../../../../../shared/styles'

export const totalValueWrapper = css`
	width: 100%;
	padding: 26px 20px;
	border-radius: 22px;
	background-color: var(--base-white);
	padding-right: ${spaces.medium};
	display: flex;
	flex-direction: column;
	gap: ${spaces.medium};
`

export const headerStyles = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const totalText = css`
${montserratMidbold}
font-size: 22px;
line-height: 30.8px;
color: var(--gray-800);
`

export const totalValue = css`
${montserratBold}
font-size: 32px;
line-height: 44.8px;
color: var(--gray-700);
`

export const plusIcon = css`
	& path {
		fill: var(--primary-600);
	}
`

export const entitiesBlockWrapper = css`
	display: flex;
	gap: 12px;
`

export const entityWrapper = css`
	width: calc((100% - 36px) / 4);
	border: 1px solid var(--gray-100);
	box-shadow: 0px 1px 2px 0px #1018280D;
	border-radius: 14px;
	padding: 9px 12px 12px 12px;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const entityText = css`
${montserratMidbold}
font-size: 14px;
line-height: 19.6px;
color: var(--gray-800);
margin-top: 9px;
`

export const assetIconStyle = css`
	display: block;
	width: 44px;
	height: 44px;
`

export const addButton = css`
	margin-top: ${spaces.smallMedium};
	width: 152.5px;
`

export const loaderWrapper = css`
	position: static !important;
	transform: none !important;
`