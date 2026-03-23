import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'

import type {
	StudentGroupItem,
	StudentGroupsListReturn,
} from '../../shared/types'

import {
	GroupRoutes,
} from './groups.constants'

class GroupsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = GroupRoutes.MODULE

	public async getMyGroups(): Promise<StudentGroupsListReturn> {
		return this.httpService.get(`${this.module}/${GroupRoutes.MY_GROUPS}`,)
	}

	public async getMyGroupById(id: string,): Promise<StudentGroupItem> {
		return this.httpService.get(`${this.module}/${GroupRoutes.MY_GROUPS}/${id}`,)
	}
}

export const groupsService = new GroupsService(new HttpFactoryService().createHttpService(),)