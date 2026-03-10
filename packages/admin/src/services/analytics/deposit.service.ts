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
	IDepositByFilter,
	IDepositFilters,
	TCashProps,
	TBankAnalytics,
	TCurrencyAnalytics,
} from './analytics.types'

class DepositAnalyticsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.DEPOSIT

	public async getAllByFilters(filters: IDepositFilters,): Promise<IDepositByFilter> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`, {
				params: filters,
			},
		)
	}

	public async getBankAnalytics(filter: TCashProps,): Promise<Array<TBankAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.BANK}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getCurrencyAnalytics(filter: TCashProps,): Promise<Array<TCurrencyAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CURRENCY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getDepositAnnualIncome(filter: IDepositFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const depositAnalyticsService = new DepositAnalyticsService(new HttpFactoryService().createHttpService(),)
