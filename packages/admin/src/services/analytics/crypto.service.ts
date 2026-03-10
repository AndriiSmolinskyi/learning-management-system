import queryString from 'query-string'
import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	AnalyticsRoutes,
} from './analytics.constants'
import type {
	DocumentIds,
} from '../../services/document/document.types'
import type {
	ICryptoByFilters,
	ICryptoFilters,
	ICryptoFilterSelectsData,
	TCashProps,
	TBankAnalytics,
	TCurrencyAnalytics,
} from './analytics.types'

class CryptoAnalyticsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.CRYPTO

	public async getCryptoFilterSelectsByBanksIds(ids?: DocumentIds,): Promise<ICryptoFilterSelectsData> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.CRYPTO_SELECTS}?${queryString.stringify(ids ?? {

			}, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getAllByFilters(filters: ICryptoFilters,): Promise<ICryptoByFilters> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`, {
				params: filters,
			},)
	}

	public async getCryptoBankAnalytics(filter: TCashProps,): Promise<Array<TBankAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.BANK}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getCryptoCurrencyAnalytics(filter: TCashProps,): Promise<Array<TCurrencyAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CURRENCY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getCryptoAnnualIncome(filter: ICryptoFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const cryptoAnalyticsService = new CryptoAnalyticsService(new HttpFactoryService().createHttpService(),)
