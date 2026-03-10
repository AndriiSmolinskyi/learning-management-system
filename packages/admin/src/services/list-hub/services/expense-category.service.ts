import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	ExpenseCategoryListRoutes,
} from '../list-hub.constants'
import type {
	IMessage,
	IListHubItemResponse,
	INewExpenseCategoryBody,
} from '../../../shared/types'

class ExpenseCategoryListService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = ExpenseCategoryListRoutes.MODULE

	public async getExpenseCategoryList(clientId: string,): Promise<Array<IListHubItemResponse>> {
		return this.httpService.get(`${this.module}/${ExpenseCategoryListRoutes.GET}`, {
			params: {
				clientId,
			},
		},)
	}

	public async createExpenseCategoryListItem(body: INewExpenseCategoryBody,): Promise<IMessage> {
		return this.httpService.post(`${this.module}/${ExpenseCategoryListRoutes.CREATE}`, body,)
	}
}

export const expenseCategoryListService = new ExpenseCategoryListService(new HttpFactoryService().createHttpService(),)
