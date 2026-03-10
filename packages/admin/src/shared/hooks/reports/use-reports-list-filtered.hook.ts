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
	TReportListRes,
} from '../../types'
import type {
	TReportFilter,
} from '../../../modules/reports/reports-list/reports.types'
import {
	reportService,
} from '../../../services/report/report.service'

export const useReportsListFiltered = (
	filter: TReportFilter,
): UseQueryResult<TReportListRes> => {
	return useQuery({
		queryKey: [
			queryKeys.REPORT, filter,
		],
		queryFn:  async() => {
			return reportService.getRepotsFiltered(filter,)
		},
	},)
}
