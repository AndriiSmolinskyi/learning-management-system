/* eslint-disable no-mixed-operators */

import type {
	SVGProps,
} from 'react'
import React from 'react'
import type {
	LabelProps,
} from 'recharts'

import {
	formatNumber,
} from '../../custom-report.utils'

import * as styles from '../../custom-report.styles'

export const HorizontalLabel = ({
	x,
	y,
	width,
	height,
	value,
}: Omit<SVGProps<SVGTextElement>, 'viewBox'> & LabelProps,): React.JSX.Element => {
	const xPos = typeof x === 'number' && typeof width === 'number' ?
		x + width + 8 :
		0

	const yPos = typeof y === 'number' && typeof height === 'number' ?
		y + height / 2 :
		0

	return <>
		{formatNumber(Number(value,),) && (
			<text
				x={xPos}
				y={yPos}
				alignmentBaseline='middle'
				textAnchor='start'
				className={styles.labelBar}
			>
				{`$${formatNumber(Number(value,),)}`}
			</text>)}
	</>
}