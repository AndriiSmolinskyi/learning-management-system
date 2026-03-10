import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
	spaces,
} from '../../../../../../shared/styles'

export const newCategoryWrapper = css`
	width: 100%;
	height: 264px;
	background-color: var(--primary-50);
	border-radius: 12px;
	padding: 8px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`

export const blockTitle = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
`

export const fieldBlock = css`
	display: flex;
	flex-direction: column;
	gap: 8px;
`

export const fieldTitle = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const buttonBlock = css`
	display: flex;
	gap: 12px;
`

export const button = css`
	padding: 0 17px;
`

export const addedFieldWrapper = css`
	display: flex;
	justify-content: space-between;
	background-color: var(--gray-25);
	padding: ${spaces.small};
	border-radius: ${spaces.smallMedium};
`

export const customFieldText = css`
${montserratMidbold}
font-size: 14px;
line-height: 19.6px;
color: var(--gray-800);
padding-left: 6px;
`

export const customInfoText = css`
${montserratMediumReg}
font-size: 12px;
line-height: 16.8px;
color: var(--gray-500);
padding-left: 6px;
`

export const iconButtonsBlockWrapper = css`
	display: flex;
	gap: 4px;
`

export const fieldIconButton = css`
	& svg {
		& path {
			fill: var(--gray-600);
		}
	}

	&:hover {
		& svg {
		& path {
			fill: var(--primary-600);
		}
	}
	}
`