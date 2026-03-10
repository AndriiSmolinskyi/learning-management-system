import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../constants'
import type {
	IAccount,
} from '../../types'
import {
	accountService,
} from '../../../services/account/account.service'

export const useAccountListByPortfolioId = (portfolioId: string,): UseQueryResult<Array<IAccount>> => {
	return useQuery({
		queryKey: [queryKeys.ACCOUNT, portfolioId,],
		queryFn:  async() => {
			return accountService.getAccountListByPortfolioId(portfolioId,)
		},
		enabled: Boolean(portfolioId,),
	},)
}
