import {
	create,
} from 'zustand'

import type {
	TBarContent,
	TBubbleContent,
	TCustomReportPayload,
	TLineContent,
	TPieContent,
} from './custom-report.types'
import {
	ReportBlockType,
} from './custom-report.types'

type TReportState = {
	builderType: ReportBlockType
	reportPayload: TCustomReportPayload
	textContent: string
	pieContent: TPieContent
	barContent: TBarContent
	lineContent: TLineContent
	bubbleContent: TBubbleContent
	currentIndex: number | undefined
}

type TReportActions = {
	setBuilderType: (builderType: ReportBlockType) => void
	setReportPayload: (reportPayload: TCustomReportPayload) => void
	setTextContent: (textContent: string) => void
	setPieContent: (pieContent: TPieContent) => void
	setBarContent: (barContent: TBarContent) => void
	setBubbleContent: (bubbleContent: TBubbleContent) => void
	setLineContent: (lineContent: TLineContent) => void
	setCurrentIndex: (currentIndex: number | undefined) => void
	resetCustomReportStore: () => void
	resetCustomReportContent: () => void
}

export const PIE_CONTENT_INITIAL_STATE: TPieContent = {
	name:    '',
	legend:  false,
	type:    'Amount',
	content: [{
		label: '',
		value: 0,
	},],
}

export const BAR_CONTENT_INITIAL_STATE: TBarContent = {
	name:    '',
	legend:  false,
	xAxis:   '',
	yAxis:   '',
	content: [{
		label:      '',
		series1: undefined,
		series2: undefined,
		series3: undefined,
	},],
}

export const BUBBLE_CONTENT_INITIAL_STATE: TBubbleContent = {
	name:    '',
	legend:  false,
	xAxis:   '',
	yAxis:   '',
	content: [{
		label:      '',
		xAxisValue: 0,
		yAxisValue: 0,
		size:       0,
	},],
}

export const LINE_CONTENT_INITIAL_STATE: TLineContent = {
	name:    '',
	legend:  false,
	xAxis:   '',
	yAxis:   '',
	content: [],
}

export const initialState: TReportState = {
	builderType:   ReportBlockType.CONTENT,
	reportPayload: [],
	textContent:   '',
	pieContent:    PIE_CONTENT_INITIAL_STATE,
	barContent:    BAR_CONTENT_INITIAL_STATE,
	bubbleContent: BUBBLE_CONTENT_INITIAL_STATE,
	lineContent:   LINE_CONTENT_INITIAL_STATE,
	currentIndex:  undefined,
}

export const useCustomReportStore = create<TReportState & TReportActions>()((set,) => {
	return {
		...initialState,
		setBuilderType: (builderType: ReportBlockType,): void => {
			set({
				builderType,
			},)
		},
		setReportPayload: (reportPayload: TCustomReportPayload,): void => {
			set({
				reportPayload,
			},)
		},
		setTextContent: (textContent: string,): void => {
			set({
				textContent,
			},)
		},
		setPieContent: (pieContent: TPieContent,): void => {
			set({
				pieContent,
			},)
		},
		setBarContent: (barContent: TBarContent,): void => {
			set({
				barContent,
			},)
		},
		setBubbleContent: (bubbleContent: TBubbleContent,): void => {
			set({
				bubbleContent,
			},)
		},
		setLineContent: (lineContent: TLineContent,): void => {
			set({
				lineContent,
			},)
		},
		setCurrentIndex: (currentIndex: number | undefined,): void => {
			set({
				currentIndex,
			},)
		},
		resetCustomReportStore: (): void => {
			set(initialState,)
		},
		resetCustomReportContent: (): void => {
			set({
				pieContent:    initialState.pieContent,
				barContent:    initialState.barContent,
				bubbleContent: initialState.bubbleContent,
				lineContent:   initialState.lineContent,
				textContent:   initialState.textContent,
			},)
		},
	}
},)