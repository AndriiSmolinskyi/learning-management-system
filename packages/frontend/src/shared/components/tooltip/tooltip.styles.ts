import {
	css,
} from '@emotion/css'

import {
	montserratRegular,
} from '../../styles'

export const tooltip = css`
	background-color: transparent !important;
	box-shadow: none !important;
	height: 42px !important;
  	padding-left:  9px !important;
	display: flex !important;
	align-items: center !important;
	& div {
	height: 29px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 6px;
	border: 1px solid var(--primary-100) !important;
   border-radius: 14px !important;
	background: var(--gradients-button-secondary-blue) !important;
	box-shadow: 0px 1px 2px 0px #1018280D !important;
	& > span {
		${montserratRegular}
		color: var(--gray-600) !important;
		font-size: 12px;
		line-height: 17px;
	}
  }
`