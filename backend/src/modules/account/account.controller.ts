import {
	Body,
	Controller,
	Post,
	UseGuards,
	Get,
	Param,
	Patch,
	Query,
	Req,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { Account, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard, } from '../../shared/guards'
import { RolesDecorator, } from '../../shared/decorators'
import { AccountService, } from './account.service'
import { AccountRoutes, SwaggerDescriptions, } from './account.constants'

import { AddAccountDto, GetByIdDto, UpdateAccountDto, GetAccountsBySourceIdsDto, AccountSourceIdsDto, } from './dto'
import { Roles, } from '../../shared/types'
import { AuthRequest, } from '../auth'

@Controller(AccountRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.CONTROLLER_TAG,)
export class AccountController {
	constructor(
		private readonly accountService: AccountService,
	) { }

	/**
	 * 2.2.1
	 * Creates a new account.
	 * @remarks
	 * This endpoint allows creating a new account. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param body - The data required to create a new account, including portfolio or draft IDs.
	 * @returns A promise that resolves to the newly created account.
	 */
	@Post(AccountRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_ACCOUNT,
		type:        AddAccountDto,
	},)
	public async createAccount(
		@Body() body: AddAccountDto,
	): Promise<Account> {
		return this.accountService.createAccount(body,)
	}

	/**
	 * 2.3.4
	 * Updates an existing account.
	 * @remarks
	 * This endpoint allows updating an existing account. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param params - The parameters required to identify the account to update.
	 * @param params.id - The unique identifier of the account to update.
	 * @param body - The data required to update the account, such as updated portfolio information.
	 * @returns A promise that resolves to the updated account.
	 */
	@Patch(AccountRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ACCOUNT_ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_ACCOUNT,
		type:        UpdateAccountDto,
	},)
	public async updateAccount(
		@Param() params: GetByIdDto,
		@Body() body: UpdateAccountDto,
	): Promise<Account> {
		return this.accountService.updateAccount(params.id, body,)
	}

	/**
	 * 2.3.4
	 * Retrieves a list of accounts associated with a specific bank.
	 * @remarks
	 * This endpoint fetches all accounts linked to the specified bank. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param params - The parameters required to identify the bank.
	 * @param params.id - The unique identifier of the bank.
	 * @returns A promise that resolves to an array of accounts associated with the specified bank.
	 */
	@Get(AccountRoutes.BANK_ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.BANK_ID,
	},)
	public async getAccountsByBankId(
		@Param() params: GetByIdDto,
	): Promise<Array<Account>> {
		return this.accountService.getAccountsByBankId(params.id,)
	}

	/**
	 * 4.2.1
	 * Retrieves a list of accounts associated with multiple banks.
	 * @remarks
	 * This endpoint fetches all accounts linked to the specified bank IDs. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param args - The parameters required to identify the banks.
	 * @param args.id - An array of unique identifiers of the banks.
	 * @returns A promise that resolves to an array of accounts associated with the specified banks.
	 */
	@Get(AccountRoutes.BANKS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
		@ApiQuery({
			name:        'id',
			type:        GetAccountsBySourceIdsDto,
			description: SwaggerDescriptions.BANK_IDS,
		},)
	public async getAccountsByBanksIds(
			@Query() args: GetAccountsBySourceIdsDto,
			@Req() req: AuthRequest,
	): Promise<Array<Account>> {
		return this.accountService.getAccountsByBanksIds(args, req.clientId,)
	}

	/**
	 * 3.1.1
	 * Retrieves a list of accounts associated with a specific entity.
	 * @remarks
	 * This endpoint fetches all accounts linked to the specified entity. It is guarded by JWT authentication and roles guard.
	 * Users with roles `Roles.BACK_OFFICE_MANAGER`, `Roles.FAMILY_OFFICE_MANAGER`, or `Roles.INVESTMEN_ANALYST` can access this endpoint.
	 * @param params - The parameters required to identify the entity.
	 * @param params.id - The unique identifier of the entity.
	 * @returns A promise that resolves to an array of accounts associated with the specified entity.
	 */
	@Get(`${AccountRoutes.ENTITY}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ENTITY_ID,
	},)
	public async getAccountsByEntityId(
		@Param() params: GetByIdDto,
	): Promise<Array<Account>> {
		return this.accountService.getAccountsByEntityId(params.id,)
	}

	/**
 * 2.3.4
 * Retrieves a list of accounts associated with a specific portfolio or portfolio draft.
 * @remarks
 * This endpoint fetches all accounts linked to the specified portfolio or portfolio draft. It is guarded by JWT authentication and roles guard.
 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
 * @param params - The parameters for identifying the portfolio.
 * @param params.id - The unique identifier of the portfolio or portfolio draft.
 * @returns A promise that resolves to an array of account records associated with the portfolio or portfolio draft.
 */
	@Get(AccountRoutes.BY_PORTFOLIO_ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.PORTFOLIO_ID,
	},)
	public async getAccountListByPortfolioId(
		@Param() params: GetByIdDto,
	): Promise<Array<Account>> {
		return this.accountService.getAccountListByPortfolioId(params.id,)
	}

	/**
 * Retrieves the total assets of a specific account.
 * @remarks
 * This endpoint fetches the total assets of an account based on its unique identifier.
 * Users with roles `Roles.BACK_OFFICE_MANAGER`, `Roles.FAMILY_OFFICE_MANAGER`, or `Roles.INVESTMEN_ANALYST` can access this endpoint.
 * @param params - The parameters for identifying the account.
 * @param params.id - The unique identifier of the account.
 * @returns A promise that resolves to the total assets of the specified account.
 */
	@Get(`${AccountRoutes.GET_ASSETS_TOTAL}/${AccountRoutes.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ACCOUNT_ID,
	},)
	public async getAccountAssetsTotalById(
		@Param() params: GetByIdDto,
	): Promise<Account> {
		return this.accountService.getAccountAssetsTotalById(params.id,)
	}

	@Get(AccountRoutes.SOURCE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.SOURCE,
		type:        AccountSourceIdsDto,
	},)
	public async getAccountsBySourceIds(
		@Query() query: AccountSourceIdsDto,
	): Promise<Array<Account>> {
		return this.accountService.getAccountsBySourceIds(query,)
	}
}
