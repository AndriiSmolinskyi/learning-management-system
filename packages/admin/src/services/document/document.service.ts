import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'

import {
	DOCUMENT_ROUTES,
} from './document.constants'
import type {
	IDocumentUpdateStatus,
	DocumentIds,
	IComplianceCheckResponse,
	TGetDocumentsBySourceProps,
	IComplianceCheckTotalResponse,
} from './document.types'
import type {
	IDocument,
	IMessage,
	DocumentStatus,
} from '../../shared/types'

class DocumentService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = DOCUMENT_ROUTES.MODULE

	public async getAllClientDocuments(id: string, status: DocumentStatus | undefined,): Promise<Array<IDocument>> {
		return this.httpService.get(`${this.module}/${DOCUMENT_ROUTES.GET_ALL_CLIENT_DOCUMENTS}/${id}`,{
			params: {
				status,
			},
		},)
	}

	public async getDocumentsForComplianceCheck(id: string, status: DocumentStatus | undefined,): Promise<IComplianceCheckResponse> {
		return this.httpService.get(`${this.module}/${DOCUMENT_ROUTES.GET_DOCUMENTS_FOR_COMPLIANCE_CHECK}/${id}`,{
			params: {
				status,
			},
		},)
	}

	public async getTotalsForComplianceCheck(id: string,): Promise<IComplianceCheckTotalResponse> {
		return this.httpService.get(`${this.module}/${DOCUMENT_ROUTES.GET_TOTALS_FOR_COMPLIANCE_CHECK}/${id}`,{
		},)
	}

	public async getDocumentsForPortfolioDetails(id: string,): Promise<IComplianceCheckResponse> {
		return this.httpService.get(`${this.module}/${DOCUMENT_ROUTES.GET_DOCUMENTS_FOR_PORTFOLIO_DETAILS}/${id}`,)
	}

	public async getDocumentsBySourceId(
		props: TGetDocumentsBySourceProps,
	): Promise<Array<IDocument>> {
		return this.httpService.get(`${this.module}/${DOCUMENT_ROUTES.SOURCE}`, {
			params: {
				...props,
			},
		},)
	}

	public async addDocument(body: FormData,): Promise<IDocument> {
		return this.httpService.post(`${this.module}/${DOCUMENT_ROUTES.CREATE}`, body,)
	}

	public async updateDocumentStatus(body: IDocumentUpdateStatus,): Promise<IMessage> {
		return this.httpService.patch(`${this.module}/${DOCUMENT_ROUTES.UPDATE_STATUS}`, body,)
	}

	public async downloadDocument(body: {storageName: string},): Promise<{url:string}> {
		return this.httpService.post(`${this.module}/${DOCUMENT_ROUTES.DOWNLOAD_DOCUMENT}`, body,)
	}

	public async deleteDocument(id: string,): Promise<void> {
		return this.httpService.delete(`${this.module}/${DOCUMENT_ROUTES.DELETE}/${id}`,)
	}

	public async deleteDocumentsByIds(ids: DocumentIds,): Promise<void> {
		return this.httpService.delete(
			`${this.module}/${DOCUMENT_ROUTES.DELETE}/?${queryString.stringify(ids, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}
}

export const documentService = new DocumentService(new HttpFactoryService().createHttpService(),)
