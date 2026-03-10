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

export const useRequestsList = (): UseQueryResult<Array<IRequestExtended>> => {
	return useQuery({
		queryKey: [
			queryKeys.REQUEST,
		],
		queryFn:  async() => {
			return requestService.getRequests()
		},
	},)
}
