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

export const useCreateTransactionDraft = (): UseMutationResult<ITransaction, Error, TAddTransactionProps> => {
	return useMutation({
		mutationFn:  async(body: TAddTransactionProps,) => {
			return transactionService.createTransactionDraft(body,)
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
				queryKey: [queryKeys.TRANSACTION_DRAFT,],
			},)
		},
	},)
}