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
	ForgotPasswordReturn,
	ForgotPasswordBody,
	ResetPasswordBody,
	ResetPasswordReturn,
	LogoutReturn,
} from '../types'

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

export const useForgotPassword = (): UseMutationResult<ForgotPasswordReturn, Error, ForgotPasswordBody> => {
	return useMutation({
		mutationFn: async(body: ForgotPasswordBody,) => {
			return authService.forgotPassword(body,)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to send reset email' :
					error.message,
			},)
		},
	},)
}

export const useResetPassword = (): UseMutationResult<ResetPasswordReturn, Error, ResetPasswordBody> => {
	return useMutation({
		mutationFn: async(body: ResetPasswordBody,) => {
			return authService.resetPassword(body,)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to reset password' :
					error.message,
			},)
		},
	},)
}

export const useLogout = (): UseMutationResult<LogoutReturn, Error, void> => {
	return useMutation({
		mutationFn: async() => {
			return authService.logout()
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Logout failed' :
					error.message,
			},)
		},
	},)
}