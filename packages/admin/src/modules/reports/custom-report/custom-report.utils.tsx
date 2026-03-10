/* eslint-disable complexity */
import React from 'react'

import {
	TextCursorInput,
	ImageIcon,
	TableIcon,
	LineChartIcon,
	PieChartIcon,
	BarChartIcon,
	BarChartHorizontalIcon,
	ScatterChartIcon,
} from '../../../assets/icons'

import type {
	TLineSetup,
} from './custom-report.types'
import {
	ReportBlockType,
} from './custom-report.types'

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
	} else if (absValue >= 1_000_000) {
		const result = (value / 1_000_000).toFixed(1,)
		return result.endsWith('.0',) ?
			`${result.replace('.0', '',)}M` :
			`${result}M`
	} else if (absValue >= 1_000) {
		const result = (value / 1_000).toFixed(1,)
		if (absValue >= 100_000 && absValue < 1_000_000) {
			return `${Math.round(value / 1_000,)}K`
		}
		const formattedResult = result.endsWith('.0',) ?
			`${result.replace('.0', '',)}K` :
			`${result}K`
		return formattedResult
	}

	return value.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	},)
}

export const getMaxNameLength = (data: Array<{name: string}>,): number => {
	if (data.length === 0) {
		return 0
	}

	return Math.max(
		...data.map((item,) => {
			return item.name
		},)
			.flatMap((word,) => {
				return word.split(' ',)
			},)
			.map((word,) => {
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

	content.forEach(({
		xAxisValues,
	},) => {
		xAxisValues.split(',',).forEach((name,) => {
			return uniqueNames.add(name.trim(),)
		},)
	},)

	const namesArray = Array.from(uniqueNames,)

	transformedData.push(
		...namesArray
			.map((name,) => {
				return {
					name,
				}
			},)
			.sort((a,b,) => {
				return parseInt(a.name,) - parseInt(b.name,)
			},),
	)

	content.forEach(({
		line, xAxisValues, yAxisValues,
	},) => {
		const xValues = xAxisValues.split(',',).map((val,) => {
			return val.trim()
		},)
		const yValues = yAxisValues.split(',',).map((val,) => {
			return parseFloat(val.trim(),)
		},)

		xValues.forEach((xValue, index,) => {
			const item = transformedData.find((d,) => {
				return d.name === xValue
			},)
			if (item && typeof yValues[index] === 'number') {
				item[line] = yValues[index] ?? 0
			}
		},)
	},)

	return transformedData
}

export const getReorderData = (type: ReportBlockType,): {icon:React.ReactNode, text: string} => {
	switch (type) {
	case ReportBlockType.TEXT:
		return {
			icon: <TextCursorInput width={20} height={20} />,
			text: 'Text',
		}
	case ReportBlockType.TABLE:
		return {
			icon: <TableIcon width={20} height={20} />,
			text: 'Table',
		}
	case ReportBlockType.IMAGE:
		return {
			icon: <ImageIcon width={20} height={20} />,
			text: 'Image',
		}
	case ReportBlockType.LINE_CHART:
		return {
			icon: <LineChartIcon width={20} height={20} />,
			text: 'Line chart',
		}
	case ReportBlockType.PIE_CHART:
		return {
			icon: <PieChartIcon width={20} height={20} />,
			text: 'Pie chart',
		}
	case ReportBlockType.VERTICAL_CHART:
		return {
			icon: <BarChartIcon width={20} height={20} />,
			text: 'Bar chart',
		}
	case ReportBlockType.HORIZOTAL_CHART:
		return {
			icon: <BarChartHorizontalIcon width={20} height={20} />,
			text: 'Bar chart race',
		}
	case ReportBlockType.BUBBLE_CHART:
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