import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
} from '../../styles'

export const errorStyle = css`
	border: 1px solid var(--error-200) !important;
	box-shadow:
		0 0 0 4px var(--error-100),
		0 1px 2px 0 #101828 !important;
`

export const inputWrapper = css`
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
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
			& svg {
            & path {
                fill: var(--primary-600);
            }
      }
	}

	&.error {
		border: 1px solid var(--error-200) !important;
		box-shadow: inset 0px 2px 6px 0px rgba(24, 39, 81, 0.1) !important;
		box-shadow:
			0 0 0 4px var(--error-100),
			0 1px 2px 0 #101828 !important;
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
		-webkit-text-fill-color: var(--gray-900) !important;
		transition: background-color 0s, color 0s !important;
		background-clip: text !important;
  		-webkit-box-shadow: none !important;
	}

	caret-color: var(--primary-600);

`

export const sectionStyle = css`
	width: 100%;
`

export const errorText = css`
	margin-top: 5px;
	font-size: 14px;
	color: var(--error-400);
`