import type {
	LessonItem,
} from '../../../shared/types'

export type TCustomLesson = {
	title: string
	comment?: string
	payload?: TCustomLessonPayload
	lessonId?: string
}

export enum LessonBlockType {
	CONTENT = 'Content',
	TEXT = 'Text',
	TABLE = 'Table',
	PIE_CHART = 'Pie',
	HORIZONTAL_CHART = 'Horizontal',
	VERTICAL_CHART = 'Vertical',
	LINE_CHART = 'Line',
	BUBBLE_CHART = 'Bubble',
	OTHER = 'Other',
}

export type TLessonTextData = {
	type: LessonBlockType.TEXT
	data: string
}

export type TLessonTableData = {
	type: LessonBlockType.TABLE
	data: string
}

export type TPieChartValue = 'Amount' | 'Percentage'

export type TPieContent = {
	name?: string
	legend: boolean
	type: TPieChartValue
	content: Array<{
		label: string
		value: number
	}>
}

export type TBarInputRaw = {
	label: string
	series1?: number
	series2?: number
	series3?: number
}

export type TBubbleInputRaw = {
	label: string
	xAxisValue: number
	yAxisValue: number
	size: number
}

export type TLineSetup = {
	line: string
	xAxisValues: string
	yAxisValues: string
}

export type TBarContent = {
	name?: string
	legend: boolean
	xAxis: string
	yAxis: string
	content: Array<TBarInputRaw>
}

export type TBubbleContent = {
	name?: string
	legend: boolean
	xAxis: string
	yAxis: string
	content: Array<TBubbleInputRaw>
}

export type TLineContent = {
	name?: string
	legend: boolean
	xAxis: string
	yAxis: string
	content: Array<TLineSetup>
}

export type TPieForm = {
	nameToggle: boolean
	name?: string
	legend: boolean
	type: TPieChartValue
	content: Array<{
		label: string
		value: string
	}>
}

export type TBarForm = {
	nameToggle: boolean
	name?: string
	legend: boolean
	xAxis: string
	yAxis: string
	content: Array<{
		label: string
		value1: string
		value2: string
		value3: string
	}>
}

export type TBubbleForm = {
	nameToggle: boolean
	name?: string
	legend: boolean
	xAxis: string
	yAxis: string
	content: Array<{
		label: string
		xAxisValue: string
		yAxisValue: string
		size: string
	}>
}

export type TLineForm = {
	nameToggle: boolean
	name: string
	legend: boolean
	xAxis: string
	yAxis: string
	content: Array<TLineSetup>
}

export type TLessonPieData = {
	type: LessonBlockType.PIE_CHART
	data: TPieContent
}

export type TLessonHorizontalData = {
	type: LessonBlockType.HORIZONTAL_CHART
	data: TBarContent
}

export type TLessonVerticalData = {
	type: LessonBlockType.VERTICAL_CHART
	data: TBarContent
}

export type TLessonBubbleData = {
	type: LessonBlockType.BUBBLE_CHART
	data: TBubbleContent
}

export type TLessonLineData = {
	type: LessonBlockType.LINE_CHART
	data: TLineContent
}

export type TLessonOtherData = {
	type: LessonBlockType.OTHER
	data: unknown
}

export type TLessonData =
	| TLessonTextData
	| TLessonTableData
	| TLessonPieData
	| TLessonHorizontalData
	| TLessonVerticalData
	| TLessonBubbleData
	| TLessonLineData
	| TLessonOtherData

export type TCustomLessonPayload = Array<TLessonData>

export type ILessonParsed = Omit<LessonItem, 'payload'> & {
	payload: TCustomLessonPayload | undefined
}