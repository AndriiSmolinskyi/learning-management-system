import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	entityService,
} from '../../../services/entity/entity.service'
import {
	queryKeys,
} from '../../constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	AxiosError,
} from 'axios'
import type {
	IEntity,
	TAddEntityProps,
	TEditEntityProps,
} from '../../types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useCreateEntity = ():
	UseMutationResult<IEntity, Error, TAddEntityProps> => {
	return useMutation({
		mutationFn:  async(body: TAddEntityProps,) => {
			return entityService.createEntity(body,)
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
				queryKey: [queryKeys.PORTFOLIO, data.portfolioId ?? data.portfolioDraftId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ENTITY, data.portfolioId ?? data.portfolioDraftId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_DETAILED,],
			},)
		},
	},)
}

export const useEditEntity = ():
	UseMutationResult<IEntity, Error, TEditEntityProps> => {
	return useMutation({
		mutationFn:  async(body: TEditEntityProps,) => {
			return entityService.updateEntity(body,)
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
				queryKey: [queryKeys.PORTFOLIO_DETAILED, context.portfolioId ?? context.portfolioDraftId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ENTITY, context.portfolioId ?? context.portfolioDraftId,],
			},)
		},
	},)
}