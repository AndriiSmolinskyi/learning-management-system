import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { Bank, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../shared/guards'
import { BankService, } from './bank.service'
import { BankRoutes, SwaggerDescriptions, } from './bank.constants'
import { RolesDecorator, } from '../../shared/decorators'

import {
	AddBankDto,
	GetByIdDto,
	UpdateBankDto,
	GetBanksBySourceIdsDto,
	SourceIdDto,
} from './dto'
import { Roles, } from '../../shared/types'
import { AuthRequest, } from '../auth'

@Controller(BankRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('Bank',)
export class BankController {
	constructor(
	private readonly bankService: BankService,
	) { }

	/**
	 * Creates a new bank record.
	 * @param body - The data for creating a new bank record.
	 * @returns A promise that resolves to the newly created bank record.
	 */
	@Post(BankRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_BANK,
		type:        AddBankDto,
	},)
	public async createBank(
		@Body() body: AddBankDto,
	): Promise<Bank> {
		return this.bankService.createBank(body,)
	}

	/**
 * Retrieves a list of banks associated with the specified source ID.
 * @remarks
 * This endpoint filters banks based on the given source identifier (e.g., accountId).
 * Useful for linking external data sources to banking records.
 *
 * @param query - DTO containing the source identifier (e.g., `accountId`).
 * @returns A promise that resolves to an array of banks associated with the provided source ID.
 */
	@Get(BankRoutes.SOURCE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.SOURCE_ID,
		type:        SourceIdDto,
	},)
	public async getBanksBySourceId(
		@Query() query: SourceIdDto,
	): Promise<Array<Bank>> {
		return this.bankService.getBanksBySourceId(query,)
	}

	/**
	 * Retrieves a list of banks associated with a specific client.
	 * @param params - The parameters for identifying the client.
	 * @param params.id - The unique identifier of the client.
	 * @returns A promise that resolves to an array of bank records associated with the client.
	 */
	@Get(BankRoutes.CLIENT_ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.PORTFOLIO_ID,
	},)
	public async getBanksByClientId(
		@Param() params: GetByIdDto,
	): Promise<Array<Bank>> {
		return this.bankService.getBanksByClientId(params.id,)
	}

	/**
	 * Retrieves a list of banks associated with a specific entity.
	 * @param params - The parameters for identifying the entity.
	 * @param params.id - The unique identifier of the entity.
	 * @returns A promise that resolves to an array of bank records associated with the entity.
	 */
	@Get(BankRoutes.ENTITY_ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.PORTFOLIO_ID,
	},)
	public async getBanksByEntityId(
		@Param() params: GetByIdDto,
	): Promise<Array<Bank>> {
		return this.bankService.getBanksByEntityId(params.id,)
	}

	/**
	 * Retrieves a list of banks associated with a specific portfolio.
	 * @param params - The parameters for identifying the portfolios.
	 * @param params.ids - The unique identifiers of the portfolios.
	 * @returns A promise that resolves to an array of bank records associated with the portfolio.
	 */
	@Get(BankRoutes.BANK_LIST_BY_IDS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		name:        'id',
		type:        GetBanksBySourceIdsDto,
		description: SwaggerDescriptions.BANK_LIST_BY_IDS,
	},)
	public async getBankListByEntitiesIds(
		@Query() args: GetBanksBySourceIdsDto,
		@Req() req: AuthRequest,
	): Promise<Array<Bank>> {
		return this.bankService.getBankListBySourceIds(args, req.clientId,)
	}

	/**
	 * Retrieves a list of banks associated with a specific portfolio.
	 * @param params - The parameters for identifying the portfolio.
	 * @param params.id - The unique identifier of the portfolio.
	 * @returns A promise that resolves to an array of bank records associated with the portfolio.
	 */
	@Get(BankRoutes.BY_PORTFOLIO_ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,] ,
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.PORTFOLIO_ID,
	},)
	public async getBankListByPortfolioId(
		@Param() params: GetByIdDto,
	): Promise<Array<Bank>> {
		return this.bankService.getBankListByPortfolioId(params.id,)
	}

		/**
		 * Updates an existing bank record.
		 * @param params - The parameters for identifying the bank record to update.
		 * @param params.id - The unique identifier of the bank record to update.
		 * @param body - The data for updating the bank record.
		 * @returns A promise that resolves to the updated bank record.
		 */
		@Patch(BankRoutes.ID,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		},)
		@ApiParam({
			name:        'id',
			description: SwaggerDescriptions.BANK_ID,
		},)
		@ApiBody({
			description: SwaggerDescriptions.UPDATE_BANK,
			type:        UpdateBankDto,
		},)
	public async updateBank(
			@Param() params: GetByIdDto,
			@Body() body: UpdateBankDto,
	): Promise<Bank> {
		return this.bankService.updateBank(params.id, body,)
	}
}
