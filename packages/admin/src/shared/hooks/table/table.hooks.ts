import type {
	UseMutationResult, UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	queryKeys,
} from '../../../shared/constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	queryClient,
} from '../../../providers/query.provider'

import {
	tableService,
} from '../../../services/table/table.service'
import type {
	IUserTablePreference,
	TGetTablePreferenceProps,
	TUpsertTablePreferenceProps,
} from '../../../services/table/table.types'

// export const useTablePreference = (
// 	params: TGetTablePreferenceProps | undefined,
// ): UseQueryResult<IUserTablePreference | null, Error> => {
// 	return useQuery<IUserTablePreference | null, Error>({
// 		queryKey: [queryKeys.TABLE_PREFERENCE, params,],
// 		queryFn:  async() => {
// 			if (!params) {
// 				return null
// 			}
// 			return tableService.getPreference(params,)
// 		},
// 		enabled: Boolean(params?.userName && params.tableName,),
// 	},)
// }
export const useTablePreference = (
	params: TGetTablePreferenceProps | undefined,
): UseQueryResult<IUserTablePreference | null, Error> => {
	const userName = params?.userName ?? ''
	const tableName = params?.tableName ?? ''

	return useQuery<IUserTablePreference | null, Error>({
		queryKey: [queryKeys.TABLE_PREFERENCE, userName, tableName,],
		queryFn:  async() => {
			if (!userName || !tableName) {
				return null
			}
			return tableService.getPreference({
				userName, tableName,
			},)
		},
	},)
}

export const useUpsertTablePreference = (): UseMutationResult<
  IUserTablePreference,
  Error,
  TUpsertTablePreferenceProps
> => {
	return useMutation({
		mutationFn: async(body: TUpsertTablePreferenceProps,): Promise<IUserTablePreference> => {
			return tableService.upsertPreference(body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message || 'Failed to update table preference',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess(response, variables,) {
			queryClient.invalidateQueries({
				queryKey: [
					queryKeys.TABLE_PREFERENCE,
					{
						userName:  variables.userName,
						tableName: variables.tableName,
					},
				],
			},)
		},
	},)
}
