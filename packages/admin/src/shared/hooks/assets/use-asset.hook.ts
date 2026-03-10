import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	assetService,
} from '../../../services/asset/asset.service'
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
	TEditAssetProps,
	IAsset,
	TAssetCreateBody,
	TAssetTransferRequest,
} from '../../types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useGetAssetList = (portfolioId: string,): UseQueryResult<Array<IAsset>> => {
	return useQuery<Array<IAsset>, Error>({
		queryKey: [queryKeys.ASSET_LIST, portfolioId,],
		queryFn:  async() => {
			return assetService.getAssetList(portfolioId,)
		},
	},)
}

export const useCreateAsset = (shouldInvalidatePortfolioList = true,): UseMutationResult<IAsset, Error, TAssetCreateBody> => {
	return useMutation({
		mutationFn:  async(body: TAssetCreateBody,) => {
			return assetService.createAsset(body,)
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
		onSuccess(data, args,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ASSET,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TOTAL_ASSETS_VALUE, args.portfolioId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_DETAILED, args.portfolioId ?? args.portfolioDraftId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_CHART,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CBONDS.CASH_CURRENCIES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_DETAILED,],
			},)
		},
	},)
}

export const useTransferAsset = (): UseMutationResult<IAsset, Error, TAssetTransferRequest> => {
	return useMutation({
		mutationFn:  async(body: TAssetTransferRequest,) => {
			return assetService.transferAsset(body,)
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
				queryKey: [queryKeys.ASSET,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_DETAILED,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_CHART,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CBONDS.CASH_CURRENCIES,],
			},)
		},
	},)
}

export const useEditAsset = (): UseMutationResult<IAsset, Error, TEditAssetProps> => {
	return useMutation({
		mutationFn:  async(body: TEditAssetProps,) => {
			return assetService.updateAsset(body,)
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
		onSuccess(data,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO, data.portfolioId ?? data.portfolioDraftId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ASSET, data.portfolioId ?? data.portfolioDraftId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ASSET,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT,],
			},)
		},
	},)
}