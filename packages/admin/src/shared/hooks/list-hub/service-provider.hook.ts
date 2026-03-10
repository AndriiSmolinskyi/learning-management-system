import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	serviceProvidersListService,
} from '../../../services/list-hub/services'
import {
	queryKeys,
} from '../../../shared/constants'
import {
	FetchErrorMessages,
} from '../../../shared/constants/messages.constants'
import type {
	IListHubItemBody, IListHubItemResponse, ISelectListHubItemResponse,
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

export const useGetServiceProvidersList = (): UseQueryResult<Array<IListHubItemResponse>, Error> => {
	return useQuery({
		queryKey:         [queryKeys.SERVICE_PROVIDERS_LIST,],
		queryFn:          async() => {
			try {
				const data = await serviceProvidersListService.getServiceProvidersList()
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_BANK_LIST_ERROR,)
			}
		},
		staleTime: 5 * 60 * 1000,
	},)
}

export const useGetEncryptedServiceProvidersList = (): UseQueryResult<Array<ISelectListHubItemResponse>, Error> => {
	return useQuery({
		queryKey:         [queryKeys.ENCRYPTED_SERVICE_PROVIDERS_LIST,],
		queryFn:          async() => {
			try {
				const data = await serviceProvidersListService.getEncryptedServiceProvidersList()
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_BANK_LIST_ERROR,)
			}
		},
		staleTime: 5 * 60 * 1000,
	},)
}

export const useCreateServiceProvidersListItem = (): UseMutationResult<IMessage, Error, IListHubItemBody> => {
	return useMutation({
		mutationFn:  async(body: IListHubItemBody,) => {
			const message = serviceProvidersListService.createServiceProvidersListItem(body,)
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
				queryKey: [queryKeys.SERVICE_PROVIDERS_LIST,],
			},)
		},
	},)
}

