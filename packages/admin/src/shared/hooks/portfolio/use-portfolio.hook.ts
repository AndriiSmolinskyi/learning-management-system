import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	portfolioService,
	portfolioDraftService,
} from '../../../services/portfolio'
import {
	queryKeys,
} from '../../constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	AxiosError,
} from 'axios'
import type {
	IPortfolioCreateBody,
} from '../../../services/portfolio/portfolio.types'
import type {
	IPortfolio,
} from '../../types'
import type {
	IMessage,
} from '../../types'
import type {
	IFilterProps,
} from '../../../modules/clients/portfolios/portfolio/portfolio.types'
import type {
	IPortfolioActivate,
} from '../../../services/portfolio/portfolio.types'
import type {
	IPortfoliosFiltered,
} from '../../../services/portfolio/portfolio/portfolio.types'
import type {
	DocumentIds,
} from '../../../services/document/document.types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useGetPortfolioListFiltered = (filters: IFilterProps, enabled?: boolean,): UseQueryResult<IPortfoliosFiltered> => {
	return useQuery<IPortfoliosFiltered, Error>({
		queryKey: [queryKeys.PORTFOLIO_LIST, filters,],
		queryFn:  async() => {
			return portfolioService.getPortfolioListFiltered(filters,)
		},
		enabled:        enabled && filters.range?.length !== 0,
	},)
}

export const useGetPortfolioListMaxTotals = (): UseQueryResult<{maxTotals: number}> => {
	return useQuery<{maxTotals: number}, Error>({
		queryKey: [queryKeys.PORTFOLIO_MAX_TOTALS,],
		queryFn:  async() => {
			return portfolioService.getPortfolioListMaxTotals()
		},
	},)
}

export const usePortfolioListByClientId = (clientId: string = '',): UseQueryResult<Array<IPortfolio>> => {
	return useQuery({
		queryKey: [queryKeys.PORTFOLIO, clientId,],
		queryFn:  async() => {
			return portfolioService.getPortfolioListByClientId(clientId,)
		},
		enabled: Boolean(clientId,),
	},)
}

export const usePortfolioList = (): UseQueryResult<Array<IPortfolio>> => {
	return useQuery({
		queryKey: [queryKeys.PORTFOLIO,],
		queryFn:  async() => {
			return portfolioService.getPortfolioList()
		},
	},)
}

export const useGetPortfolioListByClientIds = (clientIds: DocumentIds,):
	UseQueryResult<Array<IPortfolio>> => {
	return useQuery({
		queryKey: [queryKeys.PORTFOLIO_SELECT_LIST, clientIds,],
		queryFn:  async() => {
			return portfolioService.getPortfolioListByClientIds(clientIds,)
		},
	},)
}

export const useCreatePortfolio = (): UseMutationResult<IPortfolio, Error, IPortfolioCreateBody> => {
	return useMutation({
		mutationFn:  async(body: IPortfolioCreateBody,) => {
			return portfolioService.createPortfolio(body,)
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
		},
	},)
}

export const useCreatePortfolioDraft = (): UseMutationResult<IPortfolio, Error, IPortfolioCreateBody> => {
	return useMutation({
		mutationFn:  async(body: IPortfolioCreateBody,) => {
			return portfolioDraftService.createPortfolioDraft(body,)
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
		},
	},)
}

export const usePortfolioActivate = (id?: string,): UseMutationResult<IMessage, Error, IPortfolioActivate> => {
	return useMutation({
		mutationFn: async(body: IPortfolioActivate,) => {
			return portfolioService.portfolioActivate(body,)
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
			queryClient.invalidateQueries({
				queryKey: [queryKeys.OVERVIEW,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_ASSET,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_BANK,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ANALYTICS_ENTITY,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CASH,],
			},)
			if (id) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.PORTFOLIO,id,],
				},)
			}
		},
	},)
}

export const useDeletePortfolio = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn: async(portfolioId: string,) => {
			return portfolioDraftService.deletePortfolioDraft(portfolioId,)
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
		},
	},)
}

export const useUpdateDraftToPortfolio = (): UseMutationResult<IPortfolio, Error, string> => {
	return useMutation({
		mutationFn:  async(id: string,) => {
			return portfolioDraftService.updateDraftToPortfolio(id,)
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
			// todo: Remove after test
			// queryClient.invalidateQueries({
			//    queryKey: [queryKeys.PORTFOLIO_LIST,],
			// },)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.SUB_PORTFOLIO_LIST,],
			},)
		},
	},)
}
