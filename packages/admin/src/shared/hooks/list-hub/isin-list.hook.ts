import type {
	UseMutationResult, UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	isinListService,
} from '../../../services/list-hub/services'
import {
	queryKeys,
} from '../../../shared/constants'
import type {
	IIsinCreateItemBody,
	IPortfolioIsinsFilter,
	IsinType,
} from '../../../shared/types'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	AxiosError,
} from 'axios'
import type {
	IMessage,
} from '../../../shared/types'
import {
	queryClient,
} from '../../../providers/query.provider'
import {
	FetchErrorMessages,
} from '../../constants/messages.constants'

export const useCreateIsin = (isinType?: IsinType,): UseMutationResult<IMessage, Error, IIsinCreateItemBody> => {
	return useMutation({
		mutationFn:  async(body: IIsinCreateItemBody,) => {
			const message = isinListService.createIsin({
				...body, isinType,
			},)
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
		async onSuccess(data,) {
			await toasterService.showSuccessToast({
				message: data.message,
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CBONDS.EMISSIONS_ISINS,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.CBONDS.EQUITY_ISINS,],
			},)
		},
	},)
}

export const useGetPortfolioIsins = (filter: IPortfolioIsinsFilter | undefined,): UseQueryResult<Array<string>, Error> => {
	return useQuery({
		queryKey: [queryKeys.PORTFOLIO_ISINS, filter,],
		queryFn:  async() => {
			try {
				return isinListService.getPortfolioIsins(filter,)
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_ISIN_LIST_ERROR,)
			}
		},
		staleTime: 5 * 60 * 1000,
		enabled:   Boolean(filter,),
	},)
}