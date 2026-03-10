import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	TEquitySortFilter,
	TEquityFilter,
} from './equities.types'
import {
	TEquityTableSortVariants,
} from './equities.types'

type TEquityState = {
	filter: TEquityFilter
	sortFilter: TEquitySortFilter

}

type TEquityActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetId: (value: Array<string> | undefined) => void;
	setIsins: (value: Array<string> | undefined) => void;
	setSecurities: (value: Array<string> | undefined) => void;
	setEquityTypes: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TEquitySortFilter) => void;
	resetEquityStore: () => void
}

export const initialState: TEquityState = {
	filter: {
		type:      AssetNamesType.EQUITY_ASSET,
	},
	sortFilter: {
		sortBy:    TEquityTableSortVariants.PROFIT_USD,
		sortOrder:    SortOrder.DESC,
	},
}

export const useEquityStore = create<TEquityState & TEquityActions>()((set,) => {
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
		setEquityTypes: (equityTypes: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						equityTypes,
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
		setSortFilters: (sortFilter: TEquitySortFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetEquityStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)