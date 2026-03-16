/* eslint-disable complexity */
import React from 'react'
import {
	ResponsiveContainer,
	PieChart as Chart,
	Pie,
	Cell,
	Tooltip,
} from 'recharts'
import {
	CustomPieLabel,
} from './custom-pie-chart-label.component'
import {
	colors,
} from '../../styles'
import type {
	TAnalyticsChartData,
} from '../../types'
import {
	cx,
} from '@emotion/css'
import * as styles from './pie-chart.styles'

type Props<T extends string | number = string> = {
	data: Array<TAnalyticsChartData<T>> | undefined
	handlePieClick?: (data: TAnalyticsChartData<T>) => void
	handleClear?: () => void
	toolTipName?: string
	wrapperClassName?: string
	idValue?: string | undefined
	nameValue?: Array<string | number>
	clearChartOpacity?: boolean
}

const COLORS = [
	colors.primary600,
	colors.primary500,
	colors.primary400,
	colors.primary300,
	colors.primary200,
	colors.primary100,
]

const INNER_RADIUS = 40

export const PieChart = <T extends string | number = string>({
	data: sourceData,
	handlePieClick,
	handleClear,
	toolTipName,
	wrapperClassName,
	idValue,
	nameValue,
	clearChartOpacity,
}: Props<T>,): React.ReactNode => {
	const [tooltipVisible, setTooltipVisible,] = React.useState<boolean>(true,)
	const [chartLoaded, setChartLoaded,] = React.useState<boolean>(false,)
	const [activeIndex, setActiveIndex,] = React.useState<number | undefined>()
	React.useEffect(() => {
		const timeout = setTimeout(() => {
			setChartLoaded(true,)
		}, 100,)

		return () => {
			clearTimeout(timeout,)
		}
	}, [],)
	const data = sourceData?.filter((item,) => {
		return item.value >= 0
	},)
	const getOpacity = ({
		id,
		name,
		index,
	}: {
		id: string | undefined,
			name: string | number,
			index: number
	},): number => {
		if (activeIndex === index) {
			return 0.8
		}
		return 1
	}
	React.useEffect(() => {
		if (clearChartOpacity === true) {
			setActiveIndex(undefined,)
		}
	}, [clearChartOpacity,],)
	return (
		<div className={cx(styles.chartWrapper, wrapperClassName,)}>
			<ResponsiveContainer width='100%' height='100%'>
				<Chart>
					<Pie
						data={data}
						cx='50%'
						cy='50%'
						labelLine={false}
						label={CustomPieLabel}
						dataKey='value'
						onClick={handlePieClick}
						animationDuration={600}
						className={styles.pieStyle}
						stroke='currentColor'
						paddingAngle={0}
						innerRadius={handleClear ?
							INNER_RADIUS :
							0.15}
						minAngle={5}
					>
						{data?.map((entry, index,) => {
							return (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length === 5 ?
										2 :
										index % COLORS.length]}
									color={COLORS[index % COLORS.length === 5 ?
										2 :
										index % COLORS.length]}
									opacity={getOpacity({
										id:   entry.id,
										name: entry.name,
										index,
									},)}
									onClick={() => {
										if (index === activeIndex) {
											setActiveIndex(undefined,)
										} else {
											setActiveIndex(index,)
										}
									}}
									className={styles.hover}
									stroke={data.length > 1 ?
										'#ffffff' :
										'none'}
									strokeWidth={data.length > 1 ?
										0.5 :
										0}
								/>
							)
						},)}
					</Pie>
					{handleClear && (
						<Pie
							data={[{
								value: 1,
							},]}
							dataKey='value'
							cx='50%'
							cy='50%'
							outerRadius={INNER_RADIUS}
							animationDuration={100}
							fill='#ffffff'
							className={styles.pieStyle}
							onClick={() => {
								handleClear()
								setTooltipVisible(true,)
							}}
							onMouseEnter={() => {
								setTooltipVisible(false,)
							}}
							onMouseLeave={() => {
								setTooltipVisible(true,)
							}}
						/>)}
					{tooltipVisible && chartLoaded && (
						<Tooltip
							content={({
								active, payload, coordinate,
							},) => {
								if (active && payload && payload.length > 0) {
									const {
										name, value,
									} = payload[0]?.payload || {
									}
									const totalValue = data?.reduce((sum, entry,) => {
										return sum + entry.value
									}, 0,) ?? 0
									const percent = totalValue > 0 ?
										(value / totalValue) * 100 :
										0

									const safeCoordinate = coordinate ?? {
										x: 0, y: 0,
									}
									return (
										<div className={styles.tooltipStyle(safeCoordinate,)}>
											<p>{toolTipName} {name} - {value.toLocaleString('en-US', {
												maximumFractionDigits: 0,
											},)} ({`${Number(percent.toFixed(1,),) === 0 ?
												'~' :
												''}${percent.toFixed(1,)}%`})</p>
										</div>
									)
								}
								return null
							}}
						/>
					)}
				</Chart>
			</ResponsiveContainer>
		</div>
	)
}
