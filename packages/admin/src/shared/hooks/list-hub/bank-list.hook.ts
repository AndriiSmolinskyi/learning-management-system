import {
	AxiosError,
} from 'axios'
import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation,
	useQuery,
} from '@tanstack/react-query'

import {
	bankListService,
} from '../../../services/list-hub/services'
import {
	queryKeys,
} from '../../../shared/constants'
import {
	FetchErrorMessages,
} from '../../../shared/constants/messages.constants'
import type {
	IListHubItemBody,
	IListHubItemResponse,
} from '../../../shared/types'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import type {
	TGetBanksListBySourceProps,
} from '../../../services/list-hub/list-hub.types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useGetBankList = (): UseQueryResult<Array<IListHubItemResponse>, Error> => {
	return useQuery({
		queryKey: [queryKeys.BANK_LIST,],
		queryFn:  async() => {
			try {
				return bankListService.getBankList()
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_BANK_LIST_ERROR,)
			}
		},
		staleTime: 5 * 60 * 1000,
	},)
}

export const useGetBankListBySourceIds = (filter: TGetBanksListBySourceProps,): UseQueryResult<Array<IListHubItemResponse>, Error> => {
	return useQuery({
		queryKey: [queryKeys.BANK_LIST, filter,],
		queryFn:  async() => {
			return bankListService.getBanksListBySourceIds(filter,)
		},
	},)
}

export const useCreateBankListItem = (): UseMutationResult<IListHubItemResponse, Error, IListHubItemBody> => {
	return useMutation({
		mutationFn:  async(body: IListHubItemBody,) => {
			const message = bankListService.createBankListItem(body,)
			return message
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message,
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BANK_LIST,],
			},)
		},
	},)
}

