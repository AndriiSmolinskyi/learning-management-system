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
	queryKeys,
} from '../../constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	transactionService,
} from '../../../services/transaction/transaction.service'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useDeleteTransaction = (): UseMutationResult<void, Error, { id: number; email: string | null; name: string; reason: string }, string> => {
	return useMutation({
		mutationFn:  async(data: { id: number; email: string | null; name: string; reason: string},) => {
			return transactionService.deleteTransaction(data,)
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
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_FILTERED,],
				exact:    false,
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.EXPENSE_CATEGORY,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_TRANSACTIONS,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_DETAILED,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_CHART,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT,],
			},)
		},
	},)
}