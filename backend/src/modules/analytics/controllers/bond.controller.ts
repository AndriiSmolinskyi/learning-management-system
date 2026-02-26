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
import { BondAssetService, } from '../services'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import type { IBondsByFilters, TBankAnalytics, TBondsCurrencyAnalytics,  } from '../analytics.types'
import { AnalyticsBondFilterDto, BondsCurrencyFilterDto, BondIsinsSecuritiesBySourceIdsDto, NewAnalyticsBondFilterDto, } from '../dto'
import { AuthRequest, } from '../../auth'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(AnalyticsRoutes.BOND,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('BondAsset',)
export class BondAssetController {
	constructor(
		private readonly bondAssetService: BondAssetService,
	) { }

	/**
 * 3.5.3
 * Retrieves ISINs of bonds associated with the specified bank IDs.
 *
 * @remarks
 * - Filters assets by the provided bank identifiers and the asset name `BONDS`.
 * - Calls the service method to obtain bond ISINs.
 * - Returns an array of ISINs or an empty array in case of an error.
 *
 * @param {BondSelectsGetByIdsDto} args - DTO containing an array of bank identifiers.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of bond ISINs.
 */
	@Get(AnalyticsRoutes.ISINS,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		name:        'id',
		type:        BondIsinsSecuritiesBySourceIdsDto,
		description: SwaggerDescriptions.BOND_ISINS,
	},)
	public async getBondIsinsBySourceIds(
		@Query() args: BondIsinsSecuritiesBySourceIdsDto,
		@Req() req: AuthRequest,
	): Promise<Array<string>> {
		return this.bondAssetService.getBondIsinsBySourceIds(args, req.clientId,)
	}

	/**
 	* 3.5.3
 	* Retrieves security codes of bonds associated with the specified bank IDs.
 	*
 	* @remarks
 	* - Filters assets by the provided bank identifiers and the asset name `BONDS`.
 	* - Calls the service method to obtain bond security codes.
 	* - Returns an array of security codes or an empty array in case of an error.
 	*
 	* @param {BondSelectsGetByIdsDto} args - DTO containing an array of bank identifiers.
 	* @returns {Promise<Array<string>>} - A promise that resolves to an array of bond security codes.
 	*/
	@Get(AnalyticsRoutes.SECURITIES,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		name:        'id',
		type:        BondIsinsSecuritiesBySourceIdsDto,
		description: SwaggerDescriptions.BOND_SECUTITIES,
	},)
	public async getBondSecuritiesByBanksIds(
		@Query() args: BondIsinsSecuritiesBySourceIdsDto,
		@Req() req: AuthRequest,
	): Promise<Array<string>> {
		return this.bondAssetService.getBondSecuritiesByBanksIds(args, req.clientId,)
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
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		name:        'id',
		type:        AnalyticsBondFilterDto,
		description: SwaggerDescriptions.BOND_FILTER,
	},)
	public async getAllByFilters(
		@Query() filters: NewAnalyticsBondFilterDto,
		@Req() req: AuthRequest,
	): Promise<IBondsByFilters> {
		return this.bondAssetService.getAllByFilters(filters, req.clientId,)
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
 	* @param {BondsCurrencyFilterDto} filter - DTO containing filtering criteria.
 	* @returns {Promise<Array<TBankAnalytics>>} - A promise resolving to an array of bank analytics.
 	*/
		@Get(AnalyticsRoutes.BANK,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@CacheTTL(THREE_DAYS_CACHE_TIME,)
		@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.CASH_FILTER,
			type:        BondsCurrencyFilterDto,
		},)
	public async getBondsBankAnalytics(
		@Query() filter: BondsCurrencyFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.bondAssetService.getBondsBankAnalytics(filter, req.clientId,)
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
 	* @param {BondsCurrencyFilterDto} filter - DTO containing filtering criteria.
 	* @returns {Promise<Array<TBondsCurrencyAnalytics>>} - A promise resolving to an array of currency analytics.
 	*/
		@Get(AnalyticsRoutes.CURRENCY,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@CacheTTL(THREE_DAYS_CACHE_TIME,)
		@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.CASH_FILTER,
			type:        BondsCurrencyFilterDto,
		},)
		public async getBondsCurrencyAnalytics(
			@Query() filter: BondsCurrencyFilterDto,
			@Req() req: AuthRequest,
		): Promise<Array<TBondsCurrencyAnalytics>> {
			return this.bondAssetService.getBondsCurrencyAnalytics(filter, req.clientId,)
		}

	/**
		* 3.5.4
		* Retrieves annual bond income analytics data based on the provided filter.
		* @remarks
		* This endpoint fetches analytics data related to annual bond income according to the client's filter criteria.
		* Access is restricted to users with roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST,
		* and requires client-level access. The endpoint is secured by authentication and authorization guards.
		*
		* The data is calculated based on bond transactions that occurred within the current year up to the provided date.
		* If the selected year is the previous one, the endpoint returns 0.
		*
		* @param filter - The filter criteria for retrieving annual bond income analytics.
		* @param req - The authenticated request object containing the client ID.
		* @returns A promise that resolves to a number representing the annual bond income analytics.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        AnalyticsBondFilterDto,
	},)
		public async getBondAnnual(
		@Query() filter: NewAnalyticsBondFilterDto,
		@Req() req: AuthRequest,
		): Promise<number> {
			return this.bondAssetService.getBondAnnual(filter, req.clientId,)
		}
}
