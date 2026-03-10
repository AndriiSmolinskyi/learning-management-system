import type {
	UseMutationResult, UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	accountService,
} from '../../../services/account/account.service'
import {
	queryKeys,
} from '../../constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import type {
	IAccount,
	IAccountExtended,
	TAddAccountProps,
	TEditAccountProps,
} from '../../types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useCreateAccount = (): UseMutationResult<IAccount, Error, TAddAccountProps> => {
	return useMutation({
		mutationFn:  async(body: TAddAccountProps,) => {
			return accountService.createAccount(body,)
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

export const useEditAccount = (): UseMutationResult<IAccount, Error, TEditAccountProps> => {
	return useMutation({
		mutationFn:  async(body: TEditAccountProps,) => {
			return accountService.updateAccount(body,)
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

export const useAccountsByEntityId = (entityId?: string,): UseQueryResult<Array<IAccountExtended>> => {
	return useQuery({
		queryKey: [queryKeys.ACCOUNT, entityId,],
		queryFn:  async() => {
			return accountService.getAccountsByEntityId(entityId ?? '',)
		},
		enabled: Boolean(entityId,),
	},)
}
