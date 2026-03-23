/* eslint-disable complexity */
import React from 'react'

import {
	BubbleChartMarkup,
	PieChartMarkup,
	TableMarkup,
	TextMarkup,
	VerticalBarChartMarkup,
	HorizontalBarChartMarkup,
	LineChartMarkup,
} from '../../custom-lessons'
import {
	LessonBlockType,
} from '../../custom-lessons/custom-lessons.types'
import type {
	TCustomLessonPayload,
} from '../../custom-lessons/custom-lessons.types'

import * as styles from '../lessons.styles'

type Props = {
	payload?: unknown
}

type TLessonPayloadDto = {
	blocks?: unknown
}

const extractLessonBlocks = (payload: unknown,): TCustomLessonPayload => {
	if (Array.isArray(payload,)) {
		return payload as TCustomLessonPayload
	}

	if (!payload || typeof payload !== 'object') {
		return []
	}

	const maybePayload = payload as TLessonPayloadDto

	if (Array.isArray(maybePayload.blocks,)) {
		return maybePayload.blocks as TCustomLessonPayload
	}

	return []
}

export const LessonDetailsContent: React.FC<Props> = ({
	payload,
},) => {
	const lessonPayload = extractLessonBlocks(payload,)

	return (
		<div className={styles.detailsFormWrapper}>
			{lessonPayload.map((item, idx,) => {
				const key = `${item.type}${idx}`

				if (item.type === LessonBlockType.TABLE) {
					return (
						<div className='pdf-element' key={key}>
							<TableMarkup data={item.data} isEditor />
						</div>
					)
				}

				if (item.type === LessonBlockType.TEXT) {
					return (
						<div className='pdf-element' key={key}>
							<TextMarkup data={item.data} isEditor />
						</div>
					)
				}

				if (item.type === LessonBlockType.PIE_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<PieChartMarkup pieContent={item.data} isEditor />
						</div>
					)
				}

				if (item.type === LessonBlockType.HORIZONTAL_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<HorizontalBarChartMarkup barContent={item.data} isEditor />
						</div>
					)
				}

				if (item.type === LessonBlockType.VERTICAL_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<VerticalBarChartMarkup barContent={item.data} isEditor />
						</div>
					)
				}

				if (item.type === LessonBlockType.BUBBLE_CHART) {
					return (
						<div className='pdf-element' key={key}>
							<BubbleChartMarkup bubbleContent={item.data} isEditor />
						</div>
					)
				}

				if (item.type === LessonBlockType.LINE_CHART) {
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
}