import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'
import {
	subportfolioService,
} from '../../../services/portfolio'
import {
	queryKeys,
} from '../../constants'
import type {
	IPortfolioDetailed,
} from '../../types'

export const useGetSubportfolioList = (id: string, subportfolioId: string,): UseQueryResult<Array<IPortfolioDetailed>> => {
	return useQuery<Array<IPortfolioDetailed>, Error>({
		queryKey: [queryKeys.SUB_PORTFOLIO_LIST, id,],
		queryFn:  async() => {
			return subportfolioService.getSubportfolioListByPortfolioId(id,)
		},
		enabled: Boolean(id.trim(),) && !subportfolioId,
	},)
}