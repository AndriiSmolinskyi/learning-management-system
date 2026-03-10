import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../constants'
import type {
	IRequestExtended,
} from '../../types'
import {
	requestService,
} from '../../../services/request/request.service'

export const useRequestById = (id?: number,): UseQueryResult<IRequestExtended> => {
	return useQuery({
		queryKey: [
			queryKeys.REQUEST,
			id,
		],
		queryFn:  async() => {
			return requestService.getRequestById(id,)
		},
		enabled: Boolean(id,),
	},)
}
