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
	IRequestDraft,
} from '../../types'
import {
	requestService,
} from '../../../services/request/request.service'

export const useRequestDraftsList = (): UseQueryResult<Array<IRequestDraft>> => {
	return useQuery<Array<IRequestDraft>>({
		queryKey: [
			queryKeys.REQUEST_DRAFT,
		],
		queryFn:  async() => {
			return requestService.getRequestDrafts()
		},
	},)
}
