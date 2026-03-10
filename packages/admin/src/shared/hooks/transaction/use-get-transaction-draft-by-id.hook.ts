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

export const useTransactionDraftById = (id?: number,): UseQueryResult<ITransaction> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_DRAFT, id,],
		queryFn:  async() => {
			return transactionService.getTransactionDraftById(id,)
		},
		enabled: Boolean(id,),
	},)
}
