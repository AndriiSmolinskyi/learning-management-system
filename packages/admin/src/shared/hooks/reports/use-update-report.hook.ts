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
	IReport,
} from '../../types'
import type {
	TEditReportProps,
} from '../../../services/report/report.types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useUpdateReport = (): UseMutationResult<IReport, Error, TEditReportProps> => {
	return useMutation({
		mutationFn:  async(body: TEditReportProps,) => {
			return reportService.updateReport(body,)
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
				queryKey: [queryKeys.REPORT, data.id,],
			},)
		},
	},)
}