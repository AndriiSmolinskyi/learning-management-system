import {
	queryKeys,
} from '../../../shared/constants'

import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	IAccount,
} from '../../../shared/types'
import {
	accountService,
} from '../../../services/account/account.service'
import type {
	TGetAccountsBySourceProps,
} from '../../../services/account/account.types'

export type TGetAccountListSourcesIds = {
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
}

export const useGetAccountsBySourceIds = (filter: TGetAccountListSourcesIds,):
	UseQueryResult<Array<IAccount>> => {
	return useQuery({
		queryKey: [queryKeys.ACCOUNT_LIST, filter,],
		queryFn:  async() => {
			return accountService.getAccountsListBySourceIds(filter,)
		},
	},)
}

export const useGetAccountAssetsTotalById = (id: string,):
	UseQueryResult<IAccount> => {
	return useQuery({
		queryKey: [queryKeys.ACCOUNT, id,],
		queryFn:  async() => {
			return accountService.getAccountAssetsTotalById(id,)
		},
		enabled: Boolean(id.trim(),),
	},)
}

export const useAccountsBySourceIds = (filter: TGetAccountsBySourceProps,):
	UseQueryResult<Array<IAccount>> => {
	return useQuery({
		queryKey: [queryKeys.ACCOUNT, filter,],
		queryFn:  async() => {
			return accountService.getAccountsBySourceIds(filter,)
		},
	},)
}

