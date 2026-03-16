/* eslint-disable no-unused-expressions */
import {
	injectGlobal,
	css,
} from '@emotion/css'

import {
	montserratRegular,
} from './fonts'

injectGlobal`
	html, body {
		height: 100%;
	}

	body {
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
		overflow: hidden;
		background-color: var(--primary-100);
	}

	:root {
		width: 100%;
		isolation: isolate;
		position: relative;
	}

	*, *::before, *::after {
		box-sizing: border-box;
	}

	* {
		margin: 0;
	}

	img, picture, video, canvas, svg {
		display: block;
		max-width: 100%;
	}

	p, h1, h2, h3, h4, h5, h6 {
		${montserratRegular}
		overflow-wrap: break-word;
		margin-bottom: 0 !important;
		color: var(--reverted-accent-color);
	}
	
	input, button, textarea, select {
		padding: 0;
		${montserratRegular}
	}

	button {
		cursor: pointer;
	}

	.hidden-el {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		border: none;
		padding: 0;
		clip: rect(0 0 0 0);
		overflow: hidden;
	}

	.bp5-portal {
		outline: none !important;
		& div {
			outline: none !important;
		}
	}

	input[type='date']::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
	}
.bp5-popover2,
.bp5-popover2-content {
  z-index: 9999 !important;
}
   *:active {
		cursor: url('../../../src/assets/icons/cursor-click.svg'), pointer;
   }
`

export const portal = css`
	height: 100vh;
`