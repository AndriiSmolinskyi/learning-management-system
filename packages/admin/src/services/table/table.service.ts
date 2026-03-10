import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import {
	TableRoutes,
} from './table.constants'
import type {
	IUserTablePreference,
	TGetTablePreferenceProps,
	TUpsertTablePreferenceProps,
} from './table.types'

class TableService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = TableRoutes.MODULE

	public async getPreference(
		props: TGetTablePreferenceProps,
	): Promise<IUserTablePreference | null> {
		return this.httpService.get(`${this.module}/${TableRoutes.GET}`, {
			params: {
				...props,
			},
		},)
	}

	public async upsertPreference(
		body: TUpsertTablePreferenceProps,
	): Promise<IUserTablePreference> {
		return this.httpService.put(`${this.module}/${TableRoutes.UPDATE}`, body,)
	}
}

export const tableService = new TableService(
	new HttpFactoryService().createHttpService(),
)
