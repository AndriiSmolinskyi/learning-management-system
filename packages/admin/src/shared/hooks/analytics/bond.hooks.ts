import {
	queryKeys,
} from '../../../shared/constants'

import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	IBondsFilters,
	IBondsByFilter,
	TBankAnalytics,
	TCurrencyAnalytics,
} from '../../../services/analytics/analytics.types'
import {
	bondAnalyticsService,
} from '../../../services/analytics/bond.service'
import type {
	IFilterSelectBySourceIds,
} from '../../../shared/types'

export const useGetBondIsinsByBanksIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<Array<string>> => {
	return useQuery({
		queryKey: [queryKeys.BOND_ISINS, filter,],
		queryFn:  async() => {
			return bondAnalyticsService.getBondIsinsByBanksIds(filter,)
		},
	},)
}

export const useGetBondSecuritiesByBanksIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<Array<string>> => {
	return useQuery({
		queryKey: [queryKeys.BOND_SECURITIES, filter,],
		queryFn:  async() => {
			return bondAnalyticsService.getBondSecuritiesByBanksIds(filter,)
		},
	},)
}

export const useGetAllBondsByFilters = (filters: IBondsFilters,):
	UseQueryResult<IBondsByFilter> => {
	return useQuery({
		queryKey: [queryKeys.BONDS_ANALYTICS, filters,],
		queryFn:  async() => {
			return bondAnalyticsService.getAllByFilters(filters,)
		},
	},)
}

export const useBondBankAnalytics = (
	filter: IBondsFilters,
	enabled: boolean = false,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_BONDS_BANK, filter,
		],
		queryFn:  async() => {
			return bondAnalyticsService.getBondsBankAnalytics(filter,)
		},
		enabled,
	},)
}

export const useBondCurrencyAnalytics = (
	filter: IBondsFilters,
	enabled: boolean = false,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_BONDS_CURRENCY, filter,
		],
		queryFn:  async() => {
			return bondAnalyticsService.getBondsCurrencyAnalytics(filter,)
		},
		enabled,
	},)
}

export const useBondAnnualIncome = (
	filter: IBondsFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.BONDS_ANALYTICS,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return bondAnalyticsService.getBondAnnualIncome(filter,)
		},
	},)
}