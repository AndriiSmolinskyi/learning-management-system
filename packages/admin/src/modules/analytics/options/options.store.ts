import {
	create,
} from 'zustand'

import type {
	TOptionsTableFilter,
} from './options.types'
import {
	TOptionsSortVariants,
	type TOptionsFilter,
} from './options.types'
import {
	SortOrder,
} from '../../../shared/types'

type TOptionsState = {
	filter: TOptionsFilter
	sortFilter: TOptionsTableFilter
}

type TOptionsActions = {
	setBankId:(value: string | undefined) => void;
	setMaturityYear: (value: number | undefined) => void;
	setAssetIds:(value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TOptionsTableFilter) => void;
	resetOptionsStore: () => void
}

const initialState: TOptionsState = {
	filter: {
		bankId:       undefined,
		maturityYear: undefined,
		assetIds:     undefined,
	},
	sortFilter: {
		sortBy:    TOptionsSortVariants.START_DATE,
		sortOrder: SortOrder.DESC,
	},
}

export const useOptionsStore = create<TOptionsState & TOptionsActions>()((set,) => {
	return {
		...initialState,
		setMaturityYear: (maturityYear: number | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						maturityYear,
					},
				}
			},)
		},
		setAssetIds: (assetIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						assetIds,
					},
				}
			},)
		},
		setBankId: (bankId: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						bankId,
					},
				}
			},)
		},
		setSortFilters: (sortFilter: TOptionsTableFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetOptionsStore: (): void => {
			set(initialState,)
		},
	}
},)