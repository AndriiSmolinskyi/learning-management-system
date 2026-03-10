/* eslint-disable complexity */
import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg, montserratMidbold,
} from '../../../../../shared/styles'

export const chartWrapper = css`
	position: relative;
	width:   100%;
	height: calc(100% - 46px);
	height: 320px;
	overflow: auto; 
	::-webkit-scrollbar {
		display: none;
	}
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;

	.recharts-tooltip-cursor {
		pointer-events: none !important;
		fill: none !important;
	}
`

export const horizontalWrapper = css`
	position: relative;
	width:   100%;
	padding: 4px 4px;
	height: calc(100% - 0px);
	overflow-y: auto;
	::-webkit-scrollbar {
		display: none;
	}
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;

	.recharts-tooltip-cursor {
		pointer-events: none !important;
		fill: none !important;
	}
	overflow-x: hidden;
`

export const cellStyle = css`
	fill: var(--primary-400);
`

export const asisStyle = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	text-align: center;
	word-wrap: break-word;
	color: var(--gray-700);
	& > text, tspan {	 
		color: var(--gray-700);
		fill: var(--gray-700);
	}
	padding-left: 20px;
`

export const columnLabel = css`
  fill: blue;
  ${montserratMidbold}
  font-size: 12px;
`

export const barStyle = css`
	cursor: pointer;
`

export const horizontalText = css`
	margin-top: 20px;
`

export const labelBar = css`
	${montserratMediumReg}
	font-size: 12px;
	fill: var(--gray-700);
`

export const some = css`
	padding-right: 40px;
`

export const asisStyleHorizontal = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	text-align: center;
	word-wrap: break-word;
	color: var(--gray-700);

	& > text, tspan {	 
		color: var(--gray-700);
		fill: var(--gray-700);
	}
`

export const toolTipsStyle = css`
	background-color: white;
   border: 1px solid #ccc;
   padding: 10px;
   border-radius: 4px;
   z-index: 1000;
   width: 200px;
`

export const horizontalTooltipStyle = (coordinate: { x?: number; y?: number },): string => {
	const screenHeight = window.innerHeight

	let topOffset = 430
	if (screenHeight >= 800 && screenHeight < 900) {
		topOffset = 480
	} else if (screenHeight >= 900 && screenHeight < 1000) {
		topOffset = 530
	} else if (screenHeight >= 1000 && screenHeight < 1100) {
		topOffset = 580
	} else if (screenHeight >= 1100 && screenHeight < 1200) {
		topOffset = 630
	} else if (screenHeight >= 1200 && screenHeight < 1300) {
		topOffset = 680
	} else if (screenHeight >= 1300) {
		topOffset = 800
	} else if (screenHeight >= 700 && screenHeight < 800) {
		topOffset = 380
	} else if (screenHeight >= 600 && screenHeight < 700) {
		topOffset = 330
	}

	return css`
	position: fixed;
	top: ${coordinate.y ?
		coordinate.y + topOffset :
		topOffset}px;
	left: ${coordinate.x ?
		coordinate.x + 120 :
		0}px;
	${toolTipsStyle}
  `
}

export const verticalTooltipStyle = (coordinate: { x?: number; y?: number }, index: number, totalItems: number,): string => {
	let topPosition = 0
	if (coordinate.y) {
		topPosition = coordinate.y - 32
	}
	return css`
	position: fixed;
	top: ${topPosition + 280}px;
	left: ${coordinate.x}px;
	${toolTipsStyle}
  `
}

