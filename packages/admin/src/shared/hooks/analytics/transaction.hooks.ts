import type {
	InfiniteData,
	QueryFunctionContext,
	UseInfiniteQueryResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useInfiniteQuery,
	useQuery,
} from '@tanstack/react-query'
import {
	queryKeys,
} from '../../constants'
import {
	transactionService,
} from '../../../services/analytics/transaction.service'
import type {
	TTransactionSelectProps,
	TransactionFilter,
} from '../../../services/analytics/analytics.types.ts'
import type {
	TransactionListAnalyticsRes,
	GetListProps,
	TransactionPl,
	ITransactionFilteredSelects,
} from '../../../shared/types'
import type {
	TransactionSortFilter,
} from '../../../modules/analytics/transactions/transactions.types'

export const useTransactionAnalytics = (
	filter: TransactionFilter & TransactionSortFilter & GetListProps,
): UseQueryResult<TransactionListAnalyticsRes> => {
	return useQuery({
		queryKey: [
			queryKeys.TRANSACTION_ANALYTICS,
			filter,
		],
		queryFn:  async() => {
			return transactionService.getTransactionAnalytics(filter,)
		},
	},)
}

export const useTransactionAnalyticsByIds = (
	filter: TransactionFilter,
): UseQueryResult<TransactionPl> => {
	return useQuery({
		queryKey: [
			queryKeys.TRANSACTION_ANALYTICS,
			filter,
		],
		queryFn:  async() => {
			return transactionService.getTransactionAnalyticsByIds(filter,)
		},
	},)
}

export const useTransactionAnalyticsFilteredInfinite = (
	filter: Omit<TransactionFilter & TransactionSortFilter & GetListProps, 'skip' | 'take'> & { take: number },
): UseInfiniteQueryResult<InfiniteData<TransactionListAnalyticsRes, number>, Error> => {
	return useInfiniteQuery<TransactionListAnalyticsRes, Error, InfiniteData<TransactionListAnalyticsRes, number>, [string, typeof filter], number>({
		queryKey: [queryKeys.TRANSACTION_ANALYTICS, filter,],
		queryFn:  async(context: QueryFunctionContext<[string, typeof filter], number>,) => {
			const pageParam = context.pageParam || 0
			return transactionService.getTransactionAnalytics({
				...filter,
				skip: pageParam,
				take: filter.take,
			},)
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages,) => {
			const loadedCount = allPages.reduce((sum, page,) => {
				return sum + page.list.length
			}, 0,)
			return loadedCount < lastPage.total ?
				loadedCount :
				undefined
		},
	},)
}

export const useGetTransactionFilteredSelects = (filter: TTransactionSelectProps,): UseQueryResult<ITransactionFilteredSelects> => {
	return useQuery({
		queryKey: [
			queryKeys.TRANSACTION_FILTERED_SELECTS,
			filter,
		],
		queryFn:  async() => {
			return transactionService.getTransactionsFilteredSelects(filter,)
		},
	},)
}