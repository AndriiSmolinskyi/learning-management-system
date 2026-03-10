import queryString from 'query-string'
import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	CBondsRoutes,
} from '../cbonds.constants'
import type {
	ICurrency,
} from '../types'
import type {
	TCurrencyProps,
} from '../../../services/analytics/analytics.types'

const {
	Currency,
} = CBondsRoutes

class CBondsCurrencyService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = `${CBondsRoutes.MODULE}/${Currency.MODULE}`

	public async getAllCurrencies(): Promise<Array<ICurrency>> {
		return this.httpService.get(`${this.module}/${Currency.GET_CURRENCIES}`,)
	}

	public async getAllCurrenciesForCash(accountId?: string,): Promise<Array<ICurrency>> {
		return this.httpService.get(`${this.module}/${Currency.GET_CURRENCIES_CASH}`, {
			params: {
				accountId,
			},
		},)
	}

	public async getAnalyticsFilteredCurrencies(filter: TCurrencyProps,): Promise<Array<ICurrency>> {
		return this.httpService.get(`${this.module}/${Currency.GET_ANALYTICS_FILTERED_CURRENCIES}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const cBondsCurrencyService = new CBondsCurrencyService(new HttpFactoryService().createHttpService(),)
