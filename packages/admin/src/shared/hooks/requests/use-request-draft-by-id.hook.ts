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
	IRequestDraftExtended,
} from '../../types'
import {
	requestService,
} from '../../../services/request/request.service'

export const useRequestDraftById = (id?: number,): UseQueryResult<IRequestDraftExtended> => {
	return useQuery({
		queryKey: [queryKeys.REQUEST_DRAFT, id,],
		queryFn:  async() => {
			return requestService.getRequestDraftById(id,)
		},
		enabled: Boolean(id,),
	},)
}