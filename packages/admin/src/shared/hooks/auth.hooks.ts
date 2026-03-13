import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	toasterService,
} from '../../services/toaster/toaster.service'
import {
	authService,
} from '../../services/auth/auth.service'

import type {
	LoginBody,
	LoginReturn,
} from '../../shared/types'

export const useLogin = (): UseMutationResult<LoginReturn, Error, LoginBody> => {
	return useMutation({
		mutationFn: async(body: LoginBody,) => {
			return authService.login(body,)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Login failed' :
					error.message,
			},)
		},
	},)
}