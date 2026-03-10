import type {
	UseMutationResult,
} from '@tanstack/react-query'
import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'
import {
	queryKeys,
} from '../../../shared/constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	orderService,
} from '../../../services/orders/orders.service'
import type {
	ITOrderListRes,
	IAddOrderProps, IEditOrderProps, IOrder,
	TOrderFilter, IOrderDraft, IOrderUnits, IOrderUnitsFilter,
} from '../../types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useCreateOrderDraft = (): UseMutationResult<IOrderDraft, Error, IOrderDraft> => {
	return useMutation({
		mutationFn: async(body: IOrderDraft,) => {
			return orderService.createOrderDraft(body,)
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
				queryKey: [queryKeys.ORDER_DRAFT,],
			},)
		},
	},)
}

export const useOrdersList = (): UseQueryResult<ITOrderListRes> => {
	return useQuery<ITOrderListRes, Error>({
		queryKey: [queryKeys.ORDER_LIST,],
		queryFn:  async() => {
			return orderService.getOrders()
		},
	},)
}

export const useCreateOrder = (): UseMutationResult<IOrder, Error, IAddOrderProps> => {
	return useMutation({
		mutationFn: async(body: IAddOrderProps,): Promise<IOrder> => {
			return orderService.createOrder(body,)
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
				queryKey: [queryKeys.ORDER_LIST,],
			},)
		},
	},)
}

type TUpdateOrderStatusProps = {
    orderId: number;
    status: string;
};

export const useUpdateOrderStatus = (): UseMutationResult<void, Error, TUpdateOrderStatusProps> => {
	return useMutation({
		mutationFn: async({
			orderId, status,
		}: TUpdateOrderStatusProps,) => {
			return orderService.updateOrderStatus(orderId, status,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message || 'Failed to update order status',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess(data, {
			orderId,
		},) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ORDER, orderId,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ORDER_LIST,],
			},)
		},
	},)
}

export const useOrderById = (orderId: number,): UseQueryResult<IOrder, Error> => {
	return useQuery<IOrder, Error>({
		queryKey: [queryKeys.ORDER, orderId,],
		queryFn:  async() => {
			return orderService.getOrderById(orderId,)
		},
	},)
}

export const useUpdateOrder = (): UseMutationResult<IOrder, Error, { orderId: number; body: IEditOrderProps }> => {
	return useMutation<IOrder, Error, { orderId: number; body: IEditOrderProps }>({
		mutationFn: async({
			orderId, body,
		},) => {
			return orderService.updateOrder(orderId, body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message || 'Failed to update the order',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess(data,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ORDER_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ORDER, data.id,],
			},)
		},
	},)
}

type TDeleteOrderDetailsProps = { ids: Array<string> };

export const useDeleteOrderDetails = (): UseMutationResult<void, Error, TDeleteOrderDetailsProps> => {
	return useMutation({
		mutationFn: async({
			ids,
		}: TDeleteOrderDetailsProps,) => {
			return orderService.deleteOrderDetails(ids,)
		},
		onError: async(error,) => {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data.message || 'Failed to delete order details' :
					error.message,
			},)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ORDER_LIST,],
			},)
		},
	},)
}

export const useOrdersListFiltered = (
	filter: TOrderFilter,
): UseQueryResult<ITOrderListRes> => {
	return useQuery<ITOrderListRes>({
		queryKey: [
			queryKeys.ORDER_LIST, filter,
		],
		queryFn:  async() => {
			return orderService.getOrdersFiltered(filter,)
		},
	},)
}

export const useOrderDrafts = (): UseQueryResult<Array<IOrderDraft>, Error> => {
	return useQuery<Array<IOrderDraft>, Error>({
		queryKey: [queryKeys.ORDER_DRAFT,],
		queryFn:  async() => {
			return orderService.getOrderDrafts()
		},
	},)
}

export const useDeleteOrderDraft = (): UseMutationResult<void, Error, number> => {
	return useMutation({
		mutationFn: async(draftId: number,) => {
			return orderService.deleteOrderDraft(draftId,)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ORDER_DRAFT,],
			},)
		},
	},)
}

export const useUpdateOrderDraft = (): UseMutationResult<IOrderDraft, Error, { draftId: number; body: IOrderDraft }> => {
	return useMutation({
		mutationFn: async({
			draftId, body,
		}: { draftId: number; body: IOrderDraft },) => {
			return orderService.updateOrderDraft(draftId, body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message || 'Failed to update order draft',
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess(data,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ORDER_DRAFT,],
			},)
		},
	},)
}

export const useDeleteOrder = (): UseMutationResult<void, Error, number, string> => {
	return useMutation({
		mutationFn:  async(id: number,) => {
			return orderService.deleteOrderById(id,)
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
				queryKey: [queryKeys.ORDER_LIST,],
			},)
		},
	},)
}

export const useGetOrderUnits = (filter: IOrderUnitsFilter | undefined,): UseQueryResult<IOrderUnits> => {
	return useQuery<IOrderUnits, Error>({
		queryKey: [queryKeys.ORDER_UNITS, filter,],
		queryFn:  async() => {
			return orderService.getOrderUnits(filter,)
		},
		enabled: Boolean(filter?.assetName && filter.isin && filter.portfolioId,),
	},)
}