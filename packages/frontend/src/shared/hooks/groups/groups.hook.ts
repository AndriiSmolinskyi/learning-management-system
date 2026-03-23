import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	groupsService,
} from '../../../services/groups/groups.service'

import type {
	StudentGroupItem,
	StudentGroupsListReturn,
} from '../../types'
import {
	queryKeys,
} from '../../../shared/constants'

export const useMyGroups = (): UseQueryResult<StudentGroupsListReturn, Error> => {
	return useQuery({
		queryKey: [queryKeys.STUDENT_GROUPS,],
		queryFn:  async() => {
			return groupsService.getMyGroups()
		},
	},)
}

export const useMyGroup = (id: string | undefined,): UseQueryResult<StudentGroupItem, Error> => {
	return useQuery({
		queryKey: [queryKeys.STUDENT_GROUPS, id,],
		enabled:  Boolean(id,),
		queryFn:  async() => {
			return groupsService.getMyGroupById(id!,)
		},
	},)
}