/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable no-mixed-operators */

import type {
	SVGProps,
} from 'react'
import React from 'react'
import type {
	LabelProps,
} from 'recharts'
import type {
	TAnalyticsChartData,
} from '../../types'

import * as styles from './bar-chart.styles'

type CustomLabelProps<T extends string | number = string> = Omit<SVGProps<SVGTextElement>, 'viewBox'> & LabelProps & {
  wrapperRef?: React.RefObject<HTMLDivElement>;
  data?: Array<TAnalyticsChartData<T>>
  handleBarClick?: (data: TAnalyticsChartData<T>) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
};

export const CustomLabel = <T extends string | number = string>({
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
	// const containerWidth = wrapperRef?.current?.getBoundingClientRect().width ?? 0
	// const xPos = containerWidth - 60

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
			const formattedResult = result.endsWith('.0',) ?
				`${result.replace('.0', '',)}K` :
				`${result}K`
			return formattedResult
		}

		return value.toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		},)
	}

	const numericValue = typeof value === 'number' ?
		value :
		0

	const xPos = typeof x === 'number' && typeof width === 'number' ?
		(numericValue < 0 ?
			x + width - 45 :
			x + width + 8) :
		0

	const yPos = typeof y === 'number' && typeof height === 'number' ?
		y + height / 2 :
		0

	return (
		<text
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