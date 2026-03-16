/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'

import {
	montserratMediumReg,
	montserratMidbold,
	spaces,
} from '../../styles'

export const collapseArrowButton = (isOpen: boolean,): string => {
	return css`
   	background-color: transparent;
   	outline: none !important;
   	border: none;
   	transition: all 300ms ease;
   	transform: ${isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
		& path {
			fill: ${isOpen ? 'var(--primary-600)' : 'var(--gray-600)'};
		}
		width: 36px;
		height: 36px;
		display: flex;
		justify-content: center;
		align-items: center;
`
}

export const collapseHeaderBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: var(--white);
	`

export const collapseBlock = (isOpen: boolean,): string => {
	return css`
	  display: flex;
		flex-direction: column;
		padding: ${spaces.small};
		background-color: ${isOpen ? 'var(--primary-50)' : 'var(--gray-25)'};
		border-radius: 12px;
		transition: background-color 0.25s linear;
    `
}

export const topInfoText = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
`

export const bottomInfoText = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	text-align: left;
	color: var(--gray-500);
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: normal;
	word-wrap: break-word;
	overflow-wrap: break-word;
	max-width: 311px;
`

export const fieldsBlock = (isOpen: boolean, isDocument?: boolean,): string => {
	const maxHeight = isDocument ? '1000px' : '100%'
	return css`
		margin-top: ${isOpen ? '16px' : '0px'};
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		opacity: ${isOpen ? 1 : 0};
		max-height: ${isOpen ? maxHeight : '0px'};
		transition: all 0.25s linear;
		pointer-events: ${isOpen ? 'auto' : 'none'};
	`
}

export const topInfo = css`
	padding: 0px 6px;
	display: flex;
	flex-direction: column;
`

export const details = css`
	width: 304px;
	height: 34px;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;

	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-500);
`
