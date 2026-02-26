import type {
	Client,
	Document,
	Portfolio,
	Report,
	ReportDraft,
} from '@prisma/client'

import type { PaginationResult, } from '../../shared/types'

export type TReportExtended = Report & {
	client?: Partial<Client> | null
	portfolio?: Partial<Portfolio> | null
	documents: Array<Document>
}

export type TReportListRes = PaginationResult<Report>

export type TReportDraftExtended = ReportDraft & {
	client?: Partial<Client> | null
	portfolio?: Partial<Portfolio> | null
	documents: Array<Document>
}

export type TSortReportFields = keyof Pick<Report, 'id' | 'updatedAt' | 'createdAt'>

export enum ReportType {
	CUSTOMER = 'Customer',
	INTERNAL = 'Internal'
}

export enum ReportCategory {
	BOND = 'Bond',
	CUSTOM = 'Custom',
	STATEMENT = 'Statement',
	STOCK = 'Stock',
}