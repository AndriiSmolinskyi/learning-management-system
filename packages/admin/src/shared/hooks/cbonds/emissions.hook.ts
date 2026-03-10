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
	cBondsEmissionsService,
} from '../../../services/cbonds/emissions/emissions.service'
import type {
	CurrencyList,
} from '../../../shared/types'

export const useGetEmissionsIsins = (currency?: CurrencyList,): UseQueryResult<Array<string>, Error> => {
	return useQuery<Array<string>, Error>({
		queryKey: [queryKeys.CBONDS.EMISSIONS_ISINS, currency,],
		queryFn:  async() => {
			return cBondsEmissionsService.getEmissionsIsins(currency,)
		},
	},)
}

export const useGetEmissionsSecurities = (): UseQueryResult<Array<string>, Error> => {
	return useQuery<Array<string>, Error>({
		queryKey: [queryKeys.CBONDS.EMISSIONS_SECURITIES,],
		queryFn:  async() => {
			return cBondsEmissionsService.getEmissionsSecurities()
		},
	},)
}

export const useGetSecurityByIsin = (isin: string,): UseQueryResult<string | null | number, Error> => {
	return useQuery({
		queryKey: [queryKeys.CBONDS.SECURITY, isin,],
		queryFn:  async() => {
			return cBondsEmissionsService.getSecurityByIsin(isin,)
		},
		enabled:  Boolean(isin.trim(),),
	},)
}

export const useGetCurrencyByIsin = (
	isin?: string,
): UseQueryResult<{ value: string; label: string }> => {
	const trimmed = isin?.trim()

	return useQuery({
		queryKey: [queryKeys.CBONDS.CURRENCY_BY_ISIN, trimmed,],
		enabled:  Boolean(trimmed,),
		queryFn:  async() => {
			return cBondsEmissionsService.currencyByIsin(trimmed!,)
		},
	},)
}

export const useGetMarketPriceByIsin = (
	isin?: string,
): UseQueryResult<{ marketPrice: number}> => {
	const trimmed = isin?.trim()

	return useQuery({
		queryKey: [queryKeys.CBONDS.MARKET_BY_ISIN, trimmed,],
		enabled:  Boolean(trimmed,),
		queryFn:  async() => {
			return cBondsEmissionsService.marketByIsin(trimmed!,)
		},
	},)
}