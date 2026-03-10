import {
	queryKeys,
} from '../../../shared/constants'
import {
	optionsService,
} from '../../../services/analytics/options.service'
import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	IFilterSelectBySourceIds,
} from '../../../shared/types'

export const useGetAssetsPairsBySourceIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<Array<string>> => {
	return useQuery({
		queryKey: [queryKeys.OPTION_PAIRS, filter,],
		queryFn:  async() => {
			return optionsService.getAssetOptionsPairsBySourceIds(filter,)
		},
	},)
}