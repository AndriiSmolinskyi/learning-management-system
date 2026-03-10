import {
	css,
} from '@emotion/css'
import {
	spaces,
} from '../../../../../shared/styles'

export const pageHeader = css`
	height: 60px;
	width: 398px;
	background: var(--base-white);
	display: flex;
	align-items: center;
	gap: 6px;
	padding: ${spaces.medium} ${spaces.mid20};
	border-radius: 22px;
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

	& button span svg path {
			fill: currentColor;
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
	& button span svg path {
			fill: currentColor;
	}
`

export const button = css`
	padding: 0px;
	letter-spacing: 0;
`