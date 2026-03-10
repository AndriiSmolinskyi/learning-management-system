import {
	create,
} from 'zustand'

import {
	SortOrder,
} from '../../../shared/types'
import type {
	TransactionFilter,
	TransactionSortFilter,
} from './transactions.types'
import {
	TransactionTableSortVariants,
} from './transactions.types'
import {
	persist,
} from 'zustand/middleware'

type TransactionState = {
	filter: TransactionFilter
	sortFilter: TransactionSortFilter
	showChart: boolean
}

type TransactionActions = {
	setTransactionIds: (value: Array<number> | undefined) => void;
	setTransactionTypes: (value: Array<string> | undefined) => void;
	setIsins: (value: Array<string> | undefined) => void;
	setSecurities: (value: Array<string> | undefined) => void
	setSortFilters: (sortFilter: TransactionSortFilter) => void;
	setDateRange: (dateRange: [Date | null, Date | null] | undefined) => void
	setIsCalendarError: (isError: boolean) => void
	setShowChart: () => void
	resetTransactionStore: () => void
}

export const initialState: TransactionState = {
	filter:     {
	},
	sortFilter: {
		sortBy:    TransactionTableSortVariants.TRANSACTION_DATE,
		sortOrder: SortOrder.DESC,
	},
	showChart: false,
}

export const useAnalyticTransactionStore = create<TransactionState & TransactionActions>()(
	persist((set,) => {
		return {
			...initialState,
			setShowChart: (): void => {
				set((state,) => {
					return {
						showChart: !state.showChart,
					}
				},)
			},
			setTransactionIds: (transactionIds: Array<number> | undefined,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							transactionIds,
						},
					}
				},)
			},
			setTransactionTypes: (transactionTypes: Array<string> | undefined,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							transactionTypes,
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
			setSortFilters: (sortFilter: TransactionSortFilter,): void => {
				set(() => {
					return {
						sortFilter,
					}
				},)
			},
			setIsCalendarError: (isError: boolean | undefined,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							isError,
						},
					}
				},)
			},
			setDateRange: (dateRange: [Date | null, Date | null] | undefined,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							dateRange,
						},
					}
				},)
			},
			resetTransactionStore: (): void => {
				set(() => {
					return {
						...initialState,
					}
				},)
			},
		}
	},
	{
		name:       'analytics-transaction-filter-storage',
		partialize: (state,) => {
			return {
				filter:     state.filter,
				sortFilter: state.sortFilter,
				showChart:  state.showChart,
			}
		},
	},),)