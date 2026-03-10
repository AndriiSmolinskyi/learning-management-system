import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	EntityEndpoints,
} from './entity.constants'
import type {
	IEntity,
	TAddEntityProps,
	TEditEntityProps,
} from '../../shared/types'
import queryString from 'query-string'
import type {
	TGetEntityBySourceProps,
} from './entity.types'
import type {
	TGetEntityListSourcesIds,
} from '../../shared/hooks'

class EntityService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = EntityEndpoints.MODULE

	public async createEntity(body: TAddEntityProps,): Promise<IEntity> {
		return this.httpService.post(`${this.module}/${EntityEndpoints.CREATE}`, body,)
	}

	public async getEntityListByPortfolioId(id: string,): Promise<Array<IEntity>> {
		return this.httpService.get(`${this.module}/${EntityEndpoints.PORTFOLIO}/${id}`,)
	}

	public async getEntityListBySourceIds(ids: TGetEntityListSourcesIds,): Promise<Array<IEntity>> {
		return this.httpService.get(
			`${this.module}/${EntityEndpoints.ENTITY_LIST_BY_IDS}?${queryString.stringify(ids, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getEntityListBySourceId(props: TGetEntityBySourceProps,): Promise<Array<IEntity>> {
		return this.httpService.get(
			`${this.module}/${EntityEndpoints.SOURCE}?${queryString.stringify(props, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async updateEntity({
		id, ...body
	}: TEditEntityProps,): Promise<IEntity> {
		return this.httpService.patch(`${this.module}/${id}`, {
			...body,
		},)
	}
}

export const entityService = new EntityService(new HttpFactoryService().createHttpService(),)
