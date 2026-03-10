/* eslint-disable complexity */
import type {
	QueryClient,
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation,
	useQuery,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	queryKeys,
} from '../../constants'
import {
	assetService,
} from '../../../services/asset/asset.service'
import {
	hasOnlyOneField,
} from '../../../shared/utils'
import {
	toasterService,
} from '../../../services/toaster'
import {
	RouterKeys,
} from '../../../router/keys'

import type {
	AssetNamesType,
	IAsset,
	IAssetWithRelationsDecrypted,
	TAssetGetTotalUnits,
	TAssetSelectItem,
	TDeleteRefactoredAssetPayload,
} from '../../types'
import type {
	TGetAssetsBySourceProps,
} from '../../../services/asset/asset.types'
import type {
	DocumentIds,
} from '../../../services/document/document.types'
import {
	queryClient,
} from '../../../providers/query.provider'
export const useGetAssetById = (
	assetId?: string,
): UseQueryResult<IAssetWithRelationsDecrypted> => {
	return useQuery({
		queryKey: [
			queryKeys.ASSET, assetId,
		],
		queryFn:  async() => {
			return assetService.getAssetById(assetId,)
		},
		enabled: Boolean(assetId,),
	},)
}

export const useGetRefactoredAssetById = (data: {id: string, assetName: AssetNamesType, hasMainId?: boolean},): UseQueryResult<IAssetWithRelationsDecrypted> => {
	return useQuery({
		queryKey: [queryKeys.ASSET, data,],
		queryFn:  async() => {
			return assetService.getRefactoredAssetById(data,)
		},
		enabled: Boolean(data.id,),
	},)
}

export const useAssetsListBySourceId = (
	props: TGetAssetsBySourceProps,
): UseQueryResult<Array<IAsset>> => {
	return useQuery({
		queryKey: [
			queryKeys.ASSET, props,
		],
		queryFn:  async() => {
			return assetService.getAssetsBySourceId(props,)
		},
		enabled: hasOnlyOneField(props,),
	},)
}

export const useGetAssetListByBanksIds = (banksIds?: DocumentIds,):
	UseQueryResult<Array<IAsset>> => {
	return useQuery({
		queryKey: [queryKeys.ASSET_LIST, banksIds,],
		queryFn:  async() => {
			return assetService.getAssetListByBanksIds(banksIds,)
		},
	},)
}

export const useGetAssetTotalUnits = (data: TAssetGetTotalUnits | undefined,):
	UseQueryResult<{totalUnits: number}> => {
	return useQuery({
		queryKey: [queryKeys.ASSET_TOTAL_UNITS, data,],
		queryFn:  async() => {
			if (data) {
				return assetService.getAssetUnits(data,)
			}
			return undefined
		},
		enabled: Boolean(data,),
	},)
}

// export const useDeleteAssetById = (route?: RouterKeys,): UseMutationResult<IAsset, Error, string> => {
// 	return useMutation({
// 		mutationFn:  async(id: string,) => {
// 			return assetService.deleteAssetById(id,)
// 		},
// 		async onError(error,) {
// 			if (error instanceof AxiosError) {
// 				await toasterService.showErrorToast({
// 					message: error.response?.data.message,
// 				},)
// 			} else {
// 				await toasterService.showErrorToast({
// 					message: error.message,
// 				},)
// 			}
// 		},
// 		onSuccess(data,) {
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKeys.ASSET,],
// 			},)
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKeys.TOTAL_ASSETS_VALUE, data.portfolioId,],
// 			},)
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKeys.PORTFOLIO, data.portfolioId ?? data.portfolioDraftId,],
// 			},)
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKeys.PORTFOLIO_LIST,],
// 			},)
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKeys.CLIENT,],
// 			},)
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKeys.PORTFOLIO_CHART,],
// 			},)
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKeys.CBONDS.CASH_CURRENCIES,],
// 			},)
// 			if (route) {
// 				invalidateRouteUtil(route, queryClient,)
// 			}
// 		},
// 	},)
// }

export const useDeleteRefactoredAssetById = (route?: RouterKeys,): UseMutationResult<IAsset, Error, TDeleteRefactoredAssetPayload> => {
	return useMutation({
		mutationFn:  async(data: TDeleteRefactoredAssetPayload,) => {
			return assetService.deleteRefactoredAssetById(data,)
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
				queryKey: [queryKeys.ASSET,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TOTAL_ASSETS_VALUE, data.portfolioId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO, data.portfolioId ?? data.portfolioDraftId,],
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
				queryKey: [queryKeys.ANALYTICS_AVAILABILITY,],
			},)
			if (route) {
				invalidateRouteUtil(route, queryClient,)
			}
		},
	},)
}

const invalidateRouteUtil = (route: RouterKeys, queryClient: QueryClient,): void => {
	switch (route) {
	case RouterKeys.ANALYTICS_BONDS:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.BONDS_ANALYTICS,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BONDS_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BONDS_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_DEPOSIT:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.DEPOSIT_ANALYTICS,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_OPTIONS:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.OPTIONS,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_ASSET,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_MATURITY,],
		},)
		break
	case RouterKeys.ANALYTICS_LOAN:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.LOAN_ANALYTICS,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_EQUITIES:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_EQUITY,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_EQUITY_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_EQUITY_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_METALS:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.METALS,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_PRIVATE_EQUITY:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.PE_ANALYTICS,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_OTHER_INVESTMENTS:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.OTHER_INVESTMEN,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_REAL_ESTATE:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.REAL_ESTATE,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CITY,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_ASSET,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CURRENCY,],
		},)
		break
	case RouterKeys.ANALYTICS_CRYPTO:
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CRYPTO,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CRYPTO_BANK,],
		},)
		queryClient.invalidateQueries({
			queryKey: [queryKeys.ANALYTICS_CRYPTO_CURRENCY,],
		},)
		break
	default:
	}
}

export const useGetBondAndEquityForSelect = (
	params: TGetAssetsBySourceProps,
): UseQueryResult<Array<TAssetSelectItem>> => {
	return useQuery({
		queryKey: [queryKeys.ASSETS_FOR_REQUEST, params,],
		queryFn:  async() => {
			return assetService.getBondAndEquityForSelect(params,)
		},
		enabled: Object.values(params,).some(Boolean,),
	},)
}