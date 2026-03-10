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
	ILoansByFilter,
	ILoansFilters,
	TCashProps,
	TBankAnalytics,
	TCurrencyAnalytics,
} from './analytics.types'
import type {
	IFilterSelectBySourceIds,
} from '../../shared/types'

class LoanAnalyticsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.LOAN

	public async getAssetLoanNamesBySourceIds(filter: IFilterSelectBySourceIds,): Promise<Array<string>> {
		return this.httpService.get(
			`${this.module}/${AnalyticsRoutes.GET_NAMES}?${queryString.stringify(filter, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getAllByFilters(filters: ILoansFilters,): Promise<ILoansByFilter> {
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

	public async getLoanAnnualIncome(filter: ILoansFilters,): Promise<number> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.ANNUAL_INCOME}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const loanAnalyticsService = new LoanAnalyticsService(new HttpFactoryService().createHttpService(),)
