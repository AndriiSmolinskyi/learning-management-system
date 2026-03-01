/* eslint-disable complexity */
/* eslint-disable max-lines */
import {CBondsIsinService,} from './isin.service'
import {HttpException, HttpStatus, Injectable,} from '@nestjs/common'
import { PrismaService,} from 'nestjs-prisma'
import type {GetSecurityByIsinDto,} from '../dto'
import {ERROR_MESSAGES, } from '../../../../shared/constants'
import type {IEquityAsset,} from '../../../../modules/asset/asset.types'
import {AssetNamesType,} from '../../../../modules/asset/asset.types'
import {assetParser,} from '../../../../shared/utils'
import {AssetOperationType,} from '../../../../shared/types'
import {CBondsApiService,} from './'
import type {
	IEquityDataForAnalytics,
	IEquityStocksGrounds,
	IEquityTradingStocks,
	IETFQuotes,
	IEtfTradingGrounds,
	IGetEmitentsResponse,
	IGetEtfFundsResponse,
	IGetStocksFullResponse,
} from '../cbonds-api.types'
import {IsinTypeIds,} from '../cbonds-api.types'
import type {CBonds, CurrencyDataList,} from '@prisma/client'

@Injectable()
export class CBondsEquityStocksService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsApiService: CBondsApiService,
		private readonly cBondsIsinService: CBondsIsinService,
	) { }

	/**
	 * 2.2.1.4
	 * Retrieves a list of ISINs (International Securities Identification Numbers) for equity stocks.
	 * @returns A promise that resolves to an array of strings representing the ISINs of all equity stocks.
	 *
	 * This method fetches all ISINs associated with equity stocks by calling the `getEquityStocksIsins` method
	 * of the `cBondsEquityStocksRepository`. It returns an array of ISIN strings.
	 *
	 * Error Handling:
	 * - Any errors during data retrieval will be handled by the repository or calling code.
	 */
	public async getEquityStocksIsins(currency?: CurrencyDataList,): Promise<Array<string>> {
		try {
			let currencyId: string | undefined
			if (currency) {
				const currencyData = await this.prismaService.currencyData.findFirst({
					where: {
						currency,
					},
				},)

				if (currencyData) {
					const { currencyId: foundCurrencyId, } = currencyData
					currencyId = foundCurrencyId
				}
			}
			const equities = await this.prismaService.isins.findMany({
				where: {
					OR: [
						{ typeId: IsinTypeIds.EQUITY, },
						{ typeId: IsinTypeIds.ETF, },
					],
					...(currencyId ?
						{ currencyId, } :
						{}),
				},
				select: {
					isin: true,
				},
			},)
			return equities.map((equity,) => {
				return equity.isin
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 3.5.3
	 * Retrieves a list of securities associated with equity stocks.
	 * @returns A promise that resolves to an array of strings representing the securities of all equity stocks.
	 *
	 * This method fetches all securities associated with equity stocks by calling the `getEquityStocksSecurities`
	 * method of the `cBondsEquityStocksRepository`. It returns an array of security identifiers.
	 *
	 * Error Handling:
	 * - Any errors during data retrieval will be handled by the repository or calling code.
	 */
	public async getEquityStocksSecurities(): Promise<Array<string>> {
		try {
			const cBonds = await this.prismaService.cBonds.findFirst({
				orderBy: { createdAt: 'desc', },
				select:  {
					stocksTradingGrounds: true,
					etfFunds:             true,
				},
			},)
			if (!cBonds) {
				return []
			}
			const parsedCBonds = typeof cBonds.stocksTradingGrounds === 'string' ?
				JSON.parse(cBonds.stocksTradingGrounds,) :
				[]
			const parsedEtfFunds = typeof cBonds.etfFunds === 'string' ?
				JSON.parse(cBonds.etfFunds,) :
				[]
			return [...parsedCBonds, ...parsedEtfFunds,].map((bond,) => {
				return String(bond.ticker,)
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 2.2.1.4
	 * Retrieves equity stock details based on a provided ISIN (International Securities Identification Number).
	 * @param query - The `GetSecurityByIsinDto` object containing the ISIN to search for.
	 * @returns A promise that resolves to the equity stock details associated with the given ISIN, or `null` if not found.
	 *
	 * This method fetches equity stock details by querying the `cBondsEquityStocksRepository` for a matching ISIN.
	 * It returns the stock information or `null` if no matching record is found.
	 *
	 * Error Handling:
	 * - Any errors during data retrieval will be handled by the repository or calling code.
	 */
	public async getEquitySecurityByIsin(query: GetSecurityByIsinDto,): Promise<string | number | null> {
		const { isin, } = query
		const typeId = await this.cBondsIsinService.getIsinTypeId(isin,)
		if (!typeId) {
			return null
		}
		if (typeId === IsinTypeIds.EQUITY) {
			const equity = await this.prismaService.equity.findFirst({
				where: {
					isin,
				},
			},)
			if (equity?.ticker) {
				return equity.ticker
			}
		}
		if (typeId === IsinTypeIds.ETF) {
			const equity = await this.prismaService.etf.findFirst({
				where: {
					isin,
				},
			},)
			if (equity?.ticker) {
				return equity.ticker
			}
		}
		return this.cBondsApiService.getEquityIsinSecurity(isin, typeId,)
	}

	/**
	 * CR-124
	 * Retrieves issuer information for a given ISIN (International Securities Identification Number).
	 * @param query - The query parameters containing the ISIN code.
	 * @returns A Promise that resolves to a string representing the issuer name or null if not found.
	 *
	 * This method fetches issuer information for both equity stocks and ETF funds:
	 * - For equity stocks: returns the emitent_name_eng field
	 * - For ETF funds: returns the funds_name_eng field
	 */
	public async getEquityIssuerByIsin(query: GetSecurityByIsinDto,): Promise<string | null> {
		const { isin, } = query
		const typeId = await this.cBondsIsinService.getIsinTypeId(isin,)
		if (!typeId) {
			return null
		}

		try {
			if (typeId === IsinTypeIds.EQUITY) {
				const equities = await this.prismaService.cBonds.findMany({
					select: {
						stocksTradingGrounds: true,
					},
				},)
				const parsedCBonds = equities.flatMap((item,) => {
					if (typeof item.stocksTradingGrounds === 'string') {
						return JSON.parse(item.stocksTradingGrounds,)
					}
					return []
				},)
				const equity = parsedCBonds.find((item,) => {
					return item.isin === isin
				},)
				if (equity?.emitent_name_eng) {
					return equity.emitent_name_eng
				}
				return null
			}

			if (typeId === IsinTypeIds.ETF) {
				const etfFunds = await this.prismaService.cBonds.findMany({
					select: {
						etfFunds: true,
					},
				},)
				const parsedETFFunds = etfFunds.flatMap((item,) => {
					if (typeof item.etfFunds === 'string') {
						return JSON.parse(item.etfFunds,)
					}
					return []
				},)
				const etf = parsedETFFunds.find((item,) => {
					return item.isin === isin
				},)
				if (etf?.funds_name_eng) {
					return etf.funds_name_eng
				}
				return null
			}

			return null
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 3.5.4
	 * Retrieves the ticker symbol for a given ISIN (International Securities Identification Number).
	 * @param stocksGorunds - An array of `IEquityStock` objects containing trading ground information.
	 * @param isin - The ISIN code for which the ticker symbol is to be retrieved.
	 * @returns A string representing the ticker symbol of the equity stock associated with the given ISIN.
	 *
	 * This method parses the `stocksTradingGrounds` field from each stock entry and searches for a matching ISIN.
	 * It returns the corresponding ticker symbol if a match is found.
	 *
	 * Error Handling:
	 * - If `stocksTradingGrounds` is not a valid JSON string, it will be ignored.
	 * - If no matching ISIN is found, the function may throw an error or return `undefined`, so ensure proper handling when calling this method.
	 */
	public getEquityTickerByIsin = (stocksGorunds: Array<Partial<CBonds>>, isin: string,): string | null => {
		const parsedStocksGorunds = stocksGorunds.flatMap((item,) => {
			if (typeof item.stocksTradingGrounds === 'string') {
				return JSON.parse(item.stocksTradingGrounds,)
			}
			return item.stocksTradingGrounds
		},)
		const parsedETFGorunds = stocksGorunds.flatMap((item,) => {
			if (typeof item.etfFunds === 'string') {
				return JSON.parse(item.etfFunds,)
			}
			return item.etfFunds
		},)
		const tickerItem = parsedStocksGorunds.find((item,) => {
			return item.isin === isin
		},)
		const tickerETFItem = parsedETFGorunds.find((item,) => {
			return item.isin === isin
		},)
		if (!tickerItem && tickerETFItem) {
			return tickerETFItem.ticker
		}
		if (!tickerETFItem && tickerItem) {
			return tickerItem.ticker
		}
		return null
	}

	/**
	 * 3.5.4
	 * Aggregates and returns detailed analytics data for an equity instrument based on a given ISIN.
	 *
	 * @param stocksGrounds - Array of `IEquityStocksGrounds` containing basic stock metadata like ticker.
	 * @param tradingStocks - Array of `IEquityTradingStocks` containing trading data such as last price.
	 * @param equityStocks - Array of `IGetStocksFullResponse` with stock metadata including emitent and country info.
	 * @param parsedEmitents - Array of `IGetEmitentsResponse` that includes detailed branch information about emitents.
	 * @param isin - The ISIN (International Securities Identification Number) used to find corresponding data across arrays.
	 * @returns An `IEquityDataForAnalytics` object containing key information like ticker, last price, emitent, country, and branch.
	 *
	 * The function cross-references the given ISIN across four different datasets to collect full context for equity analytics.
	 * If any dataset does not contain a matching entry, the corresponding fields in the result may be `undefined`.
	 */
	// todo: need to clear
	// public getEquityDataForAnalytics = (
	// 	stocksGrounds: Array<IEquityStocksGrounds>,
	// 	tradingStocks: Array<IEquityTradingStocks>,
	// 	equityStocks: Array<IGetStocksFullResponse>,
	// 	parsedEmitents: Array<IGetEmitentsResponse>,
	// 	isin: string,
	// ): IEquityDataForAnalytics => {
	// 	const groundItem = stocksGrounds.find((ground,) => {
	// 		return ground.isin === isin
	// 	},)
	// 	const tradingItem = tradingStocks.find((trading,) => {
	// 		return trading.isin === isin
	// 	},)
	// 	const stockItem = equityStocks.find((stock,) => {
	// 		return stock.isin === isin
	// 	},)
	// 	const emitentItem = parsedEmitents.find((item,) => {
	// 		return item.id === stockItem?.emitent_id
	// 	},)
	// 	return {
	// 		ticker:           groundItem?.ticker,
	// 		lastPrice:       tradingItem?.last_price,
	// 		emitentNameEng: stockItem?.emitent_name_eng,
	// 		countryNameEng: stockItem?.country_name_eng,
	// 		branchNameEng:  emitentItem?.branch_name_eng ?
	// 			emitentItem.branch_name_eng :
	// 			undefined,
	// 	}
	// }
	public getEquityDataForAnalytics = (
		stocksGrounds: Array<IEquityStocksGrounds | undefined>,
		tradingStocks: Array<IEquityTradingStocks>,
		equityStocks: Array<IGetStocksFullResponse | undefined>,
		parsedEmitents: Array<IGetEmitentsResponse | undefined>,
		isin: string,
		currencyId: string,
	): IEquityDataForAnalytics => {
		const groundItem = stocksGrounds.find((ground,) => {
			return ground?.isin === isin
		},)
		const tradingItem = tradingStocks.find((trading,) => {
			if (groundItem) {
				if (currencyId === '12') {
					return (
						trading.isin === isin &&
						trading.trading_ground_id === groundItem.trading_ground_id &&
						trading.currency_id === currencyId
					) || (
						trading.isin === isin &&
							trading.trading_ground_id === groundItem.trading_ground_id &&
							trading.currency_id === '247'
					)
				}
				return (
					trading.isin === isin &&
					trading.trading_ground_id === groundItem.trading_ground_id &&
					trading.currency_id === currencyId
				)
			}
			return (
				trading.isin === isin &&
				trading.currency_id === currencyId
			)
		},)
		const stockItem = equityStocks.find((stock,) => {
			return stock?.isin === isin
		},)
		const emitentItem = parsedEmitents.find((item,) => {
			return item?.id === stockItem?.emitent_id
		},)
		return {
			ticker:         groundItem?.ticker,
			lastPrice:      tradingItem?.last_price,
			emitentNameEng: stockItem?.emitent_name_eng,
			countryNameEng: stockItem?.country_name_eng,
			branchNameEng:  emitentItem?.branch_name_eng ?
				emitentItem.branch_name_eng :
				undefined,
		}
	}

	/**
	 * 3.5.4
	 * Retrieves analytics-related data for an ETF instrument based on the given ISIN.
	 *
	 * @param stocksGrounds - Array of `IGetEtfFundsResponse` providing ETF metadata such as ticker, fund name, country, and sector.
	 * @param tradingStocks - Array of `IETFQuotes` providing trading data such as the latest close price.
	 * @param isin - The ISIN (International Securities Identification Number) identifying the ETF.
	 * @returns An `IEquityDataForAnalytics` object containing information like ticker, last price, fund name, geography, and sector.
	 *
	 * This method consolidates data from ETF metadata and trading information arrays using the ISIN as the key.
	 * If either source lacks a matching ISIN, the corresponding fields in the result may be `undefined`.
	 */
	// todo: need to clear
	// public getEtfDataForAnalytics = (
	// 	stocksGrounds: Array<IGetEtfFundsResponse>,
	// 	tradingStocks: Array<IETFQuotes>,
	// 	isin: string,
	// ): IEquityDataForAnalytics => {
	// 	const groundItem = stocksGrounds.find((ground,) => {
	// 		return ground.isin === isin
	// 	},)
	// 	const tradingItem = tradingStocks.find((trading,) => {
	// 		return trading.isin === isin
	// 	},)
	// 	return {
	// 		ticker:           groundItem?.ticker,
	// 		lastPrice:       tradingItem?.close,
	// 		emitentNameEng: groundItem?.funds_name_eng,
	// 		countryNameEng: groundItem?.geography_investment_name_eng,
	// 		branchNameEng:  groundItem?.sector_name_eng,
	// 	}
	// }
	public getEtfDataForAnalytics = (
		etfTradingGrounds: Array<IEtfTradingGrounds>,
		stocksGrounds: Array<IGetEtfFundsResponse | undefined>,
		tradingStocks: Array<IETFQuotes>,
		isin: string,
		currencyId: string,
	): IEquityDataForAnalytics => {
		const groundItem = stocksGrounds.find((ground,) => {
			return ground?.isin === isin
		},)
		const etfTradingGroundItem = etfTradingGrounds.find((item,) => {
			return (item.isin === isin && item.main_trading_ground === '1' && currencyId === item.currency_id) || (item.isin === isin && currencyId === item.currency_id)
		},)
		const tradingItem = tradingStocks.find((trading,) => {
			if (etfTradingGroundItem?.trading_ground_id) {
				if (currencyId === '12') {
					return (
						trading.isin === isin &&
						trading.currency_id === currencyId
					) || (
						trading.isin === isin &&
							trading.currency_id === '247'
					)
				}
				return (
					trading.isin === isin &&
					trading.currency_id === currencyId &&
					trading.trading_ground_id === etfTradingGroundItem.trading_ground_id
				) || (
					trading.isin === isin &&
						trading.currency_id === currencyId
				)
			}
			return (
				trading.isin === isin &&
				trading.currency_id === currencyId
			)
		},)
		return {
			ticker:         groundItem?.ticker,
			lastPrice:      tradingItem?.close,
			emitentNameEng: groundItem?.funds_name_eng,
			countryNameEng: groundItem?.geography_investment_name_eng,
			branchNameEng:  groundItem?.sector_name_eng,
		}
	}

	/**
	 * 3.5.4
	 * Retrieves the issuer for a given ISIN (International Securities Identification Number).
	 * @param stocksGorunds - An array of `IEquityStock` objects containing trading ground information.
	 * @param isin - The ISIN code for which the issuer is to be retrieved.
	 * @returns A string representing the issuerl of the equity stock associated with the given ISIN.
	 *
	 * This method parses the `stocksTradingGrounds` field from each stock entry and searches for a matching ISIN.
	 * It returns the corresponding issuer if a match is found.
	 *
	 * Error Handling:
	 * - If `stocksTradingGrounds` is not a valid JSON string, it will be ignored.
	 * - If no matching ISIN is found, the function may throw an error or return `undefined`, so ensure proper handling when calling this method.
	 */
	public getEquityIssuerByIsinHelper = (stocksGorunds: Array<Partial<CBonds>>, isin: string,): string | null => {
		const parsedStocksGorunds = stocksGorunds.flatMap((item,) => {
			if (typeof item.stocksTradingGrounds === 'string') {
				return JSON.parse(item.stocksTradingGrounds,)
			}
			return item.stocksTradingGrounds
		},)
		const parsedETFGorunds = stocksGorunds.flatMap((item,) => {
			if (typeof item.etfFunds === 'string') {
				return JSON.parse(item.etfFunds,)
			}
			return item.etfFunds
		},)
		const tickerItem = parsedStocksGorunds.find((item,) => {
			return item.isin === isin
		},)
		const tickerETFItem = parsedETFGorunds.find((item,) => {
			return item.isin === isin
		},)
		if (!tickerItem && tickerETFItem) {
			return tickerETFItem.funds_name_eng
		}
		if (!tickerETFItem && tickerItem) {
			return tickerItem.emitent_name_eng
		}
		return null
	}

	/**
	 * 3.5.4
	 * Retrieves trading stock details for a given ISIN (International Securities Identification Number).
	 * @param tradingStocks - An array of `IEquityTradingStock` objects containing trading stock information.
	 * @param isin - The ISIN code for which the trading stock details are to be retrieved.
	 * @returns An object representing the trading stock details associated with the given ISIN, or `undefined` if not found.
	 *
	 * This method parses the `tradingsStocksFullNew` field from each trading stock entry and searches for a matching ISIN.
	 * It returns the corresponding trading stock details if a match is found.
	 *
	 * Error Handling:
	 * - If `tradingsStocksFullNew` is not a valid JSON string, it will be ignored.
	 * - If no matching ISIN is found, the function returns `undefined`, so ensure proper handling when calling this method.
	 */
	public getEquityTradingStock = (tradingStocks: Array<Partial<CBonds>>, isin: string,): {
		id?: string;
		isin: string;
		last_price: string;
	} | null => {
		const parsedCBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.tradingsStocksFullNew === 'string') {
				return JSON.parse(item.tradingsStocksFullNew,)
			}
			return item.tradingsStocksFullNew
		},)
		const parsedETFBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.etfQuotes === 'string') {
				return JSON.parse(item.etfQuotes,)
			}
			return item.etfQuotes
		},)
		const tradingStock = parsedCBonds.find((item,) => {
			return item.isin === isin
		},)
		const tradingETFStock = parsedETFBonds.find((item,) => {
			return item.isin === isin
		},)
		if (!tradingStock && tradingETFStock) {
			const { close, } = tradingETFStock
			return {
				last_price: close,
				isin,
			}
		}
		if (!tradingETFStock && tradingStock) {
			return tradingStock
		}
		return null
	}

	/**
 * 3.5.4
 * Retrieves currency name for a stock by ISIN from the `stocksFull` field.
 * @param tradingStocks - CBonds records.
 * @param isin - ISIN to search for.
 * @returns Currency name or `null`.
 */
	public getEquityStocksFullCurrencyName = (tradingStocks: Array<Partial<CBonds>>, isin: string,): string | null => {
		const parsedCBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.stocksFull === 'string') {
				return JSON.parse(item.stocksFull,)
			}
			return null
		},)
		const tradingStock = parsedCBonds.find((item,) => {
			return item.isin === isin
		},)
		if (!tradingStock) {
			return null
		}
		return tradingStock.currency_name
	}

	/**
 * 3.5.4
 * Retrieves country name for a stock or ETF by ISIN.
 * @param tradingStocks - CBonds records.
 * @param isin - ISIN to search for.
 * @returns Country name or `null`.
 */
	public getEquityStocksFullCountry = (tradingStocks: Array<Partial<CBonds>>, isin: string,): string | null => {
		const parsedCBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.stocksFull === 'string') {
				return JSON.parse(item.stocksFull,)
			}
			return item.stocksFull
		},)
		const parsedETFCBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.etfFunds === 'string') {
				return JSON.parse(item.etfFunds,)
			}
			return item.etfFunds
		},)
		const tradingStock = parsedCBonds.find((item,) => {
			return item.isin === isin
		},)
		const tradingETFStock = parsedETFCBonds.find((item,) => {
			return item.isin === isin
		},)
		if (!tradingStock && tradingETFStock) {
			return tradingETFStock.geography_investment_name_eng
		}
		if (!tradingETFStock && tradingStock) {
			return tradingStock.country_name_eng
		}
		return null
	}

	/**
 * 3.5.4
 * Retrieves sector name by ISIN, depending on whether it’s an equity or ETF.
 * @param tradingStocks - CBonds records.
 * @param isin - ISIN to lookup.
 * @returns Sector or branch name, or `null` if not found.
 */
	public getEquityStocksFullSector = (tradingStocks: Array<Partial<CBonds>>, isin: string,): string | null => {
		const parsedCBondsStocks = tradingStocks.flatMap((item,) => {
			if (typeof item.stocksFull === 'string') {
				return JSON.parse(item.stocksFull,)
			}
			return item.stocksFull
		},)
		const stock = parsedCBondsStocks.find((item,) => {
			return item.isin === isin
		},)
		const parsedCBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.emitents === 'string') {
				return JSON.parse(item.emitents,)
			}
			return item.emitents
		},)
		const parsedETFBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.etfFunds === 'string') {
				return JSON.parse(item.etfFunds,)
			}
			return item.etfFunds
		},)
		const tradingETFStock = parsedETFBonds.find((item,) => {
			return item.isin === isin
		},)
		if (!stock && tradingETFStock) {
			return tradingETFStock.sector_name_eng
		}
		if (stock && !tradingETFStock) {
			const tradingStock = parsedCBonds.find((item,) => {
				return item.id === stock.emitent_id
			},)
			if (tradingStock) {
				return tradingStock.branch_name_eng
			}
		}
		if (!stock && !tradingETFStock) {
			return null
		}
		return null
	}

	/**
 * 3.5.4
 * Retrieves last known stock price from `stocksFull` field by ISIN.
 * @param tradingStocks - CBonds data array.
 * @param isin - ISIN to lookup.
 * @returns Price data object or `null`.
 */
	public getEquityStocksFullTockPrice = (tradingStocks: Array<Partial<CBonds>>, isin: string,): {
		id: string;
		isin: string;
		last_price: string;
	} | null => {
		const parsedCBonds = tradingStocks.flatMap((item,) => {
			if (typeof item.stocksFull === 'string') {
				return JSON.parse(item.stocksFull,)
			}
			return item.stocksFull
		},)
		const tradingStock = parsedCBonds.find((item,) => {
			return item.isin === isin
		},)
		if (!tradingStock) {
			return null
		}
		return tradingStock.country_name_eng
	}

	/**
 * CR - 030
 * Cron function that deactivates ISINs with zero net units (buy - sell = 0).
 */
	public async checkEquityIsinsUnits(): Promise<void> {
		const assets = await this.prismaService.asset.findMany({
			where: {
				assetName: AssetNamesType.EQUITY_ASSET,
			},
		},)
		const isinMap: Record<string, number> = {}
		assets.forEach((asset,) => {
			const parsedPayload = assetParser<IEquityAsset>(asset,)
			if (parsedPayload) {
				if (!isinMap[parsedPayload.isin]) {
					isinMap[parsedPayload.isin] = 0
				}
				if (parsedPayload.operation === AssetOperationType.BUY) {
					isinMap[parsedPayload.isin] = isinMap[parsedPayload.isin] + parsedPayload.units
				} else {
					isinMap[parsedPayload.isin] = isinMap[parsedPayload.isin] - parsedPayload.units
				}
			}
		},)
		const updatePromises = Object.entries(isinMap,).map(async([isin, totalUnits,],) => {
			if (totalUnits === 0) {
				return this.prismaService.isins.update({
					where: { isin, },
					data:  { isActivated: false, },
				},)
			}
			return this.prismaService.isins.update({
				where: { isin, },
				data:  { isActivated: true, },
			},)
		},)
		await Promise.all(updatePromises,)
	}
}