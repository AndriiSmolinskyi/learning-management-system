import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	transactionService,
} from '../../../services/transaction/transaction.service'
import {
	queryClient,
} from '../../../providers/query.provider'
import {
	queryKeys,
} from '../../constants'

import type {
	ITransaction,
	TEditTransactionProps,
} from '../../types'

export const useUpdateTransaction = (): UseMutationResult<ITransaction, Error, TEditTransactionProps> => {
	return useMutation({
		mutationFn: async(body: TEditTransactionProps,) => {
			return transactionService.updateTransaction(body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message,
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess(data,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION, data.id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.DOCUMENT, data.id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_FILTERED,],
				exact:    false,
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT,],
			},)
			setTimeout(() => {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.BUDGET_TRANSACTIONS,],
				},)
			}, 100,)
		},
	},)
}