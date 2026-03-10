
import type {
	MultiValue,
} from 'react-select'
import type {
	IOptionType,
	SortOrder,
	TTransactionTableSortVariants,
} from '../../../../../shared/types'

export type StoreTransactionListItem = {
	id: string
	name: string
}

export type TTransactionTableSortFilter = {
	sortBy: TTransactionTableSortVariants
	sortOrder: SortOrder

}
export type TTransactionTableFilter = {
	transactionNames?: Array<string>
	securities?: Array<string>
	currencies?: Array<string>
	dateRange?: [string | null, string | null]
}

export type TOperationsStoreFilterItem = MultiValue<IOptionType<StoreTransactionListItem>> | undefined

export type TTransactionSearch = {
	search?: string
	transactionNames?: TOperationsStoreFilterItem
	currencies?: TOperationsStoreFilterItem
	categories?: TOperationsStoreFilterItem
	dateRange?: [Date | null, Date | null] | undefined
}