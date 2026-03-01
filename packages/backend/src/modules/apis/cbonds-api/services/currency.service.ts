/* eslint-disable max-lines */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Bond, BondHistory, CurrencyDataList, Equity, EquityHistory, Etf, EtfHistory,} from '@prisma/client'
import {
	MetalDataList,
} from '@prisma/client'
import type {
	CryptoData,
	CurrencyData,
	MetalData,
} from '@prisma/client'

import type {
	ExchangeCurrencyToUSDDto,
	ExchangeCryptoToUSDDto,
	ExchangeMetalToUSDDto,
} from '../dto'
import type {
	IBondsMarketValueUSDCalculation,
	IEquitiesMarketValueUSDCalculation,
	IMetalRateName,
	TUsdToCurrencyData,
	ICurrencyRateExchangeWithHistory,
	IMetalRateExchangeWithHistory,
	IBondsMarketValueUSD,
	IGetMetalMarketPriceWithHistory,
} from '../cbonds-api.types'
import type { ICashAsset,} from '../../../../modules/asset/asset.types'
import { AssetNamesType, } from '../../../../modules/asset/asset.types'
import { assetParser, } from '../../../../shared/utils'
import type { CurrencyFilterDto, } from '../dto/get-currencies.dto'
import { endOfDay, } from 'date-fns'

@Injectable()
export class CBondsCurrencyService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	/**
 * 3.5.3
 * Retrieves a list of all currency data from the database.
 * @returns A promise that resolves to an array of `CurrencyData` objects.
 *
 * This method retrieves all currency data stored in the database by calling `thirdPartyPrismaService.currencyData.findMany()`.
 * It returns an array of `CurrencyData` objects containing all available currency records.
 *
 * Error Handling:
 * - If an error occurs during the data retrieval, an exception may be thrown and handled by the calling code or global error handler.
 */
	public async getAllCurrencies(): Promise<Array<CurrencyData>> {
		return this.prismaService.currencyData.findMany()
	}

	public async getAnalyticsFilteredCurrencies(filter: CurrencyFilterDto, clientId?: string,): Promise<Array<CurrencyData>> {
		const targetDate = endOfDay(new Date(),)
		const {clientIds, portfolioIds,entityIds,accountIds,bankListIds, bankIds, metalProductType, cryptoProductType,} = filter
		const currencyData = await this.prismaService.currencyData.findMany()
		if (filter.assetName === AssetNamesType.CASH) {
			const currencies  = await this.prismaService.transaction.findMany({
				where: {
					clientId: {
						in: clientId ?
							[clientId,] :
							clientIds,
					},
					portfolioId: {
						in: portfolioIds,
					},
					entityId: {
						in: entityIds,
					},
					accountId: {
						in: accountIds,
					},
					bankId: {
						in: bankIds,
					},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {
								in: bankListIds,
							},
						},
					},
				},
				select: {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const cashCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return cashCurrencies.includes(item.currency,)
			},)
		}

		if (filter.assetName === AssetNamesType.BONDS) {
			const currencies  = await this.prismaService.assetBondGroup.findMany({
				where: {
					clientId:    { in: clientId ?
						[clientId,] :
						clientIds, },
					portfolioId:  { in: portfolioIds, },
					entityId:    { in: entityIds, },
					accountId:   { in: accountIds,},
					bankId:      {in: bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: bankListIds,},
						},
					},
					assetName: AssetNamesType.BONDS,
					portfolio: {
						isActivated: true,
					},
					transferDate: null,
					totalUnits:   {
						not: 0,
					},
					marketPrice: {
						not: 0,
					},
					OR: [
						{ maturityDate: null, },
						{ maturityDate: { gte: targetDate, }, },
					],
				},
				select: {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const bondCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return bondCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.EQUITY_ASSET) {
			const currencies  = await this.prismaService.assetEquityGroup.findMany({
				where: {
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					currentStockPrice: {
						not: 0,
					},
					transferDate: null,
				},
				select: {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const equityCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return equityCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.CASH_DEPOSIT) {
			const currencies  = await this.prismaService.assetDeposit.findMany({
				where: {
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      { in: filter.bankIds, },
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
					AND:          [
						{
							OR: [{ maturityDate: { gt: targetDate, }, }, { maturityDate: null, },],
						},
						// filters.date ?
						// 	{ startDate: { lte: endOfDay(new Date(filters.date,),), }, } :
						// 	{},
					],
				},
				select: {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const depositCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return depositCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.CRYPTO) {
			const currencies  = await this.prismaService.assetCryptoGroup.findMany({
				where: {
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      {in: filter.bankIds,},
					bank:        {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					transferDate: null,
					productType:  {
						equals: cryptoProductType,
					},
				},
				select:       {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const cryptoCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return cryptoCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.METALS) {
			const currencies  = await this.prismaService.assetMetalGroup.findMany({
				where: {
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      {in: filter.bankIds,},
					bank:        {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					productType: {
						equals: metalProductType,
					},
					transferDate: null,
				},
				select:       {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const metalCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return metalCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.LOAN) {
			const currencies  = await this.prismaService.assetLoan.findMany({
				where: {
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      { in: filter.bankIds, },
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},

					usdValue: {
						not: 0,
					},
					transferDate: null,
					AND:          [
						{ maturityDate: { gt: targetDate, }, },
					],
				},
				select:       {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const loanCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return loanCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.OPTIONS) {
			const currencies  = await this.prismaService.assetOption.findMany({
				where: {
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					...(clientId ?
						{ client: { id: clientId, }, } :
						{}),
					bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

					portfolio: { isActivated: true, },

					marketValueUSD: { not: 0, },

					AND: [
						{ startDate: { lte: targetDate, }, },
						{
							OR: [
								{ transferDate: null, },
							],
						},
					],
				},
				select:       {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const optionCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return optionCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.OTHER) {
			const currencies  = await this.prismaService.assetOtherInvestment.findMany({
				where: {
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      { in: filter.bankIds, },
					bank:        {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
				},
				select:       {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const otherCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return otherCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.PRIVATE_EQUITY) {
			const currencies  = await this.prismaService.assetPrivateEquity.findMany({
				where: {
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      { in: filter.bankIds, },
					...(clientId ?
						{
							client: { id: clientId, },
						} :
						{}),
					bank: {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					marketValueUSD: {
						not: 0,
					},
					transferDate: null,
				},
				select:       {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const peCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return peCurrencies.includes(item.currency,)
			},)
		}
		if (filter.assetName === AssetNamesType.REAL_ESTATE) {
			const currencies  = await this.prismaService.assetRealEstate.findMany({
				where: {
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),

					bank: {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
				},
				select:       {
					currency: true,
				},
				distinct: ['currency',],
			},)
			const reCurrencies = currencies.map((c,) => {
				return c.currency
			},)
			return currencyData.filter((item,) => {
				return reCurrencies.includes(item.currency,)
			},)
		}
		return currencyData
	}

	/**
		* 3.5.3
		* Get all currencies with history.
		*
		* If the `historyDate` parameter is provided, then for each currency
		* a single (the earliest) history record (`currencyHistory`)
		* with a date greater than or equal to the given `historyDate` will be included.
		*
		* Used to take the filter `historyDate` into account.
	*/
	public async getAllCurrenciesWithHistory(historyDate?: string,): Promise<Array<CurrencyData>> {
		return this.prismaService.currencyData.findMany({
			include: {
				...(historyDate ?
					{
						currencyHistory: {
							where: {
								date: {
									gte: historyDate,
								},
							},
							orderBy: {
								date: 'asc',
							},
							take: 1,
						},
					} :
					{}),
			},
		},)
	}

	/**
	 *  * 3.5.3
		* Get all metals with history.
		*
		* If the `historyDate` parameter is provided, then for each metal
		* a single (the earliest) history record (`currencyHistory`)
		* with a date greater than or equal to the given `historyDate` will be included.
		*
		* Used to take the filter `historyDate` into account.
	*/
	public async getAllMetalsWithHistory(historyDate?: string,): Promise<Array<MetalData>> {
		return this.prismaService.metalData.findMany({
			include: {
				...(historyDate ?
					{
						currencyHistory: {
							where: {
								date: {
									gte: historyDate,
								},
							},
							orderBy: {
								date: 'asc',
							},
							take: 1,
						},
					} :
					{}),
			},
		},)
	}

	/**
	 	* 8.3.1
		* Get all bonds with history.
		* If the `historyDate` parameter is provided, then for each bond
		* a single (the earliest) history record (`bondHistory`)
		* with `createdAt` greater than or equal to the given `historyDate` will be included.
		* Used to take the filter `historyDate` into account.
	*/
	public async getAllBondsWithHistory(historyDate?: string,): Promise<Array<Bond & { bondHistory: Array<BondHistory>}>> {
		return this.prismaService.bond.findMany({
			include: {
				...(historyDate ?
					{
						bondHistory: {
							where: {
								createdAt: {
									gte: historyDate,
								},
							},
							orderBy: {
								createdAt: 'asc',
							},
							take: 1,
						},
					} :
					{}),
			},
		},)
	}

	/**
	 	* 8.3.1
		* Get all equities with history.
		* If the `historyDate` parameter is provided, then for each equity
		* a single (the earliest) history record (`equityHistory`)
		* with `createdAt` greater than or equal to the given `historyDate` will be included.
		* Used to take the filter `historyDate` into account.
	*/
	public async getAllEquitiesWithHistory(historyDate?: string,): Promise<Array<Equity & { equityHistory: Array<EquityHistory>}>> {
		return this.prismaService.equity.findMany({
			include: {
				...(historyDate ?
					{
						equityHistory: {
							where: {
								createdAt: {
									gte: historyDate,
								},
							},
							orderBy: {
								createdAt: 'asc',
							},
							take: 1,
						},
					} :
					{}),
			},
		},)
	}

	/**
	 	* 8.3.1
		* Get all ETFs with history.
		* If the `historyDate` parameter is provided, then for each ETF
		* a single (the earliest) history record (`etfHistory`)
		* with `createdAt` greater than or equal to the given `historyDate` will be included.
		* Used to take the filter `historyDate` into account.
	*/
	public async getAllEtfsWithHistory(historyDate?: string,): Promise<Array<Etf & { etfHistory: Array<EtfHistory>}>> {
		return this.prismaService.etf.findMany({
			include: {
				...(historyDate ?
					{
						etfHistory: {
							where: {
								createdAt: {
									gte: historyDate,
								},
							},
							orderBy: {
								createdAt: 'asc',
							},
							take: 1,
						},
					} :
					{}),
			},
		},)
	}

	/**
 * CR-053
 * Retrieves a list of all currency data from the database for cash asset creation.
 * @returns A promise that resolves to an array of `CurrencyData` objects.
 *
 * This method retrieves all currency data stored in the database by calling `thirdPartyPrismaService.currencyData.findMany()`.
 * It returns an array of `CurrencyData` objects hvae not been already created for cash asset.
 *
 * Error Handling:
 * - If an error occurs during the data retrieval, an exception may be thrown and handled by the calling code or global error handler.
 */
	public async getAllCurrenciesForCash(accountId?: string,): Promise<Array<CurrencyData>> {
		const assets = await this.prismaService.asset.findMany({
			where: {
				assetName: AssetNamesType.CASH,
				accountId,
			},
		},)
		const currencyArray = assets.map((asset,) => {
			const parsedAsset = assetParser<ICashAsset>(asset,)
			return parsedAsset?.currency
		},)
		const currencies = await this.prismaService.currencyData.findMany()
		if (!accountId) {
			return currencies
		}
		return currencies.filter((currency,) => {
			return !currencyArray.includes(currency.currency,)
		},)
	}

	/**
 * 3.5.2
 * Calculates the exchanged value of a given currency to USD based on a provided exchange rate.
 * @param data - The `ExchangeCurrencyToUSDDto` object containing the currency and its value to be exchanged.
 * @param currencyList - An array of `CurrencyData` objects containing available currency rates.
 * @returns The exchanged value in USD. If the currency is not found in the list, it returns 0.
 *
 * This method calculates the exchanged value of a specified currency to USD by finding the corresponding exchange rate from a list of available currencies.
 * It multiplies the provided `currencyValue` by the exchange rate (`rate`) from the `currencyData` matching the given `currency`.
 * If no matching `currency` is found, it returns 0 to indicate an invalid or missing currency.
 *
 * Error Handling:
 * - If the specified currency does not exist in the `currencyList`, the method returns 0.
 */
	public getCurrencyValueExchangedToUSD = (data: ExchangeCurrencyToUSDDto, currencyList: Array<CurrencyData>,): number => {
		const {currency, currencyValue,} = data
		const currencyData = currencyList.find((item,) => {
			return item.currency === currency
		},)
		if (!currencyData) {
			return 0
		}
		return parseFloat((currencyValue * currencyData.rate).toFixed(2,),)
	}

	/**
 		* CR-135
 		* Calculates the exchanged value of a given currency to USD using either the historical or current exchange rate.
 		* @param data - The `ICurrencyRateExchangeWithHistory` object containing the currency, value, list of available currencies, and optional history flag.
 		* @returns The exchanged value in USD. Returns 0 if the currency is not found in the list.
 		*
 		* This method searches for the specified `currency` in the provided `currencyList`. If found, it determines the applicable exchange rate:
 		* - If `historyDate` is truthy, it uses the first rate in `currencyHistory` if available; otherwise, it uses the current `rate`.
 		* - If `historyDate` is falsy, it directly uses the current `rate`.
 		*
 		* It multiplies the provided `currencyValue` by the determined rate and returns the result, rounded to two decimal places.
 		*
 		* Error Handling:
 		* - If the specified `currency` does not exist in the `currencyList`, the method returns 0.
 		* - If `currencyHistory` is missing or empty, it falls back to the current rate.
 	*/
	public getCurrencyValueExchangedToUSDWithHistory = (data: ICurrencyRateExchangeWithHistory,): number => {
		const {currency, currencyValue, currencyList, historyDate,} = data
		const currencyData = currencyList.find((item,) => {
			return item.currency === currency
		},)
		if (!currencyData) {
			return 0
		}
		const rate = historyDate ?
			currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
			currencyData.rate
		return parseFloat((currencyValue * rate).toFixed(2,),)
	}

	/**
 * 3.5.2
 * Converts a USD value into the equivalent amount of a specified currency using the exchange rate.
 * @param data - USD value and target currency.
 * @param currencyList - Available currencies with their exchange rates.
 * @returns Converted currency amount. Returns 0 if the currency is not found.
 */
	public getCurrencyAmount = (data: TUsdToCurrencyData, currencyList: Array<CurrencyData>,): number => {
		const {currency, usdValue,} = data
		const currentCurrency = currencyList.find((item,) => {
			return item.currency === currency
		},)
		if (!currentCurrency) {
			return 0
		}
		return parseFloat((usdValue / currentCurrency.rate).toFixed(2,),)
	}

	/**
 * 3.5.2
 * Calculates the exchanged value of a given currency to USD based on a provided exchange rate.
 * @param data - The `ExchangeCurrencyToUSDDto` object containing the currency and its value to be exchanged.
 * @param currencyList - An array of `CurrencyData` objects containing available currency rates.
 * @returns The exchanged value in USD. If the currency is not found in the list, it returns 0.
 *
 * This method calculates the exchanged value of a specified currency to USD by finding the corresponding exchange rate from a list of available currencies.
 * It multiplies the provided `currencyValue` by the exchange rate (`rate`) from the `currencyData` matching the given `currency`.
 * If no matching `currency` is found, it returns 0 to indicate an invalid or missing currency.
 *
 * Error Handling:
 * - If the specified currency does not exist in the `currencyList`, the method returns 0.
 */
	public getCryptoValueExchangedToUSD = (data: ExchangeCryptoToUSDDto, cryptoList: Array<CryptoData>,): number => {
		const {token, cryptoAmount,} = data
		const currencyData = cryptoList.find((item,) => {
			return item.token === token
		},)
		if (!currencyData) {
			return 0
		}
		return parseFloat((cryptoAmount * currencyData.rate).toFixed(2,),)
	}

	/**
 	* 3.5.2
 	* Calculates the exchanged value of a given metal to USD based on a provided exchange rate.
 	* @param data - The `ExchangeMetalToUSDDto` object containing the metal type and units to be exchanged.
 	* @param metalList - An array of `MetalData` objects containing available metal exchange rates.
 	* @returns The exchanged value in USD. If the metal type is not found in the list, it returns 0.
 	*
 	* This method calculates the exchanged value of a specified metal type to USD by finding the corresponding exchange rate
 	* from a list of available metals. It multiplies the provided `units` by the exchange rate (`rate`) from the `currencyData`
 	* matching the given `metalType`.
 	* If no matching `metalType` is found, it returns 0 to indicate an invalid or missing metal.
 	*
 	* Error Handling:
 	* - If the specified metal type does not exist in the `metalList`, the method returns 0.
 	*/
	public getMetalValueExchangedToUSD = (data: ExchangeMetalToUSDDto, metalList: Array<MetalData>,): number => {
		const {metalType, units,} = data
		const currencyData = metalList.find((item,) => {
			return item.currency === metalType
		},)
		if (!currencyData) {
			return 0
		}
		return parseFloat((units * currencyData.rate).toFixed(2,),)
	}

	/**
 		* CR-135
 		* Calculates the exchanged value of a given metal to USD using either the historical or current exchange rate.
 		* @param data - The `IMetalRateExchangeWithHistory` object containing the metal type, units, metal list, and optional history date.
 		* @returns The exchanged value in USD. If the metal type is not found in the metal list, it returns 0.
 		*
 		* This method finds the corresponding metal from the provided `metalList` based on the `metalType`.
 		* It then determines the appropriate exchange `rate` based on the `historyDate` flag:
 		* - If `historyDate` is truthy, it uses the first entry in the `currencyHistory` (if available).
 		* - Otherwise, it uses the current `rate`.
 		* The method multiplies the rate by the `units` and returns the value rounded to two decimal places.
 		*
 		* Error Handling:
 		* - If the specified `metalType` does not exist in the `metalList`, the method returns 0.
 		* - If `currencyHistory` is not available, falls back to the current rate.
 	*/
	public getMetalValueExchangedToUSDWithHistory = (data: IMetalRateExchangeWithHistory,): number => {
		const {metalType, units, metalList, historyDate,} = data
		const currencyData = metalList.find((item,) => {
			return item.currency === metalType
		},)
		if (!currencyData) {
			return 0
		}
		const rate = historyDate ?
			currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
			currencyData.rate
		return parseFloat((units * rate).toFixed(2,),)
	}

	public getMetalMarketPriceWithHistory = (data: IGetMetalMarketPriceWithHistory,): number => {
		const {metalType, metalList, currencyList, historyDate, currency,} = data
		const metalData = metalList.find((item,) => {
			return item.currency === metalType
		},)
		const currencyData = currencyList.find((item,) => {
			return item.currency === currency
		},)
		if (!currencyData || !metalData) {
			return 0
		}
		const metalRateToUsd = historyDate ?
			metalData.currencyHistory?.[0]?.rate ?? metalData.rate :
			metalData.rate
		const currencyRate = historyDate ?
			currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
			currencyData.rate
		return parseFloat((metalRateToUsd / currencyRate).toFixed(2,),)
	}

	/**
 * 3.5.2
 * Retrieves the exchange rate of a specified metal and its full name.
 * @param data - Metal type.
 * @param metalList - List of metal exchange data.
 * @returns Object with `rate` and `metalName`, or null if not found.
 */
	public getMetalRateToUSD = (data: IMetalRateExchangeWithHistory,): IMetalRateName | null => {
		const {metalType,metalList, historyDate,} = data
		const currencyData = metalList.find((item,) => {
			return item.currency === metalType
		},)
		if (!currencyData) {
			return null
		}
		const rate = historyDate ?
			currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
			currencyData.rate
		return {rate, metalName: this.getMetalFullName(currencyData.currency,),}
	}

	/**
 * Returns the human-readable name of a metal given its currency code.
 * @param metalName - Enum value representing the metal type.
 * @returns Full name (e.g. 'Gold', 'Silver').
 * @throws If metal is unknown.
 */
	public getMetalFullName = (metalName: MetalDataList,): string => {
		switch (metalName) {
		case MetalDataList.XAU:
			return 'Gold'
		case MetalDataList.XAG:
			return 'Silver'
		case MetalDataList.XPT:
			return 'Platinum'
		case MetalDataList.XPD:
			return 'Palladium'
		default:
			throw new Error('Unknown metal',)
		}
	}

	/**
	 * 3.5.4
	 * Retrieves the exchange rate for a given currency.
	 * @param currency - The currency for which the exchange rate is needed.
	 * @param currencyList - An array of `CurrencyData` objects containing available exchange rates.
	 * @returns A number representing the exchange rate of the given currency, or `0` if the currency is not found.
	 *
	 * This method searches for the specified currency in the provided currency list and returns its exchange rate.
	 * If the currency is not found, it returns `0` as a default value.
	 *
	 * Error Handling:
	 * - If `currencyList` does not contain the specified currency, `0` is returned.
	 */
	public getCurrencyRate = (currency: CurrencyDataList, currencyList: Array<CurrencyData>,): number => {
		const currencyData = currencyList.find((item,) => {
			return item.currency === currency
		},)
		if (!currencyData) {
			return 0
		}
		return currencyData.rate
	}

	public getCurrencyId = (currency: CurrencyDataList, currencyList: Array<CurrencyData>,): string => {
		const currencyData = currencyList.find((item,) => {
			return item.currency === currency
		},)
		if (!currencyData) {
			return '2'
		}
		return currencyData.currencyId
	}

	/**
	  * 3.5.4
	 * Calculates the market value of bonds in USD based on the given data.
	 * @param data - An object containing `isin`, `bondList`, and `units`.
	 * @returns A number representing the total market value of the bonds in USD.
	 *
	 * This method searches for a bond in the provided bond list using the ISIN code.
	 * If the bond is found, it calculates the market value by multiplying the number of units by the bond's dirty price.
	 * If the bond is not found, it returns `0`.
	 *
	 * Error Handling:
	 * - If no bond is found for the given ISIN, `0` is returned.
	 * - If `dirtyPriceCurrency` is not a valid number, the function may return `NaN`, so ensure proper validation when using this method.
	 */
	// Old Version
	public getBondsMarketValueUSD = (data: IBondsMarketValueUSDCalculation,): number => {
		const {dirtyPriceCurrency, nominalPrice, units, rate, marketPrice,} = data
		if (!dirtyPriceCurrency || !nominalPrice) {
			return parseFloat((units * Number(marketPrice,) * 10 * rate).toFixed(2,),)
		}
		return parseFloat((units * Number(dirtyPriceCurrency,) / Number(nominalPrice,) * 1000 * rate).toFixed(2,),)
	}

	// New Versiom
	public getBondsMarketValueUSDNew = (data: IBondsMarketValueUSD,): number => {
		const {dirtyPriceCurrency, nominalPrice, units, rate, marketPrice,} = data
		if (!dirtyPriceCurrency || !nominalPrice) {
			return parseFloat((units * Number(marketPrice,) * 10 * rate).toFixed(2,),)
		}
		return parseFloat((units * Number(dirtyPriceCurrency,) / Number(nominalPrice,) * 1000 * rate).toFixed(2,),)
	}

	/**
	 * 3.5.4
	 * Calculates the market value of equities in USD based on the given data.
	 * @param data - An object containing `isin`, `cbondList`, and `units`.
	 * @returns A number representing the total market value of the equities in USD.
	 *
	 * This method searches for an equity in the provided list using the ISIN code.
	 * If the equity is found, it calculates the market value by multiplying the number of units by the last recorded price.
	 * If the equity is not found, it returns `0`.
	 *
	 * Error Handling:
	 * - If no equity is found for the given ISIN, `0` is returned.
	 * - If `last_price` is not a valid number, the function may return `NaN`, so ensure proper validation when using this method.
	 */
	public getEquitiesMarketValueInCurrency = (data: IEquitiesMarketValueUSDCalculation,): number => {
		const {isin, cbondList, units, rate, stockGrounds, currencyId, etfTradingGrounds,} = data
		const stockGroundItem = stockGrounds.find((item,) => {
			return item.isin === isin
		},)
		const etfTradingGroundItem = etfTradingGrounds.find((item,) => {
			return (item.isin === isin && item.main_trading_ground === '1' && currencyId === item.currency_id) || (item.isin === isin && currencyId === item.currency_id)
		},)
		const bond = cbondList.find((bond,) => {
			if (stockGroundItem) {
				if (currencyId === '12') {
					return (
						bond.isin === isin &&
					bond.trading_ground_id === stockGroundItem.trading_ground_id &&
					bond.currency_id === currencyId
					) || (
						bond.isin === isin &&
					bond.trading_ground_id === stockGroundItem.trading_ground_id &&
					bond.currency_id === '247'
					)
				}
				return bond.isin === isin && bond.trading_ground_id === stockGroundItem.trading_ground_id && bond.currency_id === currencyId
			}
			if (etfTradingGroundItem) {
				if (currencyId === '12') {
					return (
						bond.isin === isin &&
						bond.currency_id === currencyId
					) || (
						bond.isin === isin &&
						bond.currency_id === '247'
					)
				}
				return (
					bond.isin === isin &&
					bond.currency_id === currencyId &&
					bond.trading_ground_id === etfTradingGroundItem.trading_ground_id
				) || (
					bond.isin === isin &&
					bond.currency_id === currencyId
				)
			}
			return bond.isin === isin && bond.currency_id === currencyId
		},)
		if (!bond) {
			return 0
		}
		const isGBX = bond.currency_id === '247'
		return isGBX ?
			parseFloat((units * Number(bond.last_price ?? bond.close,) * rate  / 100).toFixed(2,) ,) :
			parseFloat((units * Number(bond.last_price ?? bond.close,) * rate).toFixed(2,),)
	}
}