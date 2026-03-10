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
	cBondsEquityStocksService,
} from '../../../services/cbonds/equity-stocks/equity-stocks.service'

export const useGetEquityStocksIsins = (currency?: string,): UseQueryResult<Array<string>, Error> => {
	return useQuery<Array<string>, Error>({
		queryKey: [queryKeys.CBONDS.EQUITY_ISINS, currency,],
		queryFn:  async() => {
			return cBondsEquityStocksService.getEquityStocksIsins(currency,)
		},
	},)
}

export const useGetEquityStocksSecurities = (): UseQueryResult<Array<string>, Error> => {
	return useQuery<Array<string>, Error>({
		queryKey: [queryKeys.CBONDS.EMISSIONS_SECURITIES,],
		queryFn:  async() => {
			return cBondsEquityStocksService.getEquityStocksSecurities()
		},
	},)
}

export const useGetEquityStocksSecurityByIsin = (isin: string,): UseQueryResult<string | null | number, Error> => {
	return useQuery({
		queryKey: [queryKeys.CBONDS.SECURITY, isin,],
		queryFn:  async() => {
			return cBondsEquityStocksService.getEquityStocksByIsin(isin,)
		},
		enabled: Boolean(isin.trim(),),
	},)
}

