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
	TTransactionSelectProps,
	TransactionFilter,
} from './analytics.types'
import type {
	GetListProps,
	ITransactionFilteredSelects,
	TransactionListAnalyticsRes,
	TransactionPl,
} from '../../shared/types'
import type {
	TransactionSortFilter,
} from '../../modules/analytics/transactions/transactions.types'

class TransactionService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AnalyticsRoutes.TRANSACTION

	public async getTransactionAnalytics(filter: TransactionFilter & TransactionSortFilter & GetListProps,): Promise<TransactionListAnalyticsRes> {
		return this.httpService.get(`${this.module}`,{
			params: filter,
		},
		)
	}

	public async getTransactionAnalyticsByIds(filter: TransactionFilter,): Promise<TransactionPl> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.TRANSACTION_PL}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getTransactionsFilteredSelects(filter: TTransactionSelectProps,): Promise<ITransactionFilteredSelects> {
		return this.httpService.get(`${this.module}/${AnalyticsRoutes.TRANSACTION_SELECTS}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}
}

export const transactionService = new TransactionService(new HttpFactoryService().createHttpService(),)
