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
	TLessonBubbleData,
	TLessonHorizontalData,
	TLessonLineData,
	TLessonPieData,
	TLessonTableData,
	TLessonTextData,
	TLessonVerticalData,
} from '../custom-lessons.types'
import {
	LessonBlockType,
} from '../custom-lessons.types'
import {
	useCustomLessonStore,
} from '../custom-lessons.store'

import * as styles from '../custom-lessons.styles'

type Props = {
	hasHeader: boolean
	editTableVisible: boolean
	editTextVisible: boolean
	editPieChartVisible: boolean
	editHorizontalChartVisible: boolean
	editVerticalChartVisible: boolean
	editBubbleChartVisible: boolean
	editLineChartVisible: boolean
	closeEditors: VoidFunction
}

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
		lessonPayload,
		setLessonPayload,
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
	} = useCustomLessonStore()

	const bottomRef = React.useRef<HTMLDivElement>(null,)
	const prevLessonPayloadLength = React.useRef<number>(3000,)

	const scrollToBottom = React.useCallback((): void => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({
				behavior: 'smooth',
				block:    'start',
				inline:   'nearest',
			},)
		}
	}, [],)

	React.useEffect(() => {
		if (
			(lessonPayload.length > 0 && prevLessonPayloadLength.current < lessonPayload.length) ||
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

		prevLessonPayloadLength.current = lessonPayload.length
	}, [
		editBubbleChartVisible,
		editHorizontalChartVisible,
		editLineChartVisible,
		editPieChartVisible,
		editTableVisible,
		editTextVisible,
		editVerticalChartVisible,
		lessonPayload,
		scrollToBottom,
	],)

	const handleDelete = (idx: number,): void => {
		setLessonPayload(lessonPayload.filter((item, index,) => {
			return index !== idx
		},),)
	}

	const handleEditTable = (idx: number,): void => {
		if (lessonPayload[idx]?.type === LessonBlockType.TABLE) {
			closeEditors()
			setBuilderType(LessonBlockType.CONTENT,)
			setTextContent((lessonPayload[idx] as TLessonTableData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditText = (idx: number,): void => {
		if (lessonPayload[idx]?.type === LessonBlockType.TEXT) {
			closeEditors()
			setBuilderType(LessonBlockType.CONTENT,)
			setTextContent((lessonPayload[idx] as TLessonTextData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditPieChart = (idx: number,): void => {
		if (lessonPayload[idx]?.type === LessonBlockType.PIE_CHART) {
			closeEditors()
			setBuilderType(LessonBlockType.PIE_CHART,)
			setPieContent((lessonPayload[idx] as TLessonPieData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditHorizontalChart = (idx: number,): void => {
		if (lessonPayload[idx]?.type === LessonBlockType.HORIZONTAL_CHART) {
			closeEditors()
			setBuilderType(LessonBlockType.HORIZONTAL_CHART,)
			setBarContent((lessonPayload[idx] as TLessonHorizontalData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditVerticalChart = (idx: number,): void => {
		if (lessonPayload[idx]?.type === LessonBlockType.VERTICAL_CHART) {
			closeEditors()
			setBuilderType(LessonBlockType.VERTICAL_CHART,)
			setBarContent((lessonPayload[idx] as TLessonVerticalData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditBubbleChart = (idx: number,): void => {
		if (lessonPayload[idx]?.type === LessonBlockType.BUBBLE_CHART) {
			closeEditors()
			setBuilderType(LessonBlockType.BUBBLE_CHART,)
			setBubbleContent((lessonPayload[idx] as TLessonBubbleData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleEditLineChart = (idx: number,): void => {
		if (lessonPayload[idx]?.type === LessonBlockType.LINE_CHART) {
			closeEditors()
			setBuilderType(LessonBlockType.LINE_CHART,)
			setLineContent((lessonPayload[idx] as TLessonLineData).data,)
			setCurrentIndex(idx,)
		}
	}

	const handleTableApply = (content: string,): void => {
		if (!content) {
			return
		}

		if (currentIndex === undefined) {
			setLessonPayload([
				...lessonPayload,
				{
					type: LessonBlockType.TABLE,
					data: content,
				},
			],)
		} else {
			setLessonPayload(lessonPayload.map((item, idx,) => {
				return idx === currentIndex ?
					{
						type: LessonBlockType.TABLE,
						data: content,
					} :
					item
			},),)
		}

		setCurrentIndex(undefined,)
		closeEditors()
		setTextContent('',)
	}

	const handleTextApply = (content: string,): void => {
		if (!content) {
			return
		}

		if (currentIndex === undefined) {
			setLessonPayload([
				...lessonPayload,
				{
					type: LessonBlockType.TEXT,
					data: content,
				},
			],)
		} else {
			setLessonPayload(lessonPayload.map((item, idx,) => {
				return idx === currentIndex ?
					{
						type: LessonBlockType.TEXT,
						data: content,
					} :
					item
			},),)
		}

		setCurrentIndex(undefined,)
		closeEditors()
		setTextContent('',)
	}

	const handleTableCancel = React.useCallback((): void => {
		closeEditors()
		setCurrentIndex(undefined,)
		setTextContent('',)
	}, [
		closeEditors,
		setCurrentIndex,
		setTextContent,
	],)

	const handleTextCancel = React.useCallback((): void => {
		closeEditors()
		setCurrentIndex(undefined,)
		setTextContent('',)
	}, [
		closeEditors,
		setCurrentIndex,
		setTextContent,
	],)

	return (
		<div className={styles.reportContent(hasHeader,)}>
			{lessonPayload.map((item, idx,) => {
				if (item.type === LessonBlockType.TABLE) {
					return idx === currentIndex ?
						(
							<TableEditor
								key={`${LessonBlockType.TABLE}${idx}`}
								handleApply={handleTableApply}
								handleCancel={handleTableCancel}
								initialValue={textContent}
							/>
						) :
						(
							<TableMarkup
								key={`${LessonBlockType.TABLE}${idx}`}
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

				if (item.type === LessonBlockType.TEXT) {
					return idx === currentIndex ?
						(
							<TextEditor
								key={`${LessonBlockType.TEXT}${idx}`}
								handleApply={handleTextApply}
								handleCancel={handleTextCancel}
								initialValue={textContent}
							/>
						) :
						(
							<TextMarkup
								key={`${LessonBlockType.TEXT}${idx}`}
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

				if (item.type === LessonBlockType.PIE_CHART) {
					return idx === currentIndex ?
						(
							<PieChartMarkup
								key={`${LessonBlockType.PIE_CHART}${idx}`}
								pieContent={pieContent}
								isEditor
							/>
						) :
						(
							<PieChartMarkup
								key={`${LessonBlockType.PIE_CHART}${idx}`}
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

				if (item.type === LessonBlockType.HORIZONTAL_CHART) {
					return idx === currentIndex ?
						(
							<HorizontalBarChartMarkup
								key={`${LessonBlockType.HORIZONTAL_CHART}${idx}`}
								barContent={barContent}
								isEditor
							/>
						) :
						(
							<HorizontalBarChartMarkup
								key={`${LessonBlockType.HORIZONTAL_CHART}${idx}`}
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

				if (item.type === LessonBlockType.VERTICAL_CHART) {
					return idx === currentIndex ?
						(
							<VerticalBarChartMarkup
								key={`${LessonBlockType.VERTICAL_CHART}${idx}`}
								barContent={barContent}
								isEditor
							/>
						) :
						(
							<VerticalBarChartMarkup
								key={`${LessonBlockType.VERTICAL_CHART}${idx}`}
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

				if (item.type === LessonBlockType.BUBBLE_CHART) {
					return idx === currentIndex ?
						(
							<BubbleChartMarkup
								key={`${LessonBlockType.BUBBLE_CHART}${idx}`}
								bubbleContent={bubbleContent}
								isEditor
							/>
						) :
						(
							<BubbleChartMarkup
								key={`${LessonBlockType.BUBBLE_CHART}${idx}`}
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

				if (item.type === LessonBlockType.LINE_CHART) {
					return idx === currentIndex ?
						(
							<LineChartMarkup
								key={`${LessonBlockType.LINE_CHART}${idx}`}
								lineContent={lineContent}
								isEditor
							/>
						) :
						(
							<LineChartMarkup
								key={`${LessonBlockType.LINE_CHART}${idx}`}
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