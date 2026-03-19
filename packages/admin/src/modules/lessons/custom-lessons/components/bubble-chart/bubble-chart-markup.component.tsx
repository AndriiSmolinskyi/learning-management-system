/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'
import {
	Chart as ChartJS,
	LinearScale,
	PointElement,
	Legend,
	type BubbleDataPoint,
} from 'chart.js'
import {
	Bubble,
} from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

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
	TBubbleContent,
} from '../../custom-lessons.types'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	colors,
} from '../../../../../shared/styles'

import * as styles from '../../custom-lessons.styles'
import {
	formatNumber,
} from '../../custom-lessons.utils'

ChartJS.register(LinearScale, PointElement, Legend, ChartDataLabels,)

type Props = {
	isEditor?: boolean
	bubbleContent: TBubbleContent
	handleDelete?: VoidFunction
	handleEdit?: VoidFunction
}

const COLORS = [
	`${colors.primary400}99`,
	`${colors.success500}99`,
	`${colors.violet500}99`,
	`${colors.violet300}99`,
	`${colors.primary600}99`,
	`${colors.primary500}99`,
	`${colors.primary700}99`,
	`${colors.primary800}99`,
	`${colors.primary900}99`,
] as const

export const BubbleChartMarkup: React.FC<Props> = ({
	isEditor = false,
	bubbleContent,
	handleDelete,
	handleEdit,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	const xMaxValue = Math.max(...bubbleContent.content.map((item,) => {
		return item.xAxisValue
	},),)
	const yMaxValue = Math.max(...bubbleContent.content.map((item,) => {
		return item.yAxisValue
	},),)

	const options = {
		responsive: true,
		plugins:    {
			legend: {
				position: 'bottom' as const,
				display:  bubbleContent.legend,
				labels:   {
					color:         colors.gray600,
					usePointStyle: true,
					pointStyle:    'circle',
					boxWidth:      8,
					boxHeight:     8,
					padding:       15,
				},
			},
			datalabels: {
				anchor(context: any,): 'end' | 'center' {
					const value = context.dataset.data[context.dataIndex]
					return value.r < 15 ?
						'end' :
						'center'
				},
				align(context: any,): 'end' | 'center' {
					const value = context.dataset.data[context.dataIndex]
					return value.r < 15 ?
						'end' :
						'center'
				},
				color(context: any,): string {
					const value = context.dataset.data[context.dataIndex]
					return value.r < 15 ?
						'black' :
						'white'
				},
				formatter(value: BubbleDataPoint,): number {
					return Math.round(value.r ?? 0,)
				},
			},
		},
		scales: {
			y: {
				title:       {
					display:  true,
					text:    bubbleContent.yAxis,
					color:   colors.gray600,
				},
				ticks: {
					color:    colors.gray600,
					callback: (value: string | number,): string | number => {
						if (typeof value === 'number') {
							return formatNumber(value,) ?? ''
						}
						return formatNumber(parseFloat(value,),) ?? ''
					},
				},
				max: yMaxValue * 1.2,
				min: 0,
			},
			x: {
				title:       {
					display: true,
					text:    bubbleContent.xAxis,
					color:   colors.gray600,
				},
				ticks: {
					color:    colors.gray600,
					callback: (value: string | number,): string | number => {
						if (typeof value === 'number') {
							return formatNumber(value,) ?? ''
						}
						return formatNumber(parseFloat(value,),) ?? ''
					},
				},
				max: xMaxValue * 1.2,
				min: 0,
			},
		},
	}

	const datasets = bubbleContent.content.map((item, index,) => {
		return {
			label: item.label,
			data:  [{
				x: item.xAxisValue,
				y: item.yAxisValue,
				r: item.size,
			},],
			backgroundColor:      COLORS[index],
			hoverBackgroundColor: COLORS[index],
			hoverRadius:          0,
			borderWidth:          0,
			hoverBorderWidth:     0,
		}
	},)

	const data = {
		datasets,
	}

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
			{bubbleContent.name && (
				<h5>{bubbleContent.name}</h5>
			)}
			<Bubble
				options={options}
				data={data}
			/>
		</div>
	)
}