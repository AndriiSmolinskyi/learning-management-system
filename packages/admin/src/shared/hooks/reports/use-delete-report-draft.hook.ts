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
import {
	queryClient,
} from '../../../providers/query.provider'

export const useDeleteReportDraft = (): UseMutationResult<void, Error, number> => {
	return useMutation({
		mutationFn:  async(id: number,) => {
			return reportService.deleteReportDraft(id,)
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