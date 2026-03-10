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

export const useBankListByPortfolioId = (portfolioId: string,):
	UseQueryResult<Array<IBank>> => {
	return useQuery({
		queryKey: [queryKeys.BANK, portfolioId,],
		queryFn:  async() => {
			return bankService.getBankListByPortfolioId(portfolioId,)
		},
		enabled: Boolean(portfolioId,),
	},)
}
