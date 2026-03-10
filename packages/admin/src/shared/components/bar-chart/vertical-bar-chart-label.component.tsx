/* eslint-disable no-nested-ternary */
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
import type {
	TAnalyticsChartData,
} from '../../../shared/types'

import * as styles from './bar-chart.styles'

type CustomLabelProps<T extends string | number = string | number> = Omit<SVGProps<SVGTextElement>, 'viewBox'> & LabelProps & {
  wrapperRef?: React.RefObject<HTMLDivElement>;
  data?: Array<TAnalyticsChartData<T>>
  handleBarClick?: (data: TAnalyticsChartData<T>) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
};

export const VerticalBarLabel = <T extends string | number = string | number>({
	x,
	y,
	width,
	height,
	value,
	wrapperRef,
	data,
	handleBarClick,
	onMouseEnter,
	onMouseLeave,
}: CustomLabelProps<T>,): React.JSX.Element => {
	const [textWidth, setTextWidth,] = useState(0,)
	const textRef = useRef<SVGTextElement>(null,)

	const formatNumber = (value: number,): string => {
		if (isNaN(value,)) {
			return '0'
		}

		const absValue = Math.abs(value,)
		if (absValue >= 1_000_000_000) {
			const result = (value / 1_000_000_000).toFixed(1,)
			return result.endsWith('.0',) ?
				`${result.replace('.0', '',)}B` :
				`${result}B`
		} else if (absValue >= 1_000_000) {
			const result = (value / 1_000_000).toFixed(1,)
			return result.endsWith('.0',) ?
				`${result.replace('.0', '',)}M` :
				`${result}M`
		} else if (absValue >= 1_000) {
			const result = (value / 1_000).toFixed(1,)
			if (absValue >= 100_000 && absValue < 1_000_000) {
				return `${Math.round(value / 1_000,)}K`
			}
			return result.endsWith('.0',) ?
				`${result.replace('.0', '',)}K` :
				`${result}K`
		}

		return value.toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		},)
	}

	useEffect(() => {
		if (textRef.current) {
			const {
				width,
			} = textRef.current.getBBox()
			setTextWidth(width,)
		}
	}, [value,],)

	// const containerHeight = wrapperRef?.current?.getBoundingClientRect().height ?? 0
	// const yPos = containerHeight - containerHeight + 10

	const numericValue = typeof value === 'number' ?
		value :
		0

	const xPos = typeof x === 'number' && typeof width === 'number' ?
		x + width / 2 - textWidth / 2 :
		0

	const yPos = typeof y === 'number' && typeof height === 'number' ?
		(numericValue < 0 ?
			y + 10 :
			y - 10) :
		0

	return (
		<text
			ref={textRef}
			x={xPos}
			y={yPos}
			alignmentBaseline='middle'
			textAnchor='start'
			className={styles.labelBar}
			onClick={() => {
				const searchedBarData = data?.find((bar,) => {
					return bar.value === value
				},)
				if (searchedBarData && handleBarClick) {
					handleBarClick(searchedBarData,)
				}
			}
			}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{`$${formatNumber(Number(value,),)}`}
		</text>
	)
}
