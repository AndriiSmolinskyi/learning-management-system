import {
	queryKeys,
} from '../../../shared/constants'
import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import {
	otherInvestmentsService,
} from '../../../services/analytics/other-investments.service'
import type {
	IFilterSelectBySourceIds, IOtherInvestmentsSelects,
} from '../../../shared/types'

export const getAssetOtherNamesBySourceIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<IOtherInvestmentsSelects> => {
	return useQuery({
		queryKey: [queryKeys.OTHER_NAMES, filter,],
		queryFn:  async() => {
			return otherInvestmentsService.getAssetOtherNamesBySourcesIds(filter,)
		},
	},)
}