import {
	useMutation,
} from '@tanstack/react-query'
import {
	draftService,
} from '../../../../../services/client/draft.service'
import type {
	UseMutationResult,
} from '@tanstack/react-query'
import type {
	ClientDraft,
} from '../../../../../shared/types'
import {
	queryKeys,
} from '../../../../../shared/constants'
import {
	queryClient,
} from '../../../../../providers/query.provider'

export const useUpdateClientDraft = (): UseMutationResult<ClientDraft, Error, { draftId: string, props: ClientDraft }> => {
	return useMutation<ClientDraft, Error, { draftId: string, props: ClientDraft }>({
		mutationFn: async({
			draftId, props,
		},) => {
			return draftService.updateDraft(draftId, props,)
		},
		onSuccess: (updatedDraft,) => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT_DRAFT,],
			},)
		},
	},)
}
