import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	groupsService,
} from '../../../services/groups/groups.service'

import type {
	CreateGroupBody,
	GetGroupsQuery,
	GroupItem,
	GroupsListReturn,
	UpdateGroupBody,
	OkResponse,
} from '../../types'
import {
	queryKeys,
} from '../../../shared/constants'

export const useGroupsList = (filter: GetGroupsQuery,): UseQueryResult<GroupsListReturn, Error> => {
	return useQuery({
		queryKey: [queryKeys.GROUPS, filter,],
		queryFn:  async() => {
			return groupsService.getGroupsFiltered(filter,)
		},
	},)
}

export const useCreateGroup = (): UseMutationResult<GroupItem, Error, CreateGroupBody> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async(body: CreateGroupBody,) => {
			return groupsService.createGroup(body,)
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.GROUPS,],
			},)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to create group' :
					error.message,
			},)
		},
	},)
}

export const useUpdateGroup = (): UseMutationResult<GroupItem, Error, { id: string, body: UpdateGroupBody }> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async({
			id,
			body,
		}: { id: string, body: UpdateGroupBody },) => {
			return groupsService.updateGroup(id, body,)
		},
		onSuccess(data,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.GROUPS,],
			},)
			queryClient.setQueryData([queryKeys.GROUPS, data.id,], data,)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to update group' :
					error.message,
			},)
		},
	},)
}

export const useDeleteGroup = (): UseMutationResult<OkResponse, Error, string> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async(id: string,) => {
			return groupsService.deleteGroup(id,)
		},
		onSuccess(result, id,) {
			queryClient.removeQueries({
				queryKey: [queryKeys.GROUPS, id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.GROUPS,],
			},)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to delete group' :
					error.message,
			},)
		},
	},)
}