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
	bankService,
} from '../../../services/bank/bank.service'
import {
	queryKeys,
} from '../../constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import type {
	TAddBankProps,
	IBank,
	TEditBankProps,
} from '../../types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useCreateBank = (): UseMutationResult<IBank, Error, TAddBankProps> => {
	return useMutation({
		mutationFn:  async(body: TAddBankProps,) => {
			return bankService.createBank(body,)
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
		onSuccess(context,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO, context.portfolioId ?? context.portfolioDraftId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_DETAILED,],
			},)
		},
	},)
}

export const useEditBank = (): UseMutationResult<IBank, Error, TEditBankProps> => {
	return useMutation({
		mutationFn:  async(body: TEditBankProps,) => {
			return bankService.updateBank(body,)
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
				queryKey: [queryKeys.PORTFOLIO_DETAILED, data.portfolioId ?? data.portfolioDraftId,],
			},)
		},
	},)
}
