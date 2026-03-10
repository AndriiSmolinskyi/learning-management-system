import {
	create,
} from 'zustand'

import type {
	ReportCategory,
	ReportType,
} from '../../../shared/types'
import {
	SortOrder,
} from '../../../shared/types'
import type {
	TReportSortByVariants,
} from './reports.types'
import type {
	TReportFilter,
} from './reports.types'

type TReportState = {
	filter: TReportFilter
}

type TReportActions = {
	setSortBy: (value: TReportSortByVariants | undefined) => void;
	setSortOrder: (value: SortOrder | undefined) => void;
	setType: (value: ReportType | undefined) => void;
	setCategory: (value: ReportCategory | undefined) => void;
	setSearch: (value: string | undefined) => void;
	resetReportStore: () => void
}

export const initialState: TReportState = {
	filter: {
		sortBy:    'id',
		sortOrder: SortOrder.DESC,
		search:    undefined,
	},
}

export const useReportStore = create<TReportState & TReportActions>()((set,) => {
	return {
		...initialState,
		setSortBy: (sortBy: TReportSortByVariants | undefined,): void => {
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
		setType: (type: ReportType | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						type,
					},
				}
			},)
		},
		setCategory: (category: ReportCategory | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						category,
					},
				}
			},)
		},
		resetReportStore: (): void => {
			set(initialState,)
		},
	}
},)