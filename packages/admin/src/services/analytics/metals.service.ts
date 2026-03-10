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
	IMetalsByFilter,
	IMetalsFilters,
	TBankAnalytics,
	TCurrencyAnalytics,
} from './analytics.types'
import type {
	IMetalAsset,
} from '../../shared/types'

class MetalsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.METALS

	public async getAllByFilters(filter: IMetalsFilters,): Promise<IMetalsByFilter> {
		return this.httpService.get(`${this.module}`,{
			params: filter,
		},
		)
	}

	public async getBankAnalytics(filter: IMetalsFilters,): Promise<Array<TBankAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.BANK}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getCurrencyAnalytics(filter: IMetalsFilters,): Promise<Array<TCurrencyAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CURRENCY}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getAllMetals(): Promise<Array<IMetalAsset>> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_ALL}`,
		)
	}

	public async getMetalsAnnualIncome(filter: IMetalsFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const metalsService = new MetalsService(new HttpFactoryService().createHttpService(),)
