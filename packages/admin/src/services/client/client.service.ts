import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	IFilterProps,
} from '../../modules/clients/client-profiles/clients/clients.types'
import type {
	PaginationResult,
} from '../../shared/types'
import type {
	ActivateClientProps,
	AddClientProps,
	IClientWithBudgetPlan,
	EditClientProps,
} from './client.types'
import type {
	Client,
} from '../../shared/types'

class ClientService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = 'client'

	public async addClient(body: AddClientProps,): Promise<Client> {
		return this.httpService.post(`${this.module}/create`, body,)
	}

	public async getClientsList(filters: IFilterProps,): Promise<PaginationResult<IClientWithBudgetPlan>> {
		return this.httpService.get(`${this.module}/list`, {
			params: filters,
		},)
	}

	public async getClientById(id: string,): Promise<Client> {
		return this.httpService.get(`${this.module}/${id}`,)
	}

	public async activateClient({
		id, isActivated,
	}: ActivateClientProps,): Promise<Client> {
		return this.httpService.patch(`${this.module}/activate/${id}`, {
			isActivated,
		},)
	}

	public async getClientsListForSelect(): Promise<Array<{value: string, label: string,}>> {
		return this.httpService.get(`${this.module}/select-list`,)
	}

	public async updateClientById(id: string, body: EditClientProps,): Promise<Client> {
		return this.httpService.patch(`${this.module}/${id}`, body,)
	}

	public async resendConfirmation(id: string,): Promise<void> {
		return this.httpService.post(`${this.module}/resend-confirmation/${id}`, {
		},)
	}

	public async resetPassword(email: string,): Promise<void> {
		return this.httpService.post(`${this.module}/reset-password/${email}`, {
		},)
	}

	public async deletePortfolioById(id: string,): Promise<void> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}
}

export const clientService = new ClientService(new HttpFactoryService().createHttpService(),)
