/* eslint-disable complexity */
import React from 'react'

import {
	TextCursorInput,
	TableIcon,
	LineChartIcon,
	PieChartIcon,
	BarChartIcon,
	BarChartHorizontalIcon,
	ScatterChartIcon,
} from '../../../assets/icons'
import {
	LessonBlockType,
} from './custom-lessons.types'
import type {
	TLineSetup,
} from './custom-lessons.types'

export const formatNumber = (value: number,): string | null => {
	if (isNaN(value,)) {
		return null
	}

	const absValue = Math.abs(value,)

	if (absValue >= 1_000_000_000) {
		const result = (value / 1_000_000_000).toFixed(1,)

		return result.endsWith('.0',) ?
			`${result.replace('.0', '',)}B` :
			`${result}B`
	}

	if (absValue >= 1_000_000) {
		const result = (value / 1_000_000).toFixed(1,)

		return result.endsWith('.0',) ?
			`${result.replace('.0', '',)}M` :
			`${result}M`
	}

	if (absValue >= 1_000) {
		const result = (value / 1_000).toFixed(1,)

		if (absValue >= 100_000 && absValue < 1_000_000) {
			return `${Math.round(value / 1_000,)}K`
		}

		return result.endsWith('.0',) ?
			`${result.replace('.0', '',)}K` :
			`${result}K`
	}

	return value.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	},)
}

export const getMaxNameLength = (data: Array<{ name: string }>,): number => {
	if (data.length === 0) {
		return 0
	}

	return Math.max(
		...data
			.map((item: { name: string },) => {
				return item.name
			},)
			.flatMap((word: string,) => {
				return word.split(' ',)
			},)
			.map((word: string,) => {
				return word.length
			},),
	)
}

type TransformedDataItem = {
	name: string
} & Record<string, number | string>

export const transformLineData = (content: Array<TLineSetup>,): Array<TransformedDataItem> => {
	const transformedData: Array<TransformedDataItem> = []

	const uniqueNames = new Set<string>()

	content.forEach((item: TLineSetup,) => {
		item.xAxisValues.split(',',).forEach((name: string,) => {
			uniqueNames.add(name.trim(),)
		},)
	},)

	const namesArray: Array<string> = Array.from(uniqueNames,)

	transformedData.push(
		...namesArray
			.map((name: string,) => {
				return {
					name,
				}
			},)
			.sort((a: TransformedDataItem, b: TransformedDataItem,) => {
				return parseInt(a.name,) - parseInt(b.name,)
			},),
	)

	content.forEach((item: TLineSetup,) => {
		const xValues: Array<string> = item.xAxisValues.split(',',).map((value: string,) => {
			return value.trim()
		},)

		const yValues: Array<number> = item.yAxisValues.split(',',).map((value: string,) => {
			return parseFloat(value.trim(),)
		},)

		xValues.forEach((xValue: string, index: number,) => {
			const foundItem = transformedData.find((dataItem: TransformedDataItem,) => {
				return dataItem.name === xValue
			},)

			if (foundItem && typeof yValues[index] === 'number') {
				foundItem[item.line] = yValues[index] ?? 0
			}
		},)
	},)

	return transformedData
}

export const getReorderData = (type: LessonBlockType,): { icon: React.ReactNode, text: string } => {
	switch (type) {
	case LessonBlockType.TEXT:
		return {
			icon: <TextCursorInput width={20} height={20} />,
			text: 'Text',
		}

	case LessonBlockType.TABLE:
		return {
			icon: <TableIcon width={20} height={20} />,
			text: 'Table',
		}

	case LessonBlockType.LINE_CHART:
		return {
			icon: <LineChartIcon width={20} height={20} />,
			text: 'Line chart',
		}

	case LessonBlockType.PIE_CHART:
		return {
			icon: <PieChartIcon width={20} height={20} />,
			text: 'Pie chart',
		}

	case LessonBlockType.VERTICAL_CHART:
		return {
			icon: <BarChartIcon width={20} height={20} />,
			text: 'Bar chart',
		}

	case LessonBlockType.HORIZONTAL_CHART:
		return {
			icon: <BarChartHorizontalIcon width={20} height={20} />,
			text: 'Horizontal bar chart',
		}

	case LessonBlockType.BUBBLE_CHART:
		return {
			icon: <ScatterChartIcon width={20} height={20} />,
			text: 'Bubble chart',
		}

	default:
		return {
			icon: null,
			text: '',
		}
	}
}