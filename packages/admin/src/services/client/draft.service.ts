import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'

import type {
	PaginationResult,
} from '../../shared/types'
import type {
	ClientDraft,
} from '../../shared/types'

class DraftService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = 'draft'

	public async addDraft(props: ClientDraft,): Promise<ClientDraft> {
		return this.httpService.post(`${this.module}/create`, props,)
	}

	public async getDraftsList(): Promise<PaginationResult<ClientDraft>> {
		return this.httpService.get(`${this.module}/list`,)
	}

	public async deleteClientDraft(draftId: string,): Promise<void> {
		return this.httpService.delete(`${this.module}/delete/${draftId}`,)
	}

	public async updateDraft(draftId: string, props: ClientDraft,): Promise<ClientDraft> {
		return this.httpService.put(`${this.module}/update/${draftId}`, props,)
	}
}

export const draftService = new DraftService(new HttpFactoryService().createHttpService(),)
