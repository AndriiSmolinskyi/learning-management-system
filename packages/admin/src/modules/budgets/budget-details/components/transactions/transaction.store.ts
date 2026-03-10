import {
	create,
} from 'zustand'

import type {
	TOperationsStoreFilterItem,
	TTransactionSearch,
	TTransactionTableSortFilter,
} from './transactions.types'
import {
	SortOrder,
	TTransactionTableSortVariants,
} from '../../../../../shared/types'
import {
	addDays, subSeconds,
} from 'date-fns'

type TransactionState = {
	sortFilter: TTransactionTableSortFilter
	filter: TTransactionSearch
}

type TransactionActions = {
	setSortBy: (value: TTransactionTableSortVariants) => void;
	setSortOrder: (value: SortOrder) => void;
	setSearch: (value: string | undefined) => void;
	setTransactionNames: (value: TOperationsStoreFilterItem) => void;
	setCategories: (value: TOperationsStoreFilterItem) => void;
	setCurrencies: (value: TOperationsStoreFilterItem) => void;
	setDateRange: (dateRange: [Date | null, Date | null] | undefined) => void
	resetTransactionStore: () => void
}

export const initialFilterValues = {
	transactionNames:           undefined,
	currencies:                 undefined,
	transactionNacategoriesmes:   undefined,
	dateRange:                  undefined,
	search:                     undefined,
}
export const initialState: TransactionState = {
	sortFilter: {
		sortBy:    TTransactionTableSortVariants.TRANSACTION_DATE,
		sortOrder: SortOrder.DESC,
	},
	filter: {
		...initialFilterValues,
	},
}

export const useTransactionStore = create<TransactionState & TransactionActions>()((set,) => {
	return {
		...initialState,
		setSortBy: (sortBy: TTransactionTableSortVariants,): void => {
			set((state,) => {
				return {
					sortFilter: {
						...state.sortFilter,
						sortBy,
					},
				}
			},)
		},
		setSortOrder: (sortOrder: SortOrder,): void => {
			set((state,) => {
				return {
					sortFilter: {
						...state.sortFilter,
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
		setTransactionNames: (transactionNames: TOperationsStoreFilterItem,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						transactionNames,
					},
				}
			},)
		},
		setCategories: (categories: TOperationsStoreFilterItem,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						categories,
					},
				}
			},)
		},
		setCurrencies: (currencies: TOperationsStoreFilterItem,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						currencies,
					},
				}
			},)
		},
		setDateRange: (dateRange: [Date | null, Date | null] | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						dateRange: dateRange ?
							[
								dateRange[0],
								dateRange[1] ?
									subSeconds(addDays(dateRange[1], 1,), 1,) :
									null,
							] :
							undefined,
					},
				}
			},)
		},
		resetTransactionStore: (): void => {
			set(initialState,)
		},
	}
},)