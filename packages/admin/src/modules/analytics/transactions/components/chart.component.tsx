/* eslint-disable complexity */
import React from 'react'
import {
	BarChart,
	Bar,
	Cell,
	ResponsiveContainer,
	XAxis,
	LabelList,
} from 'recharts'
import {
	ChevronUpBlue,
} from '../../../../assets/icons'
import {
	Loader,
} from '../../../../shared/components'
import type {
	TransactionPl,
} from '../../../../shared/types'
import {
	localeString,
} from '../../../../shared/utils'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'

import * as styles from '../transactions.styles'

export enum TransactionType {
	INCOME = 'Income',
	EXPENSE = 'Expense',
}

type Props = {
	plData?: TransactionPl
	plFetching: boolean
	isFilterApplied?: boolean
}

export const TransactionsChart: React.FunctionComponent<Props> = ({
	plData,
	plFetching,
	isFilterApplied,
},) => {
	const [isOpen, setIsOpen,] = React.useState(false,)
	const chartData = plData?.chartData ?? []
	return (
		<div className={styles.chartContainer(isOpen,)}>
			<div className={styles.chartHeader}>
				<p>P&L</p><ChevronUpBlue className={styles.chevronButton(isOpen,)} onClick={() => {
					setIsOpen(!isOpen,)
				}}/>
			</div>
			<div className={styles.collapse(isOpen,)}>
				<div className={styles.chartWrapper}>
					{!plFetching && Boolean(plData?.total === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} customText='Currently you dont have this transaction type in portfolio'/>}
					{!plFetching && !Boolean(plData?.total === 0,) && Boolean(chartData.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} customText='The selected transaction is non P&L transaction' />}
					{plFetching &&
					<Loader
						radius={6}
						width={150}
					/>
					}
					{!plFetching && !Boolean(chartData.length === 0,) && (!Boolean(chartData[0]?.value === 0,) || !Boolean(chartData[1]?.value === 0,)) && <ResponsiveContainer width='100%' height={120}>
						<BarChart
							data={chartData}
							barGap={8}
							margin={{
								top: 30,
							}}
						>
							<XAxis
								dataKey='name'
								axisLine={false}
								tickLine={false}
								className={styles.xAxisStyle}
								tick={{
									fill: 'var(--base-white)',
								}}
							/>
							<Bar
								dataKey='value'
								radius={[8, 8, 0, 0,]}
								barSize='100%'
								isAnimationActive
							>
								<LabelList
									dataKey='value'
									content={({
										x, y, width, value, name,
									},) => {
										const isIncome = name === TransactionType.INCOME
										return (
											<text
												x={Number(x,) + (Number(width,) / 2)}
												y={Number(y,) - 8}
												fill={isIncome ?
													'var(--green-600)' :
													'var(--error-600)'}
												textAnchor='middle'
												dominantBaseline='bottom'
												className={styles.xAxisStyle}
											>
												{Boolean(value,) && `${isIncome ?
													'+' :
													'-'}${localeString(Number(value,), 'USD', 0, false,)}`}
											</text>
										)
									}}
								/>
								{chartData.map((entry,) => {
									return (
										<Cell
											key={`cell-${entry.name}-${entry.value}`}
											className={styles.cellStyle(entry.name === TransactionType.INCOME,)}
										/>
									)
								},)}
							</Bar>
						</BarChart>
					</ResponsiveContainer>}
				</div>
			</div>
		</div>
	)
}