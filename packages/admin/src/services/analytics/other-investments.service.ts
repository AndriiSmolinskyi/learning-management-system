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
	IOtherInvestmentsByFilter,
	TCashProps,
	TBankAnalytics,
	TCurrencyAnalytics,
	IOtherInvestmentFilters,
} from './analytics.types'
import type {
	IFilterSelectBySourceIds, IOtherInvestmentsSelects,
} from '../../shared/types'

class OtherInvestmentsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.OTHER_INVESTMEN

	public async getAllByFilters(filter: TCashProps,): Promise<IOtherInvestmentsByFilter> {
		return this.httpService.get(`${this.module}`,{
			params: filter,
		},
		)
	}

	public async getBankAnalytics(filter: TCashProps,): Promise<Array<TBankAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.BANK}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getCurrencyAnalytics(filter: TCashProps,): Promise<Array<TCurrencyAnalytics>> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.CURRENCY}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getAssetOtherNamesBySourcesIds(filter: IFilterSelectBySourceIds,): Promise<IOtherInvestmentsSelects> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_NAMES}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getOtherAnnualIncome(filter: IOtherInvestmentFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const otherInvestmentsService = new OtherInvestmentsService(new HttpFactoryService().createHttpService(),)
