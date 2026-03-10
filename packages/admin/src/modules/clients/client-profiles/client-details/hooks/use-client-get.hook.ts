import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'
import type {
	Client,
} from '../../../../../shared/types'
import {
	clientService,
} from '../../../../../services/client'
import {
	queryKeys,
} from '../../../../../shared/constants'

export const useClientGet = (id: string,): UseQueryResult<Client> => {
	return useQuery({
		queryKey: [queryKeys.CLIENT, id,],
		queryFn:  async() => {
			return clientService.getClientById(id,)
		},
		enabled: Boolean(id.trim(),),
	},)
}