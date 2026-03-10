import {
	create,
} from 'zustand'
import {
	persist,
} from 'zustand/middleware'
import type {
	ITransaction,
	OperationTransactionFilter,
	TransactionSortKey,
} from '../../../shared/types'
import {
	SortOrder,
} from '../../../shared/types'
import {
	TransactionsSortFields,
} from './transaction.constants'

type TransactionState = {
	filter: OperationTransactionFilter
	showChart: boolean
}

type TransactionActions = {
	setSortBy: (value: keyof Pick<ITransaction, TransactionSortKey> | undefined) => void;
	setSortOrder: (value: SortOrder | undefined) => void;
	setSearch: (value?: string) => void;
	setClientId: (value?: string) => void;
	setPortfolioId: (value?: string) => void;
	setBankId: (value?: string) => void;
	setTransactionName: (value?: string) => void;
	// setCategory: (value?: string) => void;
	setIsins: (value: Array<string> | undefined) => void;
	setTransactionTypes: (value: Array<string> | undefined) => void;
	setSecurities: (value: Array<string> | undefined) => void
	setDateRange: (dateRange: [Date | null, Date | null] | undefined) => void
	setCurrency: (value?: string) => void;
	setIsCalendarError: (isError: boolean) => void
	setTransactionIds: (value: Array<number> | undefined) => void;
	setShowChart: () => void
	resetTransactionStore: () => void
}

export const initialState: TransactionState = {
	filter: {
		sortBy:    TransactionsSortFields.TRANSACTION_DATE,
		sortOrder: SortOrder.DESC,
		isError:   false,
	},
	showChart: false,
}

export const useTransactionStore = create<TransactionState & TransactionActions>()(
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
			setSortBy: (sortBy: keyof Pick<ITransaction, TransactionSortKey> | undefined,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							sortBy,
						},
					}
				},)
			},
			setSortOrder: (sortOrder: SortOrder | undefined,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							sortOrder,
						},
					}
				},)
			},
			setSearch: (search?: string,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							search,
						},
					}
				},)
			},
			setClientId: (clientId?: string,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							clientId,
						},
					}
				},)
			},
			setPortfolioId: (portfolioId?: string,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							portfolioId,
						},
					}
				},)
			},
			setBankId: (bankId?: string,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							bankId,
						},
					}
				},)
			},
			setTransactionName: (transactionTypeId?: string,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							transactionTypeId,
						},
					}
				},)
			},
			// setCategory: (category?: string,): void => {
			// 	set((state,) => {
			// 		return {
			// 			filter: {
			// 				...state.filter,
			// 				category,
			// 			},
			// 		}
			// 	},)
			// },
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
			setCurrency: (currency?: string,): void => {
				set((state,) => {
					return {
						filter: {
							...state.filter,
							currency,
						},
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
			resetTransactionStore: (): void => {
				set(initialState,)
			},
		}
	},
	{
		name:       'operations-transaction-storage',
		partialize: (state,) => {
			return {
				filter:    state.filter,
				showChart: state.showChart,
			}
		},
	},
	),)