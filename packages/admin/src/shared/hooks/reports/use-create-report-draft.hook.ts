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
	queryKeys,
} from '../../constants'
import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	reportService,
} from '../../../services/report/report.service'

import type {
	IReportDraft,
} from '../../types'
import type {
	TAddReportProps,
} from '../../../services/report/report.types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useCreateReportDraft = (): UseMutationResult<IReportDraft, Error, TAddReportProps> => {
	return useMutation({
		mutationFn:  async(body: TAddReportProps,) => {
			return reportService.createReportDraft(body,)
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
				queryKey: [queryKeys.REPORT_DRAFT,],
			},)
		},
	},)
}