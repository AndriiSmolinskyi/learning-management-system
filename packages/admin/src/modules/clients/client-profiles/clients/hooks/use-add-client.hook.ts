import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import type {
	AddClientProps,
} from '../../../../../services/client'
import type {
	Client,
} from '../../../../../shared/types'
import {
	clientService,
} from '../../../../../services/client'
import {
	toasterService,
} from '../../../../../services/toaster'
import {
	queryKeys,
} from '../../../../../shared/constants'
import {
	queryClient,
} from '../../../../../providers/query.provider'

export const useAddClient = (): UseMutationResult<Client, Error, AddClientProps> => {
	return useMutation({
		mutationFn:  async(body: AddClientProps,) => {
			return clientService.addClient(body,)
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
				queryKey: [queryKeys.CLIENT,],
			},)
		},
	},)
}
