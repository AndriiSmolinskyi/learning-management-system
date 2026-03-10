import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	clientService,
} from '../../../services/client'
import {
	queryKeys,
} from '../../../shared/constants'
import {
	AxiosError,
} from 'axios'
import {
	toasterService,
} from '../../../services/toaster'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useDeleteClientById = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn:  async(id: string,) => {
			return clientService.deletePortfolioById(id,)
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