import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	isinListRoutes,
} from '../list-hub.constants'
import type {
	IMessage,
	IIsinCreateItemBody,
	IPortfolioIsinsFilter,
} from '../../../shared/types'

class IsinListService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = isinListRoutes.MODULE

	public async createIsin(body: IIsinCreateItemBody,): Promise<IMessage> {
		return this.httpService.post(`${this.module}/${isinListRoutes.CREATE}`, body,)
	}

	public async getPortfolioIsins(filter: IPortfolioIsinsFilter | undefined,): Promise<Array<string>> {
		if (!filter) {
			throw new Error('Filter is required',)
		}
		return this.httpService.get(`${this.module}/${isinListRoutes.GET_PORTFOLIO_ISINS}/${filter.id}`, {
			params: {
				assetName: filter.assetName,
			},
		},)
	}
}

export const isinListService = new IsinListService(new HttpFactoryService().createHttpService(),)
