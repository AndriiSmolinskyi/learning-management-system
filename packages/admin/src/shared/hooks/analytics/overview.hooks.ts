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
	IAnalyticsAvailability,
	TBankAnalytics,
	TCurrencyAnalytics,
	TEntityAnalytics,
	TOverviewAssetAnalytics,
	TOverviewProps,
} from '../../../services/analytics/analytics.types'
import {
	overviewService,
} from '../../../services/analytics/overview.service'

export const useOverviewAssetAnalytics = (
	filter: TOverviewProps,
): UseQueryResult<Array<TOverviewAssetAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OVERVIEW,
			queryKeys.ANALYTICS_ASSET,
			filter,
		],
		queryFn:  async() => {
			return overviewService.getAssetAnalytics(filter,)
		},
	},)
}

export const useOverviewBankAnalytics = (
	filter: TOverviewProps,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OVERVIEW,
			queryKeys.ANALYTICS_BANK,
			filter,
		],
		queryFn:  async() => {
			return overviewService.getBankAnalytics(filter,)
		},
	},)
}

export const useOverviewEntityAnalytics = (
	filter: TOverviewProps,
): UseQueryResult<Array<TEntityAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OVERVIEW,
			queryKeys.ANALYTICS_ENTITY,
			filter,
		],
		queryFn:  async() => {
			return overviewService.getEntityAnalytics(filter,)
		},
	},)
}

export const useOverviewCurrencyAnalytics = (
	filter: TOverviewProps,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OVERVIEW,
			queryKeys.ANALYTICS_CURRENCY,
			filter,
		],
		queryFn:  async() => {
			return overviewService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const useAnalyticsAvailability = (filter:TOverviewProps,): UseQueryResult<IAnalyticsAvailability> => {
	return useQuery({
		queryKey: [queryKeys.ANALYTICS_AVAILABILITY, filter,],
		queryFn:  async() => {
			return overviewService.getAnalyticsAvailability(filter,)
		},
		// enabled:              Boolean(filter.clientIds?.length,) || Boolean(filter.portfolioIds?.length,),
		refetchOnMount:       true,
		refetchOnWindowFocus: true,
		refetchOnReconnect:   true,
		staleTime:            1,
	},)
}