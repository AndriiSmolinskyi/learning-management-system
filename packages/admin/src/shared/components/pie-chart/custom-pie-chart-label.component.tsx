/* eslint-disable no-mixed-operators */
import React from 'react'
import type {
	PieLabel,
} from 'recharts'

import * as styles from './pie-chart.styles'

const RADIAN = Math.PI / 180

type CustomLabelProps = {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percent: number;
	name?: string;
}

export const CustomPieLabel: PieLabel<CustomLabelProps> | undefined = (props,) => {
	const {
		cx, cy, midAngle, innerRadius, outerRadius, percent, name,
	} = props

	if (percent < 0.2) {
		return null
	}

	const radius = innerRadius + (outerRadius - innerRadius) * 0.5
	const x = cx + radius * Math.cos(-midAngle * RADIAN,)
	const y = cy + radius * Math.sin(-midAngle * RADIAN,)

	return (
		<text
			className={styles.labelStyle}
			fill='#ffffff'
			textAnchor='middle'
			dominantBaseline='middle'
		>
			<tspan x={x} y={y - 10} >
				{(percent * 100).toFixed(1,)}%
			</tspan>
			<tspan x={x} y={y + 10}>
				{name}
			</tspan>
		</text>
	)
}