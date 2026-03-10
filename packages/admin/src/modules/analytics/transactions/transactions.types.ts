import type {
	SortOrder,
} from '../../../shared/types'

export enum TransactionType {
	INCOME = 'Income',
	EXPENSE = 'Expense',
}

export enum TransactionTableSortVariants {
	AMOUNT = 'amount',
	ID = 'id',
	TRANSACTION_DATE = 'transactionDate',
	ISIN = 'isin',
	SECURITY = 'security',
	USD_VALUE = 'usdValue',
}

export type SelectOptionType = {
	id: string
	name: string
}

export interface IOptionType<T = string> {
	label: string
	value: T
}

export type TransactionSortFilter = {
	sortBy: TransactionTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TransactionFilter = {
	transactionIds?: Array<number>
	transactionTypes?: Array<string>
	isins?: Array<string>
	securities?: Array<string>
	dateRange?: [Date | null, Date | null] | undefined
	isError?: boolean
}

export type TransactionAnalytics = {
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	bankIds?: Array<string>
	serviceProviders?: Array<string>
	currencies?: Array<string>
}

export type ChartData = {
	name: TransactionType
	value?: number
}
