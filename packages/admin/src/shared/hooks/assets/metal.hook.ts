import {
	queryKeys,
} from '../../../shared/constants'
import {
	metalsService,
} from '../../../services/analytics/metals.service'
import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	IMetalAsset,
} from '../../../shared/types'

export const useGetAllMetals = ():
	UseQueryResult<Array<IMetalAsset>> => {
	return useQuery({
		queryKey: [queryKeys.METAL_LIST,],
		queryFn:  async() => {
			return metalsService.getAllMetals()
		},
	},)
}