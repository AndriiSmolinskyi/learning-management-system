/* eslint-disable max-depth */
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
	padding: 4px 4px;
	height: calc(100% - 46px);
	overflow-x: auto;
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
`

export const horizontalWrapper = css`
	position: relative;
	width:   100%;
	padding: 4px 4px;
	height: calc(100% - 46px);
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
	// todo: Remove after new logic tested
	// const screenHeight = window.innerHeight
	// let topOffset = 330
	// if (screenHeight >= 600 && screenHeight < 700) {
	// 	topOffset = 380
	// } else if (screenHeight >= 700 && screenHeight < 800) {
	// 	topOffset = 430
	// } else if (screenHeight >= 800 && screenHeight < 900) {
	// 	topOffset = 480
	// } else if (screenHeight >= 900 && screenHeight < 1000) {
	// 	topOffset = 530
	// } else if (screenHeight >= 1000 && screenHeight < 1100) {
	// 	topOffset = 580
	// } else if (screenHeight >= 1100 && screenHeight < 1200) {
	// 	topOffset = 630
	// } else if (screenHeight >= 1200 && screenHeight < 1300) {
	// 	topOffset = 680
	// } else if (screenHeight >= 1300 && screenHeight < 1400) {
	// 	topOffset = 720
	// } else if (screenHeight >= 1400 && screenHeight < 1500) {
	// 	topOffset = 770
	// } else if (screenHeight >= 1500 && screenHeight < 1600) {
	// 	topOffset = 820
	// } else if (screenHeight >= 1600 && screenHeight < 1700) {
	// 	topOffset = 870
	// } else if (screenHeight >= 1700 && screenHeight < 1800) {
	// 	topOffset = 920
	// } else if (screenHeight >= 1800 && screenHeight < 1900) {
	// 	topOffset = 970
	// } else if (screenHeight >= 1900 && screenHeight < 2000) {
	// 	topOffset = 1020
	// } else if (screenHeight >= 2000 && screenHeight < 2100) {
	// 	topOffset = 1070
	// } else if (screenHeight >= 2100 && screenHeight < 2200) {
	// 	topOffset = 1120
	// } else if (screenHeight >= 2200 && screenHeight < 2300) {
	// 	topOffset = 1170
	// } else if (screenHeight >= 2300 && screenHeight < 2400) {
	// 	topOffset = 1220
	// } else if (screenHeight >= 2400 && screenHeight < 2500) {
	// 	topOffset = 1270
	// } else if (screenHeight >= 2500 && screenHeight < 2600) {
	// 	topOffset = 1320
	// } else if (screenHeight >= 2600 && screenHeight < 2700) {
	// 	topOffset = 1370
	// } else if (screenHeight >= 2700 && screenHeight < 2800) {
	// 	topOffset = 1420
	// } else if (screenHeight >= 2800 && screenHeight < 2900) {
	// 	topOffset = 1470
	// } else if (screenHeight >= 2900 && screenHeight < 3000) {
	// 	topOffset = 1520
	// }
	// 	return css`
	//     position: fixed;
	//     top: ${coordinate.y ?
	// 		coordinate.y + topOffset :
	// 		topOffset}px;
	//     left: ${coordinate.x ?
	// 		coordinate.x + 120 :
	// 		0}px;
	//     ${toolTipsStyle}
	//   `
	// 	return css`
	//     ${toolTipsStyle}
	//   `

	return css`
  ${toolTipsStyle}
  position: absolute;
  z-index: 9999999;
  pointer-events: none;
`
}

export const verticalTooltipStyle = (coordinate: { x?: number; y?: number }, index: number, totalItems: number,): string => {
	let leftPosition = 0
	let topPosition = 0

	if (coordinate.x) {
		if (totalItems > 6) {
			if (index >= 6) {
				leftPosition = coordinate.x - 215
			} else {
				leftPosition = coordinate.x + 10
			}
		} else {
			leftPosition = coordinate.x + 10
		}
	}

	if (coordinate.y) {
		topPosition = coordinate.y - 30
	}

	return css`
    position: absolute;
    top: ${topPosition}px;
    left: ${leftPosition}px;
    ${toolTipsStyle}
  `
}

