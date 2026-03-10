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
	TAddTransactionProps,
} from '../../types'

export const useCreateTransaction = (): UseMutationResult<ITransaction, Error, TAddTransactionProps> => {
	return useMutation({
		mutationFn:  async(body: TAddTransactionProps,) => {
			return transactionService.createTransaction(body,)
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
				queryKey: [queryKeys.TRANSACTION,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_FILTERED,],
				exact:    false,
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_DRAFT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CASH,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_CURRENCY,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.OVERVIEW,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_BANK,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.OPTION_PREMIUM,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BONDS_ANALYTICS,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_DETAILED, data.portfolioId,],
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