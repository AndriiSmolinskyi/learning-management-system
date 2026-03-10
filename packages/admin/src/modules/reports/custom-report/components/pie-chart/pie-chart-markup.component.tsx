/* eslint-disable no-mixed-operators */
/* eslint-disable complexity */
import React from 'react'
import type {
	PieLabel,
} from 'recharts'
import {
	ResponsiveContainer,
	PieChart as Chart,
	Pie,
	Cell,
	Legend,
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
	colors,
} from '../../../../../shared/styles'
import type {
	TPieContent,
} from '../../custom-report.types'
import {
	toggleState,
} from '../../../../../shared/utils'

import * as styles from '../../custom-report.styles'

const RADIAN = Math.PI / 180

type CustomLabelProps = {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percent: number;
	name?: string;
	value?: number
}

export const CustomPieLabel: PieLabel<CustomLabelProps> | undefined = (props,) => {
	const {
		cx, cy, midAngle, outerRadius, percent, name, value,
	} = props

	const radius = outerRadius + 10 + (name?.length ?? 0)
	const x = cx + radius * Math.cos(-midAngle * RADIAN,)
	const y = cy + radius * Math.sin(-midAngle * RADIAN,)

	return (
		<text
			x={x} y={y}
			className={styles.labelStyle}
			fill={colors.gray600}
			textAnchor={x > cx ?
				'start' :
				'end'}
			dominantBaseline='central'
		>
			<tspan >
				{name} - {value} - {(percent * 100).toFixed(1,)}%
			</tspan>
		</text>
	)
}

const COLORS = [
	colors.primary400,
	colors.success500,
	colors.violet500,
	colors.violet300,
	colors.gray200,
	colors.primary600,
]

type Props = {
	isEditor?: boolean
	pieContent: TPieContent
	handleDelete?: VoidFunction
	handleEdit?: VoidFunction
}

export const PieChartMarkup: React.FC<Props> = ({
	isEditor = false,
	pieContent,
	handleDelete,
	handleEdit,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	const data = pieContent.content.map((item,) => {
		return {
			name:  item.label,
			value: item.value,
		}
	},)

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
			{pieContent.name && (
				<h5>{pieContent.name}</h5>
			)}
			<ResponsiveContainer width='100%' height='100%'>
				<Chart>
					<Pie
						data={data}
						cx='50%'
						cy='50%'
						labelLine={false}
						label={CustomPieLabel}
						dataKey='value'
						animationDuration={600}
						className={styles.pieStyle}
					>
						{data.map((entry, index,) => {
							return (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length === 6 ?
										4 :
										index % COLORS.length]}
									color={COLORS[index % COLORS.length === 6 ?
										4 :
										index % COLORS.length]}
								/>
							)
						},)}
					</Pie>
					{pieContent.legend && data.length && (
						<Legend
							iconSize={8}
							iconType='circle'
							wrapperStyle={{
								color: colors.gray600,
							}}

						/>
					)}
				</Chart>
			</ResponsiveContainer>
		</div>
	)
}