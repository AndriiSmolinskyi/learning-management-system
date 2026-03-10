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
	ITransaction,
} from '../../types'

export const useTransactionById = (id?: number,): UseQueryResult<ITransaction> => {
	return useQuery({
		queryKey: [
			queryKeys.TRANSACTION,
			id,
		],
		queryFn:  async() => {
			return transactionService.getTransactionById(id,)
		},
		enabled: Boolean(id,),
	},)
}
