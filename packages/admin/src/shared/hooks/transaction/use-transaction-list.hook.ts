import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	transactionService,
} from '../../../services/transaction/transaction.service'

import {
	queryKeys,
} from '../../constants'
import type {
	TransactionListRes,
} from '../../types'

export const useTransactionList = (): UseQueryResult<TransactionListRes> => {
	return useQuery<TransactionListRes>({
		queryKey: [
			queryKeys.TRANSACTION,
		],
		queryFn:  async() => {
			return transactionService.getTransactions()
		},
	},)
}
