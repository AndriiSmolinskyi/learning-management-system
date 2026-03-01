/* eslint-disable no-unused-expressions */
import {
	injectGlobal,
} from '@emotion/css'
import {
	orbitronRegular,
} from './fonts'

injectGlobal`
	html, body {
		height: 100vh;
		background-color: var(--black);
	}

	body {
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
	}

	#root, :root {
		width: 100%;
		height: 100vh;
		isolation: isolate;
		/* background-color: var(--gray-700); */
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

	p, h1, h2, h3, h4, h5, h6, a, {
		${orbitronRegular(12,)}
		overflow-wrap: break-word;
		margin-bottom: 0 !important;
		color: var(--white);
	}

	input, button, textarea, select {
		${orbitronRegular(12,)}
		padding: 0;
	}

	button {
		cursor: pointer;
	}

	.hidden-el {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		border: 0;
		padding: 0;
		clip: rect(0 0 0 0);
		overflow: hidden;
	}

	*:active {
		cursor: url('../../../src/assets/icons/cursor-click.svg'), pointer;
   }

	.bp5-portal {
		outline: none !important;
		& div {
			outline: none !important;
		}
	}
/* 
	[data-theme="dark"] .bp5-drawer-header > button > svg > path {
		fill: var(--base-white);
	}

	[data-theme="light"] .bp5-drawer-header > button > svg > path {
		fill: var(--gray-600);
	} */
`
