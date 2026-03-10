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
	TAddRequestProps, IRequest,
} from '../../types'

export const useCreateRequest = (): UseMutationResult<IRequest, Error, TAddRequestProps> => {
	return useMutation({
		mutationFn:  async(body: TAddRequestProps,) => {
			return requestService.createRequest(body,)
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
				queryKey: [queryKeys.REQUEST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.REQUEST_DRAFT,],
			},)
		},
	},)
}