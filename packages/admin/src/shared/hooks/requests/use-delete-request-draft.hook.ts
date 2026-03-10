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

export const useDeleteRequestDraft = (): UseMutationResult<void, Error, number, string> => {
	return useMutation({
		mutationFn:  async(id: number,) => {
			return requestService.deleteRequestDraft(id,)
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
				queryKey: [queryKeys.REQUEST_DRAFT,],
			},)
		},
	},)
}