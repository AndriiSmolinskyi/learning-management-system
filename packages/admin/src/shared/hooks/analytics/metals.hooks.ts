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
	metalsService,
} from '../../../services/analytics/metals.service'
import type {
	IMetalsFilters,
	IMetalsByFilter,
	TBankAnalytics,
	TCurrencyAnalytics,
} from '../../../services/analytics/analytics.types'

export const useMetalsAnalytics = (
	filter: IMetalsFilters,
): UseQueryResult<IMetalsByFilter> => {
	return useQuery({
		queryKey: [
			queryKeys.METALS,
			filter,
		],
		queryFn:  async() => {
			return metalsService.getAllByFilters(filter,)
		},
	},)
}

export const useMetalsBanks = (
	filter: IMetalsFilters,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.METALS,
			queryKeys.ANALYTICS_BANK,
			filter,
		],
		queryFn:  async() => {
			return metalsService.getBankAnalytics(filter,)
		},
	},)
}

export const useMetalsCurrencies = (
	filter: IMetalsFilters,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.METALS,
			queryKeys.ANALYTICS_CURRENCY,
			filter,
		],
		queryFn:  async() => {
			return metalsService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const useMetalsAnnualIncome = (
	filter: IMetalsFilters,
): UseQueryResult<number> => {
	return useQuery({
		queryKey: [
			queryKeys.METALS,
			queryKeys.ANNUAL_INCOME,
			filter,
		],
		queryFn:  async() => {
			return metalsService.getMetalsAnnualIncome(filter,)
		},
	},)
}