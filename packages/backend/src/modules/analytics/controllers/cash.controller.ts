/* eslint-disable no-unused-vars */
import {
	Controller,
	Get,
	Query,
	Req,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import {
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { CashService, } from '../services/cash.service'
import { AuthRequest, } from '../../auth'

import { Roles, } from '../../../shared/types'
import type {
	TBankAnalytics,
	TCurrencyAnalytics,
	TEntityAnalytics,
} from '../analytics.types'
import { CashFilterDto, } from '../dto'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

/**
 * Controller for handling cash-related analytics data.
 * @remarks
 * This controller provides endpoints for fetching analytics data related to entities, banks, and currencies.
 * The data is fetched based on the filters provided by the client and is protected by JWT authentication and roles guard.
 */
@Controller(AnalyticsRoutes.CASH,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.CASH,)
export class CashController {
	constructor(
		private readonly cashService: CashService,
	) {}

	/**
	 * 3.5.4
	 * Retrieves analytics data for a specific entity.
	 * @remarks
	 * This endpoint fetches cash-related analytics data for a specific entity.
	 * The data is filtered based on the provided query parameters and is accessible only to users with appropriate roles.
	 * @param filter - The filters applied to the entity analytics data.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of entity analytics data.
	 */
	@Get(AnalyticsRoutes.ENTITY,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.CASH_FILTER,
		type:        CashFilterDto,
	},)
	public async getEntityAnalytics(
		@Query() filter: CashFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TEntityAnalytics>> {
		return this.cashService.getEntityAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves analytics data for a specific bank.
	 * @remarks
	 * This endpoint fetches cash-related analytics data for a specific bank.
	 * The data is filtered based on the provided query parameters and is accessible only to users with appropriate roles.
	 * @param filter - The filters applied to the bank analytics data.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of bank analytics data.
	 */
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.CASH_FILTER,
		type:        CashFilterDto,
	},)
	public async getBankAnalytics(
		@Query() filter: CashFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.cashService.getBankAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves analytics data for a specific currency.
	 * @remarks
	 * This endpoint fetches cash-related analytics data for a specific currency.
	 * The data is filtered based on the provided query parameters and is accessible only to users with appropriate roles.
	 * @param filter - The filters applied to the currency analytics data.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of currency analytics data.
	 */
	@Get(AnalyticsRoutes.CURRENCY,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.CASH_FILTER,
		type:        CashFilterDto,
	},)
	public async getCurrencyAnalytics(
		@Query() filter: CashFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.cashService.getCurrencyAnalytics(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Retrieves analytics data specifically for currency transactions.
		* @remarks
		* This endpoint returns cash-related analytics data based solely on transaction records.
		* Redis caching is not used — data is fetched directly from the database on each request.
		* The results are filtered according to the provided query parameters and are accessible only to users with the appropriate roles.
		* @param filter - The filters applied to the currency transaction analytics.
		* @param req - The authenticated request object, which includes the client ID.
		* @returns A promise that resolves to an array of currency transaction analytics data.
	*/

	@Get(AnalyticsRoutes.CURRENCY_TRANSACTION,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.CASH_FILTER,
		type:        CashFilterDto,
	},)
	public async getCurrencyAnalyticsForTransaction(
		@Query() filter: CashFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.cashService.getCurrencyAnalytics(filter, req.clientId,)
	}
}
