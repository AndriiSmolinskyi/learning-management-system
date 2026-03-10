import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'
import type {
	IClientWithBudgetPlan,
} from '../../../../../services/client'
import {
	clientService,
} from '../../../../../services/client'
import {
	queryKeys,
} from '../../../../../shared/constants'
import type {
	PaginationResult,
} from '../../../../../shared/types'
import type {
	IFilterProps,
} from '../clients.types'

export const useClientsList = (filters: IFilterProps = {
},): UseQueryResult<PaginationResult<IClientWithBudgetPlan>> => {
	return useQuery<PaginationResult<IClientWithBudgetPlan>, Error>({
		queryKey: [
			queryKeys.CLIENT,
			filters,
		],
		queryFn:  async() => {
			return clientService.getClientsList(filters,)
		},
	},)
}

export const useClientsListForSelect = (): UseQueryResult<Array<{value: string, label: string,}>> => {
	return useQuery<Array<{value: string, label: string}>, Error>({
		queryKey: [queryKeys.CLIENT_LIST,],
		queryFn:  async() => {
			return clientService.getClientsListForSelect()
		},
	},)
}
