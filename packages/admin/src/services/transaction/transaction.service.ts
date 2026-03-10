import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	TransactionRoutes,
} from './transaction.constants'
import type {
	TAddTransactionProps,
	ITransaction,
	OperationTransactionFilter,
	TransactionListRes,
	TEditTransactionProps,
	BudgetTransactionFilter,
	IBudgetTransaction,
	TransactionCurrencyTotals,
} from '../../shared/types'

class TransactionService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly transactionModule = TransactionRoutes.MODULE

	private readonly draftModule = TransactionRoutes.DRAFT

	public async createTransaction(body: TAddTransactionProps,): Promise<ITransaction> {
		return this.httpService.post(`${this.transactionModule}/${TransactionRoutes.CREATE}`, body,)
	}

	public async createTransactionDraft(body: TAddTransactionProps,): Promise<ITransaction> {
		return this.httpService.post(`${this.draftModule}/${TransactionRoutes.CREATE}`, body,)
	}

	public async getTransactions(): Promise<TransactionListRes> {
		return this.httpService.get(`${this.transactionModule}/${TransactionRoutes.LIST}`,)
	}

	public async getTransactionsFiltered(filter: OperationTransactionFilter,): Promise<TransactionListRes> {
		return this.httpService.get(`${this.transactionModule}/${TransactionRoutes.FILTER}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getTransactionDrafts(): Promise<Array<ITransaction>> {
		return this.httpService.get(`${this.draftModule}/${TransactionRoutes.LIST}`,)
	}

	public async getTransactionById(id?: number,): Promise<ITransaction> {
		return this.httpService.get(`${this.transactionModule}/${id}`,)
	}

	public async getTransactionDraftById(id?: number,): Promise<ITransaction> {
		return this.httpService.get(`${this.draftModule}/${id}`,)
	}

	public async updateTransaction({
		id, ...body
	}: TEditTransactionProps,): Promise<ITransaction> {
		return this.httpService.patch(`${this.transactionModule}/${id}`, body,)
	}

	public async updateTransactionDraft({
		id, ...body
	}: TEditTransactionProps,): Promise<ITransaction> {
		return this.httpService.patch(`${this.draftModule}/${id}`, body,)
	}

	// public async deleteTransaction(id?: number,): Promise<void> {
	// 	return this.httpService.delete(`${this.transactionModule}/${id}`,)
	// }
	public async deleteTransaction(data: { id: number; email: string | null; name: string; reason: string},): Promise<void> {
		const {
			id, ...rest
		} = data
		return this.httpService.delete(`${this.transactionModule}/${id}`, {
			params: {
				userInfo: rest,
			},
		},)
	}

	public async deleteTransactionDraft(id: number,): Promise<void> {
		return this.httpService.delete(`${this.draftModule}/${id}`,)
	}

	public async getBudgetTransactions(body: BudgetTransactionFilter,): Promise<Array<IBudgetTransaction>> {
		return this.httpService.get(`${this.transactionModule}/${TransactionRoutes.BUDGET}`, {
			params: body,
		},)
	}

	public async getCurrencyTotals(body: TransactionCurrencyTotals,): Promise<number> {
		return this.httpService.get(`${this.transactionModule}/${TransactionRoutes.GET_TOTAL_CURRENCY_AMOUNT}`, {
			params: body,
		},)
	}
}

export const transactionService = new TransactionService(new HttpFactoryService().createHttpService(),)
