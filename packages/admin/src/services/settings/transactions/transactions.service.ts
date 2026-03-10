
import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	SettingsRoutes,
} from './transactions.constants'
import type {
	ITransactionType,
	TAddTransactionType,
	ITransactionTypeCategory,
	TransactionTypeFilter,
	TRelationsResponse,
	TChangeRelationsBody,
	TAuditTrailFilter,
	ITransactionTypeAuditTrail,
} from '../../../shared/types'

class TransactionsSettings {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly transactionSettingsModule = SettingsRoutes.TRANSACTION_SETTINGS

	private readonly transactionSettingsDraftModule = SettingsRoutes.TRANSACTION_SETTINGS_DRAFT

	public async createTransactionTypeDraft(body: TAddTransactionType,): Promise<ITransactionType> {
		return this.httpService.post(`${this.transactionSettingsDraftModule}/${SettingsRoutes.CREATE}`, body,)
	}

	public async getTransactionTypeDraftsList(): Promise<Array<ITransactionType>> {
		return this.httpService.get(`${this.transactionSettingsDraftModule}/${SettingsRoutes.LIST}`,)
	}

	public async getTransactionTypeDraftById(id: string,): Promise<ITransactionType> {
		return this.httpService.get(`${this.transactionSettingsDraftModule}/${id}`,)
	}

	public async updateTransactionTypeDraft(
		id: string,
		body: Partial<TAddTransactionType>,
	): Promise<ITransactionType> {
		return this.httpService.patch(
			`${this.transactionSettingsDraftModule}/${id}`,
			body,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}

	public async deleteTransactionTypeDraft(id: string,): Promise<void> {
		return this.httpService.delete(`${this.transactionSettingsDraftModule}/${id}`,)
	}

	public async getTransactionTypeList(filter?: TransactionTypeFilter,): Promise<Array<ITransactionType>> {
		return this.httpService.get(`${this.transactionSettingsModule}/${SettingsRoutes.LIST}`, {
			params: filter,
		},)
	}

	public async createTransactionType(body: TAddTransactionType,): Promise<ITransactionType> {
		return this.httpService.post(`${this.transactionSettingsModule}/${SettingsRoutes.CREATE}`, body,)
	}

	public async createTransactionCategory(body: { name: string },): Promise<ITransactionTypeCategory> {
		return this.httpService.post(
			`${this.transactionSettingsModule}/${SettingsRoutes.CREATE_CATEGORY}`,
			body,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}

	public async getCategoryList(): Promise<Array<{ value: string; label: string }>> {
		return this.httpService.get(`${this.transactionSettingsModule}/${SettingsRoutes.CATEGORY_LIST}`,)
	}

	public async changeRelations(
		id: string,
		body: TChangeRelationsBody,
	): Promise<ITransactionType> {
		return this.httpService.patch(
			`${this.transactionSettingsModule}/${SettingsRoutes.RELATIONS}/${id}`,
			body,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}

	public async getRelations(
		id: string,
	): Promise<TRelationsResponse> {
		return this.httpService.get(`${this.transactionSettingsModule}/${SettingsRoutes.RELATIONS}/${id}`,)
	}

	public async deleteTransactionType(
		id: string,
		body: { userName: string; userRole: string },
	): Promise<ITransactionType> {
		return this.httpService.patch(
			`${this.transactionSettingsModule}/${SettingsRoutes.DELETE}/${id}`,
			body,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}

	public async changeActivatedStatus(
		id: string,
		body: { activatedStatus: boolean; userName: string; userRole: string },
	): Promise<ITransactionType> {
		return this.httpService.patch(
			`${this.transactionSettingsModule}/${SettingsRoutes.ACTIVATED}/${id}`,
			body,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}

	public async updateTransactionType(
		id: string,
		body: Partial<TAddTransactionType> & { isNewVersion: boolean },
	): Promise<ITransactionType> {
		return this.httpService.patch(
			`${this.transactionSettingsModule}/${SettingsRoutes.UPDATE}/${id}`,
			body,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}

	public async getTransactionTypeById(id: string,): Promise<ITransactionType> {
		return this.httpService.get(`${this.transactionSettingsModule}/id/${id}`,)
	}

	public async getTransactionTypeAuditTrail(
		filter?: TAuditTrailFilter,
	): Promise<Array<ITransactionTypeAuditTrail>> {
		return this.httpService.get(
			`${this.transactionSettingsModule}/${SettingsRoutes.AUDIT_LIST}`,
			{
				params: filter,
			},
		)
	}

	public async getAuditUsers(): Promise<Array<{ value: string; label: string }>> {
		return this.httpService.get(
			`${this.transactionSettingsModule}/${SettingsRoutes.AUDIT_USERS}`,
		)
	}

	public async getTransactionTypeCategoriesForList(): Promise<Array<ITransactionTypeCategory>> {
		return this.httpService.get(
			`${this.transactionSettingsModule}/${SettingsRoutes.CATEGORY_LIST_FOR_LIST}`,
		)
	}

	public async updateTransactionTypeCategory(
		id: string,
		name: string,
	): Promise<ITransactionTypeCategory> {
		return this.httpService.patch(
			`${this.transactionSettingsModule}/${SettingsRoutes.UPDATE_CATEGORY}/${id}`,
			{
				name,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}

	public async deleteTransactionTypeCategory(
		id: string,
	): Promise<ITransactionTypeCategory> {
		return this.httpService.patch(
			`${this.transactionSettingsModule}/${SettingsRoutes.DELETE_CATEGORY}/${id}`,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	}
}

export const transactionsSettingsService = new TransactionsSettings(new HttpFactoryService().createHttpService(),)