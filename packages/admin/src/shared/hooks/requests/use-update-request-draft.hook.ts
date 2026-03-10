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
	TEditRequestDraftProps,
	IRequestDraftExtended,
} from '../../types'

export const useUpdateRequestDraft = (): UseMutationResult<IRequestDraftExtended, Error, TEditRequestDraftProps> => {
	return useMutation({
		mutationFn:  async(body: TEditRequestDraftProps,) => {
			return requestService.updateRequestDraft(body,)
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
				queryKey: [queryKeys.REQUEST_DRAFT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.REQUEST_DRAFT, data.id,],
			},)
		},
	},)
}