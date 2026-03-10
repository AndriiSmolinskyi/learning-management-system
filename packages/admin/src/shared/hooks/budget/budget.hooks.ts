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
	budgetService,
} from '../../../services/budget/budget.service'
import {
	toasterService,
} from '../../../services/toaster'
import type {
	IBudgetDraftCreateBody,
	IBudgetBanksChartAnalytics,
	IBudgetDraftUpdateBody,
	IBudgetPlanCreateBody,
	IBudgetPlanUpdateBody,
	TBudgetFilter,
} from '../../../services/budget/budget.types'
import type {
	IBudgetAllocation,
	IBudgetAllocationCreateBody,
	IBudgetPlan,
	IBudgetDraft,
	IBudgetDraftAllocation,
	IBudgetDraftAllocationCreateBody,
} from '../../../shared/types'
import {
	queryKeys,
} from '../../../shared/constants'
import type {
	DocumentIds,
} from '../../../services/document/document.types'
import type {
	Client,
} from '../../../shared/types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useGetBudgetPlansFiltered = (filter: TBudgetFilter,):
	UseQueryResult<Array<IBudgetPlan>> => {
	return useQuery({
		queryKey: [queryKeys.BUDGET_LIST, filter,],
		queryFn:  async() => {
			return budgetService.getBudgetPlans(filter,)
		},
	},)
}

export const useCreateBudgetPlan = (): UseMutationResult<IBudgetPlan, Error, IBudgetPlanCreateBody> => {
	return useMutation({
		mutationFn:  async(body: IBudgetPlanCreateBody,) => {
			return budgetService.createBudgetPlan(body,)
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
				queryKey: [queryKeys.BUDGET_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
			},)
		},
	},)
}

export const useUpdateBudgetPlan = (): UseMutationResult<IBudgetPlan, Error, IBudgetPlanUpdateBody> => {
	return useMutation({
		mutationFn:  async(body: IBudgetPlanUpdateBody,) => {
			return budgetService.updateBudgetPlan(body,)
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
		onSuccess(context,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_PLAN, context.id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
			},)
			setTimeout(() => {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.BUDGET_BANKS_CHART,],
				},)
			}, 200,)
		},
	},)
}

export const useCreateBudgetAllocation = (): UseMutationResult<IBudgetAllocation, Error, IBudgetAllocationCreateBody> => {
	return useMutation({
		mutationFn:  async(body: IBudgetAllocationCreateBody,) => {
			return budgetService.createBudgetAllocation(body,)
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
		onSuccess(context,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_PLAN, context.budgetPlanId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_BANKS_CHART,context.budgetPlanId,],
			},)
		},
	},)
}

export const useGetBudgetDrafts = ():
	UseQueryResult<Array<IBudgetDraft>> => {
	return useQuery({
		queryKey: [queryKeys.BUDGET_DRAFT_LIST,],
		queryFn:  async() => {
			return budgetService.getBudgetDrafts()
		},
	},)
}

export const useCreateBudgetDraft = (): UseMutationResult<IBudgetDraft, Error, IBudgetDraftCreateBody> => {
	return useMutation({
		mutationFn:  async(body: IBudgetDraftCreateBody,) => {
			return budgetService.createBudgetDraft(body,)
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
		onSuccess(context,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_DRAFT_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
			},)
		},
	},)
}

export const useUpdateBudgetDraft = (): UseMutationResult<IBudgetDraft, Error, IBudgetDraftUpdateBody> => {
	return useMutation({
		mutationFn:  async(body: IBudgetDraftUpdateBody,) => {
			return budgetService.updateBudgetDraft(body,)
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
		onSuccess(context,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_DRAFT_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
			},)
		},
	},)
}

export const useGetBudgetPlanById = (id: string = '',): UseQueryResult<IBudgetPlan> => {
	return useQuery({
		queryKey: [queryKeys.BUDGET_PLAN, id,],
		queryFn:  async() => {
			return budgetService.getBudgetPlanById(id,)
		},
		enabled: Boolean(id,),
	},)
}

export const useGetBudgetDraftById = (id: string = '',): UseQueryResult<IBudgetDraft> => {
	return useQuery({
		queryKey: [queryKeys.BUDGET_DRAFT, id,],
		queryFn:  async() => {
			return budgetService.getBudgetDraftById(id,)
		},
		enabled: Boolean(id,),
	},)
}

export const useDeleteBudgetById = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn:  async(id: string,) => {
			return budgetService.deleteBudgetById(id,)
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
				queryKey: [queryKeys.BUDGET_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
			},)
		},
	},)
}

export const useDeleteBudgetDraftById = (): UseMutationResult<void, Error, string> => {
	return useMutation({
		mutationFn:  async(id: string,) => {
			return budgetService.deleteBudgetDraftById(id,)
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
				queryKey: [queryKeys.BUDGET_DRAFT_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
			},)
		},
	},)
}

export const useUpdateBudgetPlanDraft = (): UseMutationResult<IBudgetDraft, Error, IBudgetDraftUpdateBody> => {
	return useMutation({
		mutationFn:  async(body: IBudgetDraftUpdateBody,) => {
			return budgetService.updateBudgetPlanDraft(body,)
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
		onSuccess(data,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_DRAFT_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.REQUEST_DRAFT, data.id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
			},)
		},
	},)
}

export const useCreateBudgetDraftAllocation = (): UseMutationResult<IBudgetDraftAllocation, Error, IBudgetDraftAllocationCreateBody> => {
	return useMutation({
		mutationFn:  async(body: IBudgetDraftAllocationCreateBody,) => {
			return budgetService.createBudgetDraftAllocation(body,)
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
	},)
}

export const useDeleteAllBudgetDraftAllocations = (): UseMutationResult<void, Error, DocumentIds> => {
	return useMutation({
		mutationFn:  async(ids: DocumentIds,) => {
			return budgetService.deleteAllBudgetDraftAllocations(ids,)
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
	},)
}

export const useDeleteAllBudgetPlanAllocations = (): UseMutationResult<void, Error, DocumentIds> => {
	return useMutation({
		mutationFn:  async(ids: DocumentIds,) => {
			return budgetService.deleteAllBudgetPlanAllocations(ids,)
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
	},)
}

export const useGetBudgetBanksChartById = (id: string = '',): UseQueryResult<Array<IBudgetBanksChartAnalytics>> => {
	return useQuery({
		queryKey: [queryKeys.BUDGET_BANKS_CHART, id,],
		queryFn:  async() => {
			return budgetService.getBudgetBanksChartById(id,)
		},
		enabled: Boolean(id,),
	},)
}

export const getClientListWithoutBudgetPlan = (): UseQueryResult<Array<Client>> => {
	return useQuery({
		queryKey: [queryKeys.BUDGET_CLIENT_LIST,],
		queryFn:  async() => {
			return budgetService.getClientListWithoutBudgetPlan()
		},
	},)
}

