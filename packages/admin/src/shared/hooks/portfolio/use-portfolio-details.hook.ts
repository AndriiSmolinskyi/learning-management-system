import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'
import {
	portfolioService,
} from '../../../services/portfolio'
import {
	queryKeys,
} from '../../constants'
import type {
	IPortfolio,
	IPortfolioDetailed,
} from '../../types'

export const useGetPortfolioDetails = (id: string,): UseQueryResult<IPortfolioDetailed> => {
	return useQuery<IPortfolioDetailed, Error>({
		queryKey: [queryKeys.PORTFOLIO_DETAILED, id,],
		queryFn:  async() => {
			return portfolioService.getPortfolioDetailsById(id,)
		},
		enabled: Boolean(id.trim(),),
	},)
}

export const useGetPortfolioById = (id: string,): UseQueryResult<IPortfolio> => {
	return useQuery<IPortfolio, Error>({
		queryKey: [queryKeys.PORTFOLIO, id,],
		queryFn:  async() => {
			return portfolioService.getPortfolioById(id,)
		},
		enabled: Boolean(id.trim(),),
	},)
}