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
	TCityAnalytics,
	TCurrencyAnalytics,
	TRealEstateProps,
	TRealEstateAssetAnalytics,
	IRealEstateFilterSelects,
} from './analytics.types'
import type {
	IFilterSelectBySourceIds,
} from '../../shared/types'

class RealEstateService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.REAL_ESTATE

	public async getCurrencyAnalytics(filter: TRealEstateProps,): Promise<Array<TCurrencyAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CURRENCY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getCityAnalytics(filter: TRealEstateProps,): Promise<Array<TCityAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CITY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getAssetAnalytics(filter: TRealEstateProps,): Promise<Array<TRealEstateAssetAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ASSET}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getRealIncome(filter: TRealEstateProps,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.REAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getRealEstateFilterSelectsBySourceIds(filter: IFilterSelectBySourceIds,): Promise<IRealEstateFilterSelects> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_FILTER_SELECTS}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}
}

export const realEstateService = new RealEstateService(new HttpFactoryService().createHttpService(),)
