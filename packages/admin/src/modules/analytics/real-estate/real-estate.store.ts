import {
	create,
} from 'zustand'

import type {
	TRealEstateFilter, TRealEstateTableFilter,
} from './real-estate.types'
import {
	TRealEstateSortVariants,
} from './real-estate.types'
import {
	SortOrder,
} from '../../../shared/types'

type TRealEstateState = {
	filter: TRealEstateFilter
	sortFilter: TRealEstateTableFilter
}

type TRealEstateActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setCity: (value: string | undefined) => void;
	setAssetIds:(value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TRealEstateTableFilter) => void;
	resetRealEstateStore: () => void
}

export const initialRealEstateFilter = {
	city:     undefined,
	currency: undefined,
	assetIds: undefined,
}
export const initialState: TRealEstateState = {
	filter:     initialRealEstateFilter,
	sortFilter: {
		sortBy:    TRealEstateSortVariants.DATE,
		sortOrder: SortOrder.DESC,
	},
}

export const useRealEstateStore = create<TRealEstateState & TRealEstateActions>()((set,) => {
	return {
		...initialState,
		setCurrency: (currency: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						currency,
					},
				}
			},)
		},
		setCity: (city: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						city,
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
		setSortFilters: (sortFilter: TRealEstateTableFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetRealEstateStore: (): void => {
			set(initialState,)
		},
	}
},)