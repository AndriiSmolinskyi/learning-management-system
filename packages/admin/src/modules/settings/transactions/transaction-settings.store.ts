
import {
	create,
} from 'zustand'
import {
	SortOrder,
} from '../../../shared/types'
import type {
	TransactionTypeFilter,
	TransactionCashFlow, PlType,
} from '../../../shared/types'
import {
	TransactionTypeSortBy,
} from '../../../shared/types'

type TTransactionTypeState = {
	filter: TransactionTypeFilter
}

type TTransactionTypeActions = {
	setSortBy: (value: TransactionTypeSortBy | undefined) => void;
	setSortOrder: (value: SortOrder | undefined) => void;
	setSearch: (value: string | undefined) => void;

	setAssets: (value: Array<string> | undefined) => void;
	setCategoryIds: (value: Array<string> | undefined) => void;
	setCashFlows: (value: Array<TransactionCashFlow> | undefined) => void;
	setPls: (value: Array<PlType> | undefined) => void;
	setIsActivated: (value: boolean | undefined) => void;
	setIsDeactivated: (value: boolean | undefined) => void;

	resetTransactionTypeStore: () => void
}

export const initialFilterStoreState: TransactionTypeFilter = {
	sortBy:        TransactionTypeSortBy.NAME,
	sortOrder:     SortOrder.DESC,
	search:        undefined,
	assets:        undefined,
	categoryIds:   undefined,
	cashFlows:     undefined,
	pls:           undefined,
	isActivated:   undefined,
	isDeactivated: undefined,
}

export const initialState: TTransactionTypeState = {
	filter: {
		sortBy:        TransactionTypeSortBy.NAME,
		sortOrder:     SortOrder.DESC,
		search:        undefined,
		assets:        undefined,
		categoryIds:   undefined,
		cashFlows:     undefined,
		pls:           undefined,
		isActivated:   undefined,
		isDeactivated: undefined,
	},
}

export const useTransactionTypeStore = create<TTransactionTypeState & TTransactionTypeActions>()((set,) => {
	return {
		...initialState,

		setSortBy: (sortBy: TransactionTypeSortBy | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, sortBy,
					},
				}
			},)
		},

		setSortOrder: (sortOrder: SortOrder | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, sortOrder,
					},
				}
			},)
		},

		setSearch: (search: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, search,
					},
				}
			},)
		},

		setAssets: (assets: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, assets,
					},
				}
			},)
		},

		setCategoryIds: (categoryIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, categoryIds,
					},
				}
			},)
		},

		setCashFlows: (cashFlows: Array<TransactionCashFlow> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, cashFlows,
					},
				}
			},)
		},

		setPls: (pls: Array<PlType> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, pls,
					},
				}
			},)
		},

		setIsActivated: (isActivated: boolean | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, isActivated,
					},
				}
			},)
		},

		setIsDeactivated: (isDeactivated: boolean | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, isDeactivated,
					},
				}
			},)
		},

		resetTransactionTypeStore: (): void => {
			set(initialState,)
		},
	}
},)
