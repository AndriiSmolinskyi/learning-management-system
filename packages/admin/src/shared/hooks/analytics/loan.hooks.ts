import {
	queryKeys,
} from '../../../shared/constants'

import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'

import type {
	ILoansFilters,
	ILoansByFilter,
	TBankAnalytics,
	TCurrencyAnalytics,
} from '../../../services/analytics/analytics.types'
import {
	loanAnalyticsService,
} from '../../../services/analytics/loan.service'
import type {
	IFilterSelectBySourceIds,
} from '../../../shared/types'

export const useGetAssetLoanNamesBySourceIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<Array<string>> => {
	return useQuery({
		queryKey: [queryKeys.LOAN_NAMES, filter,],
		queryFn:  async() => {
			return loanAnalyticsService.getAssetLoanNamesBySourceIds(filter,)
		},
	},)
}

export const useGetAllLoansByFilters = (filters: ILoansFilters,):
	UseQueryResult<ILoansByFilter> => {
	return useQuery({
		queryKey: [queryKeys.LOAN_ANALYTICS, filters,],
		queryFn:  async() => {
			return loanAnalyticsService.getAllByFilters(filters,)
		},
	},)
}

export const useLoanBankAnalytics = (
	filter: ILoansFilters,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_BANK, filter,
		],
		queryFn:  async() => {
			return loanAnalyticsService.getBankAnalytics(filter,)
		},
	},)
}

export const useLoanCurrencyAnalytics = (
	filter: ILoansFilters,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.ANALYTICS_CURRENCY, filter,
		],
		queryFn:  async() => {
			return loanAnalyticsService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const useLoanAnnualIncome = (
	filter: ILoansFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.LOAN_ANALYTICS,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return loanAnalyticsService.getLoanAnnualIncome(filter,)
		},
	},)
}