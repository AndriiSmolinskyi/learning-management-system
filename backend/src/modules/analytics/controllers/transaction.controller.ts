import {
	Controller,
	Get,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import {
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { TransactionService, } from '../services/transaction.service'
import { TransactionFilterDto, } from '../dto'
import { AuthRequest, } from '../../auth'

import { Roles, } from '../../../shared/types'
import type { TransactionAnalyticsRes, TransactionPl, } from '../../transaction/transaction.types'
import { TransactionSelectsFilterDto, } from '../dto/transaction-selects.dto'
import type { ITransactionFilteredSelects, } from '../analytics.types'

/**
 * Controller for handling transaction-related analytics data.
 * @remarks
 * This controller provides endpoints for fetching transaction analytics data, including filtered transactions and transaction details.
 * The data is protected by JWT authentication and roles guard, allowing access only to authorized users.
 */
@Controller(AnalyticsRoutes.TRANSACTION,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.TRANSACTION,)
export class TransactionController {
	constructor(
		private readonly transactionService: TransactionService,
	) {}

	/**
	 * 3.5.4
	 * Retrieves filtered transaction analytics based on the provided filter.
	 * @remarks
	 * This endpoint filters transactions based on the specified criteria and returns the corresponding analytics data.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving transaction analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to the filtered transaction analytics data.
	 */
	@Get()
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.TRANSACTION_FILTER,
		type:        TransactionFilterDto,
	},)
	public async getFilteredTransactions(
		@Query() filter: TransactionFilterDto,
		@Req() req: AuthRequest,
	): Promise<TransactionAnalyticsRes> {
		return this.transactionService.getFilteredTransactions(filter, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves filtered transactions by their IDs based on the provided filter.
	 * @remarks
	 * This endpoint filters transactions based on the specified criteria and returns the transaction details by IDs.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving transaction details.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to the filtered list of transaction details by IDs.
	 */
	@Get(AnalyticsRoutes.TRANSACTION_PL,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.TRANSACTION_FILTER,
		type:        TransactionFilterDto,
	},)
	public async getFilteredTransactionsAnalyticsByIds(
		@Query() filter: TransactionFilterDto,
		@Req() req: AuthRequest,
	): Promise<TransactionPl> {
		return this.transactionService.getFilteredTransactionsAnalyticsByIds(filter, req.clientId,)
	}

	/**
 * 3.5.4
 * Retrieves unique select values for transaction filters.
 * @remarks
 * This endpoint returns distinct values used to populate transaction filter selects
 * (ISINs, securities, service providers, and transaction type names).
 * The filtering is performed based on the provided criteria and client access rules.
 * Optimized to work efficiently with large transaction datasets.
 * The method is protected by JWT authentication and role-based access control.
 * @param filter - The filter criteria used to limit the transaction scope.
 * @param req - The authenticated request object containing client identification.
 * @returns A promise that resolves to an object containing unique select values
 * for transaction filters.
 */
	@Get(AnalyticsRoutes.TRANSACTION_SELECTS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.TRANSACTION_FILTER,
		type:        TransactionFilterDto,
	},)
	public async getTransactionsFilteredSelects(
		@Query() filter: TransactionSelectsFilterDto,
		@Req() req: AuthRequest,
	): Promise<ITransactionFilteredSelects> {
		return this.transactionService.getTransactionsFilteredSelects(filter, req.clientId,)
	}
}
