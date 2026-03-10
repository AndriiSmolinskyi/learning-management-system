/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	spaces,
} from '../../../shared/styles'

export const container = css`
	display: flex;
	flex-direction: column;
	gap: ${spaces.mid20};
	height: 100%;
	width: 100%;
	padding: 0 16px 16px 0;
`

export const pageHeader = css`
	height: 68px;
	gap: 16px;
	display: flex;
	align-items: center;
	width: 100%;
	position: relative;
`

export const navContainer = css`
	width: 100%;
	height: 100%;
	position: relative;
	width: calc(100% - 16px - 180px);
	border-radius: 22px;
	overflow: hidden;
		background-color: var(--base-white);
	& > div:first-child {
		position: absolute;
		z-index: 2;
		left: 0;
		top: 0;
		width: 14px;
		height: 68px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 80%);
		border-top-right-radius: 22px;
		border-bottom-right-radius: 22px;
		pointer-events: none;
		rotate: 180deg;
	}
	& > div:last-child {
		z-index: 2;
		position: absolute;
		right: 0px;
		top: 0;
		width: 14px;
		height: 68px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 80%);
		border-top-right-radius: 22px;
		border-bottom-right-radius: 22px;
		pointer-events: none;
	}
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

export const navBtn = (active: boolean,): string => {
	return css`
	white-space: nowrap;
	${montserratMidbold}
	color: ${active ? 'var(--base-white)' : 'var(--gray-700)'};
	display: flex;
	align-items: center;
	height: 36px;
	padding: 0px 16px;
	border-radius: 12px;
	width: max-content;
	background: ${active ? 'linear-gradient(180deg, #4069FB 0%, #6090F7 20.5%, #0F1AF1 100%) !important' : 'var(--base-white)'};
	&:hover {
		background-color: var(--primary-100);
	}
	& path {
		fill: currentColor;
	}
	border: none;
	outline: none !important;
	font-size: 14px;
`
}

export const navWrapper = css`
	display: flex;
	align-items: center;
	height: 100%;
	padding: 0px 12px;
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	position: relative;
	& > div:first-child {
		position: relative;
		margin-right: 7px;
		&::after {
			content: '';
			position: absolute;
			right: -7px;
			top: 0px;
			height: 36px;
			width: 1px;
			background-color: var(--primary-200);
		}
	}
	`

export const transactionBtn = css`
	position: relative;
`

export const navScrollContainer = (isShortList: boolean,): string => {
	return css`
	width: 100%;
	height: 100%;
	padding-left: 10px;
	display: flex;
	justify-content: ${isShortList ? 'none' : 'space-between'};
	overflow-x: auto;
	gap: ${isShortList ? '32px' : '8px'};
		::-webkit-scrollbar {
    	display: none;
  	}
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;
	& > div {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	cursor: grab;

	&:active {
		cursor: grabbing;
	}
`
}

export const navButtonItem = css`
	margin-right: 6px;
	width: 20px;
	height: 20px;
`

export const rightButton = css`
	position: absolute;
	right: 0.5%;
	height: 68px;
	width: 68px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--base-white);
`

export const leftButton = css`
	position: absolute;
	left: 144px;
	height: 68px;
	width: 68px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--base-white);
`