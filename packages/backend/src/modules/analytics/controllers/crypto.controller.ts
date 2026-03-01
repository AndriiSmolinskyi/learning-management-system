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
import { CryptoAssetService, } from '../services'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import type { ICryptoByFilters, ICryptoFilterSelectsData, TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import { AnalyticsCryptoFilterDto, CryptoCurrencyFilterDto, AnalyticsSelectsGetByIdsDto, LoanFilterDto,} from '../dto'
import { AuthRequest, } from '../../auth'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(AnalyticsRoutes.CRYPTO,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('CryptoAsset',)
export class CryptoAssetController {
	constructor(
		private readonly cryptoAssetService: CryptoAssetService,
	) { }

	/**
		* 3.5.3
		* Retrieves filter data for crypto assets based on bank IDs.
		* @remarks
		* This endpoint is restricted to users with the roles BACK_OFFICE_MANAGER and FAMILY_OFFICE_MANAGER.
		* The method queries the crypto asset service to retrieve selectable filter data
		* that can be used for further filtering operations.
		*
		* @param args - The DTO containing an array of bank IDs to filter by.
		* @returns A Promise that resolves to an object containing filter options for crypto assets.
	*/
		@Get(AnalyticsRoutes.CRYPTO_SELECTS,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@ApiQuery({
			name:        'id',
			type:        AnalyticsSelectsGetByIdsDto,
			description: SwaggerDescriptions.CRYPTO_SELECTS,
		},)
	public async getCryptoFilterSelectsByBanksIds(
		@Query() args: AnalyticsSelectsGetByIdsDto,
		@Req() req: AuthRequest,
	): Promise<ICryptoFilterSelectsData> {
		return this.cryptoAssetService.getCryptoFilterSelectsByBanksIds(args.id, req.clientId,)
	}

		/**
		* Retrieves crypto asset data based on applied filters.
		* @remarks
		* This endpoint retrieves data for crypto assets based on the filters provided by the client.
		* It is protected by JWT authentication and roles guard. The method returns filtered data according to the
		* parameters specified in the `AnalyticsCryptoFilterDto`.
		*
		* @param filters - The filters applied to the crypto asset data query.
		* @param req - The authenticated request object containing client ID.
		* @returns A Promise that resolves to the filtered crypto asset data.
	*/
		@Get(AnalyticsRoutes.GET_ALL_BY_FILTERS,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@CacheTTL(THREE_DAYS_CACHE_TIME,)
		@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.LOAN_FILTER,
			type:        LoanFilterDto,
		},)
		public async getAllByFilters(
				@Query() filters: AnalyticsCryptoFilterDto,
				@Req() req: AuthRequest,
		): Promise<ICryptoByFilters> {
			return this.cryptoAssetService.getAllByFilters(filters, req.clientId,)
		}

		/**
		* Retrieves bank-specific crypto asset analytics data.
		* @remarks
		* This endpoint fetches crypto asset analytics data specific to a bank based on the provided filters.
		* It is protected by JWT authentication and roles guard, and returns filtered data as per `CryptoCurrencyFilterDto`.
		*
		* @param filter - The filters applied to the bank analytics data query.
		* @param req - The authenticated request object containing client ID.
		* @returns A Promise that resolves to an array of bank analytics data for crypto assets.
	*/
		@Get(AnalyticsRoutes.BANK,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@CacheTTL(THREE_DAYS_CACHE_TIME,)
		@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.CASH_FILTER,
			type:        CryptoCurrencyFilterDto,
		},)
		public async getBankAnalytics(
		@Query() filter: CryptoCurrencyFilterDto,
		@Req() req: AuthRequest,
		): Promise<Array<TBankAnalytics>> {
			return this.cryptoAssetService.getCryptoBankAnalytics(filter, req.clientId,)
		}

		/**
		* 3.5.5
		* Retrieves cryptocurrency analytics data based on the provided filter.
		* @remarks
		* This endpoint returns analytics data for cryptocurrencies according to the specified filter criteria.
		* The response is cached for three days using Redis and is accessible only to users with roles
		* BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST with client-level access.
		* Authentication and authorization are enforced via guards.
		* @param filter - The filter criteria used to retrieve cryptocurrency analytics data.
		* @param req - The authenticated request object containing the client ID.
		* @returns A promise that resolves to an array of cryptocurrency analytics data.
	*/
		@Get(AnalyticsRoutes.CURRENCY,)
		@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
		@CacheTTL(THREE_DAYS_CACHE_TIME,)
		@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.CASH_FILTER,
			type:        CryptoCurrencyFilterDto,
		},)
		public async getCurrencyAnalytics(
			@Query() filter: CryptoCurrencyFilterDto,
			@Req() req: AuthRequest,
		): Promise<Array<TCurrencyAnalytics>> {
			return this.cryptoAssetService.getCryptoCurrencyAnalytics(filter, req.clientId,)
		}

	/**
		* 3.5.4
		* Returns the total annual income from crypto deposits based on the provided filter.
		* @remarks
		* This endpoint calculates and returns the annual income analytics for crypto deposits,
		* filtered by the specified parameters. Access is restricted to users with the roles:
		* BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST, and requires client-level access.
		* The route is protected by authentication and authorization mechanisms.
		* @param filter - The query parameters used to filter the crypto deposit data.
		* @param req - The authenticated request object containing the client's ID.
		* @returns A promise resolving to a numeric value representing the calculated annual income.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        AnalyticsCryptoFilterDto,
	},)
		public async getCryptoAnnual(
		@Query() filter: AnalyticsCryptoFilterDto,
		@Req() req: AuthRequest,
		): Promise<number> {
			return this.cryptoAssetService.getCryptoAnnual(filter, req.clientId,)
		}
}
