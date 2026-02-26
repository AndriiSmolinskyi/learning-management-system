import {
	Controller,
	UseGuards,
	Get,
	Query,
	Req,
} from '@nestjs/common'
import {
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../../shared/guards'
import { CBondsCurrencyService, } from '../services'
import { RolesDecorator, } from '../../../../shared/decorators'
import { CBondsRoutes, } from '../cbonds-api.constants'
import { Roles,} from '../../../../shared/types'
import { GetCashCurrenciesDto, } from '../dto/cash-currencies.dto'
import type { CurrencyData, } from '@prisma/client'
import { CurrencyFilterDto, } from '../dto/get-currencies.dto'
import { AuthRequest, } from '../../../../modules/auth'
const {Currency,} = CBondsRoutes

@Controller(`${CBondsRoutes.MODULE}/${Currency.MODULE}`,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('CBondsEmissions',)
export class CBondsCurrencyController {
	constructor(
		private readonly cBondsCurrencyService: CBondsCurrencyService,
	) { }

	/**
	* 3.5.3
	* /**
 		* Retrieves all available currencies.
 	* @returns A promise that resolves to an array of `CurrencyData` objects containing the details of all available currencies.
 	* @throws Will throw an error if the currency data retrieval fails.
 	* This method handles a GET request to the route specified in `Currency.GET_CURRENCIES` and returns a list of all currencies.
 	* Access to this method is restricted to users with the following roles:
 	* - `BACK_OFFICE_MANAGER`
 	* - `FAMILY_OFFICE_MANAGER`
 	*/
	@Get(Currency.GET_CURRENCIES,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getAllCurrencies(): Promise<Array<CurrencyData>> {
		return this.cBondsCurrencyService.getAllCurrencies()
	}

	/**
	* 3.5.3
	* /**
 		* Retrieves filtered currencies for analytics.
 	* @returns A promise that resolves to an array of `CurrencyData` objects containing the details of all available currencies.
 	* @throws Will throw an error if the currency data retrieval fails.
 	* This method handles a GET request to the route specified in `Currency.GET_CURRENCIES` and returns a list of all currencies.
 	* Access to this method is restricted to users with the following roles:
 	* - `BACK_OFFICE_MANAGER`
 	* - `FAMILY_OFFICE_MANAGER`
 	*/
	@Get(Currency.GET_ANALYTICS_FILTERED_CURRENCIES,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getAnalyticsFilteredCurrencies(
		@Query() filter: CurrencyFilterDto,
		@Req() req: AuthRequest,
	): Promise<Array<CurrencyData>> {
		return this.cBondsCurrencyService.getAnalyticsFilteredCurrencies(filter, req.clientId,)
	}

	/**
	* 3.5.3
	* /**
 		* Retrieves all available currencies.
 	* @returns A promise that resolves to an array of `CurrencyData` objects containing the details of all available currencies.
 	* @throws Will throw an error if the currency data retrieval fails.
 	* This method handles a GET request to the route specified in `Currency.GET_CURRENCIES` and returns a list of all currencies.
 	* Access to this method is restricted to users with the following roles:
 	* - `BACK_OFFICE_MANAGER`
 	* - `FAMILY_OFFICE_MANAGER`
 	*/
	@Get(Currency.GET_CURRENCIES_CASH,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getAllCurrenciesForCash(
		@Query() params: GetCashCurrenciesDto,
	): Promise<Array<CurrencyData>> {
		return this.cBondsCurrencyService.getAllCurrenciesForCash(params.accountId,)
	}
}
