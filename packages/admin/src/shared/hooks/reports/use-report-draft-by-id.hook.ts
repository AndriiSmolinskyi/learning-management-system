import type {
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../../constants'
import {
	reportService,
} from '../../../services/report/report.service'
import type {
	IReportDraftParsed, TCustomReportPayload,
} from '../../../modules/reports/custom-report/custom-report.types'

export const useReportDraftById = (id: number = 0,): UseQueryResult<IReportDraftParsed> => {
	return useQuery({
		queryKey: [
			queryKeys.REPORT_DRAFT,
			id,
		],
		queryFn:  async() => {
			return reportService.getReportDraftById(id,)
		},
		enabled: Boolean(id,),
		select:  (data,) => {
			try {
				const parsedPayload: TCustomReportPayload | undefined = data.payload && JSON.parse(data.payload,)
				return {
					...data,
					payload: parsedPayload,
				}
			} catch (error) {
				return {
					...data,
					payload: undefined,
				}
			}
		},
	},)
}
