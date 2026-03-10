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
	IReportParsed,
	TCustomReportPayload,
} from '../../../modules/reports/custom-report/custom-report.types'

export const useReportById = (id: number = 0,): UseQueryResult<IReportParsed> => {
	return useQuery({
		queryKey: [
			queryKeys.REPORT,
			id,
		],
		queryFn:  async() => {
			return reportService.getReportById(id,)
		},
		enabled:        Boolean(id,),
		select:         (data,) => {
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
