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

export const useUpdateTransactionDraft = (): UseMutationResult<ITransaction, Error, TEditTransactionProps> => {
	return useMutation({
		mutationFn:  async(body: TEditTransactionProps,) => {
			return transactionService.updateTransactionDraft(body,)
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
				queryKey: [queryKeys.TRANSACTION_DRAFT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_DRAFT, data.id,],
			},)
		},
	},)
}