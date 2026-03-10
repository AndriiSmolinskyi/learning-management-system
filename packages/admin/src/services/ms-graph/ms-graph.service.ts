import type {
	AxiosResponse,
} from 'axios'
import axios from 'axios'

import type {
	MsUser,
	TGroupsRes,
} from './ms-graph.types'

import {
	Roles,
} from '../../shared/types'

class MsGraphServise {
	private readonly module = 'v1.0/me'

	private readonly baseUrl = import.meta.env.VITE_GRAPH_API_ENDPOINT

	public async getMsUser(accessToken: string,): Promise<MsUser> {
		const groupsData: AxiosResponse<TGroupsRes> = await axios.get(`${this.baseUrl}/${this.module}/memberOf`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},)

		const roles = groupsData.data.value ?
			groupsData.data.value
				.map((group,) => {
					return group.id
				},)
				.filter((group,) => {
					return Object.values(Roles,).includes(group,)
				},) :
			[]

		const userData: AxiosResponse<Omit<MsUser, 'roles'>> = await axios.get(`${this.baseUrl}/${this.module}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},)

		return {
			...userData.data,
			roles,
		}
	}
}

export const msGraphServise = new MsGraphServise()
