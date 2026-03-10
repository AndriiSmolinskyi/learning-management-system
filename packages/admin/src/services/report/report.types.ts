import type {
	IReport,
} from '../../shared/types'

export type TGetReportsBySourceProps = {
	clientId?: string
	portfolioId?: string
}

export type TAddReportProps = Omit<IReport,
	'id' |
	'createdAt' |
	'updatedAt' |
	'clientId' |
	'portfolioId' |
	'isins'
	> & {
	clientId?: string
	portfolioId?: string
	reportDraftId?: number
	isins?: Array<string>
}

export type TEditReportProps = Partial<TAddReportProps> & {
	id: number
}