import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	expenseCategoryListService,
} from '../../../services/list-hub/services'
import {
	queryKeys,
} from '../../../shared/constants'
import {
	FetchErrorMessages,
} from '../../../shared/constants/messages.constants'
import type {
	IListHubItemResponse,
	INewExpenseCategoryBody,
} from '../../../shared/types'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	AxiosError,
} from 'axios'
import type {
	IMessage,
} from '../../../shared/types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useGetExpenseCategoryList = (clientId: string,): UseQueryResult<Array<IListHubItemResponse>, Error> => {
	return useQuery({
		queryKey:         [queryKeys.EXPENSE_CATEGORY_LIST, clientId,],
		queryFn:          async() => {
			try {
				const data = await expenseCategoryListService.getExpenseCategoryList(clientId,)
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_BANK_LIST_ERROR,)
			}
		},
		staleTime: 5 * 60 * 1000,
		enabled:   Boolean(clientId.trim(),),
	},)
}

export const useCreateExpenseCategoryListItem = (): UseMutationResult<IMessage, Error, INewExpenseCategoryBody> => {
	return useMutation({
		mutationFn:  async(body: INewExpenseCategoryBody,) => {
			const message = expenseCategoryListService.createExpenseCategoryListItem(body,)
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
				queryKey: [queryKeys.EXPENSE_CATEGORY_LIST,],
			},)
		},
	},)
}

