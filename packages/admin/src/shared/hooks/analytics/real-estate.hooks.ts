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
	realEstateService,
} from '../../../services/analytics/real-estate.service'
import type {
	TCityAnalytics,
	TCurrencyAnalytics,
	TRealEstateProps,
	TRealEstateAssetAnalytics,
} from '../../../services/analytics/analytics.types'

export const useRealEstateCurrencyAnalytics = (
	filter: TRealEstateProps,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.REAL_ESTATE,
			queryKeys.ANALYTICS_CURRENCY,
			filter,
		],
		queryFn:  async() => {
			return realEstateService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const useRealEstateCityAnalytics = (
	filter: TRealEstateProps,
): UseQueryResult<Array<TCityAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.REAL_ESTATE,
			queryKeys.ANALYTICS_CITY,
			filter,
		],
		queryFn:  async() => {
			return realEstateService.getCityAnalytics(filter,)
		},
	},)
}

export const useRealEstateAssetAnalytics = (
	filter: TRealEstateProps,
): UseQueryResult<Array<TRealEstateAssetAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.REAL_ESTATE,
			queryKeys.ANALYTICS_ASSET,
			filter,
		],
		queryFn:  async() => {
			return realEstateService.getAssetAnalytics(filter,)
		},
	},)
}

export const useRealEstateIncome = (
	filter: TRealEstateProps,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.REAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return realEstateService.getRealIncome(filter,)
		},
	},)
}