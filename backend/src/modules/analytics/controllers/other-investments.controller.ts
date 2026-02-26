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
import { OtherInvestmentsService, } from '../services/other-investments.service'
import { OtherInvestmentsFilterDto, OtherInvestmentsFilterSelectsBySourceIdsDto, } from '../dto'
import { AuthRequest, } from '../../auth'

import { Roles, } from '../../../shared/types'
import type { IOthersByFilter, } from '../../asset/asset.types'
import type { IOtherInvestmentsSelects, TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(AnalyticsRoutes.OTHER_INVESTMEN,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.OTHER_INVESTMENS,)
export class OtherInvestmentsController {
	constructor(
		private readonly otherInvestmentsService: OtherInvestmentsService,
	) {}

	/**
		* 3.5.3
		* Retrieves the names of other assets based on the provided bank IDs.
		* @remarks
		* - Accessible only to users with roles `BACK_OFFICE_MANAGER` or `FAMILY_OFFICE_MANAGER`.
		* - Fetches other asset names associated with the specified bank IDs.
		* - Returns an array of other asset names.
		* @param args - Query parameters containing an array of bank IDs (`id`).
		* @returns A Promise that resolves to an array of other asset names.
	*/
	@Get(AnalyticsRoutes.GET_NAMES,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		clientAccess: true,
	},)
	@ApiQuery({
		name:        'id',
		type:        OtherInvestmentsFilterSelectsBySourceIdsDto,
		description: SwaggerDescriptions.OTHER_NAMES,
	},)
	public async getAssetOtherNamesBySourceIds(
		@Query() args: OtherInvestmentsFilterSelectsBySourceIdsDto,
		@Req() req: AuthRequest,
	): Promise<IOtherInvestmentsSelects> {
		return this.otherInvestmentsService.getAssetOtherNamesBySourceIds(args, req.clientId,)
	}

	/**
		* 3.5.4
		* Retrieves filtered other investments data based on the provided filter criteria.
		* @remarks
		* This endpoint retrieves other investments data based on the filters provided by the client.
		* The method returns filtered data about other investments and is accessible only by authorized users with the appropriate roles.
		* @param filter - The filter criteria for retrieving other investments data.
		* @param req - The authenticated request object, which includes client ID.
		* @returns A promise that resolves to the filtered other investments data.
	*/
	@Get()
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OTHER_INVESTMENS_FILTER,
		type:        OtherInvestmentsFilterDto,
	},)
	public async getFilteredOtherInvestments(
		@Query() filter: OtherInvestmentsFilterDto,
		@Req() req: AuthRequest,
	): Promise<IOthersByFilter> {
		return this.otherInvestmentsService.getFilteredOtherInvestments(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Retrieves bank analytics based on the provided filter.
		* @remarks
		* This endpoint filters bank assets based on the specified criteria and returns an array of bank analytics.
		* It includes currency value in USD. The data is accessible only to authorized users with appropriate roles.
		* @param filter - The filter criteria for retrieving bank analytics.
		* @returns A promise that resolves to an array of bank analytics.
	*/
	@Get(AnalyticsRoutes.BANK,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OTHER_INVESTMENS_FILTER,
		type:        OtherInvestmentsFilterDto,
	},)
	public async getBankAnalytics(
		@Query() filter: OtherInvestmentsFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TBankAnalytics>> {
		return this.otherInvestmentsService.getBankAnalytics(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Retrieves currency analytics based on the provided filter.
		* @remarks
		* This endpoint filters assets based on the specified currencies and returns the corresponding currency analytics.
		* The values are converted to USD, and the analytics are returned. This method is restricted to users with the
		* appropriate roles and client access.
		* @param filter - The filter criteria for retrieving currency analytics.
		* @param req - The authenticated request object, which includes client ID.
		* @returns A promise that resolves to an array of currency analytics.
	*/
	@Get(AnalyticsRoutes.CURRENCY,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.OTHER_INVESTMENS_FILTER,
		type:        OtherInvestmentsFilterDto,
	},)
	public async getCurrencyAnalytics(
		@Query() filter: OtherInvestmentsFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<TCurrencyAnalytics>> {
		return this.otherInvestmentsService.getCurrencyAnalytics(filter, req.clientId,)
	}

	/**
		* 3.5.4
		* Returns annual income analytics for other investments based on provided filters.
		* @remarks
		* Accessible to roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMEN_ANALYST with client-level access.
		* Secured by authentication and authorization guards.
		* @param filter - Query parameters for filtering other investments data.
		* @param req - Authenticated request containing client ID.
		* @returns A promise resolving to the annual income for other investments.
	*/
	@Get(AnalyticsRoutes.ANNUAL_INCOME,)
	@RolesDecorator({roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,], clientAccess: true,},)
	@ApiQuery({
		description: SwaggerDescriptions.ANNUAL_INCOME,
		type:        OtherInvestmentsFilterDto,
	},)
	public async getOtherInvestmentsAnnual(
		@Query() filter: OtherInvestmentsFilterDto,
		@Req() req: AuthRequest,
	): Promise<number> {
		return this.otherInvestmentsService.getOtherInvestmentsAnnual(filter, req.clientId,)
	}
}
