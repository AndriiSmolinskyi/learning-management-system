import {
	Controller,
	Param,
	UseGuards,
	Get,
} from '@nestjs/common'
import {
	ApiBody,
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, } from '../../../shared/guards/jwt.guard'
import { PortfolioRoutes, ApiBodyDescriptions, } from '../portfolio.constants'
import { SubportfolioService, } from '../services'
import type { IPortfolio, } from '../portfolio.types'

@ApiTags('Subportfolio',)
@Controller(PortfolioRoutes.SUB_PORTFOLIO,)
export class SubportfolioController {
	constructor(
		private readonly subportfolioService: SubportfolioService,
	) { }

	/**
	 * 1.3
	 * Retrieves a list of subportfolios associated with a specific portfolio ID.
	 * @param id - The unique identifier of the portfolio to retrieve subportfolios for.
	 * @returns A Promise that resolves to an array of Portfolio objects.
	 * @description Uses JWT authentication to ensure secure access.
	 * API documentation is provided for the client portfolio retrieval route.
	 */
	@UseGuards(JWTAuthGuard,)
	@ApiBody({
		description: ApiBodyDescriptions.SUB_PORTFOLIO_LIST,
	},)
	@Get(`${PortfolioRoutes.SUB_PORTFOLIO_LIST}/:id`,)
	public async getClientPortfolioList(
		@Param('id',) id: string,
	): Promise<Array<IPortfolio>> {
		return this.subportfolioService.getSubportfolioListByPortfolioId(id,)
	}
}
