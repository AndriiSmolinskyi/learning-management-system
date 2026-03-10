import {
	queryKeys,
} from '../../../shared/constants'
import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import {
	privateEquityAnalyticsService,
} from '../../../services/analytics/private-equity.service'
import type {
	IPrivateEquityFilters,
	IPrivateEquityByFilter,
	TBankAnalytics,
	TCurrencyAnalytics,
	IPrivateEquityFilterSelectsData,
} from '../../../services/analytics/analytics.types'
import type {
	IFilterSelectBySourceIds,
} from '../../../shared/types'

export const useGetPrivateEquityFilterSelectBySourceIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<IPrivateEquityFilterSelectsData> => {
	return useQuery({
		queryKey: [queryKeys.PRIVATE_EQUITY_NAMES, filter,],
		queryFn:  async() => {
			return privateEquityAnalyticsService.getPrivateEquityFilterSelectBySourceIds(filter,)
		},
	},)
}

export const useGetAllPrivateEquityByFilters = (filters: IPrivateEquityFilters,):
	UseQueryResult<IPrivateEquityByFilter> => {
	return useQuery({
		queryKey: [queryKeys.PE_ANALYTICS, filters,],
		queryFn:  async() => {
			return privateEquityAnalyticsService.getAllByFilters(filters,)
		},
	},)
}
export const usePrivateEquityBankAnalytics = (
	filter: IPrivateEquityFilters,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_BANK, filter,
		],
		queryFn:  async() => {
			return privateEquityAnalyticsService.getBankAnalytics(filter,)
		},
	},)
}

export const usePrivateEquityCurrencyAnalytics = (
	filter: IPrivateEquityFilters,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_CURRENCY, filter,
		],
		queryFn:  async() => {
			return privateEquityAnalyticsService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const usePrivateEquityAnnualIncome = (
	filter: IPrivateEquityFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.PE_ANALYTICS,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return privateEquityAnalyticsService.getPrivateEquityAnnualIncome(filter,)
		},
	},)
}