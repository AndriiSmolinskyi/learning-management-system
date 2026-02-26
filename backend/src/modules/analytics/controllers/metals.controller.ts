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
import { MetalsService, } from '../services/metals.service'
import { MetalsFilterDto, } from '../dto'
import { AuthRequest, } from '../../auth'

import { Roles, } from '../../../shared/types'
import type { IMetalsByFilter, } from '../../asset/asset.types'
import type { TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'
import type { MetalData, } from '@prisma/client'

/**
 * Controller for handling metals-related analytics data.
 * @remarks
 * This controller provides endpoints for fetching analytics data related to metals, including filtered data
 * for metals, bank analytics, and currency analytics. The data is protected by JWT authentication and roles guard.
 */
@Controller(AnalyticsRoutes.METALS,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.METALS,)
export class MetalsController {
	constructor(
		private readonly metalsService: MetalsService,
	) {}

	/**
	 * 3.5.4
	 * Retrieves filtered metals data based on the provided filter criteria.
	 * @remarks
	 * This endpoint retrieves metals data based on the filters provided by the client, such as types or amounts of metals.
	 * The method returns filtered data about metals and is accessible only by authorized users with the appropriate roles.
	 * @param filter - The filter criteria for retrieving metals data.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to the filtered metals data.
	 */
	@Get()
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.METALS_FILTER,
		type:        MetalsFilterDto,
	},)
	public async getFilteredMetals(
		@Query() filter: MetalsFilterDto,
		@Req() req: AuthRequest,
	): Promise<IMetalsByFilter> {
		return this.metalsService.getFilteredMetals(filter, req.clientId,)
	}

	/**
	  * 3.5.4
   * Retrieves bank analytics based on the provided filter.
   *
   * @remarks
   * - Filters bank assets based on the specified criteria.
   * - Returns an array of bank analytics, including currency value in USD.
   *
   * @param {MetalsFilterDto} filter - The filter criteria for retrieving bank analytics.
   * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics.
   */
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.METALS_FILTER,
		type:        MetalsFilterDto,
	},)
	public async getBankAnalytics(
			@Query() filter: MetalsFilterDto,
			@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.metalsService.getBankAnalytics(filter, req.clientId,)
	}

	/**
   * 3.5.4
   * Retrieves currency analytics based on the provided filter.
   *
   * @remarks
   * - Filters assets based on the specified currencies and returns corresponding currency analytics.
   * - Converts values to USD and returns the analytics.
   *
   * @param {MetalsFilterDto} filter - The filter criteria for retrieving currency analytics.
   * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
   */
	@Get(AnalyticsRoutes.CURRENCY,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.METALS_FILTER,
		type:        MetalsFilterDto,
	},)
	public async getCurrencyAnalytics(
			@Query() filter: MetalsFilterDto,
			@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.metalsService.getCurrencyAnalytics(filter, req.clientId,)
	}

	/**
		* 	 * 3.5.3
		* Endpoint to retrieve a list of metal films associated with the specified bank IDs.
		*
		* @remarks
		* - Requires authentication using `JWTAuthGuard` and role-based access control using `RolesGuard`.
		* - Accessible only by users with the roles `BACK_OFFICE_MANAGER` or `FAMILY_OFFICE_MANAGER`.
		* - Filters the metal films based on the provided bank IDs.
		* - Returns an array of metal film names as strings.
		*
		* @param args - Query parameters containing an array of bank IDs.
		* @returns A Promise that resolves to an array of metal film names.
		*/
		@Get(AnalyticsRoutes.GET_ALL,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
			clientAccess: true,
		},)
	public async getAllMetals(): Promise<Array<MetalData>> {
		return this.metalsService.getAllMetals()
	}

	/**
		* 3.5.4
		* Returns the total annual income from metal assets based on the provided filter.
		* @remarks
		* This endpoint calculates and returns the annual income analytics for metal assets,
		* filtered by the specified parameters. Access is restricted to users with the roles:
		* BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST, and requires client-level access.
		* The route is protected by authentication and authorization mechanisms.
		* @param filter - The query parameters used to filter the metal assets data.
		* @param req - The authenticated request object containing the client's ID.
		* @returns A promise resolving to a numeric value representing the calculated annual income.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        MetalsFilterDto,
	},)
		public async getMetalAnnual(
		@Query() filter: MetalsFilterDto,
		@Req() req: AuthRequest,
		): Promise<number> {
			return this.metalsService.getMetalAnnual(filter, req.clientId,)
		}
}
