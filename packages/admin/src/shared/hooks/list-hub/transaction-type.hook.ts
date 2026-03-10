import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'
import {
	transactionTypeListService,
} from '../../../services/list-hub/services'
import {
	queryKeys,
} from '../../constants'
import {
	FetchErrorMessages,
} from '../../constants/messages.constants'
import type {
	ITransactionListHubItemResponse,
} from '../../types'

export const useGetTransactionTypeList = (): UseQueryResult<Array<ITransactionListHubItemResponse>, Error> => {
	return useQuery({
		queryKey:         [queryKeys.TRANSACTION_TYPE_LIST,],
		queryFn:          async() => {
			try {
				const data = await transactionTypeListService.getTransactionTypeList()
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_TRANSACTION_TYPE_LIST_ERROR,)
			}
		},
		staleTime: 5 * 60 * 1000,
	},)
}

export const useGetTransactionCategoryList = (): UseQueryResult<Array<string>, Error> => {
	return useQuery({
		queryKey:         [queryKeys.TRANSACTION_CATEGORY_LIST,],
		queryFn:          async() => {
			try {
				const data = await transactionTypeListService.getTransactionCategoryList()
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_TRANSACTION_CATEGORY_LIST_ERROR,)
			}
		},
		staleTime: 5 * 60 * 1000,
	},)
}

