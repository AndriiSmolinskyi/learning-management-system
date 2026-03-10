import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'

import {
	RequestRoutes,
} from './request.constants'
import type {
	TAddRequestDraftProps,
	TAddRequestProps,
	TEditRequestDraftProps,
	IRequest,
	IRequestDraft,
	IRequestDraftExtended,
	IRequestExtended,
	TRequestListRes,
	TEditRequestProps,
	TUpdateRequestStatusProps,
	TRequestFilter,
} from '../../shared/types'
import type {
	TGetRequestsBySourceProps,
} from './request.types'

class RequestService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly requestModule = RequestRoutes.MODULE

	private readonly draftModule = RequestRoutes.DRAFT

	public async createRequest(body: TAddRequestProps,): Promise<IRequest> {
		return this.httpService.post(`${this.requestModule}/${RequestRoutes.CREATE}`, body,)
	}

	public async updateRequest({
		id, ...body
	}: TEditRequestProps,): Promise<IRequestExtended> {
		return this.httpService.patch(`${this.requestModule}/${id}`, body,)
	}

	public async updateRequestStatus({
		id, ...body
	}: TUpdateRequestStatusProps,): Promise<IRequestExtended> {
		return this.httpService.patch(`${this.requestModule}/${id}`, body,)
	}

	public async createRequestDraft(body: TAddRequestDraftProps,): Promise<IRequestDraft> {
		return this.httpService.post(`${this.draftModule}/${RequestRoutes.CREATE}`, body,)
	}

	public async updateRequestDraft({
		id, ...body
	}: TEditRequestDraftProps,): Promise<IRequestDraftExtended> {
		return this.httpService.patch(`${this.draftModule}/${id}`, body,)
	}

	public async getRequests(): Promise<Array<IRequestExtended>> {
		return this.httpService.get(`${this.requestModule}/${RequestRoutes.LIST}`,)
	}

	public async getRequestsBySourceId(
		props: TGetRequestsBySourceProps,
	): Promise<Array<IRequest>> {
		return this.httpService.get(`${this.requestModule}/${RequestRoutes.SOURCE}`, {
			params: {
				...props,
			},
		},)
	}

	public async getRequestsFiltered(filter: TRequestFilter,): Promise<TRequestListRes> {
		return this.httpService.get(`${this.requestModule}/${RequestRoutes.FILTER}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getRequestDrafts(): Promise<Array<IRequestDraft>> {
		return this.httpService.get(`${this.draftModule}/${RequestRoutes.LIST}`,)
	}

	public async deleteRequestDraft(id: number,): Promise<void> {
		return this.httpService.delete(`${this.draftModule}/${id}`,)
	}

	public async getRequestDraftById(id?: number,): Promise<IRequestDraftExtended> {
		return this.httpService.get(`${this.draftModule}/${id}`,)
	}

	public async getRequestById(id?: number,): Promise<IRequestExtended> {
		return this.httpService.get(`${this.requestModule}/${id}`,)
	}

	public async deleteRequestById(id: number,): Promise<void> {
		return this.httpService.delete(`${this.requestModule}/${id}`,)
	}
}

export const requestService = new RequestService(new HttpFactoryService().createHttpService(),)
