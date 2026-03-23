import {
	create,
} from 'zustand'

import {
	SortOrder,
	GroupsSortBy,
} from '../../shared/types'
import type {
	GetGroupsQuery,
} from '../../shared/types'

type TGroupsState = {
	filter: GetGroupsQuery
}

type TGroupsActions = {
	setSortBy: (value: GroupsSortBy | undefined) => void
	setSortOrder: (value: SortOrder | undefined) => void
	setSearch: (value: string | undefined) => void
	setPage: (value: number | undefined) => void
	setPageSize: (value: number | undefined) => void
	resetGroupsStore: () => void
}

export const initialFilterStoreState: GetGroupsQuery = {
	search:    undefined,
	sortBy:    GroupsSortBy.CREATED_AT,
	sortOrder: SortOrder.DESC,
	page:      1,
	pageSize:  10,
}

export const initialState: TGroupsState = {
	filter: {
		search:    undefined,
		sortBy:    GroupsSortBy.CREATED_AT,
		sortOrder: SortOrder.DESC,
		page:      1,
		pageSize:  10,
	},
}

export const useGroupsStore = create<TGroupsState & TGroupsActions>()((set,) => {
	return {
		...initialState,

		setSortBy: (sortBy: GroupsSortBy | undefined,): void => {
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
						page:   1,
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

		resetGroupsStore: (): void => {
			set(initialState,)
		},
	}
},)