import {
	queryKeys,
} from '../../../shared/constants'

import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	IDepositFilters,
	IDepositByFilter,
	TBankAnalytics,
	TCurrencyAnalytics,
} from '../../../services/analytics/analytics.types'
import {
	depositAnalyticsService,
} from '../../../services/analytics/deposit.service'

export const useGetAllDepositByFilters = (filters: IDepositFilters,):
	UseQueryResult<IDepositByFilter> => {
	return useQuery({
		queryKey: [queryKeys.DEPOSIT_ANALYTICS, filters,],
		queryFn:  async() => {
			return depositAnalyticsService.getAllByFilters(filters,)
		},
	},)
}
export const useDepositBankAnalytics = (
	filter: IDepositFilters,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_BANK, filter,
		],
		queryFn:  async() => {
			return depositAnalyticsService.getBankAnalytics(filter,)
		},
	},)
}

export const useDepositCurrencyAnalytics = (
	filter: IDepositFilters,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_CURRENCY, filter,
		],
		queryFn:  async() => {
			return depositAnalyticsService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const useDepositAnnualIncome = (
	filter: IDepositFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.DEPOSIT_ANALYTICS,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return depositAnalyticsService.getDepositAnnualIncome(filter,)
		},
	},)
}