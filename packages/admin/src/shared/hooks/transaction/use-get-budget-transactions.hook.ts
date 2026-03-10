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
	BudgetTransactionFilter,
	IBudgetTransaction,
} from '../../../shared/types'
import {
	transactionService,
} from '../../../services/transaction/transaction.service'

export const useGetBudgetTransactions = (
	filter: BudgetTransactionFilter,
): UseQueryResult<Array<IBudgetTransaction>> => {
	return useQuery({
		queryKey: [
			queryKeys.BUDGET_TRANSACTIONS, filter,
		],
		queryFn:  async() => {
			return transactionService.getBudgetTransactions(filter,)
		},
		enabled: Boolean(filter.clientId.trim(),),
	},)
}
