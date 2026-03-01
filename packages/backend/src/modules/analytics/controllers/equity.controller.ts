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
import { EquityAssetService, } from '../services'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import type { IEquitiesByFilters, IEquityFilterSelectsData, TBankAnalytics, TBondsCurrencyAnalytics,  } from '../analytics.types'
import { AnalyticsEquityFilterDto, EquityCurrencyFilterDto, EquitySelectBySourceIdsDto,} from '../dto'
import { AuthRequest, } from '../../auth'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(AnalyticsRoutes.EQUITY,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('EquityAsset',)
export class EquityAssetController {
	constructor(
		private readonly equityAssetService: EquityAssetService,
	) { }

	/**
 * 3.5.3
 * Retrieves types of equities associated with the specified bank IDs.
 *
 * @remarks
 * - Filters assets by the provided bank identifiers and the asset name `EQUITY`.
 * - Calls the service method to obtain equity types.
 * - Returns an array of types or an empty array in case of an error.
 *
 * @param {BondSelectsGetByIdsDto} args - DTO containing an array of bank identifiers.
 * @returns {Promise<IEquityFilterSelectsData>} - A promise that resolves to an object of arrays (types, isins, securities).
 */
	@Get(AnalyticsRoutes.TYPES,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		name:        'id',
		type:        EquitySelectBySourceIdsDto,
		description: SwaggerDescriptions.ASSET_TYPE,
	},)
	public async getEquityFitlerSelectsBySourceIds(
		@Query() args: EquitySelectBySourceIdsDto,
		@Req() req: AuthRequest,

	): Promise<IEquityFilterSelectsData> {
		return this.equityAssetService.getEquityFitlerSelectsBySourceIds(args, req.clientId,)
	}

	/**
	* 3.5.4
	* Retrieves bonds based on the provided filters and calculates their market value in USD.
	*
	* @remarks
	* - Filters assets by `type`, `portfolioIds`, `entitiesIds`, `bankIds`, `currencies`, `isins`, and `securities`.
	* - Calls the service method to obtain bonds and their financial metrics.
	* - Calculates profit in USD and percentage.
	* - Sorts results by `profitUsd` or `profitPercentage` in the selected order.
	* - Returns an array of filtered assets and the total profit in USD.
	*
	* @param {AnalyticsBondFilterDto} filters - DTO containing filtering criteria.
	* @returns {Promise<IBondsByFilters>} - A promise that resolves to a list of bonds and total profit.
	*/
	@Get(AnalyticsRoutes.GET_ALL_BY_FILTERS,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	// @CacheTTL(THREE_DAYS_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		name:        'id',
		type:        AnalyticsEquityFilterDto,
		description: SwaggerDescriptions.EQUITY_FILTER,
	},)
	public async getAllByFilters(
		@Query() filters: AnalyticsEquityFilterDto,
		@Req() req: AuthRequest,
	): Promise<IEquitiesByFilters> {
		return this.equityAssetService.getAllByFilters(filters, req.clientId,)
	}

	/**
	* 3.5.4
	* Retrieves bond analytics grouped by banks based on the provided filters.
	*
	* @remarks
	* - Filters assets by `currencies`, `isins`, and other criteria.
	* - Calls the service method to calculate the total market value in USD for each bank.
	* - Returns an array of bank-related bond analytics with market values.
	*
	* @param {EquityCurrencyFilterDto} filter - DTO containing filtering criteria.
	* @returns {Promise<Array<TBankAnalytics>>} - A promise resolving to an array of bank analytics.
	*/
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	// @CacheTTL(THREE_DAYS_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.CASH_FILTER,
		type:        EquityCurrencyFilterDto,
	},)
	public async getBondsBankAnalytics(
		@Query() filter: EquityCurrencyFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.equityAssetService.getEquityBankAnalytics(filter, req.clientId,)
	}

		/**
	* 3.5.4
	* Retrieves bond analytics grouped by currency based on the provided filters.
	*
	* @remarks
	* - Filters assets by `currencies`, `isins`, and other criteria.
	* - Calls the service method to calculate the total market value in USD for each currency.
	* - Returns an array of currency-related bond analytics with market values.
	*
	* @param {EquityCurrencyFilterDto} filter - DTO containing filtering criteria.
	* @returns {Promise<Array<TBondsCurrencyAnalytics>>} - A promise resolving to an array of currency analytics.
	*/
		@Get(AnalyticsRoutes.CURRENCY,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		// @CacheTTL(THREE_DAYS_CACHE_TIME,)
		// @UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.CASH_FILTER,
			type:        EquityCurrencyFilterDto,
		},)
	public async getBondsCurrencyAnalytics(
			@Query() filter: EquityCurrencyFilterDto,
			@Req() req: AuthRequest,
	): Promise<Array<TBondsCurrencyAnalytics>> {
		return this.equityAssetService.getEquityCurrencyAnalytics(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Returns annual income from equity assets based on provided filters.
		* @remarks
		* Accessible to roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST.
		* Requires client-level access. Secured by auth guards.
		* @param filter - Query parameters for equity income analytics.
		* @param req - Request object containing client ID.
		* @returns Annual equity income.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        AnalyticsEquityFilterDto,
	},)
		public async getEquityAnnual(
		@Query() filter: AnalyticsEquityFilterDto,
		@Req() req: AuthRequest,
		): Promise<number> {
			return this.equityAssetService.getEquityAnnual(filter, req.clientId,)
		}
}
