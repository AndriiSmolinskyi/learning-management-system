import {
	queryKeys,
} from '../../constants'
import {
	entityService,
} from '../../../services/entity/entity.service'
import type {
	IEntity,
} from '../../types'
import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'

import type {
	TGetEntityBySourceProps,
} from '../../../services/entity/entity.types'

export type TGetEntityListSourcesIds = {
	clientIds: Array<string>
	portfolioIds: Array<string>
}

export const useGetEntityListBySourceIds = (sourceIds: TGetEntityListSourcesIds,):
	UseQueryResult<Array<IEntity>> => {
	return useQuery({
		queryKey: [queryKeys.ENTITY_LIST, sourceIds,],
		queryFn:  async() => {
			return entityService.getEntityListBySourceIds(sourceIds,)
		},
	},)
}

export const useEntitiesBySourceIds = (props: TGetEntityBySourceProps,):
	UseQueryResult<Array<IEntity>> => {
	return useQuery({
		queryKey: [queryKeys.ENTITY, props,],
		queryFn:  async() => {
			return entityService.getEntityListBySourceId(props,)
		},
	},)
}