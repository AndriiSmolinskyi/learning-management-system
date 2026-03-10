import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	TDepositFilter,
	TDepositSortFilter,
} from './deposit.types'
import {
	TDepositTableSortVariants,
} from './deposit.types'

type TDepositState = {
	filter: TDepositFilter
	sortFilter: TDepositSortFilter

}

type TDepositActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetId: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TDepositSortFilter) => void;
	resetDepositStore: () => void
}

export const initialState: TDepositState = {
	filter: {
		type:      AssetNamesType.CASH_DEPOSIT,
	},
	sortFilter: {
		sortBy:    TDepositTableSortVariants.START_DATE,
		sortOrder:    SortOrder.DESC,
	},
}

export const useDepositStore = create<TDepositState & TDepositActions>()((set,) => {
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
		setSortFilters: (sortFilter: TDepositSortFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		resetDepositStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)