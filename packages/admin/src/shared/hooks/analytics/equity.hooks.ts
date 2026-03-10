import {
	queryKeys,
} from '../../../shared/constants'

import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	IEquitiesFilters,
	IEquitiesByFilter,
	TBankAnalytics,
	TCurrencyAnalytics,
	IEquityFilterSelectsData,
} from '../../../services/analytics/analytics.types'
import {
	equityAnalyticsService,
} from '../../../services/analytics/equity.service'
import type {
	IFilterSelectBySourceIds,
} from '../../../shared/types'

export const useGetEquityFilterSelectsBySourceIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<IEquityFilterSelectsData> => {
	return useQuery({
		queryKey: [queryKeys.EQUITY_TYPES, filter,],
		queryFn:  async() => {
			return equityAnalyticsService.getEquityFilterSelectsBySourceIds(filter,)
		},
	},)
}

export const useGetAllEquitiesByFilters = (filters: IEquitiesFilters,):
	UseQueryResult<IEquitiesByFilter> => {
	return useQuery({
		queryKey: [queryKeys.ANALYTICS_EQUITY, filters,],
		queryFn:  async() => {
			return equityAnalyticsService.getAllByFilters(filters,)
		},
	},)
}

export const useEquityBankAnalytics = (
	filter: IEquitiesFilters,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_EQUITY_BANK, filter,
		],
		queryFn:  async() => {
			return equityAnalyticsService.getBondsBankAnalytics(filter,)
		},
	},)
}

export const useEquityCurrencyAnalytics = (
	filter: IEquitiesFilters,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_EQUITY_CURRENCY, filter,
		],
		queryFn:  async() => {
			return equityAnalyticsService.getBondsCurrencyAnalytics(filter,)
		},
	},)
}

export const useEquityAnnualIncome = (
	filter: IEquitiesFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_EQUITY,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return equityAnalyticsService.getEquityAnnualIncome(filter,)
		},
	},)
}