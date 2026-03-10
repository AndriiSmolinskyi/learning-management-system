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
	TransactionCurrencyTotals,
} from '../../types'

export const useGetTransactionCurrencyTotals = (body: TransactionCurrencyTotals,): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.TRANSACTION_CURRENCY_TOTALS,
			body,
		],
		queryFn:  async() => {
			return transactionService.getCurrencyTotals(body,)
		},
		enabled: Boolean(body.accountId,) && Boolean(body.currency,),
	},)
}
