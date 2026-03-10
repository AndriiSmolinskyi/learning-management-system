import type {
	IDocument, IReportDraftExtended, IReportExtended,
} from '../../../shared/types'
import type {
	TAddReportProps,
} from '../../../services/report/report.types'

export type TCustomReport = TAddReportProps & {
	reportId?: number
	reportDraftId?: number
}

export enum ReportBlockType {
	CONTENT = 'Content',
	IMAGE = 'Image',
	TEXT = 'Text',
	TABLE = 'Table',
	PIE_CHART = 'Pie',
	HORIZOTAL_CHART = 'Horizontal',
	VERTICAL_CHART = 'Vertical',
	LINE_CHART = 'Line',
	BUBBLE_CHART = 'Bubble',
	OTHER = 'other'
}

export type TReportTextData = {
	type: ReportBlockType.TEXT
	data: string
}

export type TReportTableData = {
	type: ReportBlockType.TABLE
	data: string
}

export type TReportImageData = {
	type: ReportBlockType.IMAGE
	file?: File
	data?: IDocument
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

export type TReportPieData = {
	type: ReportBlockType.PIE_CHART
	data: TPieContent
}

export type TReportHorizontalData = {
	type: ReportBlockType.HORIZOTAL_CHART
	data: TBarContent
}

export type TReportVerticalData = {
	type: ReportBlockType.VERTICAL_CHART
	data: TBarContent
}

export type TReportBubbleData = {
	type: ReportBlockType.BUBBLE_CHART
	data: TBubbleContent
}

export type TReportLineData = {
	type: ReportBlockType.LINE_CHART
	data: TLineContent
}

export type TReportOtherData = {
	type: ReportBlockType.OTHER
	data: unknown
}

export type TReportData =
	TReportTextData |
	TReportTableData |
	TReportImageData |
	TReportPieData |
	TReportHorizontalData |
	TReportVerticalData |
	TReportBubbleData |
	TReportLineData |
	TReportOtherData

export type TCustomReportPayload = Array<TReportData>

export type IReportParsed = Omit<IReportExtended, 'payload'> & {
	payload: TCustomReportPayload | undefined
}

export type IReportDraftParsed = Omit<IReportDraftExtended, 'payload'> & {
	payload: TCustomReportPayload | undefined
}