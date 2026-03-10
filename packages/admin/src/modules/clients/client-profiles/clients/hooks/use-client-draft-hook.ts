import type {
	UseQueryResult,
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useQuery,
	useMutation,
} from '@tanstack/react-query'

import {
	draftService,
} from '../../../../../services/client/draft.service'
import {
	queryKeys,
} from '../../../../../shared/constants'
import type {
	PaginationResult,
} from '../../../../../shared/types'
import type {
	ClientDraft,
} from '../../../../../shared/types'
import {
	queryClient,
} from '../../../../../providers/query.provider'

export const useClientDraftsList = (): UseQueryResult<PaginationResult<ClientDraft>> => {
	return useQuery<PaginationResult<ClientDraft>, Error>({
		queryKey: [queryKeys.CLIENT_DRAFT,],
		queryFn:  async() => {
			return draftService.getDraftsList()
		},
	},)
}

export const useDeleteClientDraft = (): UseMutationResult<undefined, Error, string> => {
	return useMutation<undefined, Error, string>({
		mutationFn: async(draftId: string,) => {
			await draftService.deleteClientDraft(draftId,)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT_DRAFT,],
			},)
		},
	},)
}