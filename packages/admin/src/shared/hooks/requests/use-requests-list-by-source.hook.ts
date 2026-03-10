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
	IRequest,
} from '../../types'
import {
	requestService,
} from '../../../services/request/request.service'
import type {
	TGetRequestsBySourceProps,
} from '../../../services/request/request.types'
import {
	hasOnlyOneField,
} from '../../utils'

export const useRequestsListBySourceId = (
	props: TGetRequestsBySourceProps,
): UseQueryResult<Array<IRequest>> => {
	return useQuery({
		queryKey: [
			queryKeys.REQUEST, props,
		],
		queryFn:  async() => {
			return requestService.getRequestsBySourceId(props,)
		},
		enabled: hasOnlyOneField(props,),
	},)
}
