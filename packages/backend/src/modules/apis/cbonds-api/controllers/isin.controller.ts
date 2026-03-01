import {
	Controller,
	UseGuards,
	Body,
	Post,
	Query,
	Get,
	Param,
} from '@nestjs/common'
import {
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../../shared/guards'
import { CBondsIsinService, } from '../services'
import { RolesDecorator, } from '../../../../shared/decorators'
import { CBondsRoutes, } from '../cbonds-api.constants'
import type { Message,} from '../../../../shared/types'
import { Roles,} from '../../../../shared/types'
import { CreateIsinDto, } from '../dto'
import { AssetNamesType, } from '../../../../modules/asset/asset.types'
const {ISIN,} = CBondsRoutes

@Controller(`${CBondsRoutes.MODULE}/${ISIN.MODULE}`,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('CBondsIsins',)
export class CBondsIsinController {
	constructor(
		private readonly cBondsIsinService: CBondsIsinService,
	) { }

	/**
	 * CR-042
	 * Retrieves all ISINs associated with a specific portfolio.
	 * @remarks
	 * - This endpoint fetches all ISIN identifiers linked to the given portfolio ID.
	 * - Access to this endpoint is restricted to users with the following roles: `BACK_OFFICE_MANAGER`, `FAMILY_OFFICE_MANAGER`, and `INVESTMENT_ANALYST`.
	 * - The data is retrieved using the `cBondsIsinService`.
	 * @param id - The unique identifier of the portfolio for which ISINs are to be retrieved.
	 * @returns A promise that resolves to an array of ISIN strings associated with the portfolio.
	 */
	@Get(`${ISIN.GET_PORTFOLIO_ISINS}/${ISIN.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getPortfolioIsins(
		@Param('id',) id: string,
		@Query('assetName',) assetName: AssetNamesType,
	): Promise<Array<string>> {
		return this.cBondsIsinService.getPortfolioIsins({id, assetName,},)
	}

	@Get(ISIN.CURRENCY_BY_ISIN,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async currencyByIsin(
		@Query('isin',) isin: string,
	): Promise<{ value: string; label: string }> {
		return this.cBondsIsinService.currencyByIsin(isin,)
	}

	@Get(ISIN.MARKET_BY_ISIN,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async marketByIsin(
		@Query('isin',) isin: string,
	): Promise<{ marketPrice: number}> {
		return this.cBondsIsinService.marketByIsin(isin,)
	}

	/**
		* CR-042
		* Creates a new ISIN based on the provided details.
		* @remarks
		* - The method is protected by guards to ensure the user is authenticated and has the appropriate role.
		* - The roles allowed to access this endpoint are `BACK_OFFICE_MANAGER` and `FAMILY_OFFICE_MANAGER`.
		* - The ISIN is created using the `cBondsIsinService`.
		* @param body - The data required to create a new ISIN, including the name and type of ISIN.
		* @returns A message indicating the success or failure of the ISIN creation.
	*/
	@Post(ISIN.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async createIsin(
		@Body() body: CreateIsinDto,
	): Promise<Message> {
		return this.cBondsIsinService.createIsin({name: body.name, currency: body.currency, isinType: body.isinType,},)
	}
}
