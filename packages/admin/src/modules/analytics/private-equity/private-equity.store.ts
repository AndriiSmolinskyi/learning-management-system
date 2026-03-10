import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	TPrivateEquitySortFilter,
	TPrivateEquityFilter,
} from './private-equity.types'
import {
	TPrivateEquityTableSortVariants,
} from './private-equity.types'

type TPrivateEquityState = {
	filter: TPrivateEquityFilter
	sortFilter: TPrivateEquitySortFilter
}

type TPrivateEquityActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetId: (value: Array<string> | undefined) => void;
	setFundNames: (value: Array<string> | undefined) => void;
	setFundTypes: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TPrivateEquitySortFilter) => void;
	resetPrivateEquityStore: () => void
}

export const initialState: TPrivateEquityState = {
	filter: {
		type:      AssetNamesType.PRIVATE_EQUITY,
	},
	sortFilter: {
		sortBy:    TPrivateEquityTableSortVariants.ENTRY_DATE,
		sortOrder:    SortOrder.DESC,
	},
}

export const usePrivateEquityStore = create<TPrivateEquityState & TPrivateEquityActions>()((set,) => {
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
		setFundNames: (fundNames: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						fundNames,
					},
				}
			},)
		},
		setFundTypes: (fundTypes: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						fundTypes,
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
		setSortFilters: (sortFilter: TPrivateEquitySortFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetPrivateEquityStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)