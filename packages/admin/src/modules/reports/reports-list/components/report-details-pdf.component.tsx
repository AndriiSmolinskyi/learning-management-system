/* eslint-disable complexity */
import React, {
	forwardRef,
} from 'react'

import {
	BubbleChartMarkup,
	HorizontalBarChartMarkup,
	ImageMarkup,
	PieChartMarkup,
	TableMarkup,
	TextMarkup,
	VerticalBarChartMarkup,
	LineChartMarkup,
} from '../../custom-report'

import {
	ReportBlockType,
} from '../../custom-report/custom-report.types'
import {
	useReportById,
} from '../../../../shared/hooks/reports'

import * as styles from '../reports.styles'

type Props = {
	reportId: number
}

export const ReportDetailsPDF = forwardRef<HTMLDivElement, Props>(({
	reportId,
}, ref,) => {
	const {
		data: reportExtended,
	} = useReportById(reportId,)
	return (
		<div className={styles.detailsFormWrapper} ref={ref}>
			{reportExtended?.payload?.map((item, idx,) => {
				const key = `${item.type}${idx}`

				if (item.type === ReportBlockType.TABLE) {
					return (
						<div className='pdf-element' key={key}>
							<TableMarkup data={item.data} isEditor />
						</div>
					)
				}

				if (item.type === ReportBlockType.TEXT) {
					return (
						<div className='pdf-element' key={key}>
							<TextMarkup data={item.data} isEditor />
						</div>
					)
				}

				if (item.type === ReportBlockType.IMAGE) {
					return (
						<div className='pdf-element' key={key}>
							<ImageMarkup item={item} isEditor />
						</div>
					)
				}

				if (item.type === ReportBlockType.PIE_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<PieChartMarkup pieContent={item.data} isEditor />
						</div>
					)
				}

				if (item.type === ReportBlockType.HORIZOTAL_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<HorizontalBarChartMarkup barContent={item.data} isEditor />
						</div>
					)
				}

				if (item.type === ReportBlockType.VERTICAL_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<VerticalBarChartMarkup barContent={item.data} isEditor />
						</div>
					)
				}

				if (item.type === ReportBlockType.BUBBLE_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<BubbleChartMarkup bubbleContent={item.data} isEditor />
						</div>
					)
				}
				if (item.type === ReportBlockType.LINE_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<LineChartMarkup lineContent={item.data} isEditor />
						</div>
					)
				}
				return null
			},)}
		</div>
	)
},)
