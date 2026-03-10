import {
	css,
} from '@emotion/css'

export const phoneInputField = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 44px;

	.PhoneInputInput {
		width: 100%;
		padding: 0;
		outline: none;
		background-color: transparent;
		border: none;
		font-size: 14px;
	}
	
	.PhoneInputCountry {
		position: relative;
		display: flex;
		align-items: center;
		min-width: 72px;
		padding-right: 12px;
		margin-right: 12px;
		background: transparent;
		border-right: 1px solid var(--gray-100);
		cursor: pointer;
	}
	
	.PhoneInputCountryIcon {
		margin-right: 8px;
	}
	
	.PhoneInputCountrySelectArrow {
		margin-top: -4px;
		font-size: 28px;
		border-bottom: 2px solid var(--gray-600);
		border-right: 2px solid var(--gray-600);
		opacity: 1;
	}
	
	.PhoneInputCountryCallingCode {
		order: -1;
		margin-right: 6px;
	}
`

export const inputWrapper = css`
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--base-white);
  border: 1px solid var(--gray-100);
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0 12px;
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);

  &:focus-within {
    border: 1px solid var(--primary-200);
    box-shadow: 0 0 0 4px var(--primary-100), 0 1px 2px 0 #101828;
  }

  &.error {
    border: 1px solid var(--error-200);
    box-shadow: 0 0 0 4px var(--error-100), 0 1px 2px 0 #101828;
  }
`