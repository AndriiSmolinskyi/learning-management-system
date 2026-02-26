import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import type { TransactionDraft, } from '@prisma/client'
import { UpdateTransactionDto, } from '../dto'
import { RolesDecorator, } from '../../../shared/decorators'
import { JWTAuthGuard, RolesGuard, } from '../../../shared/guards'
import { TransactionDraftService, } from '../services/transaction-draft.service'
import { TransactionRoutes, SwaggerDescriptions, } from '../transaction.constants'

import { Roles, } from '../../../shared/types'
import { CreateTransactionDraftDto, } from '../dto'
import type { TransactionDraftExtended, } from '../transaction.types'

@Controller(TransactionRoutes.DRAFT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.DRAFT_TAG,)

export class TransactionDraftController {
	constructor(
		private readonly transactionDraftService: TransactionDraftService,
	) { }

	/**
	 * 3.4
	 * Creates a new transaction draft.
	 * @param body - Data for creating a new transaction draft.
	 * @returns The newly created transaction draft.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	 */
	@Post(TransactionRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_DRAFT,
		type:        CreateTransactionDraftDto,
	},)
	public async createTransactionDraft(
		@Body() body: CreateTransactionDraftDto,
	): Promise<TransactionDraft> {
		return this.transactionDraftService.createTransactionDraft(body,)
	}

	/**
	 * 3.4
	 * Retrieves a list of all transaction drafts.
	 * @returns List of transaction drafts.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	*/
	@Get(TransactionRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getTransactionDrafts(): Promise<Array<TransactionDraft>> {
		return this.transactionDraftService.getTransactionDrafts()
	}

	/**
	 * 3.4
	 * Retrieves a specific transaction draft by its ID.
	 * @param params - Object containing the transaction draft ID.
	 * @returns Detailed transaction draft information.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	*/
	@Get(TransactionRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	public async getTransactionDraftById(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<TransactionDraftExtended> {
		return this.transactionDraftService.getTransactionDraftById(id,)
	}

	/**
	 * 3.4
	 * Updates an existing transaction draft.
	 * @param params - Object containing the transaction draft ID.
	 * @param body - Updated transaction draft data.
	 * @returns The updated transaction draft.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	 */
	@Patch(TransactionRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_DRAFT,
		type:        UpdateTransactionDto,
	},)
	public async updateTransactionDraft(
		@Param('id', ParseIntPipe,) id: number,
		@Body() body: UpdateTransactionDto,
	): Promise<TransactionDraft> {
		return this.transactionDraftService.updateTransactionDraft(id, body,)
	}

	/**
	 * 3.4
	 * Deletes a specific transaction draft.
	 * @param params - Object containing the transaction draft ID.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	*/
	@Delete(TransactionRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async deleteTransactionDraft(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<void> {
		await this.transactionDraftService.deleteTransactionDraft(id,)
	}
}
