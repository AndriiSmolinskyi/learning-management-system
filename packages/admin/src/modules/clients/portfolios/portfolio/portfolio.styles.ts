import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
	montserratMidbold,
	spaces,
} from './../../../../shared/styles'

export const pageWrapper = css`
	display: flex;
	flex-direction: column;
	gap: ${spaces.medium};
	height: calc(100vh - 100px);
`

export const listsWrapper = (isOnly: boolean,): string => {
	return css`
	display: flex;
	gap: 32px;
	flex-direction: column;
	margin: -10px;
	padding: 10px;
	/* padding-bottom: ${isOnly ?
		'10px' :
		'10px'};
	margin-bottom: ${isOnly ?
		'10px' :
		'10px'}; */
	overflow-y: auto;
	${customScrollbar}
	padding-right: 8px;
	max-height: calc(100vh - 188px);
	min-height: 220px;
	  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
    box-shadow: inset -3px 0px 0px 4px var(--primary-100);
  }
`
}

export const listsDivider = css`
	&::after {
		content: '';
		display: block;
		width: 100%;
		height: 3px;
		background-color: var(--gray-200);
		position: relative;
		border-radius: 16px;
	}
`

export const portfolioList = css`
	list-style: none;
	padding: 0;
	display: flex;
	gap: 16px;
	flex-wrap: wrap;

`

export const emptyContainer = css`
	height: 69vh;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 16px;
`

export const emptyText = css`
	${montserratMidbold}
	font-size: 12px;
	color: var(--gray-600);
	font-style: italic;
`