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
	IBondsByFilter,
	IBondsFilters,
	TCashProps,
	TBankAnalytics,
	TBondsCurrencyAnalytics,
} from './analytics.types'
import type {
	IFilterSelectBySourceIds,
} from '../../shared/types'

class BondAnalyticsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.BOND

	public async getBondIsinsByBanksIds(filter: IFilterSelectBySourceIds,): Promise<Array<string>> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.ISINS}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getBondSecuritiesByBanksIds(filter: IFilterSelectBySourceIds,): Promise<Array<string>> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.SECURITIES}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getAllByFilters(filters: IBondsFilters,): Promise<IBondsByFilter> {
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

	public async getBondAnnualIncome(filter: IBondsFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const bondAnalyticsService = new BondAnalyticsService(new HttpFactoryService().createHttpService(),)
