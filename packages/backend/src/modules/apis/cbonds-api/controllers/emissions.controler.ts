import {
	Controller,
	UseGuards,
	Get,
	Query,
} from '@nestjs/common'
import {
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../../shared/guards'
import { CBondsEmissionsService, } from '../services'
import { RolesDecorator, } from '../../../../shared/decorators'
import { CBondsRoutes, SwaggerDescriptions, } from '../cbonds-api.constants'
import { Roles,} from '../../../../shared/types'
import { GetSecurityByIsinDto, } from '../dto'
import { CurrencyDataList, } from '@prisma/client'
const {Emissions,} = CBondsRoutes

@Controller(`${CBondsRoutes.MODULE}/${Emissions.MODULE}`,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('CBondsEmissions',)
export class CBondsEmissionsController {
	constructor(
		private readonly cBondsEmissionsService: CBondsEmissionsService,
	) { }

	/**
	 * 2.2.1.4
 	* Retrieves all ISIN codes associated with emissions.
 	*
 	* This endpoint fetches a list of ISINs by querying the database for emission data.
 	*
 	* @returns A Promise that resolves to an array of ISIN strings.
 	*          Returns an empty array if the emission data is invalid or cannot be parsed.
 	*
 	* @throws HttpException If the emission data retrieval fails or there is a database connection issue.
 	*/
	@Get(Emissions.GET_ISINS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getEmissionsIsins(
		@Query('currency',) currency?: CurrencyDataList,
	): Promise<Array<string>> {
		return this.cBondsEmissionsService.getEmissionsIsins(currency,)
	}

	/**
 	* 3.5.3
 * Retrieves a list of securities related to emissions.
 * @returns A promise that resolves to an array of strings representing the securities related to emissions.
 * @throws Will throw an error if the emissions securities retrieval fails.
 *
 * This method handles a GET request to the route specified in `Emissions.GET_SECURITIES` and returns a list of emissions securities.
 * Access to this method is restricted to users with the following roles:
 * - `BACK_OFFICE_MANAGER`
 * - `FAMILY_OFFICE_MANAGER`
 */
	@Get(Emissions.GET_SECURITIES,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getEmissionsSecurities(): Promise<Array<string>> {
		return this.cBondsEmissionsService.getEmissionsSecurities()
	}

	/**
	* 2.2.1.4
 	* Retrieves security information associated with a specific ISIN code.
 	*
 	* This endpoint fetches security details based on the provided ISIN code
 	* by querying the emissions data.
 	*
 	* @param query - The query parameters containing the ISIN code (`GetSecurityByIsinDto`).
 	*
 	* @returns A Promise that resolves to a string representing the security information
 	*          or `null` if no matching security is found.
 	*
 	* @throws HttpException If the ISIN code is invalid or there is a database connection issue.
 	*/
	@Get(Emissions.GET_SECURITY,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.GET_SECURITY,
		type:        GetSecurityByIsinDto,
	},)
	public async getSecurityByIsin(
		@Query() query: GetSecurityByIsinDto,

	): Promise<string | number | null> {
		return this.cBondsEmissionsService.getSecurityByIsin(query,)
	}
}
