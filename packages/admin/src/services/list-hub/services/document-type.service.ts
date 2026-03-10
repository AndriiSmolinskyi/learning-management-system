import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	DocumentTypesRoutes,
} from '../list-hub.constants'
import type {
	IMessage,
	IListHubItemBody,
	IListHubItemResponse,
} from '../../../shared/types'

class DocumentTypesService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = DocumentTypesRoutes.MODULE

	public async getAllDocumentTypes(): Promise<Array<IListHubItemResponse>> {
		return this.httpService.get(`${this.module}/${DocumentTypesRoutes.GET_ALL_DOCUMENT_TYPES}`,)
	}

	public async addDocumentType(body: IListHubItemBody,): Promise<IMessage> {
		return this.httpService.post(`${this.module}/${DocumentTypesRoutes.CREATE}`, body,)
	}
}

export const documentTypesService = new DocumentTypesService(new HttpFactoryService().createHttpService(),)
