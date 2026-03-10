import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	TBondSortFilter,
	TBondFilter,
} from './bonds.types'
import {
	TBondTableSortVariants,
} from './bonds.types'

type TBondState = {
	filter: TBondFilter
	sortFilter: TBondSortFilter
}

type TBondActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetId: (value: Array<string> | undefined) => void;
	setIsins: (value: Array<string> | undefined) => void;
	setSecurities: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TBondSortFilter) => void;
	resetBondStore: () => void
}

export const initialState: TBondState = {
	filter: {
		type:      AssetNamesType.BONDS,
	},
	sortFilter: {
		sortBy:    TBondTableSortVariants.PROFIT_USD,
		sortOrder:    SortOrder.DESC,
	},
}

export const useBondStore = create<TBondState & TBondActions>()((set,) => {
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
		setIsins: (isins: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						isins,
					},
				}
			},)
		},
		setSecurities: (securities: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						securities,
					},
				}
			},)
		},
		setAssetId: (assetId: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						assetId,
					},
				}
			},)
		},
		setSortFilters: (sortFilter: TBondSortFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetBondStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)