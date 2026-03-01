import {Controller, Get, Query, UseGuards,} from '@nestjs/common'
import {ApiQuery, ApiTags,} from '@nestjs/swagger'

import {JWTAuthGuard, RolesGuard,} from '../../../../shared/guards'
import {CBondsEquityStocksService,} from '../services'
import {RolesDecorator,} from '../../../../shared/decorators'
import {CBondsRoutes, SwaggerDescriptions,} from '../cbonds-api.constants'
import {Roles,} from '../../../../shared/types'
import {GetSecurityByIsinDto,} from '../dto'
import {CurrencyDataList,} from '@prisma/client'

const { EquitySotcks, } = CBondsRoutes

@Controller(`${CBondsRoutes.MODULE}/${EquitySotcks.MODULE}`,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('CBondsEquityStocks',)
export class CBondsEquityStocksController {
	constructor(
		private readonly cBondsEquityStocksService: CBondsEquityStocksService,
	) { }

	/**
	 * 2.2.1.4
	 * Retrieves all ISIN codes associated with equity stocks.
	 *
	 * This endpoint fetches a list of ISINs by querying the database for equity stock emissions.
	 *
	 * @returns A Promise that resolves to an array of ISIN strings.
	 *          Returns an empty array if the data is invalid or cannot be parsed.
	 *
	 * @throws HttpException If the data retrieval fails or there is a database connection issue.
	 */
	@Get(EquitySotcks.GET_ISINS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getEquityStocksIsins(
		@Query('currency',) currency?: CurrencyDataList,
	): Promise<Array<string>> {
		return this.cBondsEquityStocksService.getEquityStocksIsins(currency,)
	}

	/**
	 * 3.5.3
	 * Retrieves a list of equity stocks related to emissions.
	 *
	 * @returns A Promise that resolves to an array of strings representing the equity stocks.
	 * @throws HttpException If the retrieval process fails.
	 *
	 * This method handles a GET request to `EquityStocks.GET_SECURITIES` and returns a list of securities.
	 * Access is restricted to users with the following roles:
	 * - `BACK_OFFICE_MANAGER`
	 * - `FAMILY_OFFICE_MANAGER`
	 */
	@Get(EquitySotcks.GET_SECURITIES,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getEmissionsSecurities(): Promise<Array<string>> {
		return this.cBondsEquityStocksService.getEquityStocksSecurities()
	}

	/**
	 * 2.2.1.4
	 * Retrieves equity stock information associated with a specific ISIN code.
	 *
	 * This endpoint fetches equity stock details based on the provided ISIN code
	 * by querying the database.
	 *
	 * @param query - The query parameters containing the ISIN code (`GetSecurityByIsinDto`).
	 *
	 * @returns A Promise that resolves to a string representing the stock details
	 *          or `null` if no matching record is found.
	 *
	 * @throws HttpException If the ISIN code is invalid or a database issue occurs.
	 */
	@Get(EquitySotcks.GET_SECURITY,)
	@RolesDecorator({
		roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.GET_SECURITY,
		type:        GetSecurityByIsinDto,
	},)
	public async getSecurityByIsin(
		@Query() query: GetSecurityByIsinDto,

	): Promise<string | number | null> {
		return this.cBondsEquityStocksService.getEquitySecurityByIsin(query,)
	}
}
