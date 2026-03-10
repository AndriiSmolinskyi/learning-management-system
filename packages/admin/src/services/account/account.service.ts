import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	AccountRoutes,
} from './account.constants'
import type {
	IAccount,
	IAccountExtended,
	TAddAccountProps,
	TEditAccountProps,
} from '../../shared/types'

import queryString from 'query-string'
import type {
	TGetAccountsBySourceProps,
} from './account.types'
import type {
	TGetAccountListSourcesIds,
} from '../../shared/hooks'

class AccountService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AccountRoutes.MODULE

	public async createAccount(body: TAddAccountProps,): Promise<IAccount> {
		return this.httpService.post(`${this.module}/${AccountRoutes.CREATE}`, body,)
	}

	public async getAccountsByBankId(bankId: string,): Promise<Array<IAccount>> {
		return this.httpService.get(`${this.module}/${AccountRoutes.BANK}/${bankId}`,)
	}

	public async getAccountsListBySourceIds(ids: TGetAccountListSourcesIds,): Promise<Array<IAccount>> {
		return this.httpService.get(
			`${this.module}/${AccountRoutes.BANKS}?${queryString.stringify(ids, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async getAccountsByEntityId(id: string,): Promise<Array<IAccountExtended>> {
		return this.httpService.get(`${this.module}/${AccountRoutes.ENTITY}/${id}`,)
	}

	public async updateAccount({
		id, ...body
	}: TEditAccountProps,): Promise<IAccount> {
		return this.httpService.patch(`${this.module}/${id}`, {
			...body,
		},)
	}

	public async getAccountListByPortfolioId(id: string,): Promise<Array<IAccount>> {
		return this.httpService.get(`${this.module}/${AccountRoutes.PORTFOLIO}/${id}`,)
	}

	public async getAccountAssetsTotalById(id: string,): Promise<IAccount> {
		return this.httpService.get(`${this.module}/${AccountRoutes.GET_ASSETS_TOTAL}/${id}`,)
	}

	public async getAccountsBySourceIds(props: TGetAccountsBySourceProps,): Promise<Array<IAccount>> {
		return this.httpService.get(
			`${this.module}/${AccountRoutes.SOURCE}?${queryString.stringify(props, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}
}

export const accountService = new AccountService(new HttpFactoryService().createHttpService(),)
