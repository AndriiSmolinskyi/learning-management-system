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
	TAddReportProps,
} from '../../../services/report/report.types'
import {
	queryClient,
} from '../../../providers/query.provider'

export const useCreateReport = (): UseMutationResult<IReport, Error, TAddReportProps> => {
	return useMutation({
		mutationFn:  async(body: TAddReportProps,) => {
			return reportService.createReport(body,)
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
		onSuccess(data, args,) {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.REPORT,],
			},)
			if (args.reportDraftId) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.REPORT_DRAFT,],
				},)
			}
		},
	},)
}