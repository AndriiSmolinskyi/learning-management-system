/* eslint-disable prefer-destructuring */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable no-await-in-loop */
import {HttpException, HttpStatus, Inject, Injectable, Logger, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import type { AxiosResponse, } from 'axios'
import axios from 'axios'
import { PrismaService, CustomPrismaService,} from 'nestjs-prisma'
import type { Isins, Prisma,} from '@prisma/client'
import { type MetalDataList, type CBonds, CurrencyDataList,} from '@prisma/client'

import {
	formatGetEmissionsLink,
	formatGetTradingsNewLink,
	formatGetIndexValueNewLink,
	formatGetTradingsStocksFullNewLink,
	formatGetStocksTradingGroundsLink,
	formatGetStocksFullLink,
	formatGetEmitentsLink,
	metalApiIDs,
	formatGetEtfShareClassesDividends,
	formatGetEtfFunds,
	formatGetEtfShareClassesQuotes,
	formatGetEtfShareClassesTradingGrounds,
	filterValues,
} from '../cbonds-api.constants'
import { ERROR_MESSAGES, THIRD_PARTY_PRISMA_SERVICE, } from '../../../../shared/constants'
import { filterFields, filterOperators,} from '../cbonds-api.constants'

import { IsinTypeIds,} from '../cbonds-api.types'
import type {
	ICurrencyResponse,
	IEquityData,
	IEquityETFData,
	IGetEmissionsItem,
	IGetEmissionsResponse,
	IGetEmitentsResponse,
	IGetEtfDividendsResponse,
	IGetEtfFundsResponse,
	IGetEtfQuotesResponse,
	IGetEtfTradingGroundsResponse,
	IGetStocksFullResponse,
	IGetStocksTradingGroundsItem,
	IGetEquityTickerResponse,
	IGetTradingsNewItem,
	IGetTradingsNewItemResponse,
	IGetTradingStocksFullNewItemResponse,
	IGetBondTickerResponse,
	ICurrencyHistoryDate,
	IGetCurrencyHistoryDate,
	TBond,
	TEquity,
	TEtf,
	TEmitent,
} from '../cbonds-api.types'
import { SortOrder, } from '../../../../shared/types'
import { getDateInfo, } from '../../../../shared/utils/get-date-variables.util'
import { AssetNamesType, } from '../../../../modules/asset/asset.types'
import type { PrismaClient as ThirdPartyPrismaClient, Bond, Equity, Etf,} from '@third-party-prisma/client'
import * as XLSX from 'xlsx'
import path from 'path'
import * as fs from 'fs'

@Injectable()
export class CBondsApiService {
	private readonly apiLogin = this.configService.getOrThrow('CBONDS_API_LOGIN',)

	private readonly apiPassword = this.configService.getOrThrow('CBONDS_API_PASSWORD',)

	private readonly logger = new Logger(CBondsApiService.name,)

	constructor(
		@Inject(THIRD_PARTY_PRISMA_SERVICE,)
		private readonly thirdPartyPrismaService: CustomPrismaService<ThirdPartyPrismaClient>,
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
	) {}

	/**
  *  3.3.3 / 3.3.1
 * Retrieves and processes a list of offer data in batches.
 * @returns A promise that resolves to a JSON string containing all retrieved offer data.
 *
 * This method handles the process of fetching a large set of offer data by making multiple POST requests to a remote API in batches.
 * It starts with an offset and limit, and keeps fetching data until all available offer items are retrieved.
 * The `items` from each response are aggregated into a single list (`allItems`), which is returned as a JSON string after the final batch is processed.
 *
 * Error Handling:
 * - If an error occurs during the data retrieval process, an exception with a predefined message (`ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR`) is thrown with a `BAD_REQUEST` HTTP status.
 */
	public async getTradingsNew(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<Array<IGetTradingsNewItem>> {
		const allItems: Array<IGetTradingsNewItemResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		const {today, yesterday,} = getDateInfo()
		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN_CODE,
						operator: filterOperators.IN,
						value:    isins,
					},
				]
				if (!isCreating) {
					filters.unshift(
						{
							field:    filterFields.DATE,
							operator: filterOperators.GE,
							value:    yesterday,
						},
						{
							field:    filterFields.DATE,
							operator: filterOperators.LE,
							value:    today,
						},
						{
							field:    filterFields.TRADING_GROUND_ID,
							operator: filterOperators.EQ,
							value:    filterValues.BONDS_MAIN_TRADING_GROUND_ID,
						},
					)
				}
				const response = await axios.post<{items: Array<IGetTradingsNewItemResponse>}>(formatGetTradingsNewLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					sorting: [
						{
							field: filterFields.DATE,
							order: SortOrder.DESC,
						},
					],
					filters,
					fields: [
						{
							field: filterFields.TRADING_GROUND_ID,
						},
						{
							field: filterFields.ISIN_CODE,
						},
						{
							field: filterFields.INDICATIVE_PRICE,
						},
						{
							field: filterFields.CLEARANCE_PROFIT_EFFECT,
						},
						{
							field: filterFields.ACI,
						},
						{
							field: filterFields.DATE,
						},
						{
							field: filterFields.SELLING_QUOTE,
						},
						{
							field: filterFields.YTC_OFFER,
						},
						{
							field: filterFields.G_SPREAD,
						},
						{
							field: filterFields.DIRTY_PLACE_CURRENCY,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const prevData = prevCBonds?.tradingsNew ?
				JSON.parse(prevCBonds.tradingsNew as string,) :
				[]
			const mappedData: Array<IGetTradingsNewItem> = allItems.map((item,) => {
				const indicativePrice = item.indicative_price ??
					allItems.find((i,) => {
						return i.indicative_price !== null && i.isin_code === item.isin_code
					},)?.indicative_price ?? prevData.find((prevItem: IGetTradingsNewItem,) => {
					return prevItem.isin === item.isin_code
				},)?.indicative_price ?? '100'
				const dirtyPriceCurrency = item.dirty_price_currency ??
					allItems.find((i,) => {
						return i.dirty_price_currency !== null && i.isin_code === item.isin_code
					},)?.dirty_price_currency ?? prevData.find((prevItem: IGetTradingsNewItem,) => {
					return prevItem.isin === item.isin_code
				},)?.dirty_price_currency ?? null
				const filteredYield = item.clearance_profit_effect ??
					allItems.find((i,) => {
						return i.clearance_profit_effect !== null && i.isin_code === item.isin_code
					},)?.clearance_profit_effect ??  prevData.find((prevItem: IGetTradingsNewItem,) => {
					return prevItem.isin === item.isin_code
				},)?.clearance_profit_effect ?? null
				return {
					isin:        item.isin_code,
					marketPrice: indicativePrice,
					yield:       filteredYield,
					accrued:     item.aci,
					tradeDate: 		item.date ?
						new Date(item.date,).toISOString() :
						null,
					sellingQuote:       item.selling_quote,
					ytcOffer: 		        item.ytc_offer,
					gSpread:            item.g_spread,
					dirtyPriceCurrency,
				}
			},)

			const seen = new Map<string, IGetTradingsNewItem>()
			for (const item of mappedData) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.tradingsNew) {
				for (const item of JSON.parse(prevCBonds.tradingsNew as string,)) {
					const key = `${item.isin}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_TRADINGS_NEW_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getTradingsExtensionNew(isins: string,): Promise<Array<IGetTradingsNewItemResponse>> {
		const allItems: Array<IGetTradingsNewItemResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		const {today, yesterday, weekAgo, } = getDateInfo()
		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN_CODE,
						operator: filterOperators.IN,
						value:    isins,
					},
					{
						field:    filterFields.DATE,
						operator: filterOperators.GE,
						value:    yesterday,
					},
					{
						field:    filterFields.DATE,
						operator: filterOperators.LE,
						value:    today,
					},
					{
						field:    filterFields.TRADING_GROUND_ID,
						operator: filterOperators.EQ,
						value:    filterValues.BONDS_MAIN_TRADING_GROUND_ID,
					},
				]
				const response = await axios.post<{items: Array<IGetTradingsNewItemResponse>}>(formatGetTradingsNewLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					sorting: [
						{
							field: filterFields.DATE,
							order: SortOrder.DESC,
						},
					],
					filters,
					fields: [
						{
							field: filterFields.TRADING_GROUND_ID,
						},
						{
							field: filterFields.ISIN_CODE,
						},
						{
							field: filterFields.INDICATIVE_PRICE,
						},
						{
							field: filterFields.CLEARANCE_PROFIT_EFFECT,
						},
						{
							field: filterFields.ACI,
						},
						{
							field: filterFields.DATE,
						},
						{
							field: filterFields.SELLING_QUOTE,
						},
						{
							field: filterFields.YTC_OFFER,
						},
						{
							field: filterFields.G_SPREAD,
						},
						{
							field: filterFields.DIRTY_PLACE_CURRENCY,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const allItemsIsins = allItems.map((item,) => {
				return item.isin_code
			},)
			const arrayWithoudMainTradingGroundId = isins.split(';',).filter((isin,) => {
				return !allItemsIsins.includes(isin,)
			},)
			if (Boolean(arrayWithoudMainTradingGroundId.length,)) {
				const response = await axios.post<{items: Array<IGetTradingsNewItemResponse>}>(formatGetTradingsNewLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit:  1000,
						offset: 0,
					},
					sorting: [
						{
							field: filterFields.DATE,
							order: SortOrder.DESC,
						},
					],
					filters: [
						{
							field:    filterFields.ISIN_CODE,
							operator: filterOperators.IN,
							value:    arrayWithoudMainTradingGroundId.join(';',),
						},
						{
							field:    filterFields.DATE,
							operator: filterOperators.GE,
							value:    weekAgo,
						},
						{
							field:    filterFields.DATE,
							operator: filterOperators.LE,
							value:    today,
						},
					],
					fields: [
						{
							field: filterFields.TRADING_GROUND_ID,
						},
						{
							field: filterFields.ISIN_CODE,
						},
						{
							field: filterFields.INDICATIVE_PRICE,
						},
						{
							field: filterFields.CLEARANCE_PROFIT_EFFECT,
						},
						{
							field: filterFields.ACI,
						},
						{
							field: filterFields.DATE,
						},
						{
							field: filterFields.SELLING_QUOTE,
						},
						{
							field: filterFields.YTC_OFFER,
						},
						{
							field: filterFields.G_SPREAD,
						},
						{
							field: filterFields.DIRTY_PLACE_CURRENCY,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
			}

			const seen = new Map<string, IGetTradingsNewItemResponse>()
			for (const item of allItems) {
				const key = `${item.isin_code}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_TRADINGS_NEW_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 *  3.3.3 / 3.3.1
 * Retrieves and processes a list of emissions data.
 * @returns A promise that resolves to a JSON string containing all retrieved emissions data.
 *
 * This method handles the process of fetching a large set of emissions data in batches by making multiple POST requests to a remote API.
 * It starts with an offset and limit, and keeps fetching data until all available emissions are retrieved.
 * After all items are fetched, they are mapped to a new structure and upserted into the database using Prisma.
 * The following fields are retrieved from the API:
 * - ISIN Code (`isin_code`)
 * - Issuer Name (`formal_emitent_name_eng`)
 * - Security Ticker (`bbgid_ticker`)
 * - Currency Name (`currency_name`)
 * - Nominal Price (`nominal_price`)
 * - Maturity Date (`maturity_date`)
 * - Country Name (`emitent_country_name_eng`)
 * - Sector Name (`emitent_branch_name_eng`)
 * - Coupon Rate (`curr_coupon_rate`)
 * - Next Coupon Date (`curr_coupon_date`)
 * - Offert Date Call (`offert_date_call`)
 *
 * In case of an error, an exception with a message from `ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR` is thrown.
 */
	public async getBondIsinSecurity(isin: string,): Promise<string | number> {
		const response = await axios.post<{items: Array<IGetBondTickerResponse>}>(formatGetEmissionsLink(), {
			auth: {
				login:    this.apiLogin,
				password: this.apiPassword,
			},
			quantity: {
				limit:  1,
				offset: 0,
			},
			filters: [
				{
					field:    filterFields.ISIN_CODE,
					operator: filterOperators.EQ,
					value:    isin,
				},
			],
			fields: [
				{
					field: filterFields.BBGID_TICKER,
				},
			],
		},)
		if (!response.data.items[0]) {
			throw new HttpException(ERROR_MESSAGES.ISIN_NOT_EXISTS, HttpStatus.NOT_FOUND,)
		}
		return response.data.items[0].bbgid_ticker as string | number
	}

	/**
 * Retrieves emissions data based on the provided ISINs, merging with previous emissions data if available.
 *
 * @remarks
 * - The method fetches emissions data in paginated requests with a limit of 1000 items per request.
 * - It filters emissions by ISIN codes using the `isins` parameter and processes the data accordingly.
 * - If previous emissions data (`prevCBonds`) is provided, it merges the new data with the previous data, ensuring unique entries based on ISIN code.
 * - The data fetched includes various fields such as issuer, currency, nominal price, maturity date, coupon rate, and more.
 * - The method handles pagination, making repeated API calls until all relevant data is retrieved.
 *
 * @param prevCBonds - The previous emissions data to merge with the newly retrieved data. If null, it fetches only the new data.
 * @param isins - A comma-separated string of ISIN codes to filter the emissions data by.
 * @returns A Promise resolving to an array of emission items with unique ISIN entries.
 *
 * @throws {HttpException} - Throws an error if data retrieval fails.
 */
	public async getEmissions(prevCBonds: CBonds | null, isins: string,): Promise<Array<IGetEmissionsItem>> {
		const allItems: Array<IGetEmissionsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true

		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEmissionsResponse>}>(formatGetEmissionsLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN_CODE,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.ISIN_CODE,
						},
						{
							field: filterFields.BBGID_TICKER,
						},
						{
							field: filterFields.EMITENT_NAME_ENG,
						},
						{
							field: filterFields.CURRENCY_NAME,
						},
						{
							field: filterFields.MATURITY_DATE,
						},
						{
							field: filterFields.NOMINAL_PRICE,
						},
						{
							field: filterFields.EMITENT_COUNTRY_NAME_ENG,
						},
						{
							field: filterFields.EMITENT_BRANCH_NAME_ENG,
						},
						{
							field: filterFields.CURR_COUPON_RATE,
						},
						{
							field: filterFields.CURR_COUPON_DATE,
						},
						{
							field: filterFields.OFFERT_DATE_CALL,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const mappedData: Array<IGetEmissionsItem> = allItems.map((item,) => {
				return {
					isin:           item.isin_code,
					issuer:         item.emitent_name_eng,
					security:       item.bbgid_ticker,
					currency:       item.currency_name,
					nominalPrice:       item.nominal_price,
					maturityDate:     item.maturity_date ?
						new Date(item.maturity_date,).toISOString() :
						null,
					country:        item.emitent_country_name_eng,
					sector:         item.emitent_branch_name_eng,
					coupon:         item.curr_coupon_rate,
					nextCouponDate: item.curr_coupon_date ?
						new Date(item.curr_coupon_date,).toISOString() :
						null,
					offertDateCall: item.offert_date_call ?
						new Date(item.offert_date_call,).toISOString() :
						null,
				}
			},)
			const seen = new Map<string, IGetEmissionsItem>()
			for (const item of mappedData) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.emissions) {
				for (const item of JSON.parse(prevCBonds.emissions as string,)) {
					const key = `${item.isin}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_EMISSIONS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getEmissionsExtension(isins: string,): Promise<Array<IGetEmissionsResponse>> {
		const allItems: Array<IGetEmissionsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true

		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEmissionsResponse>}>(formatGetEmissionsLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN_CODE,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.ISIN_CODE,
						},
						{
							field: filterFields.BBGID_TICKER,
						},
						{
							field: filterFields.EMITENT_NAME_ENG,
						},
						{
							field: filterFields.CURRENCY_NAME,
						},
						{
							field: filterFields.MATURITY_DATE,
						},
						{
							field: filterFields.NOMINAL_PRICE,
						},
						{
							field: filterFields.EMITENT_COUNTRY_NAME_ENG,
						},
						{
							field: filterFields.EMITENT_BRANCH_NAME_ENG,
						},
						{
							field: filterFields.CURR_COUPON_RATE,
						},
						{
							field: filterFields.CURR_COUPON_DATE,
						},
						{
							field: filterFields.OFFERT_DATE_CALL,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			return allItems
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_EMISSIONS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 3.3.3
	 * Retrieves and processes a complete list of stock data in batches.
	 * @returns A promise that resolves to a JSON string containing all retrieved stock data.
	 *
	 * This method fetches stock data from a remote API by making multiple POST requests in paginated batches.
	 * It starts with an `offset` of 0 and a defined `limit`, iterating until all available stock data is collected.
	 * The retrieved `items` from each response are accumulated into the `allItems` array, which is then returned as a JSON string.
	 *
	 * Pagination:
	 * - The method continues fetching data while the number of retrieved items equals the specified `limit`.
	 * - The `offset` is incremented by `limit` after each request to fetch the next batch of data.
	 *
	 * API Request:
	 * - Sends authentication credentials (`apiLogin`, `apiPassword`) along with the request payload.
	 * - Requests specific fields including `currency_name`, `country_name_eng`, `id`, `emitent_id`, `emitent_name_eng`, and `isin`.
	 *
	 * Error Handling:
	 * - If an error occurs during the data retrieval process, an `HttpException` is thrown with a predefined message
	 *   (`ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR`) and an HTTP status of `BAD_REQUEST`.
	 */
	public async getStocksFull(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{stocksFull: string, stocksFullNewData: boolean,}> {
		const allItems: Array<IGetStocksFullResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetStocksFullResponse>}>(formatGetStocksFullLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.CURRENCY_NAME,
						},
						{
							field: filterFields.COUNTRY_NAME_ENG,
						},
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.EMITENT_ID,
						},
						{
							field: filterFields.EMITENT_NAME_ENG,
						},
						{
							field: filterFields.ISIN,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetStocksFullResponse>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.stocksFull) {
				for (const item of JSON.parse(prevCBonds.stocksFull as string,)) {
					const key = `${item.isin}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return {
				stocksFull:        JSON.stringify(uniqueData,),
				stocksFullNewData: Boolean(isCreating && allItems.length > 0,),
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_STOCKS_FULL_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getStocksFullExtension(isins: string,): Promise<Array<IGetStocksFullResponse>> {
		const allItems: Array<IGetStocksFullResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetStocksFullResponse>}>(formatGetStocksFullLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.CURRENCY_NAME,
						},
						{
							field: filterFields.COUNTRY_NAME_ENG,
						},
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.EMITENT_ID,
						},
						{
							field: filterFields.EMITENT_NAME_ENG,
						},
						{
							field: filterFields.ISIN,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetStocksFullResponse>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)

			return uniqueData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_STOCKS_FULL_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 	* 3.3.3
 	* Retrieves a complete list of emitent data in paginated batches.
 	* @returns A promise that resolves to a JSON string containing all retrieved emitent data.
 	*
 	* This method fetches emitent data from a remote API by making multiple POST requests in paginated batches.
 	* It begins with an `offset` of 0 and a defined `limit` of 1000 items per request, continuing the process until
 	* all available emitent data is retrieved.
 	* The retrieved `items` from each response are accumulated into the `allItems` array, which is then returned as a JSON string.
 	*
 	* Pagination:
 	* - The method continues fetching data while the number of items in each response equals the specified `limit`.
 	* - The `offset` is incremented by `limit` after each request to fetch the next batch of data.
 	*
 	* API Request:
 	* - Sends authentication credentials (`apiLogin`, `apiPassword`) as part of the request payload.
 	* - Requests specific fields such as `id` and `branch_name_eng` for each emitent.
 	*
 	* Error Handling:
 	* - If an error occurs during the data retrieval process, an `HttpException` is thrown with a predefined message
 	*   (`ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR`) and an HTTP status of `BAD_REQUEST`.
 	*/
	public async getEmitents(prevCBonds: CBonds | null,): Promise<string> {
		const allItems: Array<IGetEmitentsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		const {today, yesterday,} = getDateInfo()

		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEmitentsResponse>}>(formatGetEmitentsLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.UPDATING_DATE,
							operator: filterOperators.GE,
							value:    yesterday,
						},
						{
							field:    filterFields.UPDATING_DATE,
							operator: filterOperators.LE,
							value:    today,
						},
					],
					fields: [
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.BRANCH_NAME_ENG,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEmitentsResponse>()
			for (const item of allItems) {
				const key = `${item.id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.emitents) {
				for (const item of JSON.parse(prevCBonds.emitents as string,)) {
					const key = `${item.id}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return JSON.stringify(uniqueData,)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_EMITENTS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	// Version after refacot
	public async getEmitentsWithBranchIds(id: string,): Promise<Array<TEmitent>> {
		const allItems: Array<IGetEmitentsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true

		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEmitentsResponse>}>(formatGetEmitentsLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ID,
							operator: filterOperators.IN,
							value:    id,
						},
					],
					fields: [
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.BRANCH_NAME_ENG,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEmitentsResponse>()
			for (const item of allItems) {
				const key = `${item.id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
				.map((item,) => {
					if (!item.branch_name_eng) {
						return null
					}
					return {
						id:            item.id,
						branchNameEng: item.branch_name_eng,
					}
				},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			return uniqueData
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_EMITENTS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * 3.3.3
 * Retrieves trading stock data from an external API using paginated requests.
 * @returns A promise that resolves to a JSON string containing all retrieved stock trading data.
 *
 * This method performs multiple paginated API requests to collect trading stock information.
 * It starts with an initial `offset` and iterates through the dataset in batches of `limit` items
 * until all available data is fetched.
 *
 * Pagination:
 * - The method keeps making requests while the received `items` count matches the `limit`.
 * - The `offset` increases by `limit` after each request to fetch the next batch.
 *
 * Data Structure:
 * - The response contains an array of `items`, each representing stock trading details.
 * - Relevant fields include `isin`, `ticker`, `id`, `emitent_branch_id`, and `trading_ground_name_eng`.
 * - All retrieved items are stored in `allItems` and returned as a JSON string.
 *
 * Error Handling:
 * - If an API call fails, an `HttpException` is thrown with the message
 *   (`ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR`) and an HTTP status of `BAD_REQUEST`.
 */
	public async getStocksTradingGrounds(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{stocksTradingGrounds: string, stocksTradingGroundsNewData: boolean}> {
		const allItems: Array<IGetStocksTradingGroundsItem> = []
		const limit = 1000
		let offset = 0
		let hasMore = true

		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetStocksTradingGroundsItem>}>(formatGetStocksTradingGroundsLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
						{
							field:    filterFields.MAIN_TRADING_GROUND,
							operator: filterOperators.EQ,
							value:    filterValues.EQUITIES_MAIN_TRADING_GROUND_ID,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.TICKER,
						},
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.EMITENT_BRANCH_ID,
						},
						{
							field: filterFields.TRADING_GROUND_NAME_ENG,
						},
						{
							field: filterFields.EMITENT_NAME_ENG,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetStocksTradingGroundsItem>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.stocksTradingGrounds) {
				for (const item of JSON.parse(prevCBonds.stocksTradingGrounds as string,)) {
					const key = `${item.isin}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return {
				stocksTradingGrounds:        JSON.stringify(uniqueData,),
				stocksTradingGroundsNewData:  Boolean(isCreating && allItems.length > 0,),
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_STOCKS_TRADINGS_GROUNDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getStocksTradingGroundsExtension(isins: string,): Promise<Array<IGetStocksTradingGroundsItem>> {
		const allItems: Array<IGetStocksTradingGroundsItem> = []
		const limit = 1000
		let offset = 0
		let hasMore = true

		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetStocksTradingGroundsItem>}>(formatGetStocksTradingGroundsLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
						{
							field:    filterFields.MAIN_TRADING_GROUND,
							operator: filterOperators.EQ,
							value:    filterValues.EQUITIES_MAIN_TRADING_GROUND_ID,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.TICKER,
						},
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.EMITENT_BRANCH_ID,
						},
						{
							field: filterFields.TRADING_GROUND_NAME_ENG,
						},
						{
							field: filterFields.EMITENT_NAME_ENG,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetStocksTradingGroundsItem>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_STOCKS_TRADINGS_GROUNDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * 3.3.3
 * Retrieves and processes a list of trading stock data in batches.
 * @returns A promise that resolves to a JSON string containing all retrieved trading stock data.
 *
 * This method fetches trading stock data from a remote API by making multiple POST requests in batches.
 * It starts with an initial `offset` and `limit`, retrieving data iteratively until all available stock data is collected.
 * The retrieved `items` from each response are accumulated into the `allItems` array, which is then returned as a JSON string.
 *
 * Pagination:
 * - The method continues fetching data while the number of retrieved items equals the specified `limit`.
 * - The `offset` is incremented by `limit` after each request to fetch the next batch of data.
 *
 * Error Handling:
 * - If an error occurs during the data retrieval process, an `HttpException` is thrown with a predefined message
 *   (`ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR`) and an HTTP status of `BAD_REQUEST`.
 */
	public async getTradingsStocksFullNew(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{tradingsStocksFullNew: string, isTradingsStocksFullNewData: boolean}> {
		const allItems: Array<IGetTradingStocksFullNewItemResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		const {today, yesterday,} = getDateInfo()
		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN,
						operator: filterOperators.IN,
						value:    isins,
					},
				]
				if (!isCreating) {
					filters.unshift(
						{
							field:    filterFields.TRADING_DATE,
							operator: filterOperators.GE,
							value:    yesterday,
						},
						{
							field:    filterFields.TRADING_DATE,
							operator: filterOperators.LE,
							value:    today,
						},
					)
				}
				const response = await axios.post<{items: Array<IGetTradingStocksFullNewItemResponse>}>(formatGetTradingsStocksFullNewLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters,
					sorting: [
						{
							field: filterFields.TRADING_DATE,
							order:  SortOrder.DESC,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.LAST_PRICE,
						},
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.CURRENCY_ID,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetTradingStocksFullNewItemResponse>()
			for (const item of allItems) {
				if (item.last_price === null) {
					continue
				}
				const key = `${item.isin}-${item.currency_id}-${item.trading_ground_id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			if (prevCBonds?.tradingsStocksFullNew) {
				for (const item of JSON.parse(prevCBonds.tradingsStocksFullNew as string,)) {
					if (item.last_price === null) {
						continue
					}
					const key = `${item.isin}-${item.currency_id}-${item.trading_ground_id}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return {
				tradingsStocksFullNew:       JSON.stringify(uniqueData,),
				isTradingsStocksFullNewData:  Boolean(isCreating && allItems.length > 0,),
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_TRADINGS_FULL_NEW_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getTradingsStocksFullNewExtension(isins: string,): Promise<Array<IGetTradingStocksFullNewItemResponse>> {
		const allItems: Array<IGetTradingStocksFullNewItemResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		const {today, yesterday,} = getDateInfo()
		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN,
						operator: filterOperators.IN,
						value:    isins,
					},
					{
						field:    filterFields.TRADING_DATE,
						operator: filterOperators.GE,
						value:    yesterday,
					},
					{
						field:    filterFields.TRADING_DATE,
						operator: filterOperators.LE,
						value:    today,
					},
				]
				const response = await axios.post<{items: Array<IGetTradingStocksFullNewItemResponse>}>(formatGetTradingsStocksFullNewLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters,
					sorting: [
						{
							field: filterFields.TRADING_DATE,
							order:  SortOrder.DESC,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.LAST_PRICE,
						},
						{
							field: filterFields.ID,
						},
						{
							field: filterFields.CURRENCY_ID,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},,
						{
							field: filterFields.TRADING_DATE,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetTradingStocksFullNewItemResponse>()
			for (const item of allItems) {
				if (item.last_price === null) {
					continue
				}
				const key = `${item.isin}-${item.currency_id}-${item.trading_ground_id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_TRADINGS_FULL_NEW_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * Retrieves the ticker for a given ISIN code based on the type of ISIN (Equity or ETF).
 *
 * @remarks
 * - If the provided ISIN corresponds to an equity (IsinTypeIds.EQUITY), it queries the stocks trading grounds for the ticker.
 * - If the ISIN corresponds to an ETF, it queries the ETF funds for the ticker.
 * - The method handles both cases by making appropriate API requests for equities or ETFs, filtering by the ISIN and limiting the result to one item.
 * - If the ISIN does not exist in the database (no matching item), an error is thrown with a `NOT_FOUND` HTTP status.
 *
 * @param isins - The ISIN code to look up.
 * @param typeId - The type of ISIN (either `EQUITY` or `ETF`), used to determine which API to query.
 * @returns A Promise resolving to the ticker of the ISIN.
 *
 * @throws {HttpException} - Throws an exception if the ISIN does not exist in the database.
 */
	public async getEquityIsinSecurity(isins: string, typeId: IsinTypeIds,): Promise<string | number> {
		if (typeId === IsinTypeIds.EQUITY) {
			const response = await axios.post<{items: Array<IGetEquityTickerResponse>}>(formatGetStocksTradingGroundsLink(), {
				auth: {
					login:    this.apiLogin,
					password: this.apiPassword,
				},
				quantity: {
					limit:  1,
					offset: 0,
				},
				filters: [
					{
						field:    filterFields.ISIN,
						operator: filterOperators.EQ,
						value:    isins,
					},
				],
				fields: [
					{
						field: filterFields.TICKER,
					},
				],
			},)
			if (!response.data.items[0]) {
				throw new HttpException(ERROR_MESSAGES.ISIN_NOT_EXISTS, HttpStatus.NOT_FOUND,)
			}
			return response.data.items[0].ticker as string | number
		}
		const response = await axios.post<{items: Array<IGetEquityTickerResponse>}>(formatGetEtfFunds(), {
			auth: {
				login:    this.apiLogin,
				password: this.apiPassword,
			},
			quantity: {
				limit:  1,
				offset: 0,
			},
			filters: [
				{
					field:    filterFields.ISIN,
					operator: filterOperators.EQ,
					value:    isins,
				},
			],
			fields: [
				{
					field: filterFields.TICKER,
				},
			],
		},)
		if (!response.data.items[0]) {
			throw new HttpException(ERROR_MESSAGES.ISIN_NOT_EXISTS, HttpStatus.NOT_FOUND,)
		}
		return response.data.items[0].ticker as string | number
	}

	/**
 * Retrieves the latest metal rates (XAG, XAU, XPD, XPT) from an external API and updates them in the database.
 * @returns A promise that resolves when the metal rates are successfully updated in the database.
 *
 * This method performs multiple API requests to fetch the latest values for different metals (XAG, XAU, XPD, XPT)
 * from an external API. It uses `axios` to make POST requests with authentication and filters to retrieve the
 * relevant data for each metal.
 *
 * Data Structure:
 * - The API responses contain an array of `items`, each having a `date` and `value`. The latest `value`
 *   is determined by sorting the items based on the `date` field.
 * - The method extracts the latest value for each metal and prepares an object (`metalRates`) mapping
 *   each metal's symbol (XAG, XAU, XPD, XPT) to its latest rate.
 *
 * Database Update:
 * - The method then upserts the extracted rates for each metal into the database using Prisma's `upsert` method.
 *   If the metal's rate already exists, it is updated; otherwise, a new record is created.
 *
 * Error Handling:
 * - If an error occurs during the API requests or database update process, an `HttpException` is thrown with the
 *   message (`ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR`) and an HTTP status of `BAD_REQUEST`.
 *
 * Example:
 * - If the latest rate for XAG is "974.4205", it will be upserted in the `metalData` table with the corresponding
 *   `currency` and `rate` values.
 */
	public async getMetalRates(): Promise<void> {
		try {
			const metals = await Promise.all([

				/** XAG*/
				axios.post(formatGetIndexValueNewLink(), {
					auth:    { login: this.apiLogin, password: this.apiPassword, },
					filters: [{ field: filterFields.TYPE_ID, operator: filterOperators.EQ, value: metalApiIDs.XAG, },],
				},),

				/** XAU*/
				axios.post(formatGetIndexValueNewLink(), {
					auth:    { login: this.apiLogin, password: this.apiPassword, },
					filters: [{ field: filterFields.TYPE_ID, operator: filterOperators.EQ, value: metalApiIDs.XAU, },],
				},),

				/** XPD*/
				axios.post(formatGetIndexValueNewLink(), {
					auth:    { login: this.apiLogin, password: this.apiPassword, },
					filters: [{ field: filterFields.TYPE_ID, operator: filterOperators.EQ, value: metalApiIDs.XPD, },],
				},),

				/** XPT*/
				axios.post(formatGetIndexValueNewLink(), {
					auth:    { login: this.apiLogin, password: this.apiPassword, },
					filters: [{ field: filterFields.TYPE_ID, operator: filterOperators.EQ, value: metalApiIDs.XPT, },],
				},),
			],)
			const getLatestValue = (response: AxiosResponse,): string | null => {
				const { items, } = response.data
				if (!Array.isArray(items,) || items.length === 0) {
					return null
				}
				const [latestItem,] = items.sort((a, b,) => {
					return b.date.localeCompare(a.date,)
				},)
				return latestItem?.value ?? null
			}

			const metalRates = {
				XAG: getLatestValue(metals[0],),
				XAU: getLatestValue(metals[1],),
				XPD: getLatestValue(metals[2],),
				XPT: getLatestValue(metals[3],),
			}
			const updates = Object.entries(metalRates,).map(async([currency, rate,],) => {
				if (!currency || !rate) {
					return
				} const parsedRate = parseFloat(rate,)
				const parsedDate = new Date().toISOString()
				const metalThirdParty = await this.thirdPartyPrismaService.client.metalData.upsert({
					where:  { currency: currency as MetalDataList, },
					update: { rate: parsedRate, },
					create: {
						currency: currency as MetalDataList,
						rate:     parsedRate,
					},
				},)
				await this.thirdPartyPrismaService.client.metalHistoryData.create({
					data: {
						rate:       parsedRate,
						date:       parsedDate,
						currencyId: metalThirdParty.id,
					},
				},)
				const metal = await this.prismaService.metalData.upsert({
					where:  { currency: currency as MetalDataList, },
					update: { rate: parsedRate, },
					create: {
						currency: currency as MetalDataList,
						rate:     parsedRate,
					},
				},)
				await this.prismaService.metalHistoryData.create({
					data: {
						rate:       parsedRate,
						date:       parsedDate,
						currencyId: metal.id,
					},
				},)
			},)
			await Promise.all(updates,)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_METAL_RATES_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 	* Retrieves the latest currency rates based on `typeId` from an external API and updates them in the database.
 	* @returns A promise that resolves when all the currency rates are successfully updated in the database.
 	*
 	* This method fetches a list of all `typeId` values from the `currencyData` table where `typeId` is not null.
 	* For each `typeId`, it makes a POST request to an external API using `axios`, passing authentication credentials
 	* and filtering the results to retrieve only the `RATE_VALUE` and `TYPE_ID` fields.
 	*
 	* Data Structure:
 	* - The API response for each request contains an array of `items`, where each item includes the latest
 	*   currency `value` (rate).
 	* - The method uses the first item in the response (as limited to 1 item per request) and extracts the `value`
 	*   field, which is then interpreted as the latest rate.
 	*
 	* Database Update:
 	* - After receiving the rate, the method updates all records in the `currencyData` table that match the given `typeId`,
 	*   setting the `rate` field to the newly fetched value (converted to a number).
 	*
 	* Parallel Execution:
 	* - All API calls and database updates are executed in parallel using `Promise.all` to improve performance.
 	*
 	* Error Handling:
 	* - If no items are returned from the API for a given `typeId`, that entry is skipped.
 	* - If `typeId` is null or invalid, it is also skipped and not processed.
   */
	public async getCurrencyRates(): Promise<void> {
		try {
			const typeIds = await this.prismaService.currencyData.findMany({
				where: {
					currency: {
						not: CurrencyDataList.USD,
					},
				},
				select: {
					typeId: true,
					id:     true,
				},
			},)
			const typeIdsString = typeIds.map(({ typeId, },) => {
				return typeId
			},).join(';',)
			const date = new Date()
			date.setDate(date.getDate() - 1,)
			const formatted = new Intl.DateTimeFormat('en-CA',).format(date,)
			const historyData = await this.currencyHistoryRate({typeIds: typeIdsString, limit: typeIds.length, date: formatted,},)
			const data: Array<ICurrencyHistoryDate> = historyData.map((item,) => {
				const prevCurrency = typeIds.find((currency,) => {
					return currency.typeId === item.type_id
				},)
				if (!prevCurrency?.id) {
					return null
				}
				return {
					rate:       Number(item.value,),
					date:       new Date().toISOString(),
					currencyId: prevCurrency.id,
				}
			},)
				.filter((item,): item is ICurrencyHistoryDate => {
					return item !== null
				},)
			await this.thirdPartyPrismaService.client.currencyHistoryData.createMany({data,},)
			await this.prismaService.currencyHistoryData.createMany({data,},)
			await Promise.all(
				historyData.map(async(item,) => {
					const rate = parseFloat(item.value,)
					if (isNaN(rate,)) {
						return null
					}
					await this.prismaService.currencyData.update({
						where: { typeId: item.type_id, },
						data:  { rate, },
					},)
					return this.thirdPartyPrismaService.client.currencyData.update({
						where: { typeId: item.type_id, },
						data:  { rate, },
					},)
				},),
			)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_CURRENCY_RATES_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getHistoryCurrencyRates(date: string,): Promise<void> {
		try {
			const typeIds = await this.thirdPartyPrismaService.client.currencyData.findMany({
				where: {
					currency: {
						not: CurrencyDataList.USD,
					},
				},
				select: {
					typeId: true,
					id:     true,
				},
			},)
			const typeIdsString = typeIds.map(({ typeId, },) => {
				return typeId
			},).join(';',)
			const items = await this.currencyHistoryRate({typeIds: typeIdsString, limit: typeIds.length, date,},)
			const data: Array<ICurrencyHistoryDate> = items.map((item,) => {
				const prevCurrency = typeIds.find((currency,) => {
					return currency.typeId === item.type_id
				},)
				if (!prevCurrency?.id) {
					return null
				}
				return {
					rate:       Number(item.value,),
					date:       new Date(date,).toISOString(),
					currencyId: prevCurrency.id,
				}
			},)
				.filter((item,): item is ICurrencyHistoryDate => {
					return item !== null
				},)
			await this.thirdPartyPrismaService.client.currencyHistoryData.createMany({data,},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_CURRENCY_RATES_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	// Equity / ETF
	/**
 * Retrieves the dividends of ETF share classes based on the provided ISIN codes.
 *
 * @remarks
 * - The method queries the API for ETF share class dividend information, specifically the ISIN code and the distribution amount.
 * - It fetches the data in batches of 1000 items, using pagination (`limit` and `offset`).
 * - The results from multiple requests are aggregated and filtered to include only unique items based on the ISIN.
 * - If previous data (`prevCBonds`) is provided, it combines the new data with the previous one to ensure unique entries.
 * - If the API request fails or returns an error, a `BAD_REQUEST` HTTP exception is thrown.
 *
 * @param prevCBonds - The previous CBonds data to combine with the new results (if available).
 * @param isins - The ISIN codes to query for ETF dividends.
 * @returns A Promise resolving to a JSON string containing the unique dividend data (ISIN and distribution amount).
 *
 * @throws {HttpException} - Throws an exception if there is an error retrieving data from the API.
 */
	public async getEtfShareClassesDividends(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{etfDividends: string, etfDividendsData: boolean}> {
		const allItems: Array<IGetEtfDividendsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEtfDividendsResponse>}>(formatGetEtfShareClassesDividends(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.DISTRIBUTION_AMOUNT,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfDividendsResponse>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.etfDividends) {
				for (const item of JSON.parse(prevCBonds.etfDividends as string,)) {
					const key = `${item.isin}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return {
				etfDividends:     JSON.stringify(uniqueData,),
				etfDividendsData: Boolean(isCreating && allItems.length > 0,),
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_DIVIDENDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getEtfShareClassesDividendsExtension(isins: string,): Promise<Array<IGetEtfDividendsResponse>> {
		const allItems: Array<IGetEtfDividendsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEtfDividendsResponse>}>(formatGetEtfShareClassesDividends(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.DISTRIBUTION_AMOUNT,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfDividendsResponse>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_DIVIDENDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * Retrieves ETF fund details based on the provided ISIN codes.
 *
 * @remarks
 * - The method queries the API for ETF fund information, including ISIN, currency, geography, sector, ticker, fund name, and trading ground.
 * - It fetches the data in batches of 1000 items using pagination (`limit` and `offset`).
 * - The results from multiple requests are aggregated and filtered to include only unique items based on the ISIN.
 * - If previous data (`prevCBonds`) is provided, it combines the new data with the previous one to ensure unique entries.
 * - If the API request fails or returns an error, a `BAD_REQUEST` HTTP exception is thrown.
 *
 * @param prevCBonds - The previous CBonds data to combine with the new results (if available).
 * @param isins - The ISIN codes to query for ETF fund details.
 * @returns A Promise resolving to a JSON string containing the unique ETF fund data (ISIN, currency, geography, sector, ticker, fund name, trading ground).
 *
 * @throws {HttpException} - Throws an exception if there is an error retrieving data from the API.
 */
	public async getEtfFunds(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{etfFunds: string, etfFundsData: boolean,}> {
		const allItems: Array<IGetEtfFundsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEtfFundsResponse>}>(formatGetEtfFunds(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.ETF_CURRENCY_NAME,
						},
						{
							field: filterFields.GEOGRAPHY_INVESTMENT_NAME_ENG,
						},
						{
							field: filterFields.SECTOR_NAME_ENG,
						},
						{
							field: filterFields.TICKER,
						},
						{
							field: filterFields.FUNDS_NAME_ENG,
						},
						{
							field: filterFields.TRADING_GROUND_NAME_ENG,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfFundsResponse>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.etfFunds) {
				for (const item of JSON.parse(prevCBonds.etfFunds as string,)) {
					const key = `${item.isin}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return {
				etfFunds:     JSON.stringify(uniqueData,),
				etfFundsData: Boolean(isCreating && allItems.length > 0,),
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_FUNDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getEtfFundsExtension(isins: string,): Promise<Array<IGetEtfFundsResponse>> {
		const allItems: Array<IGetEtfFundsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		try {
			while (hasMore) {
				const response = await axios.post<{items: Array<IGetEtfFundsResponse>}>(formatGetEtfFunds(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.IN,
							value:    isins,
						},
					],
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.ETF_CURRENCY_NAME,
						},
						{
							field: filterFields.GEOGRAPHY_INVESTMENT_NAME_ENG,
						},
						{
							field: filterFields.SECTOR_NAME_ENG,
						},
						{
							field: filterFields.TICKER,
						},
						{
							field: filterFields.FUNDS_NAME_ENG,
						},
						{
							field: filterFields.TRADING_GROUND_NAME_ENG,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfFundsResponse>()
			for (const item of allItems) {
				const key = `${item.isin}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_FUNDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * Retrieves ETF share class quotes based on the provided ISIN codes.
 *
 * @remarks
 * - The method queries the API for ETF share class quotes, filtering by ISIN, currency (USD), and update timestamps (between yesterday and today).
 * - It fetches the data in batches of 1000 items using pagination (`limit` and `offset`).
 * - The results from multiple requests are aggregated and filtered to include only unique items based on the ISIN.
 * - If previous data (`prevCBonds`) is provided, it combines the new data with the previous one to ensure unique entries.
 * - If the API request fails or returns an error, a `BAD_REQUEST` HTTP exception is thrown.
 *
 * @param prevCBonds - The previous CBonds data to combine with the new results (if available).
 * @param isins - The ISIN codes to query for ETF share class quotes.
 * @returns A Promise resolving to a JSON string containing the unique ETF share class quotes (ISIN and close price).
 *
 * @throws {HttpException} - Throws an exception if there is an error retrieving data from the API.
 */
	public async getEtfShareClassesQuotes(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{etfQuotes: string, etfQuotesData : boolean}> {
		const allItems: Array<IGetEtfQuotesResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		const {today, yesterday,} = getDateInfo()

		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN,
						operator: filterOperators.IN,
						value:    isins,
					},
				]
				if (!isCreating) {
					filters.unshift(
						{
							field:    filterFields.DATE,
							operator: filterOperators.GE,
							value:    yesterday,

						},
						{
							field:    filterFields.DATE,
							operator: filterOperators.LE,
							value:    today,
						},
					)
				}
				const response = await axios.post<{items: Array<IGetEtfQuotesResponse>}>(formatGetEtfShareClassesQuotes(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					sorting: [
						{
							field: filterFields.DATE,
							order:  SortOrder.DESC,
						},
					],
					filters,
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.CLOSE,
						},
						{
							field: filterFields.CURRENCY_ID,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfQuotesResponse>()
			for (const item of allItems) {
				if (item.close === null) {
					continue
				}
				const key = `${item.isin}-${item.currency_id}-${item.trading_ground_id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			if (prevCBonds?.etfQuotes) {
				for (const item of JSON.parse(prevCBonds.etfQuotes as string,)) {
					if (item.close === null) {
						continue
					}
					const key = `${item.isin}-${item.currency_id}-${item.trading_ground_id}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return {
				etfQuotes:     JSON.stringify(uniqueData,),
				etfQuotesData: Boolean(isCreating && allItems.length > 0,),
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_QUOTES_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getEtfShareClassesQuotesExtension(isins: string,): Promise< Array<IGetEtfQuotesResponse>> {
		const allItems: Array<IGetEtfQuotesResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true
		const {today, yesterday,} = getDateInfo()

		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN,
						operator: filterOperators.IN,
						value:    isins,
					},
					{
						field:    filterFields.DATE,
						operator: filterOperators.GE,
						value:    yesterday,

					},
					{
						field:    filterFields.DATE,
						operator: filterOperators.LE,
						value:    today,
					},
				]
				const response = await axios.post<{items: Array<IGetEtfQuotesResponse>}>(formatGetEtfShareClassesQuotes(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					sorting: [
						{
							field: filterFields.DATE,
							order:  SortOrder.DESC,
						},
					],
					filters,
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.CLOSE,
						},
						{
							field: filterFields.CURRENCY_ID,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfQuotesResponse>()
			for (const item of allItems) {
				if (item.close === null) {
					continue
				}
				const key = `${item.isin}-${item.currency_id}-${item.trading_ground_id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_QUOTES_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getEtfShareClassesTradingGrounds(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{etfTradingGrounds: string, etfTradingGroundsData : boolean}> {
		const allItems: Array<IGetEtfTradingGroundsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true

		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN,
						operator: filterOperators.IN,
						value:    isins,
					},
				]
				const response = await axios.post<{items: Array<IGetEtfTradingGroundsResponse>}>(formatGetEtfShareClassesTradingGrounds(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters,
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.CURRENCY_ID,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},
						{
							field: filterFields.MAIN_TRADING_GROUND,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfTradingGroundsResponse>()
			for (const item of allItems) {
				const key = `${item.isin}-${item.currency_id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}

			if (prevCBonds?.etfTradingGrounds) {
				for (const item of JSON.parse(prevCBonds.etfTradingGrounds as string,)) {
					const key = `${item.isin}-${item.currency_id}`
					if (!seen.has(key,)) {
						seen.set(key, item,)
					}
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return {
				etfTradingGrounds:     JSON.stringify(uniqueData,),
				etfTradingGroundsData: Boolean(isCreating && allItems.length > 0,),
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_TRADING_GROUNDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getEtfShareClassesTradingGroundsExtension(isins: string,): Promise<Array<IGetEtfTradingGroundsResponse>> {
		const allItems: Array<IGetEtfTradingGroundsResponse> = []
		const limit = 1000
		let offset = 0
		let hasMore = true

		try {
			while (hasMore) {
				const filters = [
					{
						field:    filterFields.ISIN,
						operator: filterOperators.IN,
						value:    isins,
					},
				]
				const response = await axios.post<{items: Array<IGetEtfTradingGroundsResponse>}>(formatGetEtfShareClassesTradingGrounds(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit,
						offset,
					},
					filters,
					fields: [
						{
							field: filterFields.ISIN,
						},
						{
							field: filterFields.CURRENCY_ID,
						},
						{
							field: filterFields.TRADING_GROUND_ID,
						},
						{
							field: filterFields.MAIN_TRADING_GROUND,
						},
					],
				},)
				const {items,} = response.data
				allItems.push(...items,)
				hasMore = items.length === limit
				offset = offset + limit
			}
			const seen = new Map<string, IGetEtfTradingGroundsResponse>()
			for (const item of allItems) {
				const key = `${item.isin}-${item.currency_id}`
				if (!seen.has(key,)) {
					seen.set(key, item,)
				}
			}
			const uniqueData = Array.from(seen.values(),)
			return uniqueData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_ETF_TRADING_GROUNDS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * Retrieves and merges bond trading and emission data, and stores it in the database.
 *
 * @remarks
 * - This method fetches the latest trading data and emission data using the `getTradingsNew` and `getEmissions` methods, respectively.
 *
 * @param prevCBonds - The previous CBonds data to combine with the newly fetched results (if available).
 * @param isins - The ISIN codes to query for bond data.
 * @returns A Promise that resolves to an object containing:
 *   - `tradingsNew`: A JSON string of the latest bond trading data.
 *   - `emissions`: A JSON string of the latest bond emission data.
 *
 * @throws {HttpException} - Throws an exception if there is an error retrieving or processing bond data.
 */
	public async getBondsData(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<{tradingsNew: string, emissions: string}> {
		const tradingsNew = await this.getTradingsNew(prevCBonds, isins, isCreating,)
		const emissions = await this.getEmissions(prevCBonds, isins,)
		return {
			tradingsNew: JSON.stringify(tradingsNew,),
			emissions:   JSON.stringify(emissions,),
		}
	}

	public async getBondsExtensionData(prevBonds: Array<Bond>, isins: string,): Promise<Array<TBond>> {
		const tradingsNew = await this.getTradingsExtensionNew(isins,)
		const emissions = await this.getEmissionsExtension(isins,)
		const emissionMap = new Map(emissions.map((e,) => {
			return [e.isin_code, e,]
		},),)
		const prevBondMap = new Map(prevBonds.map((b,) => {
			return [b.isin, b,]
		},),)

		const merged = tradingsNew.map((trading,) => {
			const emission = emissionMap.get(trading.isin_code,)
			if (!emission) {
				return null
			}

			const prevBond = prevBondMap.get(trading.isin_code,)

			return {
				isin:               trading.isin_code,
				security:           emission.bbgid_ticker,
				sellingQuote:       trading.selling_quote ?
					parseFloat(trading.selling_quote,) :
					prevBond?.sellingQuote ?
						Number(prevBond.sellingQuote,) :
						0,
				nominalPrice:       emission.nominal_price,
				country:            emission.emitent_country_name_eng,
				dirtyPriceCurrency: trading.dirty_price_currency ?
					parseFloat(trading.dirty_price_currency,) :
					prevBond?.dirtyPriceCurrency ?
						Number(prevBond.dirtyPriceCurrency,) :
						null,

				yield: trading.clearance_profit_effect ?
					parseFloat(trading.clearance_profit_effect,) :
					prevBond?.yield ?
						Number(prevBond.yield,) :
						null,

				marketPrice: trading.indicative_price ?
					parseFloat(trading.indicative_price,) :
					prevBond?.marketPrice,

				ytcOffer: trading.ytc_offer ?
					parseFloat(trading.ytc_offer,) :
					null,

				gSpread: trading.g_spread ?
					parseFloat(trading.g_spread,) :
					null,

				accrued: trading.aci ?
					parseFloat(trading.aci,) :
					null,

				tradeDate:    new Date(trading.date,),
				issuer:       emission.emitent_name_eng,
				maturityDate: emission.maturity_date ?
					new Date(emission.maturity_date,) :
					null,
				sector:         emission.emitent_branch_name_eng ?? null,
				coupon:         emission.curr_coupon_rate ?? null,
				nextCouponDate: emission.curr_coupon_date ?
					new Date(emission.curr_coupon_date,) :
					null,
				offertDateCall: emission.offert_date_call ?
					new Date(emission.offert_date_call,) :
					null,
			}
		},)
			.filter((bond,): bond is TBond => {
				return bond !== null
			},)
		return merged
	}

	/**
 * Aggregates and returns detailed equity-related data for the provided ISINs.
 *
 * @remarks
 * - This method collects various equity-related datasets by calling:
 *   - `getTradingsStocksFullNew` – trading data for the stocks.
 *   - `getStocksTradingGrounds` – information about stock trading venues.
 *   - `getStocksFull` – full equity metadata.
 * - Combines all fetched data into a single object.
 *
 * @param prevCBonds - Previous stored CBonds data, used to merge or skip duplicate entries.
 * @param isins - Comma-separated string of ISIN codes to filter the data by.
 *
 * @returns {Promise<IEquityData>} A promise that resolves with the complete equity data object.
 */
	public async getEquityData(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<IEquityData> {
		try {
			const {tradingsStocksFullNew, isTradingsStocksFullNewData,} = await this.getTradingsStocksFullNew(prevCBonds, isins, isCreating,)
			const {stocksTradingGrounds, stocksTradingGroundsNewData,} = await this.getStocksTradingGrounds(prevCBonds, isins, isCreating,)
			const {stocksFull, stocksFullNewData,} = await this.getStocksFull(prevCBonds, isins,)
			const isDataForNewIsin =
				isTradingsStocksFullNewData ||
				stocksTradingGroundsNewData ||
				stocksFullNewData
			if (isCreating && !isDataForNewIsin) {
				throw new HttpException(ERROR_MESSAGES.ISIN_HAS_NO_DATA, HttpStatus.BAD_REQUEST,)
			}
			return {
				tradingsStocksFullNew,
				stocksTradingGrounds,
				stocksFull,
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getEquityExtensionData(prevEquity: Array<Equity>, isins: Array<{ isin: string; currencyId: string, id: number }>, isinsString: string,): Promise<Array<TEquity>> {
		try {
			const tradingsStocksFullNew = await this.getTradingsStocksFullNewExtension(isinsString,)
			const stocksTradingGrounds = await this.getStocksTradingGroundsExtension(isinsString,)
			const stocksFull = await this.getStocksFullExtension(isinsString,)
			const mergedData = stocksTradingGrounds.map((ground,) => {
				const { isin, trading_ground_id: mainTradingGroundId, } = ground
				const isinInfo = isins.find((i,) => {
					return i.isin === isin
				},)

				const stockFullData = stocksFull.find((s,) => {
					return s.isin === isin
				},)
				if (!isinInfo || !stockFullData) {
					return null
				}
				const {currencyId,} = isinInfo
				const tradingData = tradingsStocksFullNew.find((t,) => {
					return t.isin === isin &&  (t.currency_id === '247' ?
						'12'	:
						t.currency_id) === String(currencyId,) &&
				t.trading_ground_id === mainTradingGroundId
				},) ?? tradingsStocksFullNew.find((t,) => {
					return t.isin === isin && (t.currency_id === '247' ?
						'12'	:
						t.currency_id) === String(currencyId,)
				},)

				return {
					...stockFullData,
					...ground,
					...tradingData,
					isinId:        isinInfo.id,
					currencyId:    isinInfo.currencyId,
					isGBX:      tradingData?.currency_id === '247',
				}
			},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			const equitiesData = mergedData.map((item,) => {
				const prevPrice = prevEquity.find(
					(e,) => {
						return e.isin === item.isin
					},
				)?.lastPrice
				const prevCurrency = prevEquity.find(
					(e,) => {
						return e.isin === item.isin
					},
				)?.currencyName
				const lastPrice = item.last_price ?
					parseFloat(item.last_price,) :
					prevPrice ?
						Number(prevPrice,) :
						null
				if (!lastPrice) {
					return null
				}
				return {
					isin:              item.isin,
					ticker:            item.ticker,
					tradingGroundId:   Number(item.trading_ground_id,),
					lastPrice,
					emitentName:       item.emitent_name_eng,
					emitentBranchId:   item.emitent_id,
					tradingGroundName: item.trading_ground_name_eng,
					equityCurrencyId:  item.currencyId,
					currencyName:      (item.isGBX || prevCurrency === 'GBX') ?
						'GBX' :
						item.currency_name,
					stockEmitentId:    item.emitent_id,
					stockEmitentName:  item.trading_ground_name_eng,
					stockCountryName:  item.country_name_eng,
					isinId:            item.isinId,
					currencyId:        item.currencyId,
				}
			},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			return equitiesData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * Aggregates and returns ETF-related data for the provided ISINs.
 *
 * @remarks
 * - This method collects various ETF-related datasets by calling:
 *   - `getEtfFunds` – basic fund data for ETFs.
 *   - `getEtfShareClassesDividends` – dividend distribution data by share class.
 *   - `getEtfShareClassesQuotes` – recent quote information for ETF share classes.
 * - Returns a structured object containing all relevant ETF datasets.
 *
 * @param prevCBonds - Previous stored CBonds data, used to merge or enrich current results.
 * @param isins - arated string of ISIN codes to query.
 *
 * @returns {Promise<IEquityETFData>} A promise that resolves with the complete ETF data object.
 */
	public async getETFData(prevCBonds: CBonds | null, isins: string, isCreating?: boolean,): Promise<IEquityETFData> {
		try {
			const {etfFunds, etfFundsData,} = await this.getEtfFunds(prevCBonds, isins, isCreating,)
			const {etfDividends, etfDividendsData,} = await this.getEtfShareClassesDividends(prevCBonds, isins, isCreating,)
			const {etfQuotes, etfQuotesData,} = await this.getEtfShareClassesQuotes(prevCBonds, isins, isCreating,)
			const {etfTradingGrounds,etfTradingGroundsData,} = await this.getEtfShareClassesTradingGrounds(prevCBonds, isins, isCreating,)

			const isDataForNewIsin =
			etfFundsData ||
			etfDividendsData ||
			etfQuotesData ||
				etfTradingGroundsData
			if (isCreating && !isDataForNewIsin) {
				throw new HttpException(ERROR_MESSAGES.ISIN_HAS_NO_DATA, HttpStatus.BAD_REQUEST,)
			}
			return {
				etfFunds,
				etfDividends,
				etfQuotes,
				etfTradingGrounds,
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async getETFExtensionData(prevEtf: Array<Etf>, isins: Array<{ isin: string; currencyId: string, id: number }>, isinsString: string,): Promise<Array<TEtf>> {
		try {
			const etfFunds = await this.getEtfFundsExtension(isinsString,)
			const etfDividends = await this.getEtfShareClassesDividendsExtension(isinsString,)
			const etfQuotes = await this.getEtfShareClassesQuotesExtension(isinsString,)
			const etfTradingGrounds = await this.getEtfShareClassesTradingGroundsExtension(isinsString,)

			const uniqueIsins = Array.from(new Set(etfTradingGrounds.map((e,) => {
				return e.isin
			},),),)

			const mergedETFData = uniqueIsins.map((isin,) => {
				const isinInfo = isins.find((i,) => {
					return i.isin === isin
				},)
				const fundInfo = etfFunds.find((f,) => {
					return f.isin === isin
				},)
				if (!isinInfo || !fundInfo) {
					return null
				}

				const tradesForIsin = etfTradingGrounds.filter((t,) => {
					return t.isin === isin && (t.currency_id === '247' ?
						'12'	:
						t.currency_id) === isinInfo.currencyId
				},
				)
				if (tradesForIsin.length === 0) {
					return null
				}

				const mainGround = tradesForIsin.find((t,) => {
					return t.main_trading_ground === '1'
				},) ?? tradesForIsin[0]

				const quoteData = etfQuotes.find((q,) => {
					return q.isin === isin && (q.currency_id === '247' ?
						'12'	:
						q.currency_id) === mainGround.currency_id &&
    q.trading_ground_id === mainGround.trading_ground_id
				},
				) ?? etfQuotes.find((q,) => {
					return q.isin === isin && (q.currency_id === '247' ?
						'12'	:
						q.currency_id) === mainGround.currency_id
				},
				)
				if (!quoteData) {
					return null
				}
				const dividendData = etfDividends.find((d,) => {
					return d.isin === isin
				},)
				const prevItem = prevEtf.find((e,) => {
					return e.isin === isin && e.currencyId === isinInfo.currencyId
				},)
				const close = quoteData.close ?
					parseFloat(quoteData.close,) :
					prevItem ?
						Number(prevItem.close,) :
						null
				if (!close) {
					return null
				}
				const isGBX = quoteData.currency_id === '247' || prevItem?.currencyName === 'GBX'
				const currencyName = isGBX ?
					'GBX' :
					fundInfo.etf_currency_name
				return {
					isin,
					ticker:                  fundInfo.ticker,
					close,
					distributionAmount:      Number(dividendData?.distribution_amount ?? 0,),
					currencyName,
					fundsName:               fundInfo.funds_name_eng,
					tradingGroundName:       fundInfo.trading_ground_name_eng,
					geographyInvestmentName: fundInfo.geography_investment_name_eng,
					sectorName:              fundInfo.sector_name_eng === 'Undefined' ?
						'N/A' :
						fundInfo.sector_name_eng,
					tradingGroundId:         Number(mainGround.trading_ground_id,),
					etfCurrencyId:           quoteData.currency_id,

					isinId:     isinInfo.id,
					currencyId: isinInfo.currencyId,
				}
			},).filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
			return mergedETFData
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * Orchestrates the fetching and storing of all CBonds-related data.
 *
 * @remarks
 * - Retrieves the previously saved CBonds data from the database.
 * - Gets all active ISINs and formats them into a string.
 * - Fetches data from various CBonds API endpoints:
 *   - Bonds data (tradings and emissions)
 *   - Equities data
 *   - ETFs data
 * - Clears the existing CBonds table and writes the new merged dataset.
 */
	public async processCBondsData(): Promise<void> {
		try {
			const prevCBondsThirdParty = await this.thirdPartyPrismaService.client.cBonds.findFirst({
				orderBy: { createdAt: 'desc', },
			},)
			const isins = await this.prismaService.isins.findMany({
				where: {
					isActivated: true,
				},
			},)
			const isinsString = isins.map(({ isin, },) => {
				return isin
			},).join(';',)

			const bondData = await this.getBondsData(prevCBondsThirdParty, isinsString,)
			const equityData = await this.getEquityData(prevCBondsThirdParty, isinsString,)
			const etfData = await this.getETFData(prevCBondsThirdParty, isinsString,)
			const emitents = await this.getEmitents(prevCBondsThirdParty,)

			await this.thirdPartyPrismaService.client.$transaction(async(tx,) => {
				await tx.cBonds.create({
					data: {...bondData, ...equityData, ...etfData, emitents,},
				},)
			},)

			const assets = await this.prismaService.asset.findMany({
				where: {
					assetName: {
						in: [
							AssetNamesType.BONDS,
							AssetNamesType.EQUITY_ASSET,
							AssetNamesType.CRYPTO,
						],
					},
				},
			},)
			const assetIsins = Array.from(
				new Set(
					assets
						.map((asset,) => {
							const parsedPayload = JSON.parse(asset.payload as string,)
							return parsedPayload.isin ?? null
						},)
						.filter((item,): item is NonNullable<typeof item> => {
							return item !== null
						},),
				),
			)
			const isinsStringMainDB = assetIsins.join(';',)

			const prevCBondsMainDB = await this.prismaService.cBonds.findFirst({
				orderBy: { createdAt: 'desc', },
			},)
			const bondDataMainDB = await this.getBondsData(prevCBondsMainDB, isinsStringMainDB,)
			const {tradingsStocksFullNew,...equityDataMainDB} = await this.getEquityData(prevCBondsMainDB, isinsStringMainDB,)
			const {etfQuotes, ...etfDataMainDB} = await this.getETFData(prevCBondsMainDB, isinsStringMainDB,)

			const allIsins = await this.prismaService.isins.findMany()

			const parsedTradingsStocksFullNew = JSON.parse(tradingsStocksFullNew,)
			const parsedEtfQuotes = JSON.parse(etfQuotes,)

			const filteredTradingsStocksFullNew = parsedTradingsStocksFullNew.filter((item: IGetTradingStocksFullNewItemResponse,) => {
				const isin = allIsins.find((isinItem,) => {
					return item.isin === isinItem.isin
				},)
				return assetIsins.includes(item.isin,) && isin?.currencyId === item.currency_id
			},)
			const filteredEtfQuotes = parsedEtfQuotes.filter((item: IGetEtfQuotesResponse,) => {
				const isin = allIsins.find((isinItem,) => {
					return item.isin === isinItem.isin
				},)
				return assetIsins.includes(item.isin,) && isin?.currencyId === item.currency_id
			},)

			await this.prismaService.$transaction(async(tx,) => {
				await tx.cBonds.create({
					data: {tradingsStocksFullNew: JSON.stringify(filteredTradingsStocksFullNew,), ...bondDataMainDB, etfQuotes: JSON.stringify(filteredEtfQuotes,), ...equityDataMainDB, ...etfDataMainDB, emitents,},
				},)
			},)
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
		* Updates missing emitents in the database based on existing equities.
		* @remarks
		* - Fetches all `emitentBranchId` values from the `Equity` table.
		* - Fetches all existing `id` values from the `Emitent` table.
		* - Determines which emitent branch IDs are present in `Equity` but missing in `Emitent`.
		* - Retrieves additional emitent data via `getEmitentsWithBranchIds`.
		* - Inserts the missing emitents into the database using `createMany`, skipping duplicates.
		* - Throws an HttpException with a descriptive error message if any step fails.
	*/
	public async handleEmitentsUpdate(): Promise<void> {
		try {
			const equities = await this.thirdPartyPrismaService.client.equity.findMany({
				select: {
					emitentBranchId: true,
				},
			},)
			const emitents = await this.thirdPartyPrismaService.client.emitent.findMany({
				select: {
					id: true,
				},
			},)
			const equityEmitents = equities.map((item,) => {
				return item.emitentBranchId
			},)
			const emitentsIds = emitents.map((item,) => {
				return item.id
			},)
			const uniqueEquityBranchIds = Array.from(new Set([...equityEmitents,],),)
			const missingEmitentsIds = uniqueEquityBranchIds.filter((id,) => {
				return !emitentsIds.includes(id,)
			},)
			const idString = missingEmitentsIds.join(';',)
			const emitentsToCreate = await this.getEmitentsWithBranchIds(idString,)
			await this.thirdPartyPrismaService.client.emitent.createMany({
				data:           emitentsToCreate,
				skipDuplicates: true,
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_EMITENTS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	// CBonds api data retrieve refactor for history and optimization
	public async processCBondsExtensionData(): Promise<void> {
		try {
			const [
				isinsMainDB,
				isinsThirdParty,
			] = await Promise.all([
				this.prismaService.isins.findMany(),
				this.thirdPartyPrismaService.client.isins.findMany({
					select: {
						isin: true,
					},
				},),
			],)
			const thirdPartyIsinsSet = new Set(isinsThirdParty.map((i,) => {
				return i.isin
			},),)
			const isinsToCreate = isinsMainDB.filter((i,) => {
				return !thirdPartyIsinsSet.has(i.isin,)
			},)
			await this.thirdPartyPrismaService.client.isins.createMany({
				data:           isinsToCreate,
				skipDuplicates: true,
			},)
			const isins = await this.thirdPartyPrismaService.client.isins.findMany({
				where: {
					typeId:      '1',
				},
				select: {
					isin: true,
				},
			},)
			const isinsString = isins.map(({ isin, },) => {
				return isin
			},).join(';',)

			await this.bondsDataUpdate(isinsString,)

			const equityIsins = await this.thirdPartyPrismaService.client.isins.findMany({
				where: {
					typeId:      '2',
				},
			},)
			const equityIsinsString = equityIsins.map(({ isin, },) => {
				return isin
			},).join(';',)

			await this.equitiesDataUpdate(equityIsins,equityIsinsString,)

			const etfIsins = await this.thirdPartyPrismaService.client.isins.findMany({
				where: {
					typeId:      '3',
				},
			},)

			const etfIsinsString = etfIsins.map(({ isin, },) => {
				return isin
			},).join(';',)
			await this.etfsDataUpdate(etfIsins,etfIsinsString,)

			const fiveYearsAgo = new Date()
			fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5,)

			await this.thirdPartyPrismaService.client.bondHistory.deleteMany({
				where: {
					createdAt: { lt: fiveYearsAgo, },
				},
			},)

			await this.thirdPartyPrismaService.client.equityHistory.deleteMany({
				where: {
					createdAt: { lt: fiveYearsAgo, },
				},
			},)

			await this.thirdPartyPrismaService.client.etfHistory.deleteMany({
				where: {
					createdAt: { lt: fiveYearsAgo, },
				},
			},)
		} catch (error) {
			this.logger.error(error,)
			if (error instanceof HttpException) {
				throw error
			}
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	public async bondsDataUpdate(isinsString: string,): Promise<void> {
		const prevBondThirdParty = await this.thirdPartyPrismaService.client.bond.findMany()
		const bonds = await this.getBondsExtensionData(prevBondThirdParty, isinsString,)
		await this.thirdPartyPrismaService.client.$transaction(async(tx,) => {
			await Promise.all(
				bonds.map(async(b,) => {
					try {
						let bondId: number

						const currentBond = await tx.bond.findUnique({
							where: { isin: b.isin, },
						},)

						if (currentBond) {
							const updatedBond = await tx.bond.update({
								where: { isin: b.isin, },
								data:  b,
							},)
							bondId = updatedBond.id
						} else {
							const relatedIsin = await tx.isins.findUnique({
								where: { isin: b.isin, },
							},)

							if (!relatedIsin) {
								this.logger.error(`Isin ${b.isin} not found`,)
								return
							}

							const newBond = await tx.bond.create({
								data: {
									...b,
									isinRef: {
										connect: {
											id: relatedIsin.id,
										},
									},
								},
							},)
							bondId = newBond.id
						}

						await tx.bondHistory.create({
							data: {
								bondId,
								isin:               b.isin,
								security:           b.security,
								marketPrice:        b.marketPrice,
								dirtyPriceCurrency: b.dirtyPriceCurrency,
								yield:              b.yield,
								sellingQuote:       b.sellingQuote,
								ytcOffer:           b.ytcOffer,
								gSpread:            b.gSpread,
								accrued:            b.accrued,
								tradeDate:          b.tradeDate,
								issuer:             b.issuer,
								nominalPrice:       b.nominalPrice,
								maturityDate:       b.maturityDate,
								country:            b.country,
								sector:             b.sector,
								coupon:             b.coupon,
								nextCouponDate:     b.nextCouponDate,
								offertDateCall:     b.offertDateCall,
								createdAt:          new Date(),
							},
						},)
					} catch (error) {
						this.logger.error(error,)
					}
				},),
			)
		}, { timeout: 300000, },)

		const bondIsins = await this.prismaService.isins.findMany({
			where: {
				typeId: '1',
			},
		},)
		const assetIsins = bondIsins.map((asset,) => {
			return asset.isin
		},)

		const mainDbBonds = bonds.filter((bond,) => {
			return assetIsins.includes(bond.isin,)
		},)

		await this.prismaService.$transaction(async(tx,) => {
			await Promise.all(
				mainDbBonds.map(async(b,) => {
					try {
						let bondId: number

						const currentBond = await tx.bond.findUnique({
							where: { isin: b.isin, },
						},)

						if (currentBond) {
							const updatedBond = await tx.bond.update({
								where: { isin: b.isin, },
								data:  b,
							},)
							bondId = updatedBond.id
						} else {
							const relatedIsin = await tx.isins.findUnique({
								where: { isin: b.isin, },
							},)
							if (!relatedIsin) {
								this.logger.error(`Isin ${b.isin} not found`,)
								return
							}

							const newBond = await tx.bond.create({
								data: {
									...b,
									isinRef: {
										connect: {
											id: relatedIsin.id,
										},
									},
								},
							},)
							bondId = newBond.id
						}

						await tx.bondHistory.create({
							data: {
								bondId,
								isin:               b.isin,
								security:           b.security,
								marketPrice:        b.marketPrice,
								dirtyPriceCurrency: b.dirtyPriceCurrency,
								yield:              b.yield,
								sellingQuote:       b.sellingQuote,
								ytcOffer:           b.ytcOffer,
								gSpread:            b.gSpread,
								accrued:            b.accrued,
								tradeDate:          b.tradeDate,
								issuer:             b.issuer,
								nominalPrice:       b.nominalPrice,
								maturityDate:       b.maturityDate,
								country:            b.country,
								sector:             b.sector,
								coupon:             b.coupon,
								nextCouponDate:     b.nextCouponDate,
								offertDateCall:     b.offertDateCall,
								createdAt:          new Date(),
							},
						},)
					} catch (error) {
						this.logger.error(error,)
					}
				},),
			)
		}, { timeout: 300000, },)
	}

	public async equitiesDataUpdate(equityIsins: Array<Isins>, equityIsinsString: string,): Promise<void> {
		const emitents = await this.thirdPartyPrismaService.client.emitent.findMany()
		const prevbEquityThirdParty = await this.thirdPartyPrismaService.client.equity.findMany()
		const equities = await this.getEquityExtensionData(prevbEquityThirdParty, equityIsins, equityIsinsString,)
		const isins = await this.prismaService.isins.findMany({
			where: {
				typeId: '2',
			},
		},)
		const assetIsins = isins.map((isin,) => {
			return isin.isin
		},)
		await this.thirdPartyPrismaService.client.$transaction(async(tx,) => {
			await Promise.all(
				equities.map(async(e,) => {
					try {
						let equityId: number

						const currentEquity = await tx.equity.findUnique({
							where: {
								isin_currencyId: {
									isin:       e.isin,
									currencyId: e.currencyId,
								},
							},
						},)

						const emitentItem = emitents.find(
							(emitent,) => {
								return emitent.id === e.emitentBranchId
							},
						)

						if (currentEquity) {
							const updatedEquity = await tx.equity.update({
								where: {
									isin_currencyId: {
										isin:       e.isin,
										currencyId: e.currencyId,
									},
								},
								data: {
									...e,
									branchName: emitentItem?.branchNameEng,
								},
							},)
							equityId = updatedEquity.id
						} else {
							const relatedIsin = await tx.isins.findUnique({
								where: { id: e.isinId, },
							},)

							if (!relatedIsin) {
								this.logger.error(`Isin ${e.isin} not found`,)
								return
							}

							const newEquity = await tx.equity.create({
								data: {
									...e,
									branchName:        emitentItem?.branchNameEng,
									isinId:     relatedIsin.id,
								},
							},)
							equityId = newEquity.id
						}

						await tx.equityHistory.create({
							data: {
								equityId,
								isin:              e.isin,
								ticker:            e.ticker,
								tradingGroundId:   e.tradingGroundId,
								lastPrice:         e.lastPrice,
								emitentName:       e.emitentName,
								emitentBranchId:   e.emitentBranchId,
								tradingGroundName: e.tradingGroundName,
								equityCurrencyId:  e.equityCurrencyId,
								currencyName:      e.currencyName,
								stockEmitentId:    e.stockEmitentId,
								stockEmitentName:  e.stockEmitentName,
								stockCountryName:  e.stockCountryName,
								branchName:        emitentItem?.branchNameEng,
								createdAt:         new Date(),
							},
						},)
					} catch (error) {
						this.logger.error(error,)
					}
				},),
			)
		}, { timeout: 300000, },)

		const mainDbEquities = equities.filter((bond,) => {
			return assetIsins.includes(bond.isin,)
		},)

		await this.prismaService.$transaction(async(tx,) => {
			await Promise.all(
				mainDbEquities.map(async(e,) => {
					try {
						let equityId: number

						const currentEquity = await tx.equity.findUnique({
							where: {
								isin_currencyId: {
									isin:       e.isin,
									currencyId: e.currencyId,
								},
							},
						},)

						const relatedIsin = await tx.isins.findUnique({
							where: { isin: e.isin, },
						},)

						if (!relatedIsin) {
							this.logger.error(`Isin ${e.isin} not found`,)
							return
						}

						const emitentItem = emitents.find(
							(emitent,) => {
								return emitent.id === e.emitentBranchId
							},
						)

						if (currentEquity) {
							const updatedEquity = await tx.equity.update({
								where: {
									isin_currencyId: {
										isin:       relatedIsin.isin,
										currencyId: relatedIsin.currencyId,
									},
								},
								data: {
									ticker:            e.ticker,
									tradingGroundId:   e.tradingGroundId,
									lastPrice:         e.lastPrice,
									emitentName:       e.emitentName,
									emitentBranchId:   e.emitentBranchId,
									tradingGroundName: e.tradingGroundName,
									equityCurrencyId:  e.equityCurrencyId,
									currencyName:      e.currencyName,
									stockEmitentId:    e.stockEmitentId,
									stockEmitentName:  e.stockEmitentName,
									stockCountryName:  e.stockCountryName,
									branchName:        emitentItem?.branchNameEng,
								},
							},)
							equityId = updatedEquity.id
						} else {
							const newEquity = await tx.equity.create({
								data: {
									...e,
									branchName: emitentItem?.branchNameEng,
									isinId:     relatedIsin.id,
								},
							},)
							equityId = newEquity.id
						}

						await tx.equityHistory.create({
							data: {
								equityId,
								isin:              e.isin,
								ticker:            e.ticker,
								tradingGroundId:   e.tradingGroundId,
								lastPrice:         e.lastPrice,
								emitentName:       e.emitentName,
								emitentBranchId:   e.emitentBranchId,
								tradingGroundName: e.tradingGroundName,
								equityCurrencyId:  e.equityCurrencyId,
								currencyName:      e.currencyName,
								stockEmitentId:    e.stockEmitentId,
								stockEmitentName:  e.stockEmitentName,
								stockCountryName:  e.stockCountryName,
								branchName:        emitentItem?.branchNameEng,
								createdAt:         new Date(),
							},
						},)
					} catch (error) {
						this.logger.error(error,)
					}
				},),
			)
		}, { timeout: 300000, },)
	}

	public async etfsDataUpdate(etfIsins: Array<Isins>, etfIsinsString: string,): Promise<void> {
		const prevEtfThirdParty = await this.thirdPartyPrismaService.client.etf.findMany()
		const etfs = await this.getETFExtensionData(prevEtfThirdParty, etfIsins, etfIsinsString,)
		const isins = await this.prismaService.isins.findMany({
			where: {
				typeId: '3',
			},
		},)
		const assetIsins = isins.map((isin,) => {
			return isin.isin
		},)
		await this.thirdPartyPrismaService.client.$transaction(async(tx,) => {
			await Promise.all(
				etfs.map(async(e,) => {
					try {
						let etfId: number

						const currentEtf = await tx.etf.findUnique({
							where: {
								isin_currencyId: {
									isin:       e.isin,
									currencyId: e.currencyId,
								},
							},
						},)

						if (currentEtf) {
							const updatedEtf = await tx.etf.update({
								where: {
									isin_currencyId: {
										isin:       e.isin,
										currencyId: e.currencyId,
									},
								},
								data: e,
							},)
							etfId = updatedEtf.id
						} else {
							const relatedIsin = await tx.isins.findUnique({
								where: { id: e.isinId, },
							},)
							if (!relatedIsin) {
								this.logger.error(`Isin ${e.isin} not found`,)
								return
							}
							const newEtf = await tx.etf.create({
								data: {
									...e,
									isinId: relatedIsin.id,
								},
							},)
							etfId = newEtf.id
						}

						await tx.etfHistory.create({
							data: {
								etfId,
								isin:                    e.isin,
								ticker:                  e.ticker,
								close:                   e.close,
								distributionAmount:      e.distributionAmount,
								currencyName:            e.currencyName,
								fundsName:               e.fundsName,
								tradingGroundName:       e.tradingGroundName,
								geographyInvestmentName: e.geographyInvestmentName,
								sectorName:              e.sectorName,
								tradingGroundId:         e.tradingGroundId,
								etfCurrencyId:           e.etfCurrencyId,
								createdAt:               new Date(),
							},
						},)
					} catch (error) {
						this.logger.error(error,)
					}
				},),
			)
		}, { timeout: 300000, },)

		const mainDbEtfs = etfs.filter((bond,) => {
			return assetIsins.includes(bond.isin,)
		},)

		await this.prismaService.$transaction(async(tx,) => {
			await Promise.all(
				mainDbEtfs.map(async(e,) => {
					try {
						let etfId: number

						const currentEtf = await tx.etf.findUnique({
							where: {
								isin_currencyId: {
									isin:       e.isin,
									currencyId: e.currencyId,
								},
							},
						},)

						const relatedIsin = await tx.isins.findUnique({
							where: { isin: e.isin, },
						},)

						if (!relatedIsin) {
							this.logger.error(`Isin ${e.isin} not found`,)
							return
						}

						if (currentEtf) {
							const updatedEtf = await tx.etf.update({
								where: {
									isin_currencyId: {
										isin:       relatedIsin.isin,
										currencyId: relatedIsin.currencyId,
									},
								},
								data: {
									ticker:                  e.ticker,
									close:                   e.close,
									distributionAmount:      e.distributionAmount,
									currencyName:            e.currencyName,
									fundsName:               e.fundsName,
									tradingGroundName:       e.tradingGroundName,
									geographyInvestmentName: e.geographyInvestmentName,
									sectorName:              e.sectorName,
									tradingGroundId:         e.tradingGroundId,
									etfCurrencyId:           e.etfCurrencyId,
								},
							},)
							etfId = updatedEtf.id
						} else {
							const newEtf = await tx.etf.create({
								data: {
									...e,
									isinId: relatedIsin.id,
								},
							},)
							etfId = newEtf.id
						}

						await tx.etfHistory.create({
							data: {
								etfId,
								isin:                    e.isin,
								ticker:                  e.ticker,
								close:                   e.close,
								distributionAmount:      e.distributionAmount,
								currencyName:            e.currencyName,
								fundsName:               e.fundsName,
								tradingGroundName:       e.tradingGroundName,
								geographyInvestmentName: e.geographyInvestmentName,
								sectorName:              e.sectorName,
								tradingGroundId:         e.tradingGroundId,
								etfCurrencyId:           e.etfCurrencyId,
								createdAt:               new Date(),
							},
						},)
					} catch (error) {
						this.logger.error(error,)
					}
				},),
			)
		}, { timeout: 300000, },)
	}

	/**
 		* Retrieves currency rates for specified type IDs on a given date.
 		* @param data - Contains type IDs, date, and optional limit.
 		* @returns A list of currency rate responses for the given filters.
 	*/
	public async currencyHistoryRate(data: IGetCurrencyHistoryDate,): Promise<Array<ICurrencyResponse>> {
		const {typeIds, date, limit,} = data
		const response = await axios.post<{ items: Array<ICurrencyResponse> }>(formatGetIndexValueNewLink(), {
			auth:     { login: this.apiLogin, password: this.apiPassword, },
			quantity: {	limit,	offset: 0,},
			filters:  [{ field: filterFields.TYPE_ID, operator: filterOperators.IN, value: typeIds, }, { field: filterFields.DATE, operator: filterOperators.EQ, value: date, },],
			fields:   [{field: filterFields.TYPE_ID,}, {field: filterFields.RATE_VALUE,},],
			sorting:  [{field: filterFields.DATE,order: SortOrder.DESC,},],
		},)
		return response.data.items
	}

	/**
 		* ⚠ Use with caution in production — ensure proper filtering to exclude
		* unnecessary or duplicate ISINs before execution to avoid excessive load
		* on the database and redundant data in the results.
 	*/
	public async unnecessaryIsinsFilter(): Promise<void> {
		const assets = await this.prismaService.asset.findMany({
			where: {
				assetName: {
					in: [
						AssetNamesType.BONDS,
						AssetNamesType.EQUITY_ASSET,
						AssetNamesType.CRYPTO,
					],
				},
			},
		},)
		const assetIsins = Array.from(
			new Set(
				assets
					.map((asset,) => {
						const parsedPayload = JSON.parse(asset.payload as string,)
						return parsedPayload.isin ?? null
					},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},),
			),
		)
		const prevCBonds = await this.prismaService.cBonds.findMany({
			take: 10,
			skip: 0,
		},)
		const isins = await this.prismaService.isins.findMany()
		const updatedCBonds = prevCBonds.map((item,) => {
			const {tradingsNew, emissions, tradingsStocksFullNew, stocksTradingGrounds, stocksFull, etfDividends, etfFunds, etfQuotes, etfTradingGrounds,} = item

			const parsedTradingsNew = JSON.parse(tradingsNew as string,)
			const parsedEmissions = JSON.parse(emissions as string,)
			const parsedTradingsStocksFullNew = JSON.parse(tradingsStocksFullNew as string,)
			const parsedStocksTradingGrounds = JSON.parse(stocksTradingGrounds as string,)
			const parsedStocksFull = JSON.parse(stocksFull as string,)
			const parsedEtfDividends = JSON.parse(etfDividends as string,)
			const parsedEtfFunds = JSON.parse(etfFunds as string,)
			const parsedEtfQuotes = JSON.parse(etfQuotes as string,)
			const parsedEtfTradingGrounds = JSON.parse(etfTradingGrounds as string,)

			const filteredTradingsNew = parsedTradingsNew.filter((item: IGetTradingsNewItem,) => {
				return assetIsins.includes(item.isin,)
			},)
			const filteredEmissions = parsedEmissions.filter((item: IGetEmissionsItem,) => {
				return assetIsins.includes(item.isin,)
			},)
			const filteredTradingsStocksFullNew = parsedTradingsStocksFullNew.filter((item: IGetTradingStocksFullNewItemResponse,) => {
				const isin = isins.find((isinItem,) => {
					return item.isin === isinItem.isin
				},)
				return assetIsins.includes(item.isin,) && isin?.currencyId === item.currency_id
			},)
			const filteredStocksTradingGrounds = parsedStocksTradingGrounds.filter((item: IGetStocksTradingGroundsItem,) => {
				return assetIsins.includes(item.isin,)
			},)
			const filteredStocksFull = parsedStocksFull.filter((item: IGetTradingStocksFullNewItemResponse,) => {
				return assetIsins.includes(item.isin,)
			},)
			const filteredEtfDividends = parsedEtfDividends.filter((item: IGetTradingStocksFullNewItemResponse,) => {
				return assetIsins.includes(item.isin,)
			},)
			const filteredEtfFunds = parsedEtfFunds.filter((item: IGetEtfFundsResponse,) => {
				return assetIsins.includes(item.isin,)
			},)
			const filteredEtfQuotes = parsedEtfQuotes.filter((item: IGetEtfQuotesResponse,) => {
				const isin = isins.find((isinItem,) => {
					return item.isin === isinItem.isin
				},)
				return assetIsins.includes(item.isin,) && isin?.currencyId === item.currency_id
			},)
			const filteredEtfTradingGrounds = parsedEtfTradingGrounds.filter((item: IGetEtfTradingGroundsResponse,) => {
				return assetIsins.includes(item.isin,)
			},)
			return {
				...item,
				tradingsNew:           JSON.stringify(filteredTradingsNew,),
				emissions:             JSON.stringify(filteredEmissions,),
				tradingsStocksFullNew: JSON.stringify(filteredTradingsStocksFullNew,),
				stocksTradingGrounds:           JSON.stringify(filteredStocksTradingGrounds,),
				stocksFull:            JSON.stringify(filteredStocksFull,),
				etfDividends:           JSON.stringify(filteredEtfDividends,),
				etfFunds:              JSON.stringify(filteredEtfFunds,),
				etfQuotes:             JSON.stringify(filteredEtfQuotes,),
				etfTradingGrounds:           JSON.stringify(filteredEtfTradingGrounds,),
			}
		},)
		for (const cbond of updatedCBonds) {
			await this.prismaService.cBonds.update({
				where: { id: cbond.id, },
				data:  {
					tradingsNew:           cbond.tradingsNew,
					emissions:             cbond.emissions,
					tradingsStocksFullNew: cbond.tradingsStocksFullNew,
					stocksTradingGrounds:  cbond.stocksTradingGrounds,
					stocksFull:            cbond.stocksFull,
					etfDividends:          cbond.etfDividends,
					etfFunds:              cbond.etfFunds,
					etfQuotes:             cbond.etfQuotes,
					etfTradingGrounds:     cbond.etfTradingGrounds,
				},
			},)
		}
	}

	public async absentIsinsMigration(): Promise<void> {
		try {
			const assets = await this.prismaService.asset.findMany({
				where: {
					assetName: {
						in: [
							AssetNamesType.BONDS,
						// AssetNamesType.EQUITY_ASSET,
						// AssetNamesType.CRYPTO,
						],
					},
				},
			},)
			const assetIsins = Array.from(
				new Set(
					assets
						.map((asset,) => {
							const parsedPayload = JSON.parse(asset.payload as string,)
							return parsedPayload.isin ?? null
						},)
						.filter((item,): item is NonNullable<typeof item> => {
							return item !== null
						},),
				),
			)
			const bonds = await this.prismaService.bond.findMany({
				select: {
					isin: true,
				},
			},)
			const isins = await this.prismaService.isins.findMany()
			const absentIsins = assetIsins.filter((isin,) => {
				return !bonds.some((bond,) => {
					return bond.isin === isin
				},)
			},)
			const cBonds = await this.prismaService.cBonds.findFirst({
				orderBy: {
					createdAt: 'desc',
				},
				select: {
					tradingsNew: true,
					emissions:   true,
				},
			},)
			const parsedTradingsNew = cBonds?.tradingsNew ?
				JSON.parse(cBonds.tradingsNew as string,) :
				[]
			const parsedEmissions = cBonds?.emissions ?
				JSON.parse(cBonds.emissions as string,) :
				[]

			const bondsToInsert = absentIsins.map((isin,) => {
				const trading = parsedTradingsNew.find((t: { isin: string },) => {
					return t.isin === isin
				},)
				const emission = parsedEmissions.find((e: { isin: string },) => {
					return e.isin === isin
				},)
				const isinItem = isins.find((item,) => {
					return item.isin === isin
				},)
				if (!trading || !emission || !isinItem) {
					return null
				}

				return {
					isin,
					security:           emission.security,
					marketPrice:        trading.marketPrice ?
						parseFloat(trading.marketPrice,) :
						0,
					dirtyPriceCurrency: trading.dirtyPriceCurrency ?
						parseFloat(trading.dirtyPriceCurrency,) :
						null,
					yield:              trading.yield ?
						parseFloat(trading.yield,) :
						null,
					sellingQuote:       trading.sellingQuote ?
						parseFloat(trading.sellingQuote,) :
						0,
					ytcOffer:           trading.ytcOffer ?
						parseFloat(trading.ytcOffer,) :
						null,
					gSpread:            trading.gSpread ?
						parseFloat(trading.gSpread,) :
						null,
					accrued:            trading.accrued ?
						parseFloat(trading.accrued,) :
						null,
					tradeDate:          trading.tradeDate ?
						new Date(trading.tradeDate,) :
						new Date(),
					issuer:             emission.issuer ?? null,
					nominalPrice:       emission.nominalPrice,
					maturityDate:       emission.maturityDate ?
						new Date(emission.maturityDate,) :
						null,
					country:            emission.country,
					sector:             emission.sector ?? null,
					coupon:             emission.coupon ?? null,
					nextCouponDate:     emission.nextCouponDate ?
						new Date(emission.nextCouponDate,) :
						null,
					offertDateCall:     emission.offertDateCall ?
						new Date(emission.offertDateCall,) :
						null,
					isinId:             isinItem.id,
				}
			},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			await this.prismaService.bond.createMany({
				data: bondsToInsert,
			},)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	public async historyMigrationForTrhirdDB(): Promise<void> {
		const isinsData = await this.thirdPartyPrismaService.client.isins.findMany({
			select: {
				isin: true,
				id:   true,
			},
		},)
		const bonds = await this.thirdPartyPrismaService.client.bond.findMany({
			select: {
				id:   true,
				isin: true,
			},
		},)
		const equities = await this.thirdPartyPrismaService.client.equity.findMany({
			select: {
				id:               true,
				isin:             true,
				equityCurrencyId: true,
			},
		},)
		const etfs = await this.thirdPartyPrismaService.client.etf.findMany({
			select: {
				id:               true,
				isin:             true,
				etfCurrencyId: true,
			},
		},)
		const isins = isinsData.map(({isin,},) => {
			return isin
		},)
		// let lastId: string | null = null
		// let hasNext = true
		// while (hasNext) {
		// 	const cBondsBatch: Array<CBonds> = await this.thirdPartyPrismaService.client.cBonds.findMany({
		// 		take:    1,
		// 		...(lastId ?
		// 			{ cursor: { id: lastId, }, skip: 1, } :
		// 			{}),
		// 		orderBy: { createdAt: 'asc', },
		// 	},)
		// 	const [cBonds,] = cBondsBatch
		// 	if (cBondsBatch.length === 0) {
		// 		hasNext = false
		// 		continue
		// 	}

		const cBonds = await this.thirdPartyPrismaService.client.cBonds.findFirst({
			take:    1,
			skip:    24,
			orderBy: { createdAt: 'desc', },
		},)
		if (!cBonds) {
			return
		}
		const parsedEtfDividends = cBonds.etfDividends ?
			JSON.parse(cBonds.etfDividends as string,) :
			[]
		const parsedEtfFunds = cBonds.etfFunds ?
			JSON.parse(cBonds.etfFunds as string,) :
			[]
		const parsedEtfQuotes = cBonds.etfQuotes ?
			JSON.parse(cBonds.etfQuotes as string,) :
			[]
		const parsedEtfTradingGrounds = cBonds.etfTradingGrounds ?
			JSON.parse(cBonds.etfTradingGrounds as string,) :
			[]

		const etfToInsert = isins.map((isin,) => {
			const etf = etfs.find((item,) => {
				return item.isin === isin
			},)
			if (!etf) {
				return null
			}
			const etfDividend = parsedEtfDividends.find((t: { isin: string, },) => {
				return t.isin === isin
			},)
			const etfFund = parsedEtfFunds.find((t: { isin: string },) => {
				return t.isin === isin
			},)
			const etfQuote = parsedEtfQuotes.find((t: { isin: string, currency_id: string  },) => {
				return t.isin === isin  && t.currency_id === etf.etfCurrencyId
			},)
			if (!etfDividend || !etfFund || !etfQuote) {
				return null
			}
			const emitent = parsedEtfTradingGrounds.find((t: { isin: string , currency_id: string , main_trading_ground: string },) => {
				return (t.isin === isin && t.currency_id === etf.etfCurrencyId && (t.main_trading_ground === '1' || t.main_trading_ground === '0')
				)
			},)
			return {
				etfCurrencyId:           etfQuote.currency_id,
				etfId:                   etf.id,
				isin,
				ticker:                  etfFund.ticker,
				close:                   parseFloat(etfQuote.close,),
				distributionAmount:         parseFloat(etfDividend.distribution_amount,),
				currencyName:            etfFund.etf_currency_name,
				fundsName:               etfFund.funds_name_eng,
				tradingGroundName:       etfFund.trading_ground_name_eng,
				geographyInvestmentName:   etfFund.geography_investment_name_eng,
				sectorName:              etfFund.sector_name_eng,
				tradingGroundId:         Number(emitent.trading_ground_id,),

				createdAt:               cBonds.createdAt,
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		if (etfToInsert.length > 0) {
			await this.thirdPartyPrismaService.client.etfHistory.createMany({ data: etfToInsert, },)
		}
		const parsedTradingsStocksFullNew = cBonds.tradingsStocksFullNew ?
			JSON.parse(cBonds.tradingsStocksFullNew as string,) :
			[]
		const parsedStocksTradingGrounds = cBonds.stocksTradingGrounds ?
			JSON.parse(cBonds.stocksTradingGrounds as string,) :
			[]
		const parsedStocksFull = cBonds.stocksFull ?
			JSON.parse(cBonds.stocksFull as string,) :
			[]
		const parsedEmitents = cBonds.emitents ?
			JSON.parse(cBonds.emitents as string,) :
			[]

		const equityToInsert = isins.map((isin,) => {
			const equity = equities.find((item,) => {
				return item.isin === isin
			},)
			if (!equity) {
				return null
			}
			const tradingsStockFullNew = parsedTradingsStocksFullNew.find((t: { isin: string, currency_id: string },) => {
				return t.isin === isin && t.currency_id === equity.equityCurrencyId
			},)
			const stocksTradingGround = parsedStocksTradingGrounds.find((t: { isin: string },) => {
				return t.isin === isin
			},)
			const stockFull = parsedStocksFull.find((t: { isin: string },) => {
				return t.isin === isin
			},)
			if (!tradingsStockFullNew || !stocksTradingGround || !stockFull) {
				return null
			}
			const emitent = parsedEmitents.find((t: { id: string },) => {
				return t.id === stockFull.emitent_id
			},)
			return {
				equityId:          equity.id,
				isin,
				ticker:            stocksTradingGround.ticker,
				tradingGroundId:   Number(stocksTradingGround.trading_ground_id,),
				lastPrice:         parseFloat(tradingsStockFullNew.last_price,),
				emitentName:       stocksTradingGround.emitent_name_eng,
				emitentBranchId:   stocksTradingGround.emitent_branch_id,
				tradingGroundName: stocksTradingGround.trading_ground_name_eng,
				equityCurrencyId:  tradingsStockFullNew.currency_id,
				currencyName:      stockFull.currency_name,
				stockEmitentId:    stockFull.emitent_id,
				stockEmitentName:  stocksTradingGround.trading_ground_name_eng,
				stockCountryName:  stockFull.country_name_eng,
				branchName:        emitent?.branch_name_eng ?? undefined,
				createdAt:          cBonds.createdAt,
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		if (equityToInsert.length > 0) {
			await this.thirdPartyPrismaService.client.equityHistory.createMany({ data: equityToInsert, },)
		}
		const parsedTradingsNew = cBonds.tradingsNew ?
			JSON.parse(cBonds.tradingsNew as string,) :
			[]
		const parsedEmissions = cBonds.emissions ?
			JSON.parse(cBonds.emissions as string,) :
			[]

		const bondsToInsert = isins.map((isin,) => {
			const trading = parsedTradingsNew.find((t: { isin: string },) => {
				return t.isin === isin
			},)
			const emission = parsedEmissions.find((e: { isin: string },) => {
				return e.isin === isin
			},)
			const isinItem = isinsData.find((item,) => {
				return item.isin === isin
			},)
			const bond = bonds.find((item,) => {
				return item.isin === isin
			},)
			if (!trading || !emission || !isinItem || !bond) {
				return null
			}

			return {
				bondId:             bond.id,
				isin,
				security:           emission.security,
				marketPrice:        trading.marketPrice ?
					parseFloat(trading.marketPrice,) :
					0,
				dirtyPriceCurrency: trading.dirtyPriceCurrency ?
					parseFloat(trading.dirtyPriceCurrency,) :
					null,
				yield:              trading.yield ?
					parseFloat(trading.yield,) :
					null,
				sellingQuote:       trading.sellingQuote ?
					parseFloat(trading.sellingQuote,) :
					0,
				ytcOffer:           trading.ytcOffer ?
					parseFloat(trading.ytcOffer,) :
					null,
				gSpread:            trading.gSpread ?
					parseFloat(trading.gSpread,) :
					null,
				accrued:            trading.accrued ?
					parseFloat(trading.accrued,) :
					null,
				tradeDate:          trading.tradeDate ?
					new Date(trading.tradeDate,) :
					new Date(),
				issuer:             emission.issuer ?? null,
				nominalPrice:       emission.nominalPrice,
				maturityDate:       emission.maturityDate ?
					new Date(emission.maturityDate,) :
					null,
				country:            emission.country,
				sector:             emission.sector ?? null,
				coupon:             emission.coupon ?? null,
				nextCouponDate:     emission.nextCouponDate ?
					new Date(emission.nextCouponDate,) :
					null,
				offertDateCall:     emission.offertDateCall ?
					new Date(emission.offertDateCall,) :
					null,
				createdAt:          cBonds.createdAt,
			}
		},).filter((item,): item is NonNullable<typeof item> => {
			return item !== null
		},)
		if (bondsToInsert.length > 0) {
			await this.thirdPartyPrismaService.client.bondHistory.createMany({ data: bondsToInsert, },)
		}
		// 	lastId = cBonds.id
		// }
	}

	public async historyMigrationForMainDB(): Promise<void> {
		const isinsData = await this.prismaService.isins.findMany({
			select: {
				isin: true,
				id:   true,
			},
		},)
		const bonds = await this.prismaService.bond.findMany({
			select: {
				id:   true,
				isin: true,
			},
		},)
		const equities = await this.prismaService.equity.findMany({
			select: {
				id:               true,
				isin:             true,
				equityCurrencyId: true,
			},
		},)
		const etfs = await this.prismaService.etf.findMany({
			select: {
				id:               true,
				isin:             true,
				etfCurrencyId: true,
			},
		},)
		const isins = isinsData.map(({isin,},) => {
			return isin
		},)
		let lastId: string | null = null
		let hasNext = true
		while (hasNext) {
			const cBondsBatch: Array<CBonds> = await this.prismaService.cBonds.findMany({
				take:    1,
				...(lastId ?
					{ cursor: { id: lastId, }, skip: 1, } :
					{}),
				orderBy: { createdAt: 'asc', },
			},)
			const [cBonds,] = cBondsBatch
			if (cBondsBatch.length === 0) {
				hasNext = false
				continue
			}

			const parsedEtfDividends = cBonds.etfDividends ?
				JSON.parse(cBonds.etfDividends as string,) :
				[]
			const parsedEtfFunds = cBonds.etfFunds ?
				JSON.parse(cBonds.etfFunds as string,) :
				[]
			const parsedEtfQuotes = cBonds.etfQuotes ?
				JSON.parse(cBonds.etfQuotes as string,) :
				[]
			const parsedEtfTradingGrounds = cBonds.etfTradingGrounds ?
				JSON.parse(cBonds.etfTradingGrounds as string,) :
				[]

			const etfToInsert = isins.map((isin,) => {
				const etf = etfs.find((item,) => {
					return item.isin === isin
				},)
				if (!etf) {
					return null
				}
				const etfDividend = parsedEtfDividends.find((t: { isin: string, },) => {
					return t.isin === isin
				},)
				const etfFund = parsedEtfFunds.find((t: { isin: string },) => {
					return t.isin === isin
				},)
				const etfQuote = parsedEtfQuotes.find((t: { isin: string, currency_id: string  },) => {
					return t.isin === isin  && t.currency_id === etf.etfCurrencyId
				},)
				if (!etfDividend || !etfFund || !etfQuote) {
					return null
				}
				const emitent = parsedEtfTradingGrounds.find((t: { isin: string , currency_id: string , main_trading_ground: string },) => {
					return (t.isin === isin && t.currency_id === etf.etfCurrencyId && (t.main_trading_ground === '1' || t.main_trading_ground === '0')
					)
				},)
				return {
					etfCurrencyId:           etfQuote.currency_id,
					etfId:                   etf.id,
					isin,
					ticker:                  etfFund.ticker,
					close:                   parseFloat(etfQuote.close,),
					distributionAmount:         parseFloat(etfDividend.distribution_amount,),
					currencyName:            etfFund.etf_currency_name,
					fundsName:               etfFund.funds_name_eng,
					tradingGroundName:       etfFund.trading_ground_name_eng,
					geographyInvestmentName:   etfFund.geography_investment_name_eng,
					sectorName:              etfFund.sector_name_eng,
					tradingGroundId:         Number(emitent.trading_ground_id,),

					createdAt:               cBonds.createdAt,
				}
			},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			if (etfToInsert.length > 0) {
				await this.prismaService.etfHistory.createMany({ data: etfToInsert, },)
			}
			const parsedTradingsStocksFullNew = cBonds.tradingsStocksFullNew ?
				JSON.parse(cBonds.tradingsStocksFullNew as string,) :
				[]
			const parsedStocksTradingGrounds = cBonds.stocksTradingGrounds ?
				JSON.parse(cBonds.stocksTradingGrounds as string,) :
				[]
			const parsedStocksFull = cBonds.stocksFull ?
				JSON.parse(cBonds.stocksFull as string,) :
				[]
			const parsedEmitents = cBonds.emitents ?
				JSON.parse(cBonds.emitents as string,) :
				[]

			const equityToInsert = isins.map((isin,) => {
				const equity = equities.find((item,) => {
					return item.isin === isin
				},)
				if (!equity) {
					return null
				}
				const tradingsStockFullNew = parsedTradingsStocksFullNew.find((t: { isin: string, currency_id: string },) => {
					return t.isin === isin && t.currency_id === equity.equityCurrencyId
				},)
				const stocksTradingGround = parsedStocksTradingGrounds.find((t: { isin: string },) => {
					return t.isin === isin
				},)
				const stockFull = parsedStocksFull.find((t: { isin: string },) => {
					return t.isin === isin
				},)
				if (!tradingsStockFullNew || !stocksTradingGround || !stockFull) {
					return null
				}
				const emitent = parsedEmitents.find((t: { id: string },) => {
					return t.id === stockFull.emitent_id
				},)
				return {
					equityId:          equity.id,
					isin,
					ticker:            stocksTradingGround.ticker,
					tradingGroundId:   Number(stocksTradingGround.trading_ground_id,),
					lastPrice:         parseFloat(tradingsStockFullNew.last_price,),
					emitentName:       stocksTradingGround.emitent_name_eng,
					emitentBranchId:   stocksTradingGround.emitent_branch_id,
					tradingGroundName: stocksTradingGround.trading_ground_name_eng,
					equityCurrencyId:  tradingsStockFullNew.currency_id,
					currencyName:      stockFull.currency_name,
					stockEmitentId:    stockFull.emitent_id,
					stockEmitentName:  stocksTradingGround.trading_ground_name_eng,
					stockCountryName:  stockFull.country_name_eng,
					branchName:        emitent?.branch_name_eng ?? undefined,
					createdAt:          cBonds.createdAt,
				}
			},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			if (equityToInsert.length > 0) {
				await this.prismaService.equityHistory.createMany({ data: equityToInsert, },)
			}
			const parsedTradingsNew = cBonds.tradingsNew ?
				JSON.parse(cBonds.tradingsNew as string,) :
				[]
			const parsedEmissions = cBonds.emissions ?
				JSON.parse(cBonds.emissions as string,) :
				[]

			const bondsToInsert = isins.map((isin,) => {
				const trading = parsedTradingsNew.find((t: { isin: string },) => {
					return t.isin === isin
				},)
				const emission = parsedEmissions.find((e: { isin: string },) => {
					return e.isin === isin
				},)
				const isinItem = isinsData.find((item,) => {
					return item.isin === isin
				},)
				const bond = bonds.find((item,) => {
					return item.isin === isin
				},)
				if (!trading || !emission || !isinItem || !bond) {
					return null
				}

				return {
					bondId:             bond.id,
					isin,
					security:           emission.security,
					marketPrice:        trading.marketPrice ?
						parseFloat(trading.marketPrice,) :
						0,
					dirtyPriceCurrency: trading.dirtyPriceCurrency ?
						parseFloat(trading.dirtyPriceCurrency,) :
						null,
					yield:              trading.yield ?
						parseFloat(trading.yield,) :
						null,
					sellingQuote:       trading.sellingQuote ?
						parseFloat(trading.sellingQuote,) :
						0,
					ytcOffer:           trading.ytcOffer ?
						parseFloat(trading.ytcOffer,) :
						null,
					gSpread:            trading.gSpread ?
						parseFloat(trading.gSpread,) :
						null,
					accrued:            trading.accrued ?
						parseFloat(trading.accrued,) :
						null,
					tradeDate:          trading.tradeDate ?
						new Date(trading.tradeDate,) :
						new Date(),
					issuer:             emission.issuer ?? null,
					nominalPrice:       emission.nominalPrice,
					maturityDate:       emission.maturityDate ?
						new Date(emission.maturityDate,) :
						null,
					country:            emission.country,
					sector:             emission.sector ?? null,
					coupon:             emission.coupon ?? null,
					nextCouponDate:     emission.nextCouponDate ?
						new Date(emission.nextCouponDate,) :
						null,
					offertDateCall:     emission.offertDateCall ?
						new Date(emission.offertDateCall,) :
						null,
					createdAt:          cBonds.createdAt,
				}
			},).filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
			if (bondsToInsert.length > 0) {
				await this.prismaService.bondHistory.createMany({ data: bondsToInsert, },)
			}
			lastId = cBonds.id
		}
	}

	// Temporary needed to cbonds data migration from excel history
	public async bondsHistoryStoringMainDbFromExcel(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/apis/cbonds-api/bond',)

		const files = fs.readdirSync(folderPath,)
		const bonds = await this.prismaService.bond.findMany()
		const allData: Array<Prisma.BondHistoryCreateManyInput> = []
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = data.slice(1,).map((row,) => {
					const rawDate = row[1]
					let tradeDate: string
					if (typeof rawDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawDate,)
						tradeDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawDate,),)
						tradeDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const isin = row[3]
					const trdaingGroundId = row[5]
					const bond = bonds.find((item,) => {
						return item.isin === isin
					},)
					const marketPrice  = row[37]
					if (!bond || trdaingGroundId !== 4 || !marketPrice) {
						return null
					}
					const yieldField = row[31]
					const accrued  = row[53]
					const sellingQuote = row[26]
					const ytcOffer = row[29]
					const gSpread = row[52]
					return {
						dirtyPriceCurrency: null,
						nominalPrice:       null,
						bondId:             bond.id,
						isin:               String(isin,),
						tradeDate:          new Date(tradeDate,),
						marketPrice:        Number(marketPrice,),
						yield:              yieldField ?
							Number(yieldField,) :
							null,
						accrued:        Number(accrued,),
						sellingQuote:   Number(sellingQuote,),
						ytcOffer:       ytcOffer ?
							Number(ytcOffer,) :
							null,
						gSpread:        gSpread ?
							Number(gSpread,) :
							null,
						createdAt:      new Date(tradeDate,),
						security:       bond.security,
						issuer:         bond.issuer,
						maturityDate:   bond.maturityDate,
						country:        bond.country,
						sector:         bond.sector,
						coupon:         bond.coupon,
						nextCouponDate: bond.nextCouponDate,
						offertDateCall: bond.offertDateCall,
					}
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await this.prismaService.bondHistory.createMany({
			data: allData,
		},)
	}

	public async bondsHistoryStoringFromExcel(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/apis/cbonds-api/bond',)
		const files = fs.readdirSync(folderPath,)
		const bonds = await this.thirdPartyPrismaService.client.bond.findMany()
		const allData: Array<Prisma.BondHistoryCreateManyInput> = []

		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = data.slice(1,).map((row,) => {
					const rawDate = row[1]
					let tradeDate: string
					if (typeof rawDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawDate,)
						tradeDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawDate,),)
						tradeDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const isin = row[3]
					const trdaingGroundId = row[5]
					const bond = bonds.find((item,) => {
						return item.isin === isin
					},)
					const marketPrice  = row[37]
					if (!bond || trdaingGroundId !== 4 || !marketPrice) {
						return null
					}
					const yieldField = row[31]
					const accrued  = row[53]
					const sellingQuote = row[26]
					const ytcOffer = row[29]
					const gSpread = row[52]
					return {
						bondId:         bond.id,
						isin:           String(isin,),
						tradeDate,
						marketPrice:    Number(marketPrice,),
						yield:          yieldField ?
							Number(yieldField,) :
							null,
						accrued:        Number(accrued,),
						sellingQuote:   Number(sellingQuote,),
						ytcOffer:       Number(ytcOffer,),
						gSpread:        Number(gSpread,),
						createdAt:      tradeDate,
						security:       bond.security,
						issuer:         bond.issuer,
						maturityDate:   bond.maturityDate,
						country:        bond.country,
						sector:         bond.sector,
						coupon:         bond.coupon,
						nextCouponDate: bond.nextCouponDate,
						offertDateCall: bond.offertDateCall,
					}
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await this.thirdPartyPrismaService.client.bondHistory.createMany({
			data: allData,
		},)
	}

	public async equitiesHistoryStoringMainDbFromExcel(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/apis/cbonds-api/equity',)

		const files = fs.readdirSync(folderPath,)
		const allData: Array<Prisma.EquityHistoryCreateManyInput> = []

		const equities = await this.prismaService.equity.findMany()
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = data.slice(1,).map((row,) => {
					const rawDate = row[8]
					let tradeDate: string
					if (typeof rawDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawDate,)
						tradeDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawDate,),)
						tradeDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const isin = row[2]
					const lastPrice = row[14]
					const equity = equities.find((item,) => {
						return item.isin === isin
					},)
					const stockId = row[6]
					const excelCurrencyId = row[4]
					if (!equity || !lastPrice || String(stockId,) !== String(equity.tradingGroundId,) || String(excelCurrencyId,) !== String(equity.equityCurrencyId,)) {
						return null
					}

					const equityCurrencyId = row[4]
					const currencyName = row[5]
					return {
						equityId:           equity.id,
						isin:              String(isin,),
						ticker:            equity.ticker,
						lastPrice:         Number(lastPrice,),
						equityCurrencyId:  String(equityCurrencyId,),
						currencyName:      String(currencyName,),
						createdAt:         tradeDate,
						tradingGroundId:   equity.tradingGroundId,
						emitentName:       equity.emitentName,
						emitentBranchId:   equity.emitentBranchId,
						tradingGroundName: equity.tradingGroundName,
						stockEmitentId:    equity.stockEmitentId,
						stockEmitentName:  equity.stockEmitentName,
						stockCountryName:  equity.stockCountryName,
						branchName:        equity.branchName,
					}
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await this.prismaService.equityHistory.createMany({
			data: allData,
		},)
	}

	public async equitiesHistoryStoringFromExcel(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/apis/cbonds-api/equity',)

		const files = fs.readdirSync(folderPath,)
		const allData: Array<Prisma.EquityHistoryCreateManyInput> = []

		const equities = await this.thirdPartyPrismaService.client.equity.findMany()
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = data.slice(1,).map((row,) => {
					const rawDate = row[8]
					let tradeDate: string
					if (typeof rawDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawDate,)
						tradeDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawDate,),)
						tradeDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const isin = row[2]
					const lastPrice = row[14]
					const equity = equities.find((item,) => {
						return item.isin === isin
					},)
					const stockId = row[6]
					const excelCurrencyId = row[4]
					if (!equity || !lastPrice || String(stockId,) !== String(equity.tradingGroundId,) || String(excelCurrencyId,) !== String(equity.equityCurrencyId,)) {
						return null
					}

					const equityCurrencyId = row[4]
					const currencyName = row[5]
					return {
						equityId:           equity.id,
						isin:              String(isin,),
						ticker:            equity.ticker,
						lastPrice:         Number(lastPrice,),
						equityCurrencyId:  String(equityCurrencyId,),
						currencyName:      String(currencyName,),
						createdAt:         tradeDate,
						tradingGroundId:   equity.tradingGroundId,
						emitentName:       equity.emitentName,
						emitentBranchId:   equity.emitentBranchId,
						tradingGroundName: equity.tradingGroundName,
						stockEmitentId:    equity.stockEmitentId,
						stockEmitentName:  equity.stockEmitentName,
						stockCountryName:  equity.stockCountryName,
						branchName:        equity.branchName,
					}
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await this.thirdPartyPrismaService.client.equityHistory.createMany({
			data: allData,
		},)
	}

	public async etfsHistoryStoringMainDbFromExcel(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/apis/cbonds-api/etf',)

		const files = fs.readdirSync(folderPath,)
		const allData: Array<Prisma.EtfHistoryCreateManyInput> = []

		const etfs = await this.prismaService.etf.findMany()
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = data.slice(1,).map((row,) => {
					const rawDate = row[8]
					let tradeDate: string
					if (typeof rawDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawDate,)
						tradeDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawDate,),)
						tradeDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const isin = row[3]
					const close = row[14]
					const	tradingGroundName = row[7]
					const etf = etfs.find((item,) => {
						return item.isin === isin
					},)
					const stockId = row[6]
					if (!etf || !close || String(stockId,) !== String(etf.tradingGroundId,)) {
						return null
					}
					return {
						etfId:                   etf.id,
						isin:                    String(isin,),
						ticker:                  etf.ticker,
						close:                   Number(close,),
						etfCurrencyId:           String(etf.etfCurrencyId,),
						createdAt:               tradeDate,
						distributionAmount:      etf.distributionAmount,
						currencyName:            etf.currencyName,
						fundsName:               etf.fundsName,
						geographyInvestmentName: etf.geographyInvestmentName,
						sectorName:              etf.sectorName,
						tradingGroundId:         etf.tradingGroundId,
						tradingGroundName:        String(tradingGroundName,),
					}
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await this.prismaService.etfHistory.createMany({
			data: allData,
		},)
	}

	public async etfsHistoryStoringFromExcel(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/apis/cbonds-api/etf',)

		const files = fs.readdirSync(folderPath,)
		const allData: Array<Prisma.EtfHistoryCreateManyInput> = []

		const etfs = await this.thirdPartyPrismaService.client.etf.findMany()
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = data.slice(1,).map((row,) => {
					const rawDate = row[8]
					let tradeDate: string
					if (typeof rawDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawDate,)
						tradeDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawDate,),)
						tradeDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const isin = row[3]
					const close = row[14]
					const	tradingGroundName = row[7]
					const etf = etfs.find((item,) => {
						return item.isin === isin
					},)
					const stockId = row[6]
					if (!etf || !close || String(stockId,) !== String(etf.tradingGroundId,)) {
						return null
					}
					return {
						etfId:                   etf.id,
						isin:                    String(isin,),
						ticker:                  etf.ticker,
						close:                   Number(close,),
						etfCurrencyId:           String(etf.etfCurrencyId,),
						createdAt:               tradeDate,
						distributionAmount:      etf.distributionAmount,
						currencyName:            etf.currencyName,
						fundsName:               etf.fundsName,
						geographyInvestmentName: etf.geographyInvestmentName,
						sectorName:              etf.sectorName,
						tradingGroundId:         etf.tradingGroundId,
						tradingGroundName:        String(tradingGroundName,),
					}
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await this.thirdPartyPrismaService.client.etfHistory.createMany({
			data: allData,
		},)
	}

	public async removeUnnecessaryHistory(): Promise<void> {
		await this.prismaService.etfHistory.deleteMany({
			where: {
				isin:          'CH0116014934',
				etfCurrencyId: '7',
			},
		},)
		await this.prismaService.etf.delete({
			where: {
				isin_currencyId: {
					isin:       'CH0116014934',
					currencyId: '7',
				},
			},
		},)
		await this.thirdPartyPrismaService.client.etfHistory.deleteMany({
			where: {
				isin:          'CH0116014934',
				etfCurrencyId: '7',
			},
		},)
		await this.thirdPartyPrismaService.client.etf.delete({
			where: {
				isin_currencyId: {
					isin:       'CH0116014934',
					currencyId: '7',
				},
			},
		},)
	}
}
