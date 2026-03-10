import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../constants'
import {
	entityService,
} from '../../../services/entity/entity.service'
import type {
	IEntity,
} from '../../types'

export const useEntityListByPortfolioId = (portfolioId?: string,):
	UseQueryResult<Array<IEntity>> => {
	return useQuery({
		queryKey: [queryKeys.ENTITY, portfolioId,],
		queryFn:  async() => {
			return entityService.getEntityListByPortfolioId(portfolioId ?? '',)
		},
		enabled:   Boolean(portfolioId,),
	},)
}
