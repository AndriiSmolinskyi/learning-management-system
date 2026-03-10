/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import ReactDOM from 'react-dom'

import {
	BarChart,
	Bar,
	Cell,
	ResponsiveContainer,
	XAxis,
	YAxis,
	LabelList,
	Tooltip,
} from 'recharts'
import {
	CustomLabel,
} from './custom-bar-chart-label.component'
import type {
	TAnalyticsChartData,
} from '../../types'
import {
	colors,
} from '../../../shared/styles'

import * as styles from './bar-chart.styles'

type Props<T extends string | number = string> = {
	data: Array<TAnalyticsChartData<T>>
	handleBarClick?: (data: TAnalyticsChartData<T>) => void
	height?: number
	toolTipName?: string
	idValue?: string | undefined
	nameValue?: Array<string | number>
	right?: boolean
	isAssetClicked?: boolean
}

export const HorizontalBarChart = <T extends string | number = string>({
	data: sourceData,
	handleBarClick,
	height = 47,
	toolTipName,
	idValue,
	nameValue,
	right,
	isAssetClicked,
}: Props<T>,): React.ReactNode => {
	// todo: clear if good
	// const data = sourceData.filter((item,) => {
	// 	return item.value >= 0
	// },)
	// const [windowWidth, setWindowWidth,] = React.useState(window.innerWidth,)
	// React.useEffect(() => {
	// 	const handleResize = (): void => {
	// 		setWindowWidth(window.innerWidth,)
	// 	}
	// 	window.addEventListener('resize', handleResize,)
	// 	return () => {
	// 		window.removeEventListener('resize', handleResize,)
	// 	}
	// }, [],)

	const data = sourceData
	const [barHovered, setBarHovered,] = React.useState(false,)

	const wrapperRef = React.useRef<HTMLDivElement>(null,)

	const getOpacity = ({
		id, name,
	}:{id: string | undefined, name : string | number},): number => {
		return ((idValue === undefined) && (nameValue === undefined) ?
			1 :
			idValue === id || nameValue?.includes(name,) ?
				1 :
				0.4)
	}

	const hasNegativeValue = sourceData.some((entry,) => {
		return (entry.value < 0 || (entry.diff !== undefined && entry.diff < 0))
	},)
	return (
		<div className={styles.horizontalWrapper} ref={wrapperRef}>
			<ResponsiveContainer
				height={data.length * (height + 12)}
				width='100%'
			>
				<BarChart
					data={data}
					layout='vertical'
				>
					<XAxis
						hide
						axisLine={false}
						type='number'
						domain={[0, 100,]}
						padding={{
							right: 60,
							left:  hasNegativeValue ?
								55 :
								0,
						}}
					/>
					<YAxis
						dataKey={'name'}
						type='category'
						axisLine={false}
						tickLine={false}
						className={styles.asisStyleHorizontal}
						width={100}
					/>
					<Bar
						dataKey='value'
						stackId='a'
						radius={[0, 4, 4, 0,]}
						onClick={handleBarClick}
						animationDuration={100}
						className={styles.barStyle}
						fill={colors.primary400}
						onMouseEnter={() => {
							setBarHovered(true,)
						}}
						onMouseLeave={() => {
							setBarHovered(false,)
						}}
						// todo: Remove after chart test
						// minPointSize={isAssetClicked ?
						// 	0 :
						// 	20}
						minPointSize={1}
					>
						<LabelList content={<CustomLabel wrapperRef={wrapperRef} handleBarClick={handleBarClick} data={data} onMouseEnter={() => {
							setBarHovered(true,)
						}}
						onMouseLeave={() => {
							setBarHovered(false,)
						}}/>}/>
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
										key={entry['name']}
										opacity={getOpacity({
											id:   entry.id,
											name: entry.name,
										},)}
										height={height}
										radius={0}
									/>
								)
							}
							return (
								<Cell
									key={entry['name']}
									opacity={getOpacity({
										id:   entry.id,
										name: entry.name,
									},)}
									height={height}
								/>
							)
						},)}
					</Bar>
					<Bar
						opacity={0.4}
						dataKey='diff'
						radius={[0, 6, 6, 0,]}
						stackId='a'
						onClick={handleBarClick}
						animationDuration={100}
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
								<Cell
									key={entry['name']}
									height={height}
								/>
							)
						},)}
					</Bar>
					<Tooltip
						active={barHovered}
						cursor={false}
						content={({
							active, payload, coordinate,
						},) => {
							const [pos, setPos,] = React.useState<{ x: number | null; y: number | null }>({
								x: null,
								y: null,
							},)
							React.useEffect(() => {
								const handleMove = (e: MouseEvent,): void => {
									setPos({
										x: e.clientX - 200, y: e.clientY - 60,
									},)
								}
								window.addEventListener('mousemove', handleMove,)
								return () => {
									window.removeEventListener('mousemove', handleMove,)
								}
							}, [],)
							if (active && payload && payload.length > 0 && pos.x !== null && pos.y !== null) {
								const {
									name, value,
								} = payload[0]?.payload || {
								}
								const safeCoordinate = coordinate ?? {
									x: 0, y: 0,
								}
								return ReactDOM.createPortal(
									<div
										className={styles.horizontalTooltipStyle(safeCoordinate,)}
										style={{
											left: `${pos.x}px`,
											top:  `${pos.y}px`,
										}}
									>
										<p>{toolTipName ?
											`${toolTipName}: ${name}` :
											`Bank name: ${name}`}</p>
										<p>Value USD: {value.toLocaleString('en-US', {
											maximumFractionDigits: 0,
										},)}</p>
									</div>,
									document.body,
								)

								// todo: Remove after new logic tested
								// if (safeCoordinate.x && right) {
								// 	if (windowWidth - (safeCoordinate.x + (windowWidth / 2.1)) > 300) {
								// 		safeCoordinate.x = safeCoordinate.x + (windowWidth / 2.1)
								// 	} else {
								// 		safeCoordinate.x = safeCoordinate.x + (windowWidth / 2.6)
								// 	}
								// }
								// return (
								// 	<div className={styles.horizontalTooltipStyle(safeCoordinate,)}>
								// 		<p>{toolTipName ?
								// 			`${toolTipName}: ${name}` :
								// 			`Bank name: ${name}`}</p>
								// 		<p>Value USD: {value.toLocaleString('en-US', {
								// 			maximumFractionDigits: 0,
								// 		},)}</p>
								// 	</div>
								// )
							}
							return null
						}}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}
