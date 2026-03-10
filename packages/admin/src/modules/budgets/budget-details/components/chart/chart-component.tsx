import type {
	SVGProps,
} from 'react'
import React from 'react'
import {
	BarChart,
	Bar,
	Cell,
	ResponsiveContainer,
	XAxis,
	LabelList,
	Tooltip,
	// Text,
} from 'recharts'
import type {
	TAnalyticsChartData,
} from '../../../../../shared/types'
import {
	VerticalBarLabel,
} from '../../../../../shared/components/bar-chart/vertical-bar-chart-label.component'
import type {
	TooltipProps,
} from 'recharts'

import * as styles from './chart.styles'

type Props<T extends string | number = string> = {
	data: Array<TAnalyticsChartData<T>>
	handleBarClick?: (data: TAnalyticsChartData<T>) => void
	width?: number
	toolTipName?: string
	gap?: number
}

type CustomizedAxisTickProps = {
	x: number;
	y: number;
	payload: { value: string | number };
	width?: number
  }

  interface IPayloadItem {
  name: string;
  value: number;
}
const CustomizedAxisTick: React.FC<CustomizedAxisTickProps> = ({
	x, y, payload, width,
},) => {
	const [name, amount,] = String(payload.value,).split(/\s(?=\$)/,)

	return (
		// <Text x={x} y={y} width={width ?? 75} textAnchor='middle' verticalAnchor='start'>
		// 	{payload.value}
		// </Text>
		<g transform={`translate(${x}, ${y})`}>
			<text textAnchor='middle'>
				<tspan x='0' dy='6'>{name}</tspan>
				<tspan x='0' dy='16'>{amount}</tspan>
			</text>
		</g>
	)
}

export const BudgetBarChart = <T extends string | number = string>({
	data,
	handleBarClick,
	width = 150,
	gap = 8,
	toolTipName,
}: Props<T>,): React.ReactNode => {
	const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
		active, payload, label,
	},): React.ReactNode => {
		if (active && payload?.length) {
			const data: IPayloadItem = payload[0]?.payload as IPayloadItem
			return (
				<div className={styles.toolTipsStyle}>
					<p>{`Bank name: ${data.name}`}</p>
					<p>Value USD: {data.value.toLocaleString('en-US', {
						maximumFractionDigits: 0,
					},)}</p>
				</div>
			)
		}

		return null
	}
	return (
		<div className={styles.chartWrapper}>
			<ResponsiveContainer
				width={(data.length * (width + gap))}
				minWidth={550}
			>
				<BarChart
					data={data}
					barGap={data.length ?
						0 :
						gap}
					margin={{
						top: 17, right: 0, left: 0,
					}
					}
				>
					<XAxis
						orientation='top'
						xAxisId={1}
						dataKey={'value'}
						type='category'
						axisLine={false}
						tickLine={false}
						className={styles.asisStyle}
						mirror
						tickFormatter={(tick: number,) => {
							return `$${tick.toLocaleString('en-US', {
								maximumFractionDigits: 0,
							},)}`
						}}
						hide
					/>
					<XAxis
						xAxisId={0}
						height={34}
						dataKey='name'
						axisLine={false}
						tickLine={false}
						className={styles.asisStyle}
						tickFormatter={(tick: string,) => {
							return tick.slice(0, 5,)
						}}
						tick={	((props: { x: number; y: number; payload: { value: string | number } },) => {
							return <CustomizedAxisTick {...props} width={width}/>
						}
								) as unknown as SVGProps<SVGTextElement>}
					/>
					<Bar
						barSize={width}
						dataKey='value'
						radius={[8, 8, 0, 0,]}
						xAxisId={1}
						onClick={handleBarClick}
						className={styles.barStyle}
					>
						<LabelList content={<VerticalBarLabel />}/>
						{data.map((entry, index,) => {
							return (
								<Cell
									key={`cell-${entry.name}-${entry.value}`}
									className={styles.cellStyle}
									width={width}
								/>
							)
						},)}
					</Bar>
					<Tooltip content={CustomTooltip}/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}