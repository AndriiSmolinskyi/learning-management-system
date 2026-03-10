import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	spaces,
} from '../../../../../shared/styles'

export const headerClientList = css`
	height: 44px;
	display: grid;
	width: 100%;
	grid-template-columns: 1.8fr  1.8fr  1.8fr  1.8fr  1.8fr  1.8fr 0.72fr;
	background-color: var(--primary-25);
	border: 1px solid var(--primary-100);
	padding: ${spaces.smallMedium} ${spaces.medium};
	padding-right: 28px;
`

export const bodyClientListItem = css`
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 0;
	margin: 0;
	& div {
		outline: none !important;
	}
	background-color: transparent;
`

export const clientHeaderListText = css`
  	${montserratMidbold}
	font-size: 12px;
	color: var(--gray-600);
`

export const headerClientListItem = css`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0;
	margin: 0;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
`

export const orderArrow = (rotate?: boolean,): string => {
	return css`
	cursor: pointer;
	rotate: ${rotate ?
		'180deg' :
		'0deg'};
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
`
}
