import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../../shared/constants'
import type {
	ITransaction,
} from '../../../shared/types'
import {
	transactionService,
} from '../../../services/transaction/transaction.service'

export const useTransactionDraftList = (): UseQueryResult<Array<ITransaction>> => {
	return useQuery<Array<ITransaction>>({
		queryKey: [
			queryKeys.TRANSACTION_DRAFT,
		],
		queryFn:  async() => {
			return transactionService.getTransactionDrafts()
		},
	},)
}
