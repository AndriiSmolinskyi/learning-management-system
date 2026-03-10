import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
} from '../../../../../shared/styles'
import {
	PortfolioType,
} from '../../../../../shared/types'

export const selectStyle = css`
  width: 100% !important;
  
  .react-select__control {
	width: 100% !important;
  }

  .react-select__control--is-focused,
  .react-select__control--menu-is-open {
	width: 100% !important;
  }

  .css-1u9des2-indicatorSeparator {
	display: none;
  }

  .css-13cymwt-control {
	border: none !important;
  }

  .css-hlgwow {
	padding: 0;
  }

  .react-select__control, 
  .react-select__control--is-focused, 
  .react-select__control--menu-is-open, 
  .css-t3ipsp-control {
	border: none;
	outline: none;
	box-shadow: none;
	background-color: transparent;
  }

	.react-select__value-container {
		width: 250px;
		height: 34px;
		display: flex;  
		gap: 8px;  
		flex-wrap: nowrap;     
		overflow-x: auto; 
		white-space: nowrap;  
		::-webkit-scrollbar {
			display: none;
		}
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		-ms-overflow-style: none;
	}

  ${montserratMediumReg};
`

export const inputWrapper = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100% !important;
  background: var(--base-white);
  border: 1px solid var(--gray-100);
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0 12px;
  position: relative;
  height: 44px;

  &:focus-within {
    border: 1px solid var(--primary-200);
    box-shadow: 0 0 0 4px var(--primary-100), 0 1px 2px 0 #101828;

	 .some__svg{
		& path {
			fill: var(--primary-600);
		}
	 }
  }

  &.error {
    border: 1px solid var(--error-200);
    box-shadow: 0 0 0 4px var(--error-100), 0 1px 2px 0 #101828;
  }
`

export const customMultiValueStyles = (type: string,): string => {
	return css`
		background: ${((): string => {
		switch (type) {
		case PortfolioType.CORPORATE:
			return `linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);`
		case PortfolioType.PRIVATE:
			return `linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%)`
		case PortfolioType.JOINT:
			return `linear-gradient(180deg, rgba(254, 97, 35, 0.7) 70%, rgba(224, 79, 22, 0) 100%)`
		default:
			return 'tranparent'
		}
	})()};
	padding: 2px 10px;
	border-radius: 16px;
	text-transform: capitalize;
	&:hover {
		cursor: pointer;
	}
	`
}

export const customMultiSelectItem = css`
	padding: 6px;
	border: 1px solid var(--gray-200);
	border-radius: 8px;
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	color: var(--gray-900);
	${montserratMediumReg}
`

export const customMultiSelectItemBtn = css`
	width: 20px !important;
	height: 20px !important;
	flex-shrink: 0 !important;
	display: block !important;
	max-width: none !important;
	cursor: pointer;
`