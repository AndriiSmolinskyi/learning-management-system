import {
	queryKeys,
} from '../../../shared/constants'
import {
	realEstateService,
} from '../../../services/analytics/real-estate.service'
import type {
	IRealEstateFilterSelects,
} from '../../../services/analytics/analytics.types'
import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	IFilterSelectBySourceIds,
} from '../../../shared/types'

export const useGetRealEstateFilterSelectsBySourceIds = (filter: IFilterSelectBySourceIds,):
	UseQueryResult<IRealEstateFilterSelects> => {
	return useQuery({
		queryKey: [queryKeys.REAL_ESTATE_FILTERS, filter,],
		queryFn:  async() => {
			return realEstateService.getRealEstateFilterSelectsBySourceIds(filter,)
		},
	},)
}