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
	IAnalyticsAvailability,
	TBankAnalytics,
	TCurrencyAnalytics,
	TEntityAnalytics,
	TOverviewAssetAnalytics,
	TOverviewProps,
} from './analytics.types'

class OverviewService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.OVERVIEW

	public async getBankAnalytics(filter: TOverviewProps,): Promise<Array<TBankAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.BANK}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getAssetAnalytics(filter: TOverviewProps,): Promise<Array<TOverviewAssetAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ASSET}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getCurrencyAnalytics(filter: TOverviewProps,): Promise<Array<TCurrencyAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CURRENCY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getEntityAnalytics(filter: TOverviewProps,): Promise<Array<TEntityAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ENTITY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getAnalyticsAvailability(filter:TOverviewProps,): Promise<IAnalyticsAvailability> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.AVAILABILITY_CHECK}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const overviewService = new OverviewService(new HttpFactoryService().createHttpService(),)
