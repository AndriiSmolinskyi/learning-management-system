import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation,
	useQuery,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'
import {
	expenseCategoryService,
} from '../../../services/expense-category/expense-category.service'
import {
	toasterService,
} from '../../../services/toaster'
import {
	queryKeys,
} from '../../../shared/constants'
import type {
	ICreateExpenseCategoryBody, ICreateTransactionCategoryDependencyBody, IEditLinkTransactionTypesBody,
	IExpenseUpdateBody,
	IGetExpenseCategoriesFilter,
	ILinkTransactionTypesBody,
} from '../../../services/expense-category/expense-category.types'
import type {
	IExpenseCategory,
} from '../../../shared/types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useGetExpenseCategoriesByBudgetId = (body: IGetExpenseCategoriesFilter,):
	UseQueryResult<Array<IExpenseCategory>> => {
	return useQuery({
		queryKey: [queryKeys.EXPENSE_CATEGORIES, body,],
		queryFn:  async() => {
			return expenseCategoryService.getExpenseCategoriesByBudgetId(body,)
		},
		enabled: body.id ?
			Boolean(body.id.trim(),) :
			false,
	},)
}

export const useGetExpenseCategoryById = (body: IGetExpenseCategoriesFilter,):
	UseQueryResult<IExpenseCategory> => {
	return useQuery({
		queryKey: [queryKeys.EXPENSE_CATEGORY, body,],
		queryFn:  async() => {
			return expenseCategoryService.getExpenseCategoryById(body,)
		},
		enabled: body.id ?
			Boolean(body.id.trim(),) :
			false,
	},)
}

export const useCreateExpenseCategory = (): UseMutationResult<IExpenseCategory, Error, ICreateExpenseCategoryBody> => {
	return useMutation({
		mutationFn:  async(body: ICreateExpenseCategoryBody,) => {
			return expenseCategoryService.createExpenseCategory(body,)
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
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
		},
	},)
}

export const useUpdateAllCategoriesByBudgetId = (id: string,): UseMutationResult<void, Error, IExpenseUpdateBody> => {
	return useMutation({
		mutationFn:  async(body: IExpenseUpdateBody,) => {
			return expenseCategoryService.updateAllByBudgetId(body,)
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
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.EXPENSE_CATEGORY, id,],
			},)
		},
	},)
}

export const useDeleteExpenseCategoryById = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn:  async(id: string,) => {
			return expenseCategoryService.deleteExpenseCategoryById(id,)
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
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
		},
	},)
}

export const useLinkTransactionTypes = (): UseMutationResult<void, Error, ILinkTransactionTypesBody> => {
	return useMutation({
		mutationFn:  async(body: ILinkTransactionTypesBody,) => {
			return expenseCategoryService.linkExpenseCategoryWithTransactions(body,)
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
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.EXPENSE_CATEGORY,],
			},)
		},
		retry: 0,
	},)
}

export const useCreateTransactionCategoryDependency = (): UseMutationResult<void, Error, ICreateTransactionCategoryDependencyBody> => {
	return useMutation({
		mutationFn:  async(body: ICreateTransactionCategoryDependencyBody,) => {
			return expenseCategoryService.createLinkTransactionWithExpenseCategory(body,)
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
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.TRANSACTION,],
			},)
		},
		retry: 0,
	},)
}

export const useEditLinkTransactionCategory = (): UseMutationResult<void, Error, IEditLinkTransactionTypesBody> => {
	return useMutation({
		mutationFn:  async(body: IEditLinkTransactionTypesBody,) => {
			return expenseCategoryService.editLinkTransactionWithCategory(body,)
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
				queryKey: [queryKeys.EXPENSE_CATEGORIES,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.EXPENSE_CATEGORY,],
			},)
		},
		retry: 0,
	},)
}
