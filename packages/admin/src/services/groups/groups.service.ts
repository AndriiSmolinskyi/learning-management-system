import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	CreateGroupBody,
	GetGroupsQuery,
	GroupItem,
	GroupItemExtended,
	GroupsListReturn,
	UpdateGroupBody,
	OkResponse,
	ChangeGroupStudentsBody,
} from '../../shared/types'

import {
	GroupRoutes,
} from './groups.constants'

class GroupsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = GroupRoutes.MODULE

	public async createGroup(body: CreateGroupBody,): Promise<GroupItem> {
		return this.httpService.post(`${this.module}/${GroupRoutes.CREATE}`, body,)
	}

	public async getGroupsFiltered(filter: GetGroupsQuery,): Promise<GroupsListReturn> {
		return this.httpService.get(`${this.module}/${GroupRoutes.LIST}/?${queryString.stringify(filter, {
			skipNull:        true,
			skipEmptyString: true,
			arrayFormat:     'bracket',
		},)}`,)
	}

	public async getGroupById(id: string,): Promise<GroupItemExtended> {
		return this.httpService.get(`${this.module}/${id}`,)
	}

	public async updateGroup(id: string, body: UpdateGroupBody,): Promise<GroupItem> {
		return this.httpService.patch(`${this.module}/${id}`, body,)
	}

	public async changeGroupStudents(
		id: string,
		body: ChangeGroupStudentsBody,
	): Promise<GroupItemExtended> {
		return this.httpService.patch(`${this.module}/${id}/${GroupRoutes.STUDENTS}`, body,)
	}

	public async deleteGroup(id: string,): Promise<OkResponse> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}
}

export const groupsService = new GroupsService(new HttpFactoryService().createHttpService(),)