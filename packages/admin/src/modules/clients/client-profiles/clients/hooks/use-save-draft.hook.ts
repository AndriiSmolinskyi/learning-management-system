import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import type {
	ClientDraft,
} from '../../../../../shared/types'
import {
	draftService,
} from '../../../../../services/client/draft.service'
import {
	toasterService,
} from '../../../../../services/toaster'
import {
	queryKeys,
} from '../../../../../shared/constants'
import type {
	ClientDraftStoreValues,
} from '../clients.types'
import {
	queryClient,
} from '../../../../../providers/query.provider'

export const useSaveDraft = (): UseMutationResult<ClientDraft, Error, ClientDraftStoreValues> => {
	return useMutation({
		mutationFn:  async({
			email, contact, ...body
		}: ClientDraftStoreValues,) => {
			return draftService.addDraft(body,)
		},
		async onMutate() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT_DRAFT,],
			},)
		},
		async onSuccess() {
			queryClient.refetchQueries({
				queryKey: [queryKeys.CLIENT_DRAFT,],
			},)
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
	},)
}