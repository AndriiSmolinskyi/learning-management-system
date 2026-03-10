import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../../shared/constants'
import {
	bankService,
} from '../../../services/bank/bank.service'
import type {
	IBank,
} from '../../../shared/types'

export const useBanksByClientId = (clientId: string = '',): UseQueryResult<Array<IBank>> => {
	return useQuery({
		queryKey: [queryKeys.BANK_LIST, clientId,],
		queryFn:  async() => {
			return bankService.getBanksByClientId(clientId,)
		},
		enabled: Boolean(clientId,),
	},)
}