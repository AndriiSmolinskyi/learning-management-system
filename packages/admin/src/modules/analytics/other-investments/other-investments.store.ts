import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	TOtherInvestmentsFilter,
	TOtherInvestmentsSortFilter,
} from './other-investments.types'
import {
	TOtherInvestmentsTableSortVariants,
} from './other-investments.types'

type TOtherInvestmentsState = {
	filter: TOtherInvestmentsFilter
	sortFilter: TOtherInvestmentsSortFilter

}

type TOtherInvestmentsActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetIds: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TOtherInvestmentsSortFilter) => void;
	resetOtherInvestmentsStore: () => void
}

export const initialState: TOtherInvestmentsState = {
	filter: {
		type:      AssetNamesType.OTHER,
	},
	sortFilter: {
		sortBy:    TOtherInvestmentsTableSortVariants.INVESTMENT_DATE,
		sortOrder: SortOrder.DESC,
	},
}

export const useOtherInvestmentsStore = create<TOtherInvestmentsState & TOtherInvestmentsActions>()((set,) => {
	return {
		...initialState,
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
		setSortFilters: (sortFilter: TOtherInvestmentsSortFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetOtherInvestmentsStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)