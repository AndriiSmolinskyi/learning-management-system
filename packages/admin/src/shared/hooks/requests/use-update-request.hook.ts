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
	requestService,
} from '../../../services/request/request.service'
import {
	queryClient,
} from '../../../providers/query.provider'

import type {
	IRequest,
	TEditRequestProps,
} from '../../types'

export const useUpdateRequest = (): UseMutationResult<IRequest, Error, TEditRequestProps> => {
	return useMutation({
		mutationFn:  async(body: TEditRequestProps,) => {
			return requestService.updateRequest(body,)
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
				queryKey: [queryKeys.REQUEST, data.id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.DOCUMENT, data.id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.REQUEST,],
			},)
		},
	},)
}