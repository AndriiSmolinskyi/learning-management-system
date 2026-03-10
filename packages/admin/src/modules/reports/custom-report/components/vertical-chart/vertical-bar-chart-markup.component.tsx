/* eslint-disable complexity */
import React from 'react'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Label,
	LabelList,
	Legend,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../shared/components'
import {
	MoreVertical,
	PenSquare,
	Trash,
	XmarkMid,
} from '../../../../../assets/icons'
import {
	VerticalBarLabel,
} from './vertical-bar-chart-label.component'

import type {
	TBarContent,
} from '../../custom-report.types'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	formatNumber,
} from '../../custom-report.utils'
import {
	colors,
} from '../../../../../shared/styles'

import * as styles from '../../custom-report.styles'

type Name = {
	name: string
}

type Series1 = {
	'Series 1': number
}

type Series2 = {
	'Series 2': number
}

type Series3 = {
	'Series 3': number
}

type Props = {
	isEditor?: boolean
	barContent: TBarContent
	handleDelete?: VoidFunction
	handleEdit?: VoidFunction
}

export const VerticalBarChartMarkup: React.FC<Props> = ({
	isEditor = false,
	barContent,
	handleDelete,
	handleEdit,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	const data = barContent.content
		.map((item,) => {
			if (
				item.series1 !== undefined && !isNaN(item.series1,) &&
				item.series2 !== undefined && !isNaN(item.series2,) &&
				item.series3 !== undefined && !isNaN(item.series3,)
			) {
				return {
					name:       item.label,
					'Series 1': item.series1,
					'Series 2': item.series2,
					'Series 3': item.series3,
				} as Name & Series1 & Series2 & Series3
			}
			if (
				item.series1 !== undefined && !isNaN(item.series1,) &&
				item.series2 !== undefined && !isNaN(item.series2,)
			) {
				return {
					name:       item.label,
					'Series 1': item.series1,
					'Series 2': item.series2,
				} as Name & Series1 & Series2
			}
			if (
				item.series1 !== undefined && !isNaN(item.series1,) &&
				item.series3 !== undefined && !isNaN(item.series3,)
			) {
				return {
					name:       item.label,
					'Series 1': item.series1,
					'Series 3': item.series3,
				} as Name & Series1 & Series3
			}
			if (
				item.series2 !== undefined && !isNaN(item.series2,) &&
				item.series3 !== undefined && !isNaN(item.series3,)
			) {
				return {
					name:       item.label,
					'Series 2': item.series2,
					'Series 3': item.series3,
				} as Name & Series2 & Series3
			}
			if (item.series1 !== undefined && !isNaN(item.series1,)) {
				return {
					name:       item.label,
					'Series 1': item.series1,
				} as Name & Series1
			}
			if (item.series2 !== undefined && !isNaN(item.series2,)) {
				return {
					name:       item.label,
					'Series 2': item.series2,
				} as Name & Series2
			}
			if (item.series3 !== undefined && !isNaN(item.series3,)) {
				return {
					name:       item.label,
					'Series 3': item.series3,
				} as Name & Series3
			}
			return null
		},)
		.filter((item,): item is Name & (Series1 | Series2 | Series3) => {
			return item !== null
		},)

	const series1Shown = data.filter((item,): item is Name & Series1 => {
		return 'Series 1' in item
	},).length !== 0

	const series2Shown = data.filter((item,) => {
		return 'Series 2' in item
	},).length !== 0

	const series3Shown = data.filter((item,) => {
		return 'Series 3' in item
	},).length !== 0

	const content = (
		<div className={styles.dialogContainer}>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={handleEdit}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit chart',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={handleDelete}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete chart',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
			</div>
		</div>
	)

	return (
		<div className={styles.pieChartWrapper(isEditor,)}>
			{!isEditor && (
				<div>
					<Popover
						usePortal={false}
						hasBackdrop={false}
						placement='bottom-end'
						content={content}
						popoverClassName={cx(
							styles.popoverContainer,
							Classes.POPOVER_DISMISS,
						)}
						onClose={() => {
							setIsPopoverShown(false,)
						}}
					>
						<Button<ButtonType.ICON>
							onClick={toggleState(setIsPopoverShown,)}
							className={cx(isPopoverShown && styles.closeBtn,)}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.SMALL,
								color:   Color.BLUE,
								icon:    isPopoverShown ?
									<XmarkMid width={20} height={20} />			:
									<MoreVertical width={20} height={20} />	,
							}}
						/>
					</Popover>
				</div>
			)}
			{barContent.name && (
				<h5>{barContent.name}</h5>
			)}
			<ResponsiveContainer
				width='100%'
				height='100%'
			>
				<BarChart
					data={data}
					margin={{
						top:    barContent.name ?
							32 :
							8,
						left:   16,
						right:  16,
						bottom: barContent.legend ?
							8 :
							24,
					}}
				>
					<CartesianGrid
						vertical={false}
						stroke={colors.gray100}
						fill={colors.baseWhite}
					/>
					<XAxis
						type='category'
						tickLine={false}
						stroke={colors.gray200}
						className={styles.asisStyleHorizontal}
						dataKey={'name'}
					>
						<Label
							offset={-10}
							value={barContent.xAxis}
							position='insideBottom'
						/>
					</XAxis>
					<YAxis
						tickFormatter={(value,) => {
							return formatNumber(value,) ?? ''
						}}
						type='number'
						tickLine={false}
						stroke={colors.gray200}
						className={styles.asisStyleHorizontal}
						padding={{
							top:    20,
						}}
						label={{
							value:    barContent.yAxis,
							angle:    -90,
							position: 'insideLeft',
						}}
					/>
					{barContent.legend && data.length && (
						<Legend
							iconSize={10}
							iconType='circle'
							wrapperStyle={{
								paddingTop: 24,
							}}
						/>
					)}
					{series1Shown && (
						<Bar
							dataKey='Series 1'
							radius={[8, 8, 0, 0,]}
							fill={colors.primary600}
						>
							<LabelList
								content={<VerticalBarLabel />}
								stroke={colors.gray600}
								fill={colors.gray600}
							/>
							{data.map((entry,) => {
								return (
									<Cell
										key={entry['name']}
									/>
								)
							},)}
						</Bar>
					)}
					{series2Shown && (
						<Bar
							dataKey='Series 2'
							radius={[8, 8, 0, 0,]}
							fill={colors.primary400}
						>
							<LabelList content={<VerticalBarLabel />}/>
							{data.map((entry,) => {
								return (
									<Cell
										key={entry['name']}
									/>
								)
							},)}
						</Bar>
					)}
					{series3Shown && (
						<Bar
							dataKey='Series 3'
							radius={[8, 8, 0, 0,]}
							fill={colors.success500}
						>
							<LabelList content={<VerticalBarLabel />}/>
							{data.map((entry,) => {
								return (
									<Cell
										key={entry['name']}
									/>
								)
							},)}
						</Bar>
					)}
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}