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
	TRequestFilter,
	TRequestListRes,
} from '../../types'
import {
	requestService,
} from '../../../services/request/request.service'

export const useRequestsListFiltered = (
	filter: TRequestFilter,
): UseQueryResult<TRequestListRes> => {
	return useQuery({
		queryKey: [
			queryKeys.REQUEST, filter,
		],
		queryFn:  async() => {
			return requestService.getRequestsFiltered(filter,)
		},
	},)
}
