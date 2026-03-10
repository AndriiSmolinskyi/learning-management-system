import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	documentTypesService,
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
	IMessage,
} from '../../../shared/types'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	AxiosError,
} from 'axios'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useGetDocumentTypes = (): UseQueryResult<Array<IListHubItemResponse>, Error> => {
	return useQuery({
		queryKey:         [queryKeys.DOCUMENT_TYPES,],
		queryFn:          async() => {
			try {
				const data = await documentTypesService.getAllDocumentTypes()
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_ALL_CLIENT_DOCUMENTS_ERROR,)
			}
		},
		staleTime:      5 * 60 * 1000,
	},)
}

export const useAddDocumentType = (): UseMutationResult<IMessage, Error, IListHubItemBody> => {
	return useMutation({
		mutationFn:  async(body: IListHubItemBody,) => {
			const message = documentTypesService.addDocumentType(body,)
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
				queryKey: [queryKeys.DOCUMENT_TYPES,],
			},)
		},
	},)
}

