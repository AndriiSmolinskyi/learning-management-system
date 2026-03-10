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
	TCashProps,
	TBankAnalytics,
	TCurrencyAnalytics,
	IPrivateEquityFilters,
	IPrivateEquityByFilter,
	IPrivateEquityFilterSelectsData,
} from './analytics.types'
import type {
	IFilterSelectBySourceIds,
} from '../../shared/types'

class PrivateEquityAnalyticsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.PRIVATE_EQUITY

	public async getPrivateEquityFilterSelectBySourceIds(filter: IFilterSelectBySourceIds,): Promise<IPrivateEquityFilterSelectsData> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_NAMES}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getAllByFilters(filters: IPrivateEquityFilters,): Promise<IPrivateEquityByFilter> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,{
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

	public async getPrivateEquityAnnualIncome(filter: IPrivateEquityFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const privateEquityAnalyticsService = new PrivateEquityAnalyticsService(new HttpFactoryService().createHttpService(),)
