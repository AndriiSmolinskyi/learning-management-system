import {
	queryKeys,
} from '../../../shared/constants'

import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	DocumentIds,
} from '../../../services/document/document.types'
import type {
	ICryptoByFilters,
	ICryptoFilters,
	ICryptoFilterSelectsData,
	TBankAnalytics,
	TCurrencyAnalytics,
} from '../../../services/analytics/analytics.types'
import {
	cryptoAnalyticsService,
} from '../../../services/analytics/crypto.service'

export const useGetCryptoFilterSelectsByBanksIds = (banksIds?: DocumentIds,):
	UseQueryResult<ICryptoFilterSelectsData> => {
	return useQuery({
		queryKey: [queryKeys.CRYPTO_FILTER_SELECTS, banksIds,],
		queryFn:  async() => {
			return cryptoAnalyticsService.getCryptoFilterSelectsByBanksIds(banksIds,)
		},
	},)
}

export const useGetAllCryptoByFilters = (filters: ICryptoFilters,):
	UseQueryResult<ICryptoByFilters> => {
	return useQuery({
		queryKey: [queryKeys.ANALYTICS_CRYPTO, filters,],
		queryFn:  async() => {
			return cryptoAnalyticsService.getAllByFilters(filters,)
		},
	},)
}

export const useGetCryptoBankAnalytics = (
	filter: ICryptoFilters,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_CRYPTO_BANK, filter,
		],
		queryFn:  async() => {
			return cryptoAnalyticsService.getCryptoBankAnalytics(filter,)
		},
	},)
}

export const useGetCryptoCurrencyAnalytics = (
	filter: ICryptoFilters,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_CRYPTO_CURRENCY, filter,
		],
		queryFn:  async() => {
			return cryptoAnalyticsService.getCryptoCurrencyAnalytics(filter,)
		},
	},)
}

export const useCryptoAnnualIncome = (
	filter: ICryptoFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_CRYPTO,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return cryptoAnalyticsService.getCryptoAnnualIncome(filter,)
		},
	},)
}