import {
	create,
} from 'zustand'

import {
	SortOrder,
	StudentsSortBy,
} from '../../shared/types'
import type {
	GetStudentsQuery,
} from '../../shared/types'

type TStudentsState = {
	filter: GetStudentsQuery
}

type TStudentsActions = {
	setSortBy: (value: StudentsSortBy | undefined) => void
	setSortOrder: (value: SortOrder | undefined) => void
	setSearch: (value: string | undefined) => void
	setPage: (value: number | undefined) => void
	setPageSize: (value: number | undefined) => void
	resetStudentsStore: () => void
}

export const initialFilterStoreState: GetStudentsQuery = {
	search:    undefined,
	sortBy:    StudentsSortBy.CREATED_AT,
	sortOrder: SortOrder.DESC,
	page:      1,
	pageSize:  10,
}

export const initialState: TStudentsState = {
	filter: {
		search:    undefined,
		sortBy:    StudentsSortBy.CREATED_AT,
		sortOrder: SortOrder.DESC,
		page:      1,
		pageSize:  10,
	},
}

export const useStudentsStore = create<TStudentsState & TStudentsActions>()((set,) => {
	return {
		...initialState,

		setSortBy: (sortBy: StudentsSortBy | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						sortBy,
						page: 1,
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
						page: 1,
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
						page:  1,
					},
				}
			},)
		},

		setPage: (page: number | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						page,
					},
				}
			},)
		},

		setPageSize: (pageSize: number | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						pageSize,
						page: 1,
					},
				}
			},)
		},

		resetStudentsStore: (): void => {
			set(initialState,)
		},
	}
},)