/* eslint-disable no-unused-expressions */
import {
	css,
} from '@emotion/css'
import {
	injectGlobal,
} from '@emotion/css'
import orbitronTtf from '../../assets/fonts/Orbitron.ttf'

injectGlobal`
  @font-face {
    font-family: 'Orbitron';
    src: url(${orbitronTtf}) format('truetype');
    font-weight: 100 1000;
    font-display: swap;
  }
`

const font = css`
	font-family: Orbitron, Arial, Helvetica, sans-serif;
 `

export const orbitronMax = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 900;
	`
}

export const orbitronBold = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 700;
	`
}

export const orbitronSemibold = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 600;
	`
}

export const orbitronMidBold = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 560;
	`
}

export const orbitronMedium = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 500;
	`
}

export const orbitronMediumReg = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 460;
	`
}

export const orbitronRegular = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 400;
	`
}

export const orbitronLight = (fontSize: number, lineHeight?: number,): string => {
	return css`
		${font}
		font-size: ${fontSize}px;
		line-height: ${lineHeight ?? fontSize * 1.4}px;
		font-weight: 300;
	`
}