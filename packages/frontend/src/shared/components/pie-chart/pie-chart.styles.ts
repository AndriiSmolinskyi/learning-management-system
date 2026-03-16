import {
	css,
} from '@emotion/css'

import {
	montserratMediumReg,
	montserratMidbold,
} from '../../styles'

export const chartWrapper = css`
	position: relative;
	width:   100%;
	height: calc(100% - 46px);
`

export const columnLabel = css`
  fill: blue;
  ${montserratMediumReg}
  font-size: 12px;
`

export const pieStyle = css`
	cursor: pointer;
	outline: none !important;
	& * {
		outline: none !important;
	}
`

export const labelText = css`
	${montserratMidbold}
	font-size: 12px;
`

export const labelStyle = css`
	pointer-events: none;
	${montserratMediumReg}
	font-size: 12px;
`

export const tooltipStyle = (coordinate: { x?: number; y?: number },): string => {
	return css`
    position: absolute;
    top: ${coordinate.y ?
		coordinate.y + 20 :
		0}px;
    left: ${coordinate.x ?
		coordinate.x - 50 :
		0}px;
    background-color: white;
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 4px;
    z-index: 1000;
    width: 140px;
	 font-size: 12px;
  `
}

export const hover = css`
	&:hover{
		opacity: 0.7;
	}
`
