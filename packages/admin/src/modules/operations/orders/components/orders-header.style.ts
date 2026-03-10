import {
	css,
} from '@emotion/css'
import {
	spaces,
} from '../../../../shared/styles'
import {
	montserratMidbold,
	montserratSemibold,
} from '../../../../shared/styles'

export const TableHeaderBtnBlock = css`
	height: 44px;
	flex-grow: 1 !important; 
	min-width: 200px;
	max-width: 400px;
	border: 1px solid var(--primary-200);
	background-color: var(--base-white);
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0px 2px 6px 0px #1827511A inset;
`

export const TableHeaderBtnBlockLine = css`
	width: 1px;
	height: 28px;
	background-color: var(--primary-200);
`

export const TableHeaderBtn = css`
	width: 50%;
	margin: 0px 3px;
	padding: ${spaces.small} ${spaces.medium};
	cursor: pointer;
	${montserratMidbold}
	font-size: 14px;
	color: var(--gray-700); 
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`

export const TableHeaderBtnSelected = css`
	padding: ${spaces.small} ${spaces.medium};
	cursor: pointer;
	${montserratMidbold}
	font-size: 14px;
	color: var(--base-white) !important; 
	background: var(--gradients-button-primary-blue);
	border-radius: 12px;
`

export const OrderHeader = css`
	width: 100%;
	height: 84px;
	margin-left: 1px;
	padding: ${spaces.mid20};
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
`

export const orderHeaderLeft = css`
	display: flex;
	align-items: center;
	gap: 8px;
`

export const orderTitle = css`
	font-size: 26px;
	color: var(--gray-800);
	${montserratSemibold}
`

export const headerBtnBlock = css`
	display: flex;
	gap: 12px;
`

export const clientHeaderInput = css`
	width: 299px;
    height: 42px;
	div{
		border-radius: 10px;
	}
`

export const filterButton = (iFilterShown: boolean,):string => {
	return css`
	${iFilterShown && `
		position: relative;
		z-index: 100;
	`}
	& svg {
		& path {
			fill: var(--primary-600);
		}
	}
`
}