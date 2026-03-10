import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'

import type {
	EditClientProps,
} from '../../../../../services/client'
import {
	clientService,
} from '../../../../../services/client'
import type {
	Client,
} from '../../../../../shared/types'
import {
	queryKeys,
} from '../../../../../shared/constants'
import {
	queryClient,
} from '../../../../../providers/query.provider'

export const useUpdateClient = (): UseMutationResult<Client, Error, EditClientProps & {id: string}> => {
	return useMutation({
		mutationFn: async(body: EditClientProps & { id: string },) => {
			const {
				id, ...data
			} = body
			return clientService.updateClientById(id, data,)
		},
		onSuccess: (data, args,) => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT, args.id,],
			},)
		},
	},)
}
