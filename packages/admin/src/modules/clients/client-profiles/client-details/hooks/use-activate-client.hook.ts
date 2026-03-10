import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	clientService, type ActivateClientProps,
} from '../../../../../services/client'
import type {
	Client,
} from '../../../../../shared/types'
import {
	queryKeys,
} from '../../../../../shared/constants'
import type {
	ISortParams,
} from '../../clients/clients.component'
import {
	queryClient,
} from '../../../../../providers/query.provider'

export const useActivateClient = (): UseMutationResult<Client, Error, ActivateClientProps & ISortParams> => {
	return useMutation({
		mutationFn: async(body: ActivateClientProps & ISortParams,) => {
			return clientService.activateClient(body,)
		},
		onSuccess: (data, {
			id, search, sortBy, sortOrder,
		},) => {
			queryClient.setQueryData([queryKeys.CLIENT, id,], data,)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT, sortBy, sortOrder, search,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.OVERVIEW,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_ASSET,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_BANK,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_ENTITY,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CASH,],
			},)
		},
	},)
}