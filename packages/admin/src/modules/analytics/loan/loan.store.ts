import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	TLoanFilter,
	TLoanSortFilter,
} from './loan.types'
import {
	TLoanTableSortVariants,
} from './loan.types'

type TLoanState = {
	filter: TLoanFilter
	sortFilter: TLoanSortFilter

}

type TLoanActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetId: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TLoanSortFilter) => void;
	resetLoanStore: () => void
}

export const initialState: TLoanState = {
	filter: {
		type:      AssetNamesType.LOAN,
	},
	sortFilter: {
		sortBy:    TLoanTableSortVariants.START_DATE,
		sortOrder:    SortOrder.DESC,
	},
}

export const useLoanStore = create<TLoanState & TLoanActions>()((set,) => {
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
		setSortFilters: (sortFilter: TLoanSortFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetLoanStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)