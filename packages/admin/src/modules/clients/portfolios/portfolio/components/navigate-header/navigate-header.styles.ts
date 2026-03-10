import {
	css,
} from '@emotion/css'
import {
	spaces,
} from '../../../../../../shared/styles'

export const pageHeader = css`
	height: 52px;
	background: var(--base-white);
	display: inline-flex;
	align-items: center;
	padding: ${spaces.medium} ${spaces.mid20};
	border-radius: 22px;
	margin-bottom: ${spaces.medium};
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
	& svg {
		& path {
			fill: currentColor;
		}
	}
	}

	&:hover {
	text-decoration: none;
	outline: none;
	& svg {
		& path {
			fill: currentColor;
		}
	}
	}
`

export const inactiveBriefcase = css`
	& path {
		fill: var(--gray-600);
	}
`

