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
	accountService,
} from '../../../services/account/account.service'
import type {
	IAccount,
} from '../../types'

export const useAccountsByBankId = (bankId: string,):
	UseQueryResult<Array<IAccount>> => {
	return useQuery({
		queryKey: [queryKeys.ACCOUNT, bankId,],
		queryFn:  async() => {
			return accountService.getAccountsByBankId(bankId,)
		},
		enabled: Boolean(bankId,),
	},)
}
