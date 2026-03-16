/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import {
	BarChart,
	Bar,
	Cell,
	ResponsiveContainer,
	XAxis,
	LabelList,
	Tooltip,
} from 'recharts'
import type {
	TAnalyticsChartData,
} from '../../types'
import {
	VerticalBarLabel,
} from './vertical-bar-chart-label.component'
import {
	colors,
} from '../../styles'

import * as styles from './bar-chart.styles'

type Props<T extends string | number = string> = {
	data: Array<TAnalyticsChartData<T>>
	handleBarClick?: (data: TAnalyticsChartData<T>) => void
	width?: number
	toolTipName?: string
	idValue?: string | undefined
	nameValue?: Array<string | number>
}

export const VerticalBarChart = <T extends string | number = string>({
	data: sourceData,
	handleBarClick,
	width = 47,
	toolTipName,
	idValue,
	nameValue,
}: Props<T>,): React.ReactNode => {
	const wrapperRef = React.useRef<HTMLDivElement>(null,)
	const [barHovered, setBarHovered,] = React.useState(false,)

	const data = sourceData

	const getOpacity = ({
		id, name,
	}: { id: string | undefined, name: string | number },): number => {
		return ((idValue === undefined) && (nameValue === undefined) ?
			1 :
			((idValue !== undefined && idValue === id) || nameValue?.includes(name,)) ?
				1 :
				0.4)
	}

	const hasNegativeValue = sourceData.some((entry,) => {
		return (entry.value < 0 || (entry.diff !== undefined && entry.diff < 0))
	},)

	return (
		<div className={styles.chartWrapper} ref={wrapperRef}>
			<ResponsiveContainer
				width={data.length * (width + 12)}
				minWidth={550}
			>
				<BarChart
					data={data}
					barGap={30}
					margin={{
						top:    17,
						left:   5,
						bottom: hasNegativeValue ?
							10 :
							0,
					}}
				>
					<XAxis
						dataKey='name'
						axisLine={false}
						tickLine={false}
						className={styles.asisStyle}
						tickFormatter={(tick: string,) => {
							return tick.slice(0, 5,)
						}}
						tick={{
							dy: hasNegativeValue ?
								10 :
								0,
						}}
					/>
					<Bar
						barSize={width}
						dataKey='value'
						radius={[4, 4, 0, 0,]}
						stackId='a'
						animationDuration={100}
						onClick={handleBarClick}
						fill={colors.primary400}
						className={styles.barStyle}
						onMouseEnter={() => {
							setBarHovered(true,)
						}}
						onMouseLeave={() => {
							setBarHovered(false,)
						}}
						// minPointSize={25}
						minPointSize={1}
					>
						<LabelList content={<VerticalBarLabel wrapperRef={wrapperRef} data={data} handleBarClick={handleBarClick}/>} onMouseEnter={() => {
							setBarHovered(true,)
						}}
						onMouseLeave={() => {
							setBarHovered(false,)
						}}/>
						{data.map((entry,) => {
							const hasSecondBar = entry.diff !== undefined && entry.diff < 0 ?
								entry.value > entry.diff :
								entry.value < 0 ?
									entry.value > (entry.diff ?? 0) + entry.value :
									entry.value < (entry.diff ?? 0) + entry.value
							// todo: Remove after chart test
							// const hasSecondBar = entry.diff !== undefined && entry.diff !== 0
							if (hasSecondBar) {
								return (
									<Cell
										opacity={getOpacity({
											id:   entry.id,
											name: entry.name,
										},)}
										key={`cell-${entry.name}-${entry.value}`}
										width={width}
										radius={0}
									/>
								)
							}
							return (
								<Cell
									opacity={getOpacity({
										id:   entry.id,
										name: entry.name,
									},)}
									key={`cell-${entry.name}-${entry.value}`}
									width={width}
								/>
							)
						},)}
					</Bar>
					<Bar
						barSize={width}
						animationDuration={100}
						opacity={0.4}
						dataKey='diff'
						radius={[6, 6, 0, 0,]}
						stackId='a'
						onClick={handleBarClick}
						className={styles.barStyle}
						fill={colors.primary400}
						onMouseEnter={() => {
							setBarHovered(true,)
						}}
						onMouseLeave={() => {
							setBarHovered(false,)
						}}
					>
						{data.map((entry,) => {
							return (
								entry.diff ?
									<Cell
										key={`cell-${entry.name}-${entry.diff}`}
										width={width}
									/> :
									null
							)
						},)}
					</Bar>
					<Tooltip
						active={barHovered}
						cursor={false}
						content={({
							active, payload, coordinate,
						},) => {
							if (active && payload && payload.length > 0) {
								const {
									name, value,
								} = payload[0]?.payload || {
								}
								const safeCoordinate = coordinate ?? {
									x: 0, y: 0,
								}
								const index = data.findIndex((entry,) => {
									return entry.name === name
								},)
								return (
									<div className={styles.verticalTooltipStyle(safeCoordinate, index, data.length,)} key={index}>
										<p>{toolTipName ?
											`${toolTipName}: ${name}` :
											`Currency name: ${name}`}</p>
										<p>Value USD: {value.toLocaleString('en-US', {
											maximumFractionDigits: 0,
										},)}</p>
									</div>
								)
							}
							return null
						}}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}