/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable max-depth */
/* eslint-disable complexity */
import React from 'react'
import {
	useLocation,
	useNavigate,
} from 'react-router-dom'

import {
	PieChartConstructor,
	LessonsBuilder,
	ReportContent,
	HorizontalBarChartConstructor,
	VerticalBarChartConstructor,
	BubbleChartConstructor,
	LineChartConstructor,
} from './components'

import {
	LessonBlockType,
} from './custom-lessons.types'
import type {
	TCustomLesson,
	TCustomLessonPayload,
} from './custom-lessons.types'
import {
	useCreateLesson,
	useLesson,
	useUpdateLesson,
} from '../../../shared/hooks/lessons/lessons.hook'
import {
	RouterKeys,
} from '../../../router/keys'
import {
	useCustomLessonStore,
} from './custom-lessons.store'

import * as styles from './custom-lessons.styles'

type TCustomLessonLocationState = {
	customPayload?: {
		title?: string
		comment?: string
		payload?: unknown
	}
	lessonId?: string
} | null

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

const normalizeComment = (comment: string | undefined,): string | undefined => {
	const trimmed = comment?.trim() ?? ''

	return trimmed ?
		trimmed :
		undefined
}

const CustomLesson: React.FC = () => {
	const [customLesson, setCustomLesson,] = React.useState<TCustomLesson | undefined>(undefined,)
	const [editTableVisible, setEditTableVisible,] = React.useState<boolean>(false,)
	const [editTextVisible, setEditTextVisible,] = React.useState<boolean>(false,)
	const [editPieChartVisible, setEditPieChartVisible,] = React.useState<boolean>(false,)
	const [editHorizontalChartVisible, setEditHorizontalChartVisible,] = React.useState<boolean>(false,)
	const [editVerticalChartVisible, setEditVerticalChartVisible,] = React.useState<boolean>(false,)
	const [editBubbleChartVisible, setEditBubbleChartVisible,] = React.useState<boolean>(false,)
	const [editLineChartVisible, setEditLineChartVisible,] = React.useState<boolean>(false,)

	const {
		currentIndex,
		builderType,
		setBuilderType,
		lessonPayload,
		setLessonPayload,
		resetCustomLessonStore,
		setCurrentIndex,
		resetCustomLessonContent,
	} = useCustomLessonStore()

	const location = useLocation()
	const locationState = location.state as TCustomLessonLocationState
	const customPayload = locationState?.customPayload
	const lessonId = locationState?.lessonId

	const navigate = useNavigate()

	const {
		mutateAsync: createLesson,
		isPending: createLessonPending,
	} = useCreateLesson()

	const {
		mutateAsync: updateLesson,
		isPending: updateLessonPending,
	} = useUpdateLesson()

	const {
		data: lesson,
	} = useLesson(lessonId,)

	const closeEditors = React.useCallback((): void => {
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
	}, [],)

	const toggleEditTable = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setBuilderType(LessonBlockType.CONTENT,)
		setEditTextVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setEditTableVisible((prev,) => {
			return !prev
		},)
	}, [
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	const toggleEditText = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setBuilderType(LessonBlockType.CONTENT,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setEditTextVisible((prev,) => {
			return !prev
		},)
	}, [
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	const toggleEditPieChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(LessonBlockType.PIE_CHART,)
		setEditPieChartVisible((prev,) => {
			return !prev
		},)
	}, [
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	const toggleEditHorizontalChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(LessonBlockType.HORIZONTAL_CHART,)
		setEditHorizontalChartVisible((prev,) => {
			return !prev
		},)
	}, [
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	const toggleEditVerticalChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(LessonBlockType.VERTICAL_CHART,)
		setEditVerticalChartVisible((prev,) => {
			return !prev
		},)
	}, [
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	const toggleEditBubbleChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(LessonBlockType.BUBBLE_CHART,)
		setEditBubbleChartVisible((prev,) => {
			return !prev
		},)
	}, [
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	const toggleEditLineChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setBuilderType(LessonBlockType.LINE_CHART,)
		setEditLineChartVisible((prev,) => {
			return !prev
		},)
	}, [
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	const handleLeavePage = React.useCallback((): void => {
		navigate(RouterKeys.LESSONS, {
			state: null,
		},)
		resetCustomLessonStore()
	}, [navigate, resetCustomLessonStore,],)

	const handleCreateLesson = React.useCallback(async(): Promise<void> => {
		if (!customLesson) {
			return
		}

		const title = customLesson.title.trim()
		const comment = normalizeComment(customLesson.comment,)

		if (!title || !lessonPayload.length) {
			return
		}

		await createLesson({
			title,
			comment,
			payload: {
				blocks: lessonPayload,
			},
		},)

		handleLeavePage()
	}, [
		createLesson,
		customLesson,
		handleLeavePage,
		lessonPayload,
	],)

	const handleUpdateLesson = React.useCallback(async(): Promise<void> => {
		if (!customLesson?.lessonId) {
			return
		}

		const title = customLesson.title.trim()
		const comment = normalizeComment(customLesson.comment,)

		if (!title || !lessonPayload.length) {
			return
		}

		await updateLesson({
			id:   customLesson.lessonId,
			body: {
				title,
				comment,
				payload: {
					blocks: lessonPayload,
				},
			},
		},)

		handleLeavePage()
	}, [
		customLesson,
		handleLeavePage,
		lessonPayload,
		updateLesson,
	],)

	const isActionDisabled = React.useMemo((): boolean => {
		if (!customLesson) {
			return true
		}

		return !customLesson.title.trim() || !lessonPayload.length || createLessonPending || updateLessonPending
	}, [
		createLessonPending,
		customLesson,
		lessonPayload,
		updateLessonPending,
	],)

	React.useEffect(() => {
		if (!customPayload && !lessonId) {
			handleLeavePage()
		}
	}, [
		customPayload,
		handleLeavePage,
		lessonId,
	],)

	React.useEffect(() => {
		setCurrentIndex(undefined,)
		resetCustomLessonContent()
		setBuilderType(LessonBlockType.CONTENT,)
		closeEditors()
	}, [
		closeEditors,
		resetCustomLessonContent,
		setBuilderType,
		setCurrentIndex,
	],)

	React.useEffect(() => {
		if (customPayload) {
			setCustomLesson({
				title:    customPayload.title?.trim() ?? '',
				comment:  customPayload.comment ?? undefined,
				lessonId: undefined,
				payload:  undefined,
			},)
			setLessonPayload(extractLessonBlocks(customPayload.payload,),)
			return
		}

		if (lessonId && lesson) {
			setCustomLesson({
				lessonId: lesson.id,
				title:    lesson.title,
				comment:  lesson.comment ?? undefined,
				payload:  undefined,
			},)
			setLessonPayload(extractLessonBlocks(lesson.payload,),)
		}
	}, [
		customPayload,
		lesson,
		lessonId,
		setLessonPayload,
	],)

	React.useEffect(() => {
		return () => {
			resetCustomLessonStore()
		}
	}, [resetCustomLessonStore,],)

	return (
		<div className={styles.container}>
			<div className={styles.panel}>
				<ReportContent
					hasHeader={false}
					editTableVisible={editTableVisible}
					editTextVisible={editTextVisible}
					editPieChartVisible={editPieChartVisible}
					editHorizontalChartVisible={editHorizontalChartVisible}
					editVerticalChartVisible={editVerticalChartVisible}
					editBubbleChartVisible={editBubbleChartVisible}
					editLineChartVisible={editLineChartVisible}
					closeEditors={closeEditors}
				/>
			</div>

			{builderType === LessonBlockType.CONTENT && (
				<LessonsBuilder
					handleCreateLesson={lessonId ?
						undefined :
						handleCreateLesson}
					handleUpdateLesson={lessonId ?
						handleUpdateLesson :
						undefined}
					createDisabled={isActionDisabled}
					updateDisabled={isActionDisabled}
					toggleEditText={toggleEditText}
					toggleEditTable={toggleEditTable}
					toggleEditPieChart={toggleEditPieChart}
					toggleEditHorizontalChart={toggleEditHorizontalChart}
					toggleEditVerticalChart={toggleEditVerticalChart}
					toggleEditBubbleChart={toggleEditBubbleChart}
					toggleEditLineChart={toggleEditLineChart}
				/>
			)}

			{builderType === LessonBlockType.PIE_CHART && (
				<PieChartConstructor
					key={currentIndex}
					setEditPieChartVisible={setEditPieChartVisible}
				/>
			)}

			{builderType === LessonBlockType.HORIZONTAL_CHART && (
				<HorizontalBarChartConstructor
					key={currentIndex}
					setEditHorizontalChartVisible={setEditHorizontalChartVisible}
				/>
			)}

			{builderType === LessonBlockType.VERTICAL_CHART && (
				<VerticalBarChartConstructor
					key={currentIndex}
					setEditVerticalChartVisible={setEditVerticalChartVisible}
				/>
			)}

			{builderType === LessonBlockType.BUBBLE_CHART && (
				<BubbleChartConstructor
					key={currentIndex}
					setEditBubbleChartVisible={setEditBubbleChartVisible}
				/>
			)}

			{builderType === LessonBlockType.LINE_CHART && (
				<LineChartConstructor
					key={currentIndex}
					setEditLineChartVisible={setEditLineChartVisible}
				/>
			)}
		</div>
	)
}

export default CustomLesson