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
	TCashProps,
	TBankAnalytics,
	TCurrencyAnalytics,
	TEntityAnalytics,
} from '../../../services/analytics/analytics.types'
import {
	cashService,
} from '../../../services/analytics/cash.service'

export const useCashEntityAnalytics = (
	filter: TCashProps,
): UseQueryResult<Array<TEntityAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.CASH,
			queryKeys.ANALYTICS_ENTITY,
			filter,
		],
		queryFn:  async() => {
			return cashService.getEntityAnalytics(filter,)
		},
	},)
}

export const useCashBankAnalytics = (
	filter: TCashProps,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.CASH,
			queryKeys.ANALYTICS_BANK,
			filter,
		],
		queryFn:  async() => {
			return cashService.getBankAnalytics(filter,)
		},
	},)
}

export const useCashCurrencyAnalytics = (
	filter: TCashProps,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.CASH,
			queryKeys.ANALYTICS_CURRENCY,
			filter,
		],
		queryFn:  async() => {
			return cashService.getCurrencyAnalytics(filter,)
		},
	},)
}

export const useCashCurrencyAnalyticsForTransaction = (
	filter: TCashProps,
): UseQueryResult<Array<TCurrencyAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.TRANSACTION,
			queryKeys.ANALYTICS_CURRENCY,
			filter,
		],
		queryFn:  async() => {
			return cashService.getCurrencyAnalyticsForTransaction(filter,)
		},
	},)
}
