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
	TBankAnalytics,
	TMaturityAnalytics,
	TOptionsAssetAnalytics,
	TOptionsProps,
} from './analytics.types'
import type {
	IFilterSelectBySourceIds,
} from '../../shared/types'

class OptionsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.OPTIONS

	public async getBankAnalytics(filter: TOptionsProps,): Promise<Array<TBankAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.BANK}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getAssetAnalytics(filter: TOptionsProps,): Promise<Array<TOptionsAssetAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ASSET}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getOptionsPremium(filter: TOptionsProps,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.OPTION_PREMIUM}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getMaturityAnalytics(filter: TOptionsProps,): Promise<Array<TMaturityAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.MATURITY}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getAssetOptionsPairsBySourceIds(filter: IFilterSelectBySourceIds,): Promise<Array<string>> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_PAIRS_BY_BANKS_IDS}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}
}

export const optionsService = new OptionsService(new HttpFactoryService().createHttpService(),)
