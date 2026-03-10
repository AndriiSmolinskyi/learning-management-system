import type {
	IStorePortfolioDetailed,
} from '../../store/compliance-check.store'
import type {
	DocumentStatus,
	IDocument,
} from '../../shared/types'

export interface IDocumentUpdateStatus {
  documentsIds: Array<string>,
  status: DocumentStatus,
  comment?: string
}

export type DocumentIds = {
	id: Array<string>
}

export interface IComplianceCheckResponse {
	clientDocuments: Array<IDocument>
	portfolios: Array<IStorePortfolioDetailed>
}

export interface IComplianceCheckTotalResponse {
	pending: number
	approved: number
	declined: number
}

export type TGetDocumentsBySourceProps = {
	clientId?: string
	clientDraftId?: string
	portfolioId?: string
	portfolioDraftId?: string
	entityId?: string
	assetId?: string
	requestId?: number
	requestDraftId?: number
	transactionId?: number
	transactionDraftId?: number
}