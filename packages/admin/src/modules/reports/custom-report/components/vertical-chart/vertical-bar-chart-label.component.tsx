/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
/* eslint-disable no-mixed-operators */
import React, {
	useRef, useEffect, useState,
} from 'react'
import type {
	SVGProps,
} from 'react'
import type {
	LabelProps,
} from 'recharts'

import {
	formatNumber,
} from '../../custom-report.utils'

import * as styles from '../../custom-report.styles'

export const VerticalBarLabel = ({
	x,
	y,
	width,
	height,
	value,
}: Omit<SVGProps<SVGTextElement>, 'viewBox'> & LabelProps,): React.JSX.Element => {
	const [textWidth, setTextWidth,] = useState(0,)
	const textRef = useRef<SVGTextElement>(null,)

	useEffect(() => {
		if (textRef.current) {
			const {
				width,
			} = textRef.current.getBBox()
			setTextWidth(width,)
		}
	}, [value,],)

	if (value === null || value === undefined) {
		return <></>
	}
	const xPos = typeof x === 'number' && typeof width === 'number' ?
		x + width / 2 - textWidth / 2 :
		0
	const yPos = typeof y === 'number' && typeof height === 'number' && typeof value === 'number' ?
		value < 0 ?
			y + 10 :
			y - 10 :
		0

	return (
		<text
			ref={textRef}
			x={xPos}
			y={yPos}
			alignmentBaseline='middle'
			textAnchor='start'
			className={styles.labelBar}
		>
			{`$${formatNumber(Number(value,),)}`}
		</text>
	)
}
