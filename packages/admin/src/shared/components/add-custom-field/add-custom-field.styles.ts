import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
	spaces,
} from '../../../shared/styles'

export const creationBlockWrapper = css`
	width: 332px;
	height: 225px;
	background-color: var(--primary-50);
	border-radius: ${spaces.smallMedium};
	padding: ${spaces.small};
	display: flex;
	flex-direction: column;
	gap: ${spaces.smallMedium};
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

export const addButton = css`
	${montserratMidbold}
	color: var(--primary-600);
	font-size: 14px;
	line-height: 19.6px;
	margin-right: auto;

&:disabled {
	color: var(--primary-200);
	margin-top: 12px;
	& svg {
		& path {
			fill: var(--primary-200);
		}
	}
}
`

export const inputWrapper = css`
	display: flex;
	align-items: center;
	gap: 8px;
	width: 316px;
	background: var(--base-white);
	border: 1px solid var(--gray-100);
	border-radius: 8px;
	box-sizing: border-box;
	padding: 0 12px;
	box-shadow: inset 0px 2px 6px 0px rgba(24, 39, 81, 0.1);

	&:focus-within {
		border: 1px solid var(--primary-200);
		box-shadow: inset 0px 2px 6px 0px rgba(24, 39, 81, 0.1);
		box-shadow:
			0 0 0 4px var(--primary-100),
			0 1px 2px 0 #101828;
	}

	&.error {
		border: 1px solid var(--error-200);
		box-shadow: inset 0px 2px 6px 0px rgba(24, 39, 81, 0.1);
		box-shadow:
			0 0 0 4px var(--error-100),
			0 1px 2px 0 #101828;
	}
`

export const inputField = css`
	flex: 1;
	outline: none !important;
	height: 44px;
	background: transparent !important;
	border: none;
	padding: 12px 0;
	font-size: 14px;
	color: var(--gray-900);
	${montserratMediumReg};

	&::placeholder {
		color: var(--gray-400);
	}

	&:-webkit-autofill {
		box-shadow: 0 0 0px 1000px var(--base-white) inset !important;
		-webkit-text-fill-color: var(--gray-900) !important;
		transition: background-color 0s, color 0s !important;
	}
`

export const buttonBlock = css`
	display: flex;
	gap: 12px;
`

export const cancelButton = css`
	color: var(--gray-800);
	border: 1px solid var(--gray-200);
	box-shadow: 1px 1px 4px 0px #0E0F590F;
	background-color: var(--base-white);
`

export const addedFieldWrapper = css`
	display: flex;
	justify-content: space-between;
	background-color: var(--gray-25);
	padding: ${spaces.small};
	border-radius: ${spaces.smallMedium};
`

export const fieldsList = css`
	display: flex;
	flex-direction: column;
	gap: 8px;
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
