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
	TBankAnalytics,
	TMaturityAnalytics,
	TOptionsAssetAnalytics,
	TOptionsProps,
} from '../../../services/analytics/analytics.types'
import {
	optionsService,
} from '../../../services/analytics/options.service'

export const useOptionsAssetAnalytics = (
	filter: TOptionsProps,
): UseQueryResult<Array<TOptionsAssetAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OPTIONS,
			queryKeys.ANALYTICS_ASSET,
			filter,
		],
		queryFn:  async() => {
			return optionsService.getAssetAnalytics(filter,)
		},
	},)
}

export const useOptionsPremium = (
	filter: TOptionsProps,
): UseQueryResult<Array<TOptionsAssetAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OPTION_PREMIUM,
			filter,
		],
		queryFn:  async() => {
			return optionsService.getOptionsPremium(filter,)
		},
	},)
}

export const useOptionsBankAnalytics = (
	filter: TOptionsProps,
): UseQueryResult<Array<TBankAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OPTIONS,
			queryKeys.ANALYTICS_BANK,
			filter,
		],
		queryFn:  async() => {
			return optionsService.getBankAnalytics(filter,)
		},
	},)
}

export const useOptionsMaturityAnalytics = (
	filter: TOptionsProps,
): UseQueryResult<Array<TMaturityAnalytics>> => {
	return useQuery({
		queryKey: [
			queryKeys.OPTIONS,
			queryKeys.ANALYTICS_MATURITY,
			filter,
		],
		queryFn:  async() => {
			return optionsService.getMaturityAnalytics(filter,)
		},
	},)
}