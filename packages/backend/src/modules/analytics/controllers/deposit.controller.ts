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
import { DepositService,} from '../services'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import type { TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import { DepositCurrencyFilterDto, DepositFilterDto, } from '../dto'
import type { IDepositByFilter, } from '../analytics.types'
import { AuthRequest, } from '../../auth'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(AnalyticsRoutes.DEPOSIT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('DepositAsset',)
export class DepositAssetController {
	constructor(
		private readonly depositAssetService: DepositService,
	) { }

	/**
   * 3.5.4
   * Retrieves loan assets based on specified filters.
   *
   * @remarks
   * - Filters loan assets based on the provided criteria.
   * - Returns a list of loans that match the filter conditions.
   *
   * @param {DepositFilterDto} filters - The filter criteria for retrieving loan assets.
   * @returns {Promise<IDepositByFilter>} - A Promise resolving to the filtered loan assets.
   */
	@Get(AnalyticsRoutes.GET_ALL_BY_FILTERS,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.LOAN_FILTER,
		type:        DepositFilterDto,
	},)
	public async getAllByFilters(
		@Query() filters: DepositFilterDto,
		@Req() req: AuthRequest,
	): Promise<IDepositByFilter> {
		return this.depositAssetService.getAllByFilters(filters, req.clientId,)
	}

	/**
	  * 3.5.4
   * Retrieves bank analytics based on the provided filter.
   *
   * @remarks
   * - Filters bank assets based on the specified criteria.
   * - Returns an array of bank analytics, including currency value in USD.
   *
   * @param {DepositFilterDto} filter - The filter criteria for retrieving bank analytics.
   * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics.
   */
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.CASH_FILTER,
		type:        DepositCurrencyFilterDto,
	},)
	public async getBankAnalytics(
		@Query() filter: DepositCurrencyFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.depositAssetService.getBankAnalytics(filter, req.clientId,)
	}

	/**
	* 3.5.4
	* Retrieves currency analytics based on the provided filter.
	*
   * @remarks
   * - Filters assets based on the specified currencies and returns corresponding currency analytics.
   * - Converts values to USD and returns the analytics.
   *
   * @param {DepositFilterDto} filter - The filter criteria for retrieving currency analytics.
   * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
   */
		@Get(AnalyticsRoutes.CURRENCY,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@CacheTTL(THREE_DAYS_CACHE_TIME,)
		@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.DEPOSIT_FILTER,
			type:        DepositCurrencyFilterDto,
		},)
	public async getCurrencyAnalytics(
			@Query() filter: DepositCurrencyFilterDto,
			@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.depositAssetService.getCurrencyAnalytics(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Retrieves annual deposit income analytics data based on the provided filter.
		* @remarks
		* This endpoint fetches analytics data related to annual deposit income according to the client's filter criteria.
		* Access is restricted to users with roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST,
		* and requires client-level access. The endpoint is secured by authentication and authorization guards.
		* @param filter - The filter criteria for retrieving annual deposit income analytics.
		* @param req - The authenticated request object containing the client ID.
		* @returns A promise that resolves to a number representing the annual deposit income analytics.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        DepositFilterDto,
	},)
		public async getDepositAnnual(
		@Query() filter: DepositFilterDto,
		@Req() req: AuthRequest,
		): Promise<number> {
			return this.depositAssetService.getDepositAnnual(filter, req.clientId,)
		}
}
