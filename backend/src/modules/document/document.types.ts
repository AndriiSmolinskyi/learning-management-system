import type { Document, Portfolio, } from '@prisma/client'

export interface IComplianceCheckResponse {
	clientDocuments: Array<Document>
	portfolios: Array<Portfolio>
}

export interface IComplianceCheckTotalResponse {
	pending: number
	approved: number
	declined: number
}