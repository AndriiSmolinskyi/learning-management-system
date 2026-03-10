import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'

import {
	clientService,
} from '../../../../../services/client'
import {
	queryKeys,
} from '../../../../../shared/constants'
import {
	queryClient,
} from '../../../../../providers/query.provider'

export const useResendConfirmation = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn: async(id: string,) => {
			await clientService.resendConfirmation(id,)
		},
		onSuccess: (data, id,) => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT, id,],
			},)
		},
	},)
}

export const useResetPassword = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn: async(email: string,) => {
			await clientService.resetPassword(email,)
		},
		onSuccess: (data, id,) => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CLIENT, id,],
			},)
		},
	},)
}
