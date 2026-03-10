import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	ServiceProvidersRoutes,
} from '../list-hub.constants'
import type {
	IMessage,
	IListHubItemBody,
	IListHubItemResponse,
	ISelectListHubItemResponse,
} from '../../../shared/types'

class ServiceProvidersListService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = ServiceProvidersRoutes.MODULE

	public async getServiceProvidersList(): Promise<Array<IListHubItemResponse>> {
		return this.httpService.get(`${this.module}/${ServiceProvidersRoutes.GET_ALL_SERVICE_PROVIDERS}`,)
	}

	public async createServiceProvidersListItem(body: IListHubItemBody,): Promise<IMessage> {
		return this.httpService.post(`${this.module}/${ServiceProvidersRoutes.CREATE}`, body,)
	}

	public async getEncryptedServiceProvidersList(): Promise<Array<ISelectListHubItemResponse>> {
		return this.httpService.get(`${this.module}/${ServiceProvidersRoutes.GET_ALL_ENCRYPTED_SERVICE_PROVIDERS}`,)
	}
}

export const serviceProvidersListService = new ServiceProvidersListService(new HttpFactoryService().createHttpService(),)
