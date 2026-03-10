/* eslint-disable complexity */
import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'
import {
	CartesianGrid,
	Label,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'

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

import type {
	TLineContent,
} from '../../custom-report.types'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	colors,
} from '../../../../../shared/styles'
import {
	formatNumber,
	transformLineData,
} from '../../custom-report.utils'

import * as styles from '../../custom-report.styles'

type Props = {
	isEditor?: boolean
	lineContent: TLineContent
	handleDelete?: VoidFunction
	handleEdit?: VoidFunction
}

const COLORS = [
	colors.primary400,
	colors.success500,
	colors.violet500,
	colors.violet300,
	colors.primary600,
	colors.primary500,
	colors.primary700,
	colors.primary800,
	colors.primary900,
] as const

export const LineChartMarkup: React.FC<Props> = ({
	isEditor = false,
	lineContent,
	handleDelete,
	handleEdit,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

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

	const data = transformLineData(lineContent.content,)

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
			{lineContent.name && (
				<h5>{lineContent.name}</h5>
			)}
			<ResponsiveContainer width='100%' height='100%'>
				<LineChart
					data={data}
					margin={{
						top:    lineContent.name ?
							32 :
							8,
						left:   16,
						right:  40,
						bottom: lineContent.legend ?
							8 :
							24,
					}}
				>
					<CartesianGrid
						stroke={colors.gray100}
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
							value={lineContent.xAxis}
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
						label={{
							value:    lineContent.yAxis,
							angle:    -90,
							position: 'insideLeft',
						}}
					/>
					{lineContent.legend && data.length && (
						<Legend
							iconSize={10}
							iconType='circle'
							wrapperStyle={{
								paddingTop: 24,
							}}
						/>
					)}
					{lineContent.content.map((item, index,) => {
						return (
							<Line
								key={`${item.line}$}${index}`}
								dataKey={item.line}
								stroke={COLORS[index]}
								dot={false}
								strokeWidth={4}
							/>
						)
					},)
					}
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}