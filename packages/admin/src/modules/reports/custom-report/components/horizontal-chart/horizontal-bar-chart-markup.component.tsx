/* eslint-disable no-mixed-operators */
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
	HorizontalLabel,
} from './horizontal-bar-chart-label.component'

import type {
	TBarContent,
} from '../../custom-report.types'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	formatNumber, getMaxNameLength,
} from '../../custom-report.utils'
import {
	colors,
} from '../../../../../shared/styles'

import * as styles from '../../custom-report.styles'

type Props = {
	isEditor?: boolean
	barContent: TBarContent
	handleDelete?: VoidFunction
	handleEdit?: VoidFunction
}

type Name = {
	name: string
}

type Series1 = {
	'Series 1': number
}

type Series2 = {
	'Series 2': number
}

export const HorizontalBarChartMarkup: React.FC<Props> = ({
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
				item.series2 !== undefined && !isNaN(item.series2,)
			) {
				return {
					name:       item.label,
					'Series 1': item.series1,
					'Series 2': item.series2,
				} as Name & Series1 & Series2
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
			return null
		},)
		.filter((item,): item is Name & (Series1 | Series2) => {
			return item !== null
		},)

	const series1Shown = data.filter((item,): item is Name & Series1 => {
		return 'Series 1' in item
	},).length !== 0

	const series2Shown = data.filter((item,) => {
		return 'Series 2' in item
	},).length !== 0

	const maxNameLength = getMaxNameLength(data,)

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
		<div className={styles.barChartWrapper(isEditor,)}>
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
					layout='vertical'
					margin={{
						top:    barContent.name ?
							32 :
							8,
						left:   maxNameLength * 5,
						right:  16,
						bottom: barContent.legend ?
							8 :
							24,
					}}
				>
					<CartesianGrid
						horizontal={false}
						stroke={colors.gray100}
					/>
					<XAxis
						type='number'
						padding={{
							right: 55,
						}}
						tickLine={false}
						stroke={colors.gray200}
						className={styles.asisStyleHorizontal}
						tickFormatter={(value,) => {
							return formatNumber(value,) ?? ''
						}}
					>
						<Label
							offset={-10}
							value={barContent.xAxis}
							position='insideBottom'
						/>
					</XAxis>
					<YAxis
						dataKey={'name'}
						type='category'
						tickLine={false}
						stroke={colors.gray200}
						className={styles.asisStyleHorizontal}
					>
						<Label
							offset={maxNameLength * -5 + 20}
							value={barContent.yAxis}
							angle={-90}
							position='insideLeft'
						/>
					</YAxis>
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
							radius={[0, 8, 8, 0,]}
							fill={colors.primary600}
						>
							<LabelList
								content={<HorizontalLabel />}
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
							radius={[0, 8, 8, 0,]}
							fill={colors.primary400}
						>
							<LabelList content={<HorizontalLabel />}/>
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