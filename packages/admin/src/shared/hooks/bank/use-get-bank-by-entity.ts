import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../constants'
import {
	bankService,
} from '../../../services/bank/bank.service'
import type {
	IBank,
} from '../../types'

export const useBanksByEntityId = (entityId: string = '',): UseQueryResult<Array<IBank>> => {
	return useQuery({
		queryKey: [queryKeys.BANK_LIST, entityId,],
		queryFn:  async() => {
			return bankService.getBanksByEntityId(entityId,)
		},
		enabled: Boolean(entityId,),
	},)
}
