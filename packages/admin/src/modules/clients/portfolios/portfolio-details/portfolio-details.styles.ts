import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
	spaces,
} from './../../../../shared/styles'

export const pageWrapper = css`
	max-height: calc(100vh - 100px);
	/* margin: -10px;
	padding: 10px; */
`

export const loaderWrapper = css`
	width: 100%;
	height: 300px;
	position: relative;
`

export const bothSidesWrapper = css`
	display: flex;
	gap: ${spaces.medium};
	margin-top: ${spaces.medium};
	width: 100%;
	max-height: calc(100vh - 188px);
	overflow-y: auto;
	${customScrollbar}
	&::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
    box-shadow: inset -3px 0px 0px 4px var(--primary-100);
  }
`

export const leftSideWrapper = css`
	display: flex;
	flex-direction: column;
	gap: ${spaces.medium};
	position: relative;
	/* width: calc((100% - 16px) * 0.6); */
	flex-grow: 1;
`

export const sideWrapper = css`
	display: flex;
	flex-direction: column;
	gap: ${spaces.medium};
	padding-right: 4px;
	/* width: calc((100% - 16px) * 0.4); */
	width: 600px;
	flex-shrink: 0;
`