/* eslint-disable max-lines */
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
	useUserStore,
} from '../../../store/user.store'
import {
	queryKeys,
} from '../../constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	queryClient,
} from '../../../providers/query.provider'
import {
	keysToInvalidateMainRoutes,
} from '../../constants'
import type {
	ITransactionType,
	TAddTransactionType,
	ITransactionTypeCategory,
	TransactionTypeFilter,
	TRelationsResponse,
	TAuditTrailFilter,
	ITransactionTypeAuditTrail,
	IOldTransactionType,
} from '../../../shared/types'
import {
	transactionsSettingsService,
} from '../../../services/settings/transactions/transactions.service'

export const useCreateTransactionTypeDraft = (): UseMutationResult<IOldTransactionType, Error, TAddTransactionType> => {
	return useMutation({
		mutationFn: async(body: TAddTransactionType,) => {
			return transactionsSettingsService.createTransactionTypeDraft(body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while creating the transaction type draft.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_DRAFT,],
			},)
		},
	},)
}

export const useTransactionTypeDraftsList = (): UseQueryResult<Array<IOldTransactionType>> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_TYPES_DRAFT,],
		queryFn:  async() => {
			return transactionsSettingsService.getTransactionTypeDraftsList()
		},
	},)
}

export const useTransactionTypeDraftById = (id?: string,): UseQueryResult<IOldTransactionType> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_TYPES_DRAFT, 'draft', id,],
		enabled:  Boolean(id,),
		queryFn:  async() => {
			return transactionsSettingsService.getTransactionTypeDraftById(id!,)
		},
	},)
}

export const useUpdateTransactionTypeDraft = (): UseMutationResult<
	IOldTransactionType,
	Error,
	{ id: string; body: Partial<TAddTransactionType> }
> => {
	return useMutation({
		mutationFn: async(variables,) => {
			return transactionsSettingsService.updateTransactionTypeDraft(variables.id, variables.body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: ((error.response?.data as { message?: string } | undefined)?.message) ??
						'An error occurred while updating the draft.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_DRAFT,],
			},)
		},
	},)
}

export const useDeleteTransactionTypeDraft = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn: async(id,) => {
			return transactionsSettingsService.deleteTransactionTypeDraft(id,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: ((error.response?.data as { message?: string } | undefined)?.message) ??
						'An error occurred while deleting the draft.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_DRAFT,],
			},)
		},
	},)
}

export const useCreateTransactionType = (): UseMutationResult<ITransactionType, Error, TAddTransactionType> => {
	return useMutation({
		mutationFn: async(body: TAddTransactionType,) => {
			return transactionsSettingsService.createTransactionType(body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while creating the transaction type.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [keysToInvalidateMainRoutes,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPE_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_DRAFT,],
			},)
		},
	},)
}

export const useCreateTransactionCategory = (): UseMutationResult<ITransactionTypeCategory, Error, string> => {
	return useMutation({
		mutationFn: async(name: string,) => {
			return transactionsSettingsService.createTransactionCategory({
				name,
			},)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while creating the category.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_CATEGORY_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_CATEGORY_FOR_LIST,],
			},)
		},
	},)
}

export const useTransactionCategoryList = (): UseQueryResult<Array<{ value: string; label: string }>> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_CATEGORY_LIST,],
		queryFn:  async() => {
			return transactionsSettingsService.getCategoryList()
		},
	},)
}

export const useTransactionTypeList = (
	filter?: TransactionTypeFilter,
): UseQueryResult<Array<ITransactionType>> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_TYPES, filter ?? {
		},],
		queryFn:  async() => {
			return transactionsSettingsService.getTransactionTypeList(filter,)
		},
	},)
}

export const useChangeRelations = (): UseMutationResult<
  ITransactionType,
  Error,
  { id: string; body: { relatedTypeId?: string | null; asset?: string | null } }
> => {
	const {
		userInfo,
	} = useUserStore()

	return useMutation({
		mutationFn: async({
			id, body,
		},) => {
			return transactionsSettingsService.changeRelations(id, {
				...body,
				userName: userInfo.name ?? '',
				userRole: userInfo.roles[0] ?? '',
			},)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while updating relations.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: (error).message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [keysToInvalidateMainRoutes,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPE_LIST,],
			},)
		},
	},)
}

export const useTransactionTypeRelations = (id: string,): UseQueryResult<TRelationsResponse> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_TYPES, id,],
		enabled:  Boolean(id.trim(),),
		queryFn:  async() => {
			return transactionsSettingsService.getRelations(id,)
		},
	},)
}

export const useDeleteTransactionType = (): UseMutationResult<ITransactionType, Error, string> => {
	const {
		userInfo,
	} = useUserStore()

	return useMutation({
		mutationFn: async(id: string,) => {
			return transactionsSettingsService.deleteTransactionType(id, {
				userName: userInfo.name ?? '',
				userRole: userInfo.roles[0] ?? '',
			},)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while deleting the transaction type.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: (error).message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
		},
	},)
}

export const useChangeActivatedStatus = (): UseMutationResult<
  ITransactionType,
  Error,
  { id: string; activatedStatus: boolean }
> => {
	const {
		userInfo,
	} = useUserStore()

	return useMutation({
		mutationFn: async({
			id, activatedStatus,
		},) => {
			return transactionsSettingsService.changeActivatedStatus(id, {
				activatedStatus,
				userName: userInfo.name ?? '',
				userRole: userInfo.roles[0] ?? '',
			},)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while updating activation status.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: (error).message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [keysToInvalidateMainRoutes,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPE_LIST,],
			},)
		},
	},)
}

export const useUpdateTransactionType = (): UseMutationResult<
  ITransactionType,
  Error,
  { id: string; body: Partial<TAddTransactionType> & { isNewVersion: boolean }}
> => {
	return useMutation({
		mutationFn: async({
			id, body,
		},) => {
			return transactionsSettingsService.updateTransactionType(id, body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while updating the transaction type.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [keysToInvalidateMainRoutes,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPE_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_ANALYTICS,],
			},)
		},
	},)
}

export const useTransactionTypeById = (id?: string,): UseQueryResult<ITransactionType> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_TYPES, id,],
		enabled:  Boolean(id,),
		queryFn:  async() => {
			return transactionsSettingsService.getTransactionTypeById(id!,)
		},
	},)
}

export const useTransactionTypeAuditTrail = (
	filter?: TAuditTrailFilter,
): UseQueryResult<Array<ITransactionTypeAuditTrail>> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT, filter ?? {
		},],
		queryFn:  async() => {
			return transactionsSettingsService.getTransactionTypeAuditTrail(filter,)
		},
	},)
}

export const useAuditUsers = (): UseQueryResult<Array<{ value: string; label: string }>> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
		queryFn:  async() => {
			return transactionsSettingsService.getAuditUsers()
		},
	},)
}

export const useTransactionTypeForList = (): UseQueryResult<Array<ITransactionTypeCategory>> => {
	return useQuery({
		queryKey: [queryKeys.TRANSACTION_CATEGORY_FOR_LIST,],
		queryFn:  async() => {
			return transactionsSettingsService.getTransactionTypeCategoriesForList()
		},
	},)
}

export const useUpdateTransactionTypeCategory = (): UseMutationResult<
  ITransactionTypeCategory,
  Error,
  { id: string; name: string}
> => {
	return useMutation({
		mutationFn: async({
			id, name,
		},) => {
			return transactionsSettingsService.updateTransactionTypeCategory(id, name,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while updating the transaction type.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [keysToInvalidateMainRoutes,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPE_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_ANALYTICS,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_CATEGORY_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_CATEGORY_FOR_LIST,],
			},)
		},
	},)
}

export const useDeleteTransactionTypeCategory = (): UseMutationResult<ITransactionTypeCategory, Error, string> => {
	return useMutation({
		mutationFn: async(id: string,) => {
			return transactionsSettingsService.deleteTransactionTypeCategory(id,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message:
            ((error.response?.data as { message?: string } | undefined)?.message) ??
            'An error occurred while deleting the transaction type.',
				},)
			} else {
				await toasterService.showErrorToast({
					message: (error).message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_AUDIT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_CATEGORY_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_CATEGORY_FOR_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION_TYPES_DRAFT,],
			},)
		},
	},)
}