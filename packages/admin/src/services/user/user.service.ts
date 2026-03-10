import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	PaginationResult,
	TAddUserProps,
	TEditUserProps,
	GetUserListProps,
	IUser,
} from '../../shared/types'

class UserService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = 'users'

	public async addUser(props: TAddUserProps,): Promise<IUser> {
		return this.httpService.post(`${this.module}/create`, props,)
	}

	public async getUsersList(props: GetUserListProps,):
		Promise<PaginationResult<IUser>> {
		return this.httpService.get(`${this.module}/list?${queryString.stringify(props,)}`,)
	}

	public async deleteUser(id: string,): Promise<IUser> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}

	public async editUser(props: TEditUserProps,): Promise<IUser> {
		return this.httpService.patch(`${this.module}/${props.id}`, props,)
	}
}

export const userService = new UserService(new HttpFactoryService().createHttpService(),)
