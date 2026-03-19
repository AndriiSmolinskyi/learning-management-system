import {
	create,
} from 'zustand'

import type {
	TBarContent,
	TBubbleContent,
	TCustomLessonPayload,
	TLineContent,
	TPieContent,
} from './custom-lessons.types'
import {
	LessonBlockType,
} from './custom-lessons.types'

type TLessonState = {
	builderType: LessonBlockType
	lessonPayload: TCustomLessonPayload
	textContent: string
	pieContent: TPieContent
	barContent: TBarContent
	lineContent: TLineContent
	bubbleContent: TBubbleContent
	currentIndex: number | undefined
}

type TLessonActions = {
	setBuilderType: (builderType: LessonBlockType) => void
	setLessonPayload: (lessonPayload: TCustomLessonPayload) => void
	setTextContent: (textContent: string) => void
	setPieContent: (pieContent: TPieContent) => void
	setBarContent: (barContent: TBarContent) => void
	setBubbleContent: (bubbleContent: TBubbleContent) => void
	setLineContent: (lineContent: TLineContent) => void
	setCurrentIndex: (currentIndex: number | undefined) => void
	resetCustomLessonStore: () => void
	resetCustomLessonContent: () => void
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
		label:   '',
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

export const initialState: TLessonState = {
	builderType:   LessonBlockType.TEXT,
	lessonPayload: [],
	textContent:   '',
	pieContent:    PIE_CONTENT_INITIAL_STATE,
	barContent:    BAR_CONTENT_INITIAL_STATE,
	bubbleContent: BUBBLE_CONTENT_INITIAL_STATE,
	lineContent:   LINE_CONTENT_INITIAL_STATE,
	currentIndex:  undefined,
}

export const useCustomLessonStore = create<TLessonState & TLessonActions>()((set,) => {
	return {
		...initialState,
		setBuilderType: (builderType: LessonBlockType,): void => {
			set({
				builderType,
			},)
		},
		setLessonPayload: (lessonPayload: TCustomLessonPayload,): void => {
			set({
				lessonPayload,
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
		resetCustomLessonStore: (): void => {
			set(initialState,)
		},
		resetCustomLessonContent: (): void => {
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