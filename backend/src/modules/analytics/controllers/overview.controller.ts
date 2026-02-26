/* eslint-disable no-unused-vars */
import {Controller, Get, Query, Req, UseGuards, UseInterceptors,} from '@nestjs/common'
import {ApiQuery, ApiTags,} from '@nestjs/swagger'

import {OverviewService,} from '../services'
import {RolesDecorator,} from '../../../shared/decorators'
import {JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import {AnalyticsRoutes, SwaggerDescriptions,} from '../analytics.constants'

import {Roles,} from '../../../shared/types'
import {OverviewAvailabilityFilterDto, OverviewFilterDto,} from '../dto'
import {AuthRequest,} from '../../auth'
import type {IAnalyticsAvailability, TBankAnalytics, TCurrencyAnalytics, TEntityAnalytics, TOverviewAssetAnalytics,} from '../analytics.types'
import {THREE_DAYS_CACHE_TIME, RedisCacheInterceptor,} from '../../redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

/**
 * Controller for handling overview-related analytics data.
 * @remarks
 * This controller provides endpoints for fetching overview analytics data, including bank, asset, entity, and currency analytics.
 * The data is protected by JWT authentication and roles guard, allowing access only to authorized users.
 */
@Controller(AnalyticsRoutes.OVERVIEW,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.OVERVIEW,)
export class OverviewController {
	constructor(
		private readonly overviewService: OverviewService,
	) { }

	/**
	 * CR-125
	 * Returns availability of analytics data for navigation buttons.
	 * @remarks
	 * This endpoint checks the availability of various analytics sections (e.g., overview, cash, etc.) based on the provided filter.
	 * It is protected by JWT authentication and roles guard, allowing access only to authorized users.
	 * @param req - The authenticated request object, which includes client ID.
	 * @return A promise that resolves to an object containing the availability status of different analytics sections.
	 */
	@Get(AnalyticsRoutes.AVAILABILITY_CHECK,)
	@RolesDecorator({ roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true, },)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        OverviewAvailabilityFilterDto,
	},)
	public async availabilityCheck(
		@Query() filter: OverviewFilterDto,
		@Req() req: AuthRequest,
	): Promise<IAnalyticsAvailability> {
		return this.overviewService.availabilityCheck(filter, req.clientId,)
	}

	/**
	 * 3.5.2
	 * Retrieves bank-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint filters bank assets based on the specified criteria and returns an array of bank analytics.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving bank analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of bank analytics data.
	 */
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({ roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true, },)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OVERVIEW_FILTER,
		type:        OverviewFilterDto,
	},)
	public async getBankAnalytics(
		@Query() filter: OverviewFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.overviewService.getBankAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.2
	 * Retrieves asset-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint filters assets based on the specified criteria and returns the corresponding asset analytics data.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving asset analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of asset analytics data.
	 */
	@Get(AnalyticsRoutes.ASSET,)
	@RolesDecorator({ roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true, },)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        OverviewFilterDto,
	},)
	public async getAsetAnalytics(
		@Query() filter: OverviewFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TOverviewAssetAnalytics>> {
		return this.overviewService.getAssetAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.2
	 * Retrieves entity-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint filters entities based on the specified criteria and returns the corresponding entity analytics data.
	 * The method is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving entity analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of entity analytics data.
	 */
	@Get(AnalyticsRoutes.ENTITY,)
	@RolesDecorator({ roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true, },)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        OverviewFilterDto,
	},)
	public async getEntityAnalytics(
		@Query() filter: OverviewFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TEntityAnalytics>> {
		return this.overviewService.getEntityAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.2
	 * Retrieves currency-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint filters assets based on the specified currencies and returns the corresponding currency analytics data.
	 * The method converts values to USD and is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving currency analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of currency analytics data.
	 */
	@Get(AnalyticsRoutes.CURRENCY,)
	@RolesDecorator({ roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true, },)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OVERVIEW_FILTER,
		type:        OverviewFilterDto,
	},)
	public async getCurrencyAnalytics(
		@Query() filter: OverviewFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.overviewService.getCurrencyAnalytics(filter, req.clientId,)
	}
}
