import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'
import {
	queryKeys,
} from '../../../shared/constants'
import {
	cBondsCurrencyService,
} from '../../../services/cbonds'
import type {
	ICurrency,
} from '../../../services/cbonds/types'
import type {
	TCurrencyProps,
} from '../../../services/analytics/analytics.types'

export const useGetAllCurrencies = (): UseQueryResult<Array<ICurrency>, Error> => {
	return useQuery<Array<ICurrency>, Error>({
		queryKey: [queryKeys.CBONDS.CURRENCIES,],
		queryFn:  async() => {
			return cBondsCurrencyService.getAllCurrencies()
		},
	},)
}

export const useGetAnalyticsFilteredCurrencies = (filter: TCurrencyProps,): UseQueryResult<Array<ICurrency>, Error> => {
	return useQuery<Array<ICurrency>, Error>({
		queryKey: [queryKeys.CBONDS.CURRENCIES, filter,],
		queryFn:  async() => {
			return cBondsCurrencyService.getAnalyticsFilteredCurrencies(filter,)
		},
	},)
}

export const useGetAllCurrenciesForCash = (accountId?: string,): UseQueryResult<Array<ICurrency>, Error> => {
	return useQuery<Array<ICurrency>, Error>({
		queryKey: [queryKeys.CBONDS.CASH_CURRENCIES, accountId,],
		queryFn:  async() => {
			return cBondsCurrencyService.getAllCurrenciesForCash(accountId,)
		},
	},)
}