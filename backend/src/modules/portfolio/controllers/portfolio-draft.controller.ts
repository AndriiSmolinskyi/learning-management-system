import {
	Body,
	Controller,
	Post,
	Param,
	UseGuards,
	Delete,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import type { Portfolio, PortfolioDraft, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { PortfolioDraftService, } from '../services'
import { PortfolioRoutes, ApiBodyDescriptions, } from '../portfolio.constants'
import { RolesDecorator, } from '../../../shared/decorators'

import { CreatePortfolioDto,} from '../dto'
import { Roles, } from '../../../shared/types'

@Controller(PortfolioRoutes.DRAFT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('PortfolioDraft',)
export class PortfolioDraftController {
	constructor(
		private readonly portfolioDraftService: PortfolioDraftService,
	) { }

	/**
	 * 1.3
	 * Creates a new portfolio data with the provided data.
	 * @param body - The portfolio form values.
	 * @returns A Promise that resolves to an object containing the ID of the created portfolio.
	 */
	@Post(PortfolioRoutes.CREATE_DRAFT,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: ApiBodyDescriptions.CREATE_PORTFOLIO,
		type:        CreatePortfolioDto,
	},)
	public async createPortfolioDraft(
		@Body() body: CreatePortfolioDto,
	): Promise<PortfolioDraft> {
		return this.portfolioDraftService.createPortfolioDraft(body,)
	}

	/**
	 * 1.3
	 * Updates a draft to a portfolio by its ID.
	 * @param id - The ID of the draft to update.
	 * @returns A Promise that resolves to a message indicating the status of the update.
	*/
	@Post(`${PortfolioRoutes.DRAFT_TO_PORTFOLIO}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: ApiBodyDescriptions.PORTFOLIO_STATUS_UPDATE,
	},)
	public async updateDraftToPortfolio(
		@Param('id',) id: string,
	): Promise<Portfolio> {
		return this.portfolioDraftService.updateDraftToPortfolio(id,)
	}

	/**
	 * 1.3
	 * Deletes a portfolio draft by its ID.
	 * @param id - The ID of the draft to delete.
	 * @returns A Promise that resolves when the draft is deleted.
	 */
	@Delete(`${PortfolioRoutes.DELETE_DRAFT}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: ApiBodyDescriptions.DELETE_PORTFOLIO_DRAFT,
	},)
	public async deletePortfolioDraft(
		@Param('id',) id: string,
	): Promise<void> {
		return this.portfolioDraftService.deletePortfolioDraft(id,)
	}
}
