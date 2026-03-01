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
import { RealEstateService, } from '../services/real-estate.service'
import {
	SwaggerDescriptions,
	AnalyticsRoutes,
} from '../analytics.constants'

import { Roles, } from '../../../shared/types'
import { RealEstateFilterDto, RealEstateFilterSelectsBySourceIdsDto, } from '../dto'
import { AuthRequest, } from '../../auth'
import type {
	TCityAnalytics,
	TCurrencyAnalytics,
	TRealEstateAssetAnalytics,
} from '../analytics.types'
import type { IRealEstateFilterSelects, } from '../../../modules/asset/asset.types'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

/**
 * Controller for handling real estate-related analytics data.
 * @remarks
 * This controller provides endpoints for fetching real estate analytics data, including city, asset, and currency analytics.
 * The data is protected by JWT authentication and roles guard, allowing access only to authorized users.
 */
@Controller(AnalyticsRoutes.REAL_ESTATE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.REAL_ESTATE,)
export class RealEstateController {
	constructor(
		private readonly realEstateService: RealEstateService,
	) {}

	/**
	 * 3.5.4
	 * Retrieves currency-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint filters real estate assets based on the specified currencies and returns corresponding currency analytics data.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving currency analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of currency analytics data for real estate assets.
	 */
	@Get(AnalyticsRoutes.CURRENCY,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.REAL_ESTATE_FILTER,
		type:        RealEstateFilterDto,
	},)
	public async getCurrencyAnalytics(
		@Query() filter: RealEstateFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.realEstateService.getCurrencyAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves city-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint filters real estate assets based on the specified cities and returns the corresponding city analytics data.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving city analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of city analytics data for real estate assets.
	 */
	@Get(AnalyticsRoutes.CITY,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.REAL_ESTATE_FILTER,
		type:        RealEstateFilterDto,
	},)
	public async getCityAnalytics(
		@Query() filter: RealEstateFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TCityAnalytics>> {
		return this.realEstateService.getCityAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves asset-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint filters real estate assets based on the specified criteria and returns the corresponding asset analytics data.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving asset analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of asset analytics data for real estate assets.
	 */
	@Get(AnalyticsRoutes.ASSET,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.REAL_ESTATE_FILTER,
		type:        RealEstateFilterDto,
	},)
	public async getAsetAnalytics(
		@Query() filter: RealEstateFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TRealEstateAssetAnalytics>> {
		return this.realEstateService.getAssetAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves real estate filter values based on the provided source IDs.
	 * @remarks
	 * This endpoint returns available select values (banks, entities, accounts, etc.)
	 * filtered by the specified source identifiers.
	 * The method is protected by JWT authentication and roles guard.
	 * @param args - The filter criteria containing source IDs for retrieving filter select values.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an object containing available real estate filter select options.
	 */
	@Get(AnalyticsRoutes.GET_FILTER_SELECTS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		clientAccess: true,
	},)
	@ApiQuery({
		name:        'id',
		type:        RealEstateFilterSelectsBySourceIdsDto,
		description: SwaggerDescriptions.REAL_ESTATE_FILTERS,
	},)
	public async getRealEstateFilterValuesBySourceIds(
					@Query() args: RealEstateFilterSelectsBySourceIdsDto,
					@Req() req: AuthRequest,
	): Promise<IRealEstateFilterSelects> {
		return this.realEstateService.getRealEstateFilterValuesBySourceIds(args, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves the total real income for real estate assets based on the provided filter.
	 * @remarks
	 * This endpoint calculates and returns the aggregated real income value for real estate assets
	 * that match the specified filter criteria.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria used to calculate real income.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to a numeric value representing the total real income.
	 */
	@Get(AnalyticsRoutes.REAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        RealEstateFilterDto,
	},)
	public async getRealIncome(
		@Query() filter: RealEstateFilterDto,
		@Req() req: AuthRequest,
	): Promise<number> {
		return this.realEstateService.getRealIncome(filter, req.clientId,)
	}
}
