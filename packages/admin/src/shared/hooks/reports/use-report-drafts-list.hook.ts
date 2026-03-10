import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../constants'
import type {
	IReportDraft,
} from '../../types'
import {
	reportService,
} from '../../../services/report/report.service'

export const useReportDraftsList = (): UseQueryResult<Array<IReportDraft>> => {
	return useQuery<Array<IReportDraft>>({
		queryKey: [
			queryKeys.REPORT_DRAFT,
		],
		queryFn:  async() => {
			return reportService.getReportDrafts()
		},
	},)
}
