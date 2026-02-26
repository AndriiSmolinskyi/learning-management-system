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
import {
	SwaggerDescriptions,
	AnalyticsRoutes,
} from '../analytics.constants'
import { OptionsService, } from '../services/options.service'

import { Roles, } from '../../../shared/types'
import { OptionPairsBySourceIdsDto, OptionsFilterDto, } from '../dto'
import { AuthRequest, } from '../../auth'
import type {
	TBankAnalytics,
	TMaturityAnalytics,
	TOptionsAssetAnalytics,
} from '../analytics.types'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

/**
 * Controller for handling options-related analytics data.
 * @remarks
 * This controller provides endpoints for fetching analytics data related to options, including bank, asset, and maturity analytics.
 * The data is protected by JWT authentication and roles guard, allowing access only to authorized users.
 */
@Controller(AnalyticsRoutes.OPTIONS,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.OPTIONS,)
export class OptionsController {
	constructor(
		private readonly optionsService: OptionsService,
	) {}

	/**
		 * 3.5.3
		  * Endpoint to retrieve a list of option pairs associated with the specified bank IDs.
	 *
	 * @remarks
	 * - Requires authentication using `JWTAuthGuard` and role-based access control using `RolesGuard`.
	 * - Accessible only by users with the roles `BACK_OFFICE_MANAGER` or `FAMILY_OFFICE_MANAGER`.
	 * - Filters the option pairs based on the provided bank IDs.
	 * - Returns an array of option pairs as strings.
	 *
	 * @param args - Query parameters containing an array of bank IDs.
	 * @returns A Promise that resolves to an array of option pairs.
	 */
		@Get(AnalyticsRoutes.GET_PAIRS_BY_BANKS_IDS,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
			clientAccess: true,

		},)
		@ApiQuery({
			name:        'id',
			type:        OptionPairsBySourceIdsDto,
			description: SwaggerDescriptions.OPTION_PAIRS,
		},)
	public async getOptionPairsListByBanksIds(
			@Query() args: OptionPairsBySourceIdsDto,
			@Req() req: AuthRequest,
	): Promise<Array<string>> {
		return this.optionsService.getOptionPairsListByBanksIds(args, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves bank-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint fetches bank-specific analytics data for options, based on the filter criteria provided by the client.
	 * The method returns data including the value of options in the bank and is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving bank analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of bank analytics data for options.
	 */
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        OptionsFilterDto,
	},)
		public async getBankAnalytics(
		@Query() filter: OptionsFilterDto,
		@Req() req: AuthRequest,
		): Promise<Array<TBankAnalytics>> {
			return this.optionsService.getBankAnalytics(filter, req.clientId,)
		}

	/**
	 * 3.5.4
	 * Retrieves asset-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint fetches asset-specific analytics data for options, based on the filter criteria provided by the client.
	 * The method returns data that includes asset-specific analytics for options and is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving asset analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of asset analytics data for options.
	 */
	@Get(AnalyticsRoutes.ASSET,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        OptionsFilterDto,
	},)
	public async getAsetAnalytics(
		@Query() filter: OptionsFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TOptionsAssetAnalytics>> {
		return this.optionsService.getAssetAnalytics(filter, req.clientId,)
	}

	/**
	 * 3.5.4
	 * Retrieves maturity-specific analytics data based on the provided filter.
	 * @remarks
	 * This endpoint fetches maturity-specific analytics data for options, based on the filter criteria provided by the client.
	 * The method returns data that includes maturity-specific analytics for options and is protected by JWT authentication and roles guard.
	 * @param filter - The filter criteria for retrieving maturity analytics.
	 * @param req - The authenticated request object, which includes client ID.
	 * @returns A promise that resolves to an array of maturity analytics data for options.
	 */
	@Get(AnalyticsRoutes.MATURITY,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        OptionsFilterDto,
	},)
	public async getMaturityAnalytics(
		@Query() filter: OptionsFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TMaturityAnalytics>> {
		return this.optionsService.getMaturityAnalytics(filter, req.clientId,)
	}

	/**
 		* 3.5.4
 		* Retrieves premium options analytics data based on the provided filter.
 		* @remarks
 		* This endpoint fetches premium options analytics data filtered according to the criteria specified by the client.
 		* Access is restricted to users with roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST,
 		* and requires client-level access. The endpoint is protected by authentication and authorization guards.
 		* @param filter - The filter criteria for retrieving premium options data.
 		* @param req - The authenticated request object containing the client ID.
 		* @returns A promise that resolves to a number representing the premium options analytics data.
 	*/
	@Get(AnalyticsRoutes.OPTION_PREMIUM,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.OPTIONS_FILTER,
		type:        OptionsFilterDto,
	},)
	public async getOptionsPremium(
		@Query() filter: OptionsFilterDto,
		@Req() req: AuthRequest,
	): Promise<number> {
		return this.optionsService.getOptionsPremium(filter, req.clientId,)
	}
}
