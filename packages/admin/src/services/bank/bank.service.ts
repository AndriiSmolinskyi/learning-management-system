import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	BankEndpoints,
} from './bank.constants'
import type {
	TAddBankProps,
	IBank,
	TEditBankProps,
} from '../../shared/types'

import queryString from 'query-string'
import type {
	TGetBanksBySourceProps,
} from './bank.types'
import type {
	TGetBankListSourcesIds,
} from '../../shared/hooks'

class BankService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = BankEndpoints.MODULE

	public async createBank(body: TAddBankProps,): Promise<IBank> {
		return this.httpService.post(`${this.module}/${BankEndpoints.CREATE}`, body,)
	}

	public async getBankListByPortfolioId(id: string,): Promise<Array<IBank>> {
		return this.httpService.get(`${this.module}/${BankEndpoints.PORTFOLIO}/${id}`,)
	}

	public async getBanksByClientId(id: string,): Promise<Array<IBank>> {
		return this.httpService.get(`${this.module}/${BankEndpoints.CLIENT}/${id}`,)
	}

	public async getBanksByEntityId(id: string,): Promise<Array<IBank>> {
		return this.httpService.get(`${this.module}/${BankEndpoints.ENTITY}/${id}`,)
	}

	public async getBankListBySourceIds(ids: TGetBankListSourcesIds,): Promise<Array<IBank>> {
		return this.httpService.get(
			`${this.module}/${BankEndpoints.BANK_LIST_BY_IDS}?${queryString.stringify(ids, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async updateBank({
		id, ...body
	}: TEditBankProps,): Promise<IBank> {
		return this.httpService.patch(`${this.module}/${id}`, {
			...body,
		},)
	}

	public async getBanksBySourceId(props: TGetBanksBySourceProps,): Promise<Array<IBank>> {
		return this.httpService.get(
			`${this.module}/${BankEndpoints.SOURCE}?${queryString.stringify(props, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}
}

export const bankService = new BankService(new HttpFactoryService().createHttpService(),)
