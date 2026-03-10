/* eslint-disable complexity */
import React from 'react'

import {
	TextEditor,
	TextMarkup,
} from './text'
import {
	TableEditor,
	TableMarkup,
} from './table'
import {
	ImageMarkup,
} from './image'
import {
	PieChartMarkup,
} from './pie-chart'
import {
	HorizontalBarChartMarkup,
} from './horizontal-chart'
import {
	VerticalBarChartMarkup,
} from './vertical-chart'
import {
	BubbleChartMarkup,
} from './bubble-chart'
import {
	LineChartMarkup,
} from './line-chart'

import type {
	TReportBubbleData,
	TReportHorizontalData,
	TReportLineData,
	TReportPieData,
	TReportTableData,
	TReportTextData,
	TReportVerticalData,
} from '../custom-report.types'
import {
	ReportBlockType,
} from '../custom-report.types'
import {
	useCustomReportStore,
} from '../custom-report.store'

import * as styles from '../custom-report.styles'

type Props = {
	hasHeader: boolean;
	editTableVisible: boolean
	editTextVisible: boolean
	editPieChartVisible: boolean
	editHorizontalChartVisible: boolean
	editVerticalChartVisible: boolean
	editBubbleChartVisible: boolean
	editLineChartVisible: boolean
	closeEditors: VoidFunction
};

