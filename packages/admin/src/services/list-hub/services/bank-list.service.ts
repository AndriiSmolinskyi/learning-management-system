import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	BankListRoutes,
} from '../list-hub.constants'
import queryString from 'query-string'
import type {
	IListHubItemBody,
	IListHubItemResponse,
} from '../../../shared/types'
import type {
	TGetBanksListBySourceProps,
} from '../list-hub.types'

class BankListService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = BankListRoutes.MODULE

	public async getBankList(): Promise<Array<IListHubItemResponse>> {
		return this.httpService.get(`${this.module}/${BankListRoutes.GET}`,)
	}

	public async createBankListItem(body: IListHubItemBody,): Promise<IListHubItemResponse> {
		return this.httpService.post(`${this.module}/${BankListRoutes.CREATE}`, body,)
	}

	public async getBanksListBySourceIds(props: TGetBanksListBySourceProps,): Promise<Array<IListHubItemResponse>> {
		return this.httpService.get(
			`${this.module}/${BankListRoutes.SOURCE}?${queryString.stringify(props, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}
}

export const bankListService = new BankListService(new HttpFactoryService().createHttpService(),)
