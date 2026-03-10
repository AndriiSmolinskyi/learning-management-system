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
	IEquitiesByFilter,
	IEquitiesFilters,
	TCashProps,
	TBankAnalytics,
	TBondsCurrencyAnalytics,
	IEquityFilterSelectsData,
} from './analytics.types'
import type {
	IFilterSelectBySourceIds,
} from '../../shared/types'

class EquityAnalyticsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.EQUITY

	public async getEquityFilterSelectsBySourceIds(filter: IFilterSelectBySourceIds,): Promise<IEquityFilterSelectsData> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.TYPES}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getAllByFilters(filters: IEquitiesFilters,): Promise<IEquitiesByFilter> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.LOAN_BY_FILTERS}`, {
				params: filters,
			},)
	}

	public async getBondsBankAnalytics(filter: TCashProps,): Promise<Array<TBankAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.BANK}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getBondsCurrencyAnalytics(filter: TCashProps,): Promise<Array<TBondsCurrencyAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CURRENCY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getEquityAnnualIncome(filter: IEquitiesFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const equityAnalyticsService = new EquityAnalyticsService(new HttpFactoryService().createHttpService(),)