export const ReportContent: React.FC<Props> = ({
	hasHeader,
	editTableVisible,
	editTextVisible,
	editPieChartVisible,
	editHorizontalChartVisible,
	editVerticalChartVisible,
	editBubbleChartVisible,
	editLineChartVisible,
	closeEditors,
},) => {
	const {
		reportPayload,
		setReportPayload,
		pieContent,
		setPieContent,
		currentIndex,
		setCurrentIndex,
		setBarContent,
		barContent,
		bubbleContent,
		setBubbleContent,
		lineContent,
		setLineContent,
		textContent,
		setTextContent,
		setBuilderType,
	} = useCustomReportStore()
	const bottomRef = React.useRef<HTMLDivElement>(null,)
	const prevReportPayloadLength = React.useRef(3000,)

	React.useEffect(() => {
		if ((reportPayload.length > 0 && prevReportPayloadLength.current < reportPayload.length) ||
		editTextVisible ||
		editTableVisible ||
		editPieChartVisible ||
		editHorizontalChartVisible ||
		editVerticalChartVisible ||
		editBubbleChartVisible ||
		editLineChartVisible
		) {
			scrollToBottom()
		}
		prevReportPayloadLength.current = reportPayload.length
	}, [reportPayload,
		bottomRef,
		editTextVisible,
		editTableVisible,
		editPieChartVisible,
		editHorizontalChartVisible,
		editVerticalChartVisible,
		editBubbleChartVisible,
		editLineChartVisible,
	],)

	const scrollToBottom = React.useCallback(() => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({
				behavior: 'smooth',
				block:    'start',
				inline:   'nearest',
			},)
		}
	}, [bottomRef,],)

	const handleDelete = (idx: number,): void => {
		setReportPayload(reportPayload.filter((item, index,) => {
			return index !== idx
		},),)
	}

	const handleEditTable = (idx: number,): void => {
		if (reportPayload[idx]?.type === ReportBlockType.TABLE) {
			closeEditors()
			setBuilderType(ReportBlockType.CONTENT,)
			setTextContent((reportPayload[idx] as TReportTableData).data ,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditText = (idx: number,): void => {
		if (reportPayload[idx]?.type === ReportBlockType.TEXT) {
			closeEditors()
			setBuilderType(ReportBlockType.CONTENT,)
			setTextContent((reportPayload[idx] as TReportTextData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditPieChart = (idx: number,): void => {
		if (reportPayload[idx]?.type === ReportBlockType.PIE_CHART) {
			closeEditors()
			setBuilderType(ReportBlockType.PIE_CHART,)
			setPieContent((reportPayload[idx] as TReportPieData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditHorizontalChart = (idx: number,): void => {
		if (reportPayload[idx]?.type === ReportBlockType.HORIZOTAL_CHART) {
			setBuilderType(ReportBlockType.HORIZOTAL_CHART,)
			closeEditors()
			setBarContent((reportPayload[idx] as TReportHorizontalData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditVerticalChart = (idx: number,): void => {
		if (reportPayload[idx]?.type === ReportBlockType.VERTICAL_CHART) {
			setBuilderType(ReportBlockType.VERTICAL_CHART,)
			closeEditors()
			setBarContent((reportPayload[idx] as TReportVerticalData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditBubbleChart = (idx: number,): void => {
		if (reportPayload[idx]?.type === ReportBlockType.BUBBLE_CHART) {
			setBuilderType(ReportBlockType.BUBBLE_CHART,)
			closeEditors()
			setBubbleContent((reportPayload[idx] as TReportBubbleData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditLineChart = (idx: number,): void => {
		if (reportPayload[idx]?.type === ReportBlockType.LINE_CHART) {
			setBuilderType(ReportBlockType.LINE_CHART,)
			closeEditors()
			setLineContent((reportPayload[idx] as TReportLineData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditImage = (file: File, currentIndex: number,): void => {
		closeEditors()
		setReportPayload(reportPayload.map((item, idx,) => {
			return (idx === currentIndex ?
				{
					type:   ReportBlockType.IMAGE,
					file,
				} :
				item)
		},),)
	}

	const handleTableApply = (content: string,): void => {
		if (content) {
			if (currentIndex === undefined) {
				setReportPayload([
					...reportPayload, {
						type:   ReportBlockType.TABLE,
						data:   content,
					},
				],)
			} else {
				setReportPayload(reportPayload.map((item, idx,) => {
					return (idx === currentIndex ?
						{
							type:   ReportBlockType.TABLE,
							data:   content,
						} :
						item)
				},),)
			}
			setCurrentIndex(undefined,)
			closeEditors()
			setTextContent('',)
		}
	}

	const handleTextApply = (content: string,): void => {
		if (content) {
			if (currentIndex === undefined) {
				setReportPayload([
					...reportPayload, {
						type: ReportBlockType.TEXT,
						data: content,
					},
				],)
			} else {
				setReportPayload(reportPayload.map((item, idx,) => {
					return (idx === currentIndex ?
						{
							type:   ReportBlockType.TEXT,
							data:   content,
						} :
						item)
				},),)
			}
			setCurrentIndex(undefined,)
			closeEditors()
			setTextContent('',)
		}
	}

	const handleTableCancel = React.useCallback((): void => {
		closeEditors()
		setCurrentIndex(undefined,)
		setTextContent('',)
	}, [],)

	const handleTextCancel = React.useCallback((): void => {
		closeEditors()
		setCurrentIndex(undefined,)
		setTextContent('',)
	}, [],)

	return (
		<div
			className={styles.reportContent(hasHeader,)}
		>
			{reportPayload.map((item, idx,) => {
				if (item.type === ReportBlockType.TABLE) {
					return (
						idx === currentIndex ?
							<TableEditor
								key={`${ReportBlockType.TABLE}${idx}`}
								handleApply={handleTableApply}
								handleCancel={handleTableCancel}
								initialValue={textContent}
							/> :
							<TableMarkup
								key={`${ReportBlockType.TABLE}${idx}`}
								data={item.data}
								handleDelete={() => {
									handleDelete(idx,)
								}}
								handleEdit={() => {
									handleEditTable(idx,)
								}}
							/>
					)
				}
				if (item.type === ReportBlockType.TEXT) {
					return (
						idx === currentIndex ?
							<TextEditor
								key={`${ReportBlockType.TEXT}${idx}`}
								handleApply={handleTextApply}
								handleCancel={handleTextCancel}
								initialValue={textContent}
							/> :
							<TextMarkup
								key={`${ReportBlockType.TEXT}${idx}`}
								data={item.data}
								handleDelete={() => {
									handleDelete(idx,)
								}}
								handleEdit={() => {
									handleEditText(idx,)
								}}
							/>
					)
				}
				if (item.type === ReportBlockType.IMAGE) {
					return (
						<ImageMarkup
							key={`${ReportBlockType.IMAGE}${idx}`}
							item={item}
							handleDelete={() => {
								handleDelete(idx,)
							}}
							handleEdit={(data: File,) => {
								handleEditImage(data, idx,)
							}}
						/>
					)
				}
				if (item.type === ReportBlockType.PIE_CHART) {
					return (
						idx === currentIndex ?
							<PieChartMarkup
								key={`${ReportBlockType.PIE_CHART}${idx}`}
								pieContent={pieContent}
								isEditor
							/> :
							<PieChartMarkup
								key={`${ReportBlockType.PIE_CHART}${idx}`}
								pieContent={item.data}
								handleDelete={() => {
									handleDelete(idx,)
								}}
								handleEdit={() => {
									handleEditPieChart(idx,)
								}}
							/>
					)
				}
				if (item.type === ReportBlockType.HORIZOTAL_CHART) {
					return (
						idx === currentIndex ?
							<HorizontalBarChartMarkup
								barContent={barContent}
								key={`${ReportBlockType.HORIZOTAL_CHART}${idx}`}
								isEditor
							/> :
							<HorizontalBarChartMarkup
								key={`${ReportBlockType.HORIZOTAL_CHART}${idx}`}
								barContent={item.data}
								handleDelete={() => {
									handleDelete(idx,)
								}}
								handleEdit={() => {
									handleEditHorizontalChart(idx,)
								}}
							/>
					)
				}
				if (item.type === ReportBlockType.VERTICAL_CHART) {
					return (
						idx === currentIndex ?
							<VerticalBarChartMarkup
								key={`${ReportBlockType.VERTICAL_CHART}${idx}`}
								barContent={barContent}
								isEditor
							/> :
							<VerticalBarChartMarkup
								key={`${ReportBlockType.VERTICAL_CHART}${idx}`}
								barContent={item.data}
								handleDelete={() => {
									handleDelete(idx,)
								}}
								handleEdit={() => {
									handleEditVerticalChart(idx,)
								}}
							/>
					)
				}
				if (item.type === ReportBlockType.BUBBLE_CHART) {
					return (
						idx === currentIndex ?
							<BubbleChartMarkup
								key={`${ReportBlockType.BUBBLE_CHART}${idx}`}
								bubbleContent={bubbleContent}
								isEditor
							/> :
							<BubbleChartMarkup
								key={`${ReportBlockType.BUBBLE_CHART}${idx}`}
								bubbleContent={item.data}
								handleDelete={() => {
									handleDelete(idx,)
								}}
								handleEdit={() => {
									handleEditBubbleChart(idx,)
								}}
							/>
					)
				}
				if (item.type === ReportBlockType.LINE_CHART) {
					return (
						idx === currentIndex ?
							<LineChartMarkup
								key={`${ReportBlockType.LINE_CHART}${idx}`}
								lineContent={lineContent}
								isEditor
							/> :
							<LineChartMarkup
								key={`${ReportBlockType.LINE_CHART}${idx}`}
								lineContent={item.data}
								handleDelete={() => {
									handleDelete(idx,)
								}}
								handleEdit={() => {
									handleEditLineChart(idx,)
								}}
							/>
					)
				}
				return null
			},)}
			{editTableVisible && (
				<TableEditor
					handleApply={handleTableApply}
					handleCancel={handleTableCancel}
					initialValue={textContent}
				/>
			)}
			{editTextVisible && (
				<TextEditor
					handleApply={handleTextApply}
					handleCancel={handleTextCancel}
					initialValue={textContent}
				/>
			)}
			{editPieChartVisible && (
				<PieChartMarkup
					pieContent={pieContent}
					isEditor
				/>
			)}
			{editHorizontalChartVisible && (
				<HorizontalBarChartMarkup
					barContent={barContent}
					isEditor
				/>
			)}
			{editVerticalChartVisible && (
				<VerticalBarChartMarkup
					barContent={barContent}
					isEditor
				/>
			)}
			{editBubbleChartVisible && (
				<BubbleChartMarkup
					bubbleContent={bubbleContent}
					isEditor
				/>
			)}
			{editLineChartVisible && (
				<LineChartMarkup
					lineContent={lineContent}
					isEditor
				/>
			)}
			<div ref={bottomRef} className={styles.bottomBlock}></div>
		</div>
	)
}

