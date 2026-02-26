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
import { PrivateEquityAssetService, } from '../services'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import { PrivateEquityFilterDto, PrivateEquityFilterSelectsBySourceIdsDto, } from '../dto'
import { AuthRequest, } from '../../auth'
import type { IPrivateEquityFilterSelectsData, TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import type { IPrivateByFilter, } from '../analytics.types'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(AnalyticsRoutes.PRIVATE_EQUITY,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('PrivateEquityAsset',)
export class PrivateEquityAssetController {
	constructor(
		private readonly privateEquityAssetService: PrivateEquityAssetService,
	) { }

	/**
		* 3.5.3
		* Retrieves the names of loan assets based on the provided bank IDs.
		*
		* @remarks
		* - Accessible only to users with roles `BACK_OFFICE_MANAGER` or `FAMILY_OFFICE_MANAGER`.
		* - Fetches loan asset names associated with the specified bank IDs.
		* - Returns an array of loan asset names.
		*
		* @param args - Query parameters containing an array of bank IDs (`id`).
		* @returns A Promise that resolves to an array of loan asset names.
		*/
		@Get(AnalyticsRoutes.GET_NAMES,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@ApiQuery({
			name:        'id',
			type:        PrivateEquityFilterSelectsBySourceIdsDto,
			description: SwaggerDescriptions.LOAN_NAMES,
		},)
	public async getPrivateFilterSelectsBySourceIds(
			@Query() args: PrivateEquityFilterSelectsBySourceIdsDto,
			@Req() req: AuthRequest,
	): Promise<IPrivateEquityFilterSelectsData> {
		return this.privateEquityAssetService.getPrivateFilterSelectsBySourceIds(args, req.clientId,)
	}

	/**
   * 3.5.4
   * Retrieves loan assets based on specified filters.
   *
   * @remarks
   * - Filters loan assets based on the provided criteria.
   * - Returns a list of loans that match the filter conditions.
   *
   * @param {DepositFilterDto} filters - The filter criteria for retrieving loan assets.
   * @returns {Promise<IPrivateByFilter>} - A Promise resolving to the filtered loan assets.
   */
	@Get(AnalyticsRoutes.PE_BY_FILTERS,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.LOAN_FILTER,
		type:        PrivateEquityFilterDto,
	},)
		public async getAllByFilters(
		@Query() filters: PrivateEquityFilterDto,
		@Req() req: AuthRequest,
		): Promise<IPrivateByFilter> {
			return this.privateEquityAssetService.getAllByFilters(filters, req.clientId,)
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
		type:        PrivateEquityFilterDto,
	},)
	public async getBankAnalytics(
		@Query() filter: PrivateEquityFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.privateEquityAssetService.getBankAnalytics(filter, req.clientId,)
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
		type:        PrivateEquityFilterDto,
	},)
	public async getCurrencyAnalytics(
			@Query() filter: PrivateEquityFilterDto,
			@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.privateEquityAssetService.getCurrencyAnalytics(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Retrieves annual private equity income analytics data based on the provided filter.
		* @remarks
		* This endpoint fetches analytics data related to annual private equity income according to the client's filter criteria.
		* Access is restricted to users with roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST,
		* and requires client-level access. The endpoint is secured by authentication and authorization guards.
		* @param filter - The filter criteria for retrieving annual private equity income analytics.
		* @param req - The authenticated request object containing the client ID.
		* @returns A promise that resolves to a number representing the annual private equity income analytics.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        PrivateEquityFilterDto,
	},)
	public async getPEAnnual(
		@Query() filter: PrivateEquityFilterDto,
		@Req() req: AuthRequest,
	): Promise<number> {
		return this.privateEquityAssetService.getPEAnnual(filter, req.clientId,)
	}
}
