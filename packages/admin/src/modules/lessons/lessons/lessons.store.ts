import {
	create,
} from 'zustand'

import type {
	GetLessonsQuery,
} from '../../../shared/types'
import {
	LessonsSortBy,
	SortOrder,
} from '../../../shared/types'

type TLessonState = {
	filter: GetLessonsQuery
}

type TLessonActions = {
	setSortBy: (value: LessonsSortBy | undefined) => void
	setSortOrder: (value: SortOrder | undefined) => void
	setSearch: (value: string | undefined) => void
	resetLessonStore: () => void
}

export const initialState: TLessonState = {
	filter: {
		sortBy:    LessonsSortBy.CREATED_AT,
		sortOrder: SortOrder.DESC,
		search:    undefined,
	},
}

export const useLessonStore = create<TLessonState & TLessonActions>()((set,) => {
	return {
		...initialState,

		setSortBy: (sortBy: LessonsSortBy | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						sortBy,
					},
				}
			},)
		},

		setSortOrder: (sortOrder: SortOrder | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						sortOrder,
					},
				}
			},)
		},

		setSearch: (search: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						search,
					},
				}
			},)
		},

		resetLessonStore: (): void => {
			set(initialState,)
		},
	}
},)