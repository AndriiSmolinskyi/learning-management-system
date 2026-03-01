import {
	Body,
	Controller,
	Get,
	Post,
	Param,
	Patch,
	Delete,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import type { TransactionTypeDraft, } from '@prisma/client'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import { SettingsRoutes, SwaggerDescriptions, } from '../settings.constants'
import { TransactionSettingsDraftService, } from '../services/transaction-draft.service'
import { CreateTransactionTypeDraftDto, } from '../dto/create-transaction-draft.dto'

@Controller(SettingsRoutes.TRANSACTION_SETTINGS_DRAFT,)
@ApiTags(SwaggerDescriptions.TRANSACTION_SETTINGS_TAG_DRAFT,)
export class TransactionSettingsDraftController {
	constructor(
		private readonly transactionSettingsDraftService: TransactionSettingsDraftService,
	) { }

	@Get(SettingsRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getTransactionTypeDraftsList(): Promise<Array<TransactionTypeDraft>> {
		return this.transactionSettingsDraftService.getTransactionTypeDrafts()
	}

	@Get(SettingsRoutes.ID,)
	@RolesDecorator({
		roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({ name: 'id', description: 'Draft id', },)
	public async getDraftById(
	@Param('id',) id: string,
	): Promise<TransactionTypeDraft> {
		return this.transactionSettingsDraftService.getTransactionTypeDraftById(id,)
	}

	@Patch(SettingsRoutes.ID,)
	@RolesDecorator({
		roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({ name: 'id', description: 'Draft id', },)
	@ApiBody({
		description: 'Partial draft update',
		type:        CreateTransactionTypeDraftDto,
		required:    false,
	},)
	public async updateDraft(
		@Param('id',) id: string,
		@Body() body: Partial<CreateTransactionTypeDraftDto>,
	): Promise<TransactionTypeDraft> {
		return this.transactionSettingsDraftService.updateTransactionTypeDraft(id, body,)
	}

	@Delete(SettingsRoutes.ID,)
	@RolesDecorator({
		roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({ name: 'id', description: 'Draft id', },)
	public async deleteDraft(
		@Param('id',) id: string,
	): Promise<void> {
		return this.transactionSettingsDraftService.deleteTransactionTypeDraft(id,)
	}

	@Post(SettingsRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_TRANSACTION_TYPE,
		type:        CreateTransactionTypeDraftDto,
	},)
	public async createTransactionTypeDraft(
		@Body() body: CreateTransactionTypeDraftDto,
	): Promise<TransactionTypeDraft> {
		return this.transactionSettingsDraftService.createTransactionTypeDraft(body,)
	}
}
