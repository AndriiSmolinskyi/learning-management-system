import type {
	UseInfiniteQueryResult,
	QueryFunctionContext,
	InfiniteData,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useInfiniteQuery, useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../../shared/constants'
import type {
	OperationTransactionFilter,
	TransactionListRes,
	OperationTransactionFilterRequest,
} from '../../../shared/types'
import {
	transactionService,
} from '../../../services/transaction/transaction.service'

export const useTransactionListFilteredInfinite = (
	filter: Omit<OperationTransactionFilterRequest, 'skip' | 'take'> & { take: number },
): UseInfiniteQueryResult<InfiniteData<TransactionListRes, number>, Error> => {
	return useInfiniteQuery<TransactionListRes, Error, InfiniteData<TransactionListRes, number>, [string, typeof filter], number>({
		queryKey: [queryKeys.TRANSACTION, filter,],
		queryFn:  async(context: QueryFunctionContext<[string, typeof filter], number>,) => {
			const pageParam = context.pageParam || 0
			return transactionService.getTransactionsFiltered({
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

export const useTransactionListFiltered = (
	filter: OperationTransactionFilter,
): UseQueryResult<TransactionListRes> => {
	return useQuery({
		queryKey: [
			queryKeys.TRANSACTION_FILTERED, filter,
		],
		queryFn:  async() => {
			return transactionService.getTransactionsFiltered(filter,)
		},
		staleTime: 0,
	},)
}