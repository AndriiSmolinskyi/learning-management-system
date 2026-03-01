/* eslint-disable no-unused-vars */
import {
	Body,
	Controller,
	Post,
	Param,
	UseGuards,
	Get,
	Patch,
	Req,
	Query,
	Delete,
	UseInterceptors,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { Portfolio, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { PortfolioService, } from '../services'
import { PortfolioRoutes, ApiBodyDescriptions, } from '../portfolio.constants'
import { RolesDecorator, } from '../../../shared/decorators'

import type { IAsyncPortfoliosFiltered, IPortfolio, IPortfolioChartResponse, PortfolioWithRelations, RefactoredPortfolioWithRelations,} from '../portfolio.types'
import { Roles, type Message, } from '../../../shared/types'
import {
	CreatePortfolioDto,
	GetPortfolioFilterDto,
	GetPortfoliosByClientsIdsDto,
	IdDto,
	PortfolioChartDto,
	PortfolioUpdateDto,
} from '../dto'
import { AuthRequest, } from '../../auth'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'
import { CacheTTL, } from '@nestjs/cache-manager'

@Controller(PortfolioRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('Portfolio',)
export class PortfolioController {
	constructor(
		private readonly portfolioService: PortfolioService,
	) { }

	/**
	 * 1.3
	 * Retrieves a list of client portfolios based on provided filters.
	 * @param filters - Filters to apply when retrieving the client portfolio list.
	 * @returns A Promise that resolves to an array of portfolios.
	 */
	@Get(PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
		clientAccess: true,
	},)
	// @CacheTTL(THREE_DAYS_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: ApiBodyDescriptions.GET_CLIENTS_PORTFOLIO_LIST,
		type:        GetPortfolioFilterDto,
	},)
	public async getPortfolioListFiltered(
		@Query() filters: GetPortfolioFilterDto,
		@Req() req: AuthRequest,
	): Promise<IAsyncPortfoliosFiltered> {
		return this.portfolioService.getPortfolioListFiltered(filters, req.clientId,)
	}

	/**
	 * 3.1.7
 * Retrieves a list of portfolios based on user roles.
 * @returns A promise that resolves to an array of `IPortfolio` objects representing the portfolios.
 *
 * This method is exposed via a GET request to the `PortfolioRoutes.LIST` endpoint. It retrieves a list of portfolios by calling the `getPortfolioList` method of the `portfolioService`.
 * The request is restricted to users with specific roles, such as `BACK_OFFICE_MANAGER`, `FAMILY_OFFICE_MANAGER`, `INVESTMEN_ANALYST`, and `BOOKKEEPER`.
 *
 * Error Handling:
 * - If an error occurs during the retrieval of the portfolio list, it will be handled by the `portfolioService` or the controller.
 */
	@Get(PortfolioRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	public async getPortfolioList(
	): Promise<Array<IPortfolio>> {
		return this.portfolioService.getPortfolioList()
	}

	/**
 * Retrieves a list of portfolios filtered by a list of client IDs. If no client IDs are provided,
 * it defaults to the client ID from the authenticated request.
 *
 * Access restricted to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, or INVESTMENT_ANALYST.
 * The endpoint also checks client access permissions.
 *
 * @param args - Query parameter containing an array of client IDs.
 * @param req - The authenticated request object containing the client ID.
 * @returns A Promise that resolves to an array of matching portfolios.
 */
	@Get(PortfolioRoutes.LIST_BY_CLIENTS_IDS,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
			clientAccess: true,
		},)
		@ApiQuery({
			name:        'id',
			type:        GetPortfoliosByClientsIdsDto,
			description: ApiBodyDescriptions.LIST_BY_CLIENTS_IDS,
		},)
	public async getPortfolioListByClientsIds(
			@Query() args: GetPortfoliosByClientsIdsDto,
			@Req() req: AuthRequest,
	): Promise<Array<Portfolio>> {
		return this.portfolioService.getPortfolioListByClientsIds(args.id, req.clientId,)
	}

	/**
	 * 3.1.1
	 * Retrieves a list of client portfolios based on provided filters.
	 * @param filters - Filters to apply when retrieving the client portfolio list.
	 * @returns A Promise that resolves to an array of portfolios.
	 */
	@Get(`${PortfolioRoutes.CLIENT}/${PortfolioRoutes.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiParam({
		name: ApiBodyDescriptions.ID,
		type: IdDto,
	},)
	public async getPortfolioListByClientId(
		@Param() params: IdDto,
	): Promise<Array<IPortfolio>> {
		return this.portfolioService.getPortfolioListByClientId(params.id,)
	}

	/**
	 * 1.3
	 * Retrieves the details of a portfolio by its ID.
	 * @param id - The ID of the portfolio to retrieve.
	 * @returns A Promise that resolves to the portfolio details.
	 */
	@Get(`${PortfolioRoutes.PORTFOLIO_DETAILS}/${PortfolioRoutes.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	// @CacheTTL(THREE_DAYS_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@ApiParam({
		name:        ApiBodyDescriptions.ID,
		description: ApiBodyDescriptions.PORTFOLIO_ID,
	},)
	public async getPortfolioDetailsById(
		@Param('id',) id: string,
	// ): Promise<PortfolioWithRelations> {
	): Promise<RefactoredPortfolioWithRelations> {
		return this.portfolioService.getPortfolioDetailsById(id,)
	}

	/**
 * 3.5.1
 * Retrieves portfolio chart analytics by portfolio ID and optional filters.
 *
 * @remarks
 * This endpoint provides time-based analytical data for a given portfolio,
 * such as asset performance, category distributions, or other visual insights.
 * It is primarily used for building portfolio performance charts.
 *
 * @param filter - Query parameters including portfolio ID and optional time range.
 * @returns A Promise resolving to an array of chart data points.
 */
	@Get(PortfolioRoutes.PORTFOLIO_CHART,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	// @CacheTTL(THREE_DAYS_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		type:        PortfolioChartDto,
		description: ApiBodyDescriptions.PORTFOLIO_CHART,
	},)
	public async getPortfolioChartAnalyticsById(
		@Query() filter: PortfolioChartDto,
	):  Promise<Array<IPortfolioChartResponse>> {
		return this.portfolioService.getPortfolioChartAnalyticsById(filter,)
	}

	/**
	 * Retrieves the portfolio by its ID.
	 * @param id - The ID of the portfolio to retrieve.
	 * @returns A Promise that resolves to the portfolio.
	 */
	@Get(PortfolioRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiParam({
		name:        ApiBodyDescriptions.ID,
		description: ApiBodyDescriptions.PORTFOLIO_ID,
	},)
	public async getPortfolioById(
		@Param('id',) id: string,
	): Promise<IPortfolio> {
		return this.portfolioService.getPortfolioById(id,)
	}

	/**
		* 4.2.1
		* Deletes portfolio by its ID.
		 *
		 * @remarks
		 * - This route is used to delete the specific portfolio by its `id`.
		 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER.
		 *
		 * @param params - The ID of the portfolio to delete.
		 */
		@Delete(PortfolioRoutes.ID,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		},)
		@ApiParam({
			name:        ApiBodyDescriptions.ID,
			description: ApiBodyDescriptions.PORTFOLIO_ID,
		},)
	public async deletePortfolioById(
		@Param() params: IdDto,
	): Promise<void> {
		return this.portfolioService.deletePortfolioById(params.id,)
	}

	/**
	 * 1.3
	 * Creates a new portfolio with the provided data.
	 * @param body - The portfolio form values.
	 * @returns A Promise that resolves to an object containing the ID of the created portfolio.
	*/
	@Post(PortfolioRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: ApiBodyDescriptions.CREATE_PORTFOLIO,
		type:        CreatePortfolioDto,
	},)
		public async createPortfolio(
		@Body() body: CreatePortfolioDto,
		): Promise<Portfolio> {
			return this.portfolioService.createPortfolio(body,)
		}

	/**
	 * 1.3
	 * Updates the status of a portfolio by its ID.
	 * @param id - The ID of the portfolio to update.
	 * @param body - The portfolio patch data.
	 * @returns A Promise that resolves to a message indicating the status of the update.
	 */
	@Patch(`${PortfolioRoutes.UPDATE_STATUS}/${PortfolioRoutes.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        ApiBodyDescriptions.ID,
		description: ApiBodyDescriptions.PORTFOLIO_ID,
	},)
	@ApiBody({
		description: ApiBodyDescriptions.UPDATE_DRAFT_TO_PORTFOLIO,
		type:        PortfolioUpdateDto,
	},)
	public async updatePortfolioStatus(
		@Param('id',) id: string,
		@Body() body: PortfolioUpdateDto,
	): Promise<Message> {
		return this.portfolioService.updatePortfolioStatus(id, body,)
	}
}
