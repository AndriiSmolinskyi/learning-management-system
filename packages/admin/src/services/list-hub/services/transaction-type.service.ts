import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	TransactionTypeRoutes,
} from '../list-hub.constants'
import type {
	ITransactionListHubItemResponse,
} from '../../../shared/types'

class TransactionTypeListService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = TransactionTypeRoutes.MODULE

	public async getTransactionTypeList(): Promise<Array<ITransactionListHubItemResponse>> {
		return this.httpService.get(`${this.module}/${TransactionTypeRoutes.GET}`,)
	}

	public async getTransactionCategoryList(): Promise<Array<string>> {
		return this.httpService.get(`${this.module}/${TransactionTypeRoutes.GET_CATEGORY_LIST}`,)
	}
}

export const transactionTypeListService = new TransactionTypeListService(new HttpFactoryService().createHttpService(),)
