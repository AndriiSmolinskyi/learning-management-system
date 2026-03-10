import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation,
	useQuery,
} from '@tanstack/react-query'
import {
	portfolioService,
} from '../../../services/portfolio'
import {
	queryKeys,
} from '../../../shared/constants'
import type {
	IPortfolioChartFilter,
	IPortfolioChartResponse,
} from '../../../services/portfolio/portfolio.types'
import {
	AxiosError,
} from 'axios'
import {
	toasterService,
} from '../../../services/toaster'
import {
	queryClient,
} from '../../../providers/query.provider'

export const usePortfolioChartAnalytics = (filters: IPortfolioChartFilter,): UseQueryResult<Array<IPortfolioChartResponse>> => {
	return useQuery<Array<IPortfolioChartResponse>, Error>({
		queryKey: [queryKeys.PORTFOLIO_CHART, filters,],
		queryFn:  async() => {
			return portfolioService.portfolioChart(filters,)
		},
		enabled:        Boolean(filters.portfolioId.trim(),),
	},)
}

export const useDeletePortfolioById = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn:  async(id: string,) => {
			return portfolioService.deletePortfolioById(id,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message,
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.SUB_PORTFOLIO_LIST,],
			},)
		},
	},)
}