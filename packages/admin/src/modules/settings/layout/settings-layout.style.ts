import {
	css,
} from '@emotion/css'
import {
	spaces,
} from '../../../shared/styles'

export const container = css`
	display: flex;
	flex-direction: column;
	gap: ${spaces.medium};
	height: 100%;
	width: 100%;
`

export const pageHeader = css`
	height: 52px;
	background: var(--base-white);
	display: flex;
	align-items: center;
	padding: 0 6px;
	border-radius: 22px;
	width: max-content;
	flex-shrink: 0;
`

export const pageHeaderItem = css`
	cursor: pointer;
`

export const linkHeader = css`
	all: unset;
	display: inline-block;
	text-decoration: none;
	color: inherit;
	outline: none;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;

	&:focus,
	&:active {
	outline: none;
	text-decoration: none;
	}

	&:hover {
	text-decoration: none;
	outline: none;
	}
`

export const inactiveIcon = css`
	& path {
		fill: var(--gray-600);
	}
`

export const activeIcon = css`
	& path {
		fill: var(--primary-600);
	}
`

export const navigateBtn = css`
	&:focus,
	&:active,
	&:hover {
		color: var(--primary-700);
	& svg {
		& path {
			fill: var(--primary-700);
		}
	}
	}
`