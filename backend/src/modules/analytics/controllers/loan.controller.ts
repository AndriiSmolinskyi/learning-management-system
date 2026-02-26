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
import { LoanAssetService, } from '../services'
import { SwaggerDescriptions, AnalyticsRoutes, } from '../analytics.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import type { ILoansByFilter, TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import { LoanCurrencyFilterDto, LoanFilterDto, LoanNamesBySourceIdsDto, } from '../dto'
import { AuthRequest, } from '../../auth'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(AnalyticsRoutes.LOAN,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('LoanAsset',)
export class LoanAssetController {
	constructor(
		private readonly loanAssetService: LoanAssetService,
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
		type:        LoanNamesBySourceIdsDto,
		description: SwaggerDescriptions.LOAN_NAMES,
	},)
	public async getAssetLoanNamesByBanksIds(
		@Query() args: LoanNamesBySourceIdsDto,
		@Req() req: AuthRequest,
	): Promise<Array<string>> {
		return this.loanAssetService.getAssetLoanNamesByBanksIds(args, req.clientId,)
	}

	/**
   * 3.5.4
   * Retrieves loan assets based on specified filters.
   *
   * @remarks
   * - Filters loan assets based on the provided criteria.
   * - Returns a list of loans that match the filter conditions.
   *
   * @param {LoanFilterDto} filters - The filter criteria for retrieving loan assets.
   * @returns {Promise<ILoansByFilter>} - A Promise resolving to the filtered loan assets.
   */
	@Get(AnalyticsRoutes.LOAN_BY_FILTERS,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.LOAN_FILTER,
		type:        LoanFilterDto,
	},)
	public async getAllByFilters(
		@Query() filters: LoanFilterDto,
		@Req() req: AuthRequest,
	): Promise<ILoansByFilter> {
		return this.loanAssetService.getAllByFilters(filters, req.clientId,)
	}

	/**
	  * 3.5.4
   * Retrieves bank analytics based on the provided filter.
   * @remarks
   * - Filters bank assets based on the specified criteria.
   * - Returns an array of bank analytics, including currency value in USD.
   * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics.
   */
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.CASH_FILTER,
			type:        LoanCurrencyFilterDto,
		},)
	public async getBankAnalytics(
		@Query() filter: LoanCurrencyFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.loanAssetService.getBankAnalytics(filter, req.clientId,)
	}

	/**
   * 3.5.4
   * Retrieves currency analytics based on the provided filter.
   *
   * @remarks
   * - Filters assets based on the specified currencies and returns corresponding currency analytics.
   * - Converts values to USD and returns the analytics.
   *
   * @param {LoanCurrencyFilterDto} filter - The filter criteria for retrieving currency analytics.
   * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
   */
	@Get(AnalyticsRoutes.CURRENCY,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
		@ApiQuery({
			description: SwaggerDescriptions.CASH_FILTER,
			type:        LoanCurrencyFilterDto,
		},)
	public async getCurrencyAnalytics(
			@Query() filter: LoanCurrencyFilterDto,
			@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.loanAssetService.getCurrencyAnalytics(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Returns annual loan income analytics data based on the provided filter.
		* @remarks
		* Accessible only to roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST with client-level access.
		* Secured by authentication and authorization guards.
		* @param filter - Query parameters to filter loan income data.
		* @param req - Authenticated request containing client ID.
		* @returns A promise resolving to the annual loan income as a number.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        LoanFilterDto,
	},)
	public async getLoanAnnual(
		@Query() filter: LoanFilterDto,
		@Req() req: AuthRequest,
	): Promise<number> {
		return this.loanAssetService.getLoanAnnual(filter, req.clientId,)
	}
}
