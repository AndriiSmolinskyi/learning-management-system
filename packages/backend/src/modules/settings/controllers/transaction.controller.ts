import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	Patch,
	Param,
} from '@nestjs/common'
import {
	ApiBody,
	ApiTags,
	ApiQuery,
} from '@nestjs/swagger'
import type { TransactionType, } from '@prisma/client'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import { SettingsRoutes, SwaggerDescriptions, } from '../settings.constants'
import { TransactionSettingsService, } from '../services/transaction.service'
import { CreateTransactionTypeDto, } from '../dto/create-transaction.dto'
import type { TransactionTypeCategory, } from '@prisma/client'
import { TransactionTypeFilterDto, } from '../dto/transaction-filter.dto'
import { UpdateTransactionTypeDto, } from '../dto/edit-transaction.dto'
import { SoftDeleteTransactionTypeDto, } from '../dto/delete-transaction.dto'
import { ChangeActivatedStatusDto, } from '../dto/change-status.dto'
import { ChangeRelationsDto, } from '../dto/change-relations.dto'
import { AuditTrailFilterDto, } from '../dto/audit-trail-filter.dto'
import type { TransactionTypeAuditTrail, } from '@prisma/client'

@Controller(SettingsRoutes.TRANSACTION_SETTINGS,)
@ApiTags(SwaggerDescriptions.TRANSACTION_SETTINGS_TAG,)
export class TransactionSettingsController {
	constructor(
		private readonly transactionSettingsService: TransactionSettingsService,
	) { }

	@Get(SettingsRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		type:        TransactionTypeFilterDto,
	},)
	public async getTransactionTypeList(
		@Query() filter: TransactionTypeFilterDto,
	): Promise<Array<TransactionType>> {
		return this.transactionSettingsService.getTransactionTypeList(filter,)
	}

	@Get(SettingsRoutes.ID_ITEM,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getTransactionTypeById(
	@Param('id',) id: string,
	): Promise<TransactionType> {
		return this.transactionSettingsService.getTransactionTypeById(id,)
	}

	@Get(SettingsRoutes.CATEGORY_LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getCategoryList(): Promise<Array<{ value: string; label: string }>> {
		return this.transactionSettingsService.getTransactionTypeCategories()
	}

	@Get(SettingsRoutes.RELATIONS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getRelations(
    @Param('id',) id: string,
	): Promise<{
		id: string
		relatedType: { value: string; label: string } | null
		asset: { value: string; label: string } | null
	}> {
		return this.transactionSettingsService.getRelations(id,)
	}

	@Patch(SettingsRoutes.RELATIONS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async changeRelations(
	@Param('id',) id: string,
	@Body() body: ChangeRelationsDto,
	): Promise<TransactionType> {
		return this.transactionSettingsService.changeRelations(id, body,)
	}

	@Patch(SettingsRoutes.DELETE,)
	@RolesDecorator({
		roles:        [Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async softDeleteTransactionType(
		@Param('id',) id: string,
		@Body() body: SoftDeleteTransactionTypeDto,
	): Promise<TransactionType> {
		return this.transactionSettingsService.softDeleteTransactionType(id, body,)
	}

	@Post(SettingsRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_TRANSACTION_TYPE,
		type:        CreateTransactionTypeDto,
	},)
	public async createTransactionType(
		@Body() body: CreateTransactionTypeDto,
	): Promise<TransactionType> {
		return this.transactionSettingsService.createTransactionType(body,)
	}

	@Post(SettingsRoutes.CREATE_CATEGORY,)
	@RolesDecorator({
		roles:        [Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_TRANSACTION_TYPE,
	},)
	public async createCategory(
	@Body('name',) name: string,
	): Promise<TransactionTypeCategory> {
		return this.transactionSettingsService.createTransactionTypeCategory(name,)
	}

	@Patch(SettingsRoutes.UPDATE,)
	@RolesDecorator({
		roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_TRANSACTION_TYPE,
		type:        UpdateTransactionTypeDto,
	},)
	public async updateTransactionType(
		@Param('id',) id: string,
		@Body() body: UpdateTransactionTypeDto & { isNewVersion: boolean },
	): Promise<TransactionType> {
		return this.transactionSettingsService.updateTransactionType(id, body,)
	}

	@Get(SettingsRoutes.AUDIT_LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({ type: AuditTrailFilterDto, },)
	public async getTransactionTypeAuditTrail(
		@Query() filter: AuditTrailFilterDto,
	): Promise<Array<TransactionTypeAuditTrail>> {
		return this.transactionSettingsService.getTransactionTypeAuditTrail(filter,)
	}

	@Patch(SettingsRoutes.ACTIVATED,)
	@RolesDecorator({
		roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async changeActivatedStatus(
		@Param('id',) id: string,
		@Body() body: ChangeActivatedStatusDto,
	): Promise<TransactionType> {
		return this.transactionSettingsService.changeActivatedStatus(id, body,)
	}

	@Get(SettingsRoutes.CATEGORY_LIST_FOR_LIST,)
	@RolesDecorator({ roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], },)
	public async getTransactionTypeCategoriesForList(): Promise<Array<TransactionTypeCategory>> {
		return this.transactionSettingsService.getTransactionTypeCategoriesForList()
	}

	@Patch(SettingsRoutes.UPDATE_CATEGORY,)
	@RolesDecorator({ roles: [Roles.FAMILY_OFFICE_MANAGER,], },)
	public async updateCategory(
		@Param('id',) id: string,
		@Body('name',) name: string,
	): Promise<TransactionTypeCategory> {
		return this.transactionSettingsService.updateTransactionTypeCategory(id, name,)
	}

	@Patch(SettingsRoutes.DELETE_CATEGORY,)
	@RolesDecorator({ roles: [Roles.FAMILY_OFFICE_MANAGER,], },)
	public async deleteCategory(
			@Param('id',) id: string,
	): Promise<TransactionTypeCategory> {
		return this.transactionSettingsService.deleteTransactionTypeCategory(id,)
	}

	@Get(SettingsRoutes.AUDIT_USERS,)
	public async getAuditUsers(): Promise<Array<{ value: string; label: string }>> {
		return this.transactionSettingsService.getAuditUsers()
	}
}
