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
	otherInvestmentsService,
} from '../../../services/analytics/other-investments.service'
import type {
	IOtherInvestmentFilters,
	IOtherInvestmentsByFilter,
	TBankAnalytics,
	TCurrencyAnalytics,
} from '../../../services/analytics/analytics.types'

export const useOtherInvestmentsAnalytics = (
	filter: IOtherInvestmentFilters,
): UseQueryResult<IOtherInvestmentsByFilter> => {
	return useQuery({
		queryKey: [
			queryKeys.OTHER_INVESTMEN,
			filter,
		],
		queryFn:  async() => {
			return otherInvestmentsService.getAllByFilters(filter,)
		},
	},)
}

export const useOtherInvestmentsBanks = (
	filter: IOtherInvestmentFilters,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OTHER_INVESTMEN,
			queryKeys.ANALYTICS_BANK,
			filter,
		],
		queryFn:  async() => {
			return otherInvestmentsService.getBankAnalytics(filter,)
		},
	},)
}

export const useOtherInvestmentsCurrencies = (
	filter: IOtherInvestmentFilters,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OTHER_INVESTMEN,
			queryKeys.ANALYTICS_CURRENCY,
			filter,
		],
		queryFn:  async() => {
			return otherInvestmentsService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const useOtherInvestmentsAnnualIncome = (
	filter: IOtherInvestmentFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.OTHER_INVESTMEN,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return otherInvestmentsService.getOtherAnnualIncome(filter,)
		},
	},)
}