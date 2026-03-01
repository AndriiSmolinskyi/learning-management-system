/* eslint-disable max-depth */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import { Injectable, Logger, } from '@nestjs/common'
import { EquityType, CurrencyDataList, type Equity, type Etf, type Prisma, } from '@prisma/client'
import { v4 as uuid4, } from 'uuid'
import { assetParser, } from '../../../shared/utils'
import {
	CBondsCurrencyService, CBondsEquityStocksService,
} from '../../../modules/apis/cbonds-api/services'
import type {
	IAnalyticEquity, IAnalyticEquityWithInnerAssets, IEquitiesByFilters, IEquityFilterSelectsData, TBankAnalytics, TBondsCurrencyAnalytics,
} from '../analytics.types'
import type { IEquityAsset, TAssetExtended,} from '../../asset/asset.types'
import { AssetNamesType, } from '../../asset/asset.types'
// import { TEquityTableSortVariants,} from '../analytics.types'
import type { AnalyticsEquityFilterDto, EquityCurrencyFilterDto, EquitySelectBySourceIdsDto, } from '../dto'
import { AssetOperationType, SortOrder, } from '../../../shared/types'
import { endOfDay, } from 'date-fns'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TEquityInitials, } from '../../../modules/common/cache-sync/cache-sync.types'

@Injectable()
export class EquityAssetService {
	private readonly logger = new Logger(EquityAssetService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cBondsEquityStocksService: CBondsEquityStocksService,
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
	) {}

	private getTimestampLogger = (): ((functionName: string, label: string) => void) => {
		const start = performance.now()
		return (functionName: string, label: string,): void => {
			const now = performance.now()
			this.logger.warn(`[Equity-${functionName}]: [${label}] ${Math.round(now - start,)} ms`,)
		}
	}

	/**
		* 3.5.4
 		* Calculates annual income from equity transactions based on provided filters.
		* @remarks
		* Fetches transactions of type "Equity" for the current year (up to the given date or today),
		* filters them by portfolios, banks, accounts, entities, and clients. If the selected date is
		* in the previous year, returns 0. Otherwise, sums each transaction's amount multiplied by its rate.
		* @param filter - Criteria for filtering transactions.
		* @param clientId - Optional client ID to override filter.
		* @returns Total income for the current year.
	*/
	public async getEquityAnnual(filter: AnalyticsEquityFilterDto, clientId?: string,): Promise<number> {
		const selectedDate = filter.date ?
			new Date(filter.date,) :
			new Date()
		const year = selectedDate.getFullYear()

		const startOfYear = new Date(Date.UTC(year, 0, 1,),)
		const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999,),)
		const transactions = await this.prismaService.transaction.findMany({
			where: {
				portfolioId: {
					in: filter.portfolioIds,
				},
				entityId: {
					in: filter.entitiesIds,
				},
				bankId: {
					in: filter.bankIds,
				},
				bank: {
					is: {
						bankListId: { in: filter.bankListIds, },
					},
				},
				accountId: {
					in: filter.accountIds,
				},
				clientId: {
					in: clientId ?
						[clientId,] :
						filter.clientIds,
				},
				portfolio: {
					is: {
						isActivated: true,
					},
				},
				typeVersion: {
					annualAssets: { has: AssetNamesType.EQUITY_ASSET, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},

			},
		},)
		const equityAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return equityAnnual
	}

	/**
 * 3.5.3
 * Retrieves the equity types of assets associated with the specified bank IDs.
 *
 * @remarks
 * - Filters assets based on the provided bank IDs and the asset name `EQUITY_ASSET`.
 * - Parses each matching asset to extract its `equityType` value.
 * - Returns an array of equity types.
 * - If an error occurs during processing, an empty array is returned.
 *
 * @param ids - Optional array of bank IDs to filter the equity assets.
 * @returns A Promise resolving to an object of arrays (types, isins, securities).
 */
	public async getEquityFitlerSelectsBySourceIds(filter: EquitySelectBySourceIdsDto, clientId?: string,): Promise<IEquityFilterSelectsData> {
		const {clientIds, portfolioIds,entityIds,accountIds,bankListIds, type,} = filter
		if (filter.type === AssetNamesType.CRYPTO) {
			const assets = await this.prismaService.assetCrypto.findMany({
				where: {
					clientId:    {in: clientIds,},
					portfolioId:  { in: portfolioIds, },
					entityId:    { in: entityIds, },
					accountId:   { in: accountIds,},
					...(clientId ?
						{
							clientId: {
								in: [clientId,],
							},
						} :
						{}),
					group: {
						bank: {
							is: {
								bankListId: {in: bankListIds,},
							},
						},
						portfolio: {
							is: {
								isActivated: true,
							},
						},
						totalUnits: {
							gt: 0,
						},
						currentStockPrice: {
							not: 0,
						},
						transferDate: null,
					},
					assetName: type,
				},
			},)
			try {
				const isins = assets.map((asset,) => {
					return asset.isin
				},)
					.filter((item,): item is string => {
						return item !== null
					},)
				const securities = assets.map((asset,) => {
					return asset.security
				},)
					.filter((item,): item is string => {
						return item !== null
					},)
				const cryptoCurrencies = assets.map((asset,) => {
					return asset.cryptoCurrencyType
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				const cryptoWallets = assets.map((asset,) => {
					return asset.exchangeWallet
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				return {
					equityTypes:      [],
					equityIsins:      Array.from(new Set(isins,),),
					equitySecurities: Array.from(new Set(securities,),),
					cryptoCurrencies:      Array.from(new Set(cryptoCurrencies,),),
					wallets:          Array.from(new Set(cryptoWallets,),),
				}
			} catch (error) {
				return {
					equityTypes:      [],
					equityIsins:      [] ,
					equitySecurities: [],
					cryptoCurrencies: [],
				}
			}
		}
		if (filter.type === AssetNamesType.METALS) {
			const assets = await this.prismaService.assetMetal.findMany({
				where: {
					clientId:    {in: clientIds,},
					portfolioId:  { in: portfolioIds, },
					entityId:    { in: entityIds, },
					accountId:   { in: accountIds,},
					...(clientId ?
						{
							clientId: {
								in: [clientId,],
							},
						} :
						{}),
					group: {
						bank: {
							is: {
								bankListId: {in: bankListIds,},
							},
						},
						portfolio: {
							is: {
								isActivated: true,
							},
						},
						totalUnits: {
							gt: 0,
						},
						currentStockPrice: {
							not: 0,
						},
						transferDate: null,
					},
					assetName: type,
				},
			},)
			try {
				const isins = assets.map((asset,) => {
					return asset.isin
				},)
					.filter((item,): item is string => {
						return item !== null
					},)
				const securities = assets.map((asset,) => {
					return asset.security
				},)
					.filter((item,): item is string => {
						return item !== null
					},)
				const metalCurrencies = assets.map((asset,) => {
					return asset.metalType
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				return {
					equityTypes:      [],
					equityIsins:      Array.from(new Set(isins,),),
					equitySecurities: Array.from(new Set(securities,),),
					metalCurrencies:  Array.from(new Set(metalCurrencies,),),
				}
			} catch (error) {
				return {
					equityTypes:      [],
					equityIsins:      [] ,
					equitySecurities: [],
					metalCurrencies:  [],

				}
			}
		}
		const assets = await this.prismaService.assetEquity.findMany({
			where: {
				clientId:    {in: clientIds,},
				portfolioId:  { in: portfolioIds, },
				entityId:    { in: entityIds, },
				accountId:   { in: accountIds,},
				...(clientId ?
					{
						clientId: {
							in: [clientId,],
						},
					} :
					{}),
				group: {
					bank: {
						is: {
							bankListId: {in: bankListIds,},
						},
					},
					portfolio: {
						is: {
							isActivated: true,
						},
					},
					totalUnits: {
						gt: 0,
					},
					currentStockPrice: {
						not: 0,
					},
					transferDate: null,
				},
				assetName:  type,
			},
		},)
		try {
			const options = assets.map((asset,) => {
				return asset.equityType
			},)
			const isins = assets.map((asset,) => {
				return asset.isin
			},)
				.filter((item,): item is string => {
					return item !== null
				},)
			const securities = assets.map((asset,) => {
				return asset.security
			},)
				.filter((item,): item is string => {
					return item !== null
				},)
			return {
				equityTypes:      Array.from(new Set(options,),),
				equityIsins:      Array.from(new Set(isins,),),
				equitySecurities: Array.from(new Set(securities,),),
			}
		} catch (error) {
			return {
				equityTypes:      [],
				equityIsins:      [] ,
				equitySecurities: [],
			}
		}
	}

	/**
 * 3.5.4
 * Retrieves bond assets based on the provided filters and calculates financial metrics.
 *
 * @remarks
 * - Filters assets by `type`, `currencies`, `isins`, `securities`, `portfolioIds`, `entitiesIds`, and `bankIds`.
 * - Parses the `payload` field of each asset to extract relevant bond details.
 * - Calculates market value and profit in USD based on unit price and bond pricing data.
 * - Sorts results by profit in USD or profit percentage based on `sortBy` and `sortOrder`.
 * - If an error occurs, returns an empty list with a predefined income value.
 *
 * @param {AnalyticsBondFilterDto} filters - The filter criteria for retrieving bond assets.
 * @returns {Promise<IBondsByFilters>} - A Promise resolving to an object containing the filtered bond assets and income details.
 */
	// todo: clear if new version good
	// public async getAllByFilters(
	// 	filters: AnalyticsEquityFilterDto,
	// 	clientId?: string,
	// ): Promise<IEquitiesByFilters> {
	// 	try {
	// 		const [equityGroups, equitiesData, etfsData, currencyList,] = await Promise.all([
	// 			this.prismaService.assetEquityGroup.findMany({
	// 				where: {
	// 					clientId:    { in: filters.clientIds, },
	// 					portfolioId: { in: filters.portfolioIds, },
	// 					entityId:    { in: filters.entitiesIds, },
	// 					accountId:   { in: filters.accountIds, },
	// 					bankId:      { in: filters.bankIds, },
	// 					...(clientId ?
	// 						{
	// 							client: {
	// 								id: clientId,
	// 							},
	// 						} :
	// 						{}),
	// 					bank: {
	// 						is: {
	// 							bankListId: { in: filters.bankListIds, },
	// 						},
	// 					},
	// 					portfolio: {
	// 						isActivated: true,
	// 					},
	// 					...(filters.date ?
	// 						{OR: [
	// 							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
	// 							{ transferDate: null, },
	// 						],} :
	// 						{
	// 							totalUnits: {
	// 								gt: 0,
	// 							},
	// 							currentStockPrice: {
	// 								not: 0,
	// 							},
	// 							isin: {
	// 								in: filters.isins,
	// 							},
	// 							security: {
	// 								in: filters.securities,
	// 							},
	// 							currency: {
	// 								in: filters.currencies,
	// 							},
	// 							transferDate: null,
	// 						}),
	// 				},
	// 				orderBy: {
	// 					[filters.sortBy]: filters.sortOrder,
	// 				},
	// 				include: {
	// 					equities: {
	// 						where: {
	// 							operation: filters.tradeOperation,
	// 							...(filters.date && {
	// 								transactionDate: {
	// 									lte: endOfDay(new Date(filters.date,),),
	// 								},
	// 							}),
	// 						},
	// 						include: {
	// 							assetEquityVersions: filters.date ?
	// 								{
	// 									where: {
	// 										transactionDate: {
	// 											lte: endOfDay(new Date(filters.date,),),
	// 										},
	// 									},
	// 									orderBy: {
	// 										transactionDate: 'desc',
	// 									},
	// 									take: 1,
	// 								} :
	// 								true,
	// 						},
	// 					},
	// 					portfolio: {
	// 						select: {
	// 							name: true,
	// 						},
	// 					},
	// 					entity: {
	// 						select: {
	// 							name: true,
	// 						},
	// 					},
	// 					bank: {
	// 						select: {
	// 							bankName: true,
	// 						},
	// 					},
	// 					account: {
	// 						select: {
	// 							accountName: true,
	// 						},
	// 					},
	// 				},
	// 			},),
	// 			filters.date ?
	// 				this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,) :
	// 				Promise.resolve([],),
	// 			filters.date ?
	// 				this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,) :
	// 				Promise.resolve([],),
	// 			filters.date ?
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,) :
	// 				Promise.resolve([],),
	// 		],)

	// 		if (filters.date) {
	// 			const mappedEquities = equityGroups
	// 				.filter((group,) => {
	// 					return group.equities.length
	// 				},)
	// 				.map((group,) => {
	// 					const {
	// 						assetName,
	// 						currency,
	// 						security,
	// 						isin,
	// 						issuer,
	// 						country,
	// 						sector,
	// 						costPrice,
	// 						costValueFC,
	// 						costValueUSD,
	// 						profitUSD,
	// 						profitPercentage,
	// 						isArchived,
	// 						equities,
	// 						account,
	// 						entity,
	// 						bank,
	// 						portfolio,
	// 						transactionDate,
	// 						type,
	// 					} = group

	// 					const equitiesForDate = equities.map((e,) => {
	// 						const version = e.assetEquityVersions?.[0]

	// 						if (version) {
	// 							return {
	// 								...version,
	// 								mainAssetId: version.assetEquityId ?? e.id,
	// 							}
	// 						}

	// 						return {
	// 							...e,
	// 							mainAssetId: undefined as string | undefined,
	// 						}
	// 					},)

	// 					if (!equitiesForDate.length) {
	// 						return null
	// 					}

	// 					const filteredUnits = equitiesForDate.reduce((sum, b,) => {
	// 						if (b.operation === AssetOperationType.SELL) {
	// 							return sum - Number(b.units,)
	// 						}
	// 						return sum + Number(b.units,)
	// 					}, 0,)

	// 					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 						return item.currency === currency
	// 					},)
	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1
	// 					let cBondsData: Equity | Etf | undefined
	// 					let lastPrice = 0

	// 					if (type === EquityType.Equity) {
	// 						const equity = equitiesData.find((e,) => {
	// 							return e.isin === isin
	// 						},)
	// 						if (equity) {
	// 							lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
	// 						}
	// 						cBondsData = equity
	// 					} else {
	// 						const etf = etfsData.find((e,) => {
	// 							return e.isin === isin
	// 						},)
	// 						if (etf) {
	// 							lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
	// 						}
	// 						cBondsData = etf
	// 					}

	// 					const marketPrice =
	// 				cBondsData?.currencyName === 'GBX' ?
	// 					lastPrice / 100 :
	// 					lastPrice
	// 					const marketValueUsd = parseFloat(
	// 						(filteredUnits * Number(marketPrice,) * rate).toFixed(2,),
	// 					)
	// 					const marketValueFC = parseFloat(
	// 						(filteredUnits * Number(marketPrice,)).toFixed(2,),
	// 					)

	// 					return {
	// 						id:                equitiesForDate[0].id,
	// 						mainAssetId:       equitiesForDate[0].mainAssetId,
	// 						assetName,
	// 						isin,
	// 						issuer:            issuer ?? 'N/A',
	// 						country:           country ?? 'N/A',
	// 						sector:            sector ?? 'N/A',
	// 						currency:          currency as CurrencyDataList,
	// 						costPrice,
	// 						costValueFC,
	// 						costValueUsd:      costValueUSD,
	// 						marketValueFC,
	// 						marketValueUsd,
	// 						profitUsd:         profitUSD,
	// 						profitPercentage,
	// 						currentStockPrice: marketPrice,
	// 						isArchived,
	// 						units:             filteredUnits,
	// 						portfolioName:     this.cryptoService.decryptString(portfolio.name,),
	// 						entityName:        this.cryptoService.decryptString(entity.name,),
	// 						accountName:       this.cryptoService.decryptString(account.accountName,),
	// 						bankName:          bank.bankName,
	// 						equityType:        equitiesForDate[0].equityType,
	// 						security,
	// 						valueDate:         transactionDate.toISOString(),
	// 						operation:         AssetOperationType.BUY,
	// 						groupId:           group.id,
	// 						isTransferred:     Boolean(group.transferDate,),
	// 						...(equitiesForDate.length > 1 ?
	// 							{
	// 								assets: equitiesForDate.map((e,) => {
	// 									const itemMarketValueUsd = parseFloat(
	// 										((e.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),
	// 									)
	// 									const itemMarketValueFC = parseFloat(
	// 										((e.units ?? 0) * Number(marketPrice,)).toFixed(2,),
	// 									)
	// 									return {
	// 										id:               e.id,
	// 										mainAssetId:      e.mainAssetId,
	// 										operation:        e.operation as AssetOperationType,
	// 										transactionPrice: e.transactionPrice,
	// 										units:            e.units,
	// 										costValueFC:      e.costValueFC,
	// 										costValueUsd:     e.costValueUSD,
	// 										marketValueFC:    itemMarketValueFC,
	// 										marketValueUsd:   itemMarketValueUsd,
	// 										profitUSD:        e.profitUSD,
	// 										profitPercentage: e.profitPercentage,
	// 										valueDate:        e.transactionDate.toISOString(),
	// 										portfolioName:
	// 									this.cryptoService.decryptString(portfolio.name,),
	// 										entityName:
	// 									this.cryptoService.decryptString(entity.name,),
	// 										accountName:
	// 									this.cryptoService.decryptString(
	// 										account.accountName,
	// 									),
	// 										bankName:          bank.bankName,
	// 										isin:              e.isin,
	// 										security:          e.security,
	// 										equityType:        e.equityType,
	// 										issuer:            e.issuer ?? 'N/A',
	// 										currency:          e.currency as CurrencyDataList,
	// 										country:           e.country ?? 'N/A',
	// 										sector:            e.sector ?? 'N/A',
	// 										costPrice:         e.costPrice,
	// 										profitUsd:         e.profitUSD,
	// 										currentStockPrice: marketPrice,
	// 										groupId:           group.id,
	// 										isTransferred:     Boolean(group.transferDate,),
	// 									}
	// 								},),
	// 							} :
	// 							{}),
	// 					}
	// 				},)
	// 				.filter(
	// 					(item,): item is NonNullable<typeof item> => {
	// 						return item !== null
	// 					},
	// 				)
	// 			return {
	// 				list: mappedEquities,
	// 			}
	// 		}

	// 		const mappedEquities = equityGroups
	// 			.filter((group,) => {
	// 				return group.equities?.length
	// 			},)
	// 			.map((group,) => {
	// 				const {
	// 					assetName,
	// 					currency,
	// 					security,
	// 					isin,
	// 					issuer,
	// 					country,
	// 					sector,
	// 					totalUnits,
	// 					costPrice,
	// 					costValueFC,
	// 					costValueUSD,
	// 					marketValueFC,
	// 					marketValueUSD,
	// 					profitUSD,
	// 					profitPercentage,
	// 					currentStockPrice,
	// 					isArchived,
	// 					equities,
	// 					account,
	// 					entity,
	// 					bank,
	// 					portfolio,
	// 					transactionDate,
	// 				} = group

	// 				return {
	// 					id:             group.equities[0].id,
	// 					assetName,
	// 					isin,
	// 					issuer:         issuer ?? 'N/A',
	// 					country:        country ?? 'N/A',
	// 					sector:         sector ?? 'N/A',
	// 					currency:       currency as CurrencyDataList,
	// 					costPrice,
	// 					costValueFC,
	// 					costValueUsd:   costValueUSD,
	// 					marketValueFC,
	// 					marketValueUsd: marketValueUSD,
	// 					profitUsd:      profitUSD,
	// 					profitPercentage,
	// 					currentStockPrice,
	// 					isArchived,
	// 					units:          totalUnits,
	// 					portfolioName:  this.cryptoService.decryptString(portfolio.name,),
	// 					entityName:     this.cryptoService.decryptString(entity.name,),
	// 					accountName:    this.cryptoService.decryptString(account.accountName,),
	// 					bankName:       bank.bankName,
	// 					equityType:     equities[0].equityType,
	// 					security,
	// 					valueDate:      transactionDate.toISOString(),
	// 					operation:      AssetOperationType.BUY,
	// 					groupId:           group.id,
	// 					...(equities.length > 1 ?
	// 						{
	// 							assets: equities.map((e,) => {
	// 								return {
	// 									id:               e.id,
	// 									operation:        e.operation as AssetOperationType,
	// 									transactionPrice: e.transactionPrice,
	// 									units:            e.units,
	// 									costValueFC:      e.costValueFC,
	// 									costValueUsd:     e.costValueUSD,
	// 									marketValueFC:    e.marketValueFC,
	// 									marketValueUsd:   e.marketValueUSD,
	// 									profitUSD:        e.profitUSD,
	// 									profitPercentage: e.profitPercentage,
	// 									valueDate:        e.transactionDate.toISOString(),
	// 									portfolioName:
	// 								this.cryptoService.decryptString(portfolio.name,),
	// 									entityName:
	// 								this.cryptoService.decryptString(entity.name,),
	// 									accountName:
	// 								this.cryptoService.decryptString(
	// 									account.accountName,
	// 								),
	// 									bankName:          bank.bankName,
	// 									isin:              e.isin,
	// 									security:          e.security,
	// 									equityType:        e.equityType,
	// 									issuer:            e.issuer ?? 'N/A',
	// 									currency:          e.currency as CurrencyDataList,
	// 									country:           e.country ?? 'N/A',
	// 									sector:            e.sector ?? 'N/A',
	// 									costPrice:         e.costPrice,
	// 									profitUsd:         e.profitUSD,
	// 									currentStockPrice: e.currentStockPrice,
	// 									groupId:           group.id,
	// 								}
	// 							},),
	// 						} :
	// 						{}),
	// 				}
	// 			},)

	// 		return {
	// 			list: mappedEquities,
	// 		}
	// 	} catch {
	// 		return {
	// 			list: [],
	// 		}
	// 	}
	// }
	public async getAllByFilters(
		filters: AnalyticsEquityFilterDto,
		clientId?: string,
	): Promise<IEquitiesByFilters> {
		try {
			const [equityGroups, equitiesData, etfsData, currencyList, historyCurrencyData,] = await Promise.all([
				this.prismaService.assetEquityGroup.findMany({
					where: {
						clientId:    { in: filters.clientIds, },
						portfolioId: { in: filters.portfolioIds, },
						entityId:    { in: filters.entitiesIds, },
						accountId:   { in: filters.accountIds, },
						bankId:      { in: filters.bankIds, },
						...(clientId ?
							{
								client: {
									id: clientId,
								},
							} :
							{}),
						bank: {
							is: {
								bankListId: { in: filters.bankListIds, },
							},
						},
						portfolio: {
							isActivated: true,
						},

						...(filters.date ?
							{
								OR: [
									{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
									{ transferDate: null, },
								],
								totalUnits: {
									gt: 0,
								},
								currentStockPrice: {
									not: 0,
								},
								isin: {
									in: filters.isins,
								},
								security: {
									in: filters.securities,
								},
								currency: {
									in: filters.currencies,
								},
							} :
							{
								totalUnits: {
									gt: 0,
								},
								currentStockPrice: {
									not: 0,
								},
								isin: {
									in: filters.isins,
								},
								security: {
									in: filters.securities,
								},
								currency: {
									in: filters.currencies,
								},
								transferDate: null,
							}),
					},
					orderBy: {
						[filters.sortBy]: filters.sortOrder,
					},
					include: {
						equities: {
							where: {
								operation: filters.tradeOperation,
								...(filters.date && {
									transactionDate: {
										lte: endOfDay(new Date(filters.date,),),
									},
								}),
								equityType: {
									in: filters.equityTypes,
								},
							},
							include: {
								assetEquityVersions: filters.date ?
									{
										where: {
											createdAt: {
												lte: endOfDay(new Date(filters.date,),),
											},
										},
										orderBy: {
											createdAt: 'desc',
										},
										take: 1,
									} :
									false,
							},
						},
						portfolio: {
							select: {
								name: true,
							},
						},
						entity: {
							select: {
								name: true,
							},
						},
						bank: {
							select: {
								bankName: true,
							},
						},
						account: {
							select: {
								accountName: true,
							},
						},
					},
				},),
				filters.date ?
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,) :
					Promise.resolve([],),
				filters.date ?
					this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,) :
					Promise.resolve([],),
				filters.date ?
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,) :
					Promise.resolve([],),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			if (filters.date) {
				const mappedEquities = equityGroups
					.filter((group,) => {
						return group.equities.length
					},)
					.map((group,) => {
						const {
							assetName,
							currency,
							security,
							isin,
							issuer,
							country,
							sector,
							isArchived,
							equities,
							account,
							entity,
							bank,
							portfolio,
							transactionDate,
							type,
						} = group

						const equitiesForDate = equities.map((e,) => {
							const version = e.assetEquityVersions?.[0]
							if (version) {
								return {
									...version,
									mainAssetId: version.assetEquityId ?? e.id,
								}
							}
							return {
								...e,
								mainAssetId: undefined as string | undefined,
							}
						},)
						if (!equitiesForDate.length) {
							return null
						}
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice = 0

						if (type === EquityType.Equity) {
							const equity = equitiesData.find((e,) => {
								return e.isin === isin
							},)
							if (equity) {
								lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfsData.find((e,) => {
								return e.isin === isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}
						let rateSum = 0
						let rateCount = 0
						let totalUnits = 0
						let totalValue = 0
						for (const a of equitiesForDate) {
							if (a.operation === AssetOperationType.SELL) {
								continue
							}
							const costRateDate = new Date(a.transactionDate,)
							const costCurrencyDataRate = a.currency === CurrencyDataList.USD ?
								1 :
								historyCurrencyData
									.filter((item,) => {
										return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
									},)
									.sort((a, b,) => {
										return new Date(a.date,).getTime() - new Date(b.date,).getTime()
									},)[0]?.rate
							rateSum = rateSum + ((costCurrencyDataRate ?? rate) * a.units)
							rateCount = rateCount + 1
							totalUnits = totalUnits + a.units
							totalValue = totalValue + (a.transactionPrice * a.units)
						}

						const totalBuySellUnits = equitiesForDate.reduce((sum, a,) => {
							return a.operation === AssetOperationType.SELL ?
								sum - a.units :
								sum + a.units
						}, 0,)
						const avgRate = totalUnits > 0 ?
							parseFloat((rateSum / totalUnits).toFixed(4,),) :
							0
						const costPriceGroup = totalUnits > 0 ?
							parseFloat((totalValue / totalUnits).toFixed(2,),) :
							0

						const marketPrice =
						cBondsData?.currencyName === 'GBX' ?
							lastPrice / 100 :
							lastPrice

						const costValueFCGroup = totalBuySellUnits * costPriceGroup
						const costValueUSDGroup = costValueFCGroup * avgRate
						const marketValueFCGroup = totalBuySellUnits * marketPrice
						const marketValueUSDGroup = marketValueFCGroup * rate
						const profitUSDGroup = marketValueUSDGroup - costValueUSDGroup
						const profitPercentageGroup =	costPriceGroup > 0 ?
							((Number(marketPrice,) - Number(costPriceGroup,)) / Number(costPriceGroup,)) * 100 :
							0
						// const marketValueUsd = parseFloat(
						// 	(filteredUnits * Number(marketPrice,) * rate).toFixed(2,),
						// )
						// const marketValueFC = parseFloat(
						// 	(filteredUnits * Number(marketPrice,)).toFixed(2,),
						// )
						return {
							id:                equitiesForDate[0].id,
							mainAssetId:       equitiesForDate[0].mainAssetId,
							assetName,
							isin,
							issuer:            issuer ?? '- -',
							country:           country ?? '- -',
							sector:            sector ?? '- -',
							currency:          currency as CurrencyDataList,
							costPrice:         parseFloat(costPriceGroup.toFixed(2,),),
							costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),),
							costValueUsd:       parseFloat(costValueUSDGroup.toFixed(2,),),
							marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),),
							marketValueUsd:     parseFloat(marketValueUSDGroup.toFixed(2,),),
							profitUsd:         parseFloat(profitUSDGroup.toFixed(2,),),
							profitPercentage:     parseFloat(profitPercentageGroup.toFixed(2,),),
							currentStockPrice: marketPrice,
							isArchived,
							units:             totalBuySellUnits,
							portfolioName:     this.cryptoService.decryptString(portfolio.name,),
							entityName:        this.cryptoService.decryptString(entity.name,),
							accountName:       this.cryptoService.decryptString(account.accountName,),
							bankName:          bank.bankName,
							equityType:        equitiesForDate[0].equityType,
							security,
							valueDate:         equities.length === 1 ?
								group.equities[0]?.transactionDate?.toISOString() :
								transactionDate?.toISOString(),
							operation:         AssetOperationType.BUY,
							groupId:           group.id,
							isTransferred:     Boolean(group.transferDate,),
							...(equitiesForDate.length > 1 ?
								{
									assets: equitiesForDate.map((e,) => {
										const itemMarketValueUsd = parseFloat(
											((e.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),
										)
										const itemMarketValueFC = parseFloat(
											((e.units ?? 0) * Number(marketPrice,)).toFixed(2,),
										)
										return {
											id:               e.id,
											mainAssetId:      e.mainAssetId,
											operation:        e.operation as AssetOperationType,
											transactionPrice: e.transactionPrice,
											units:            e.units,
											costValueFC:      e.costValueFC,
											costValueUsd:     e.costValueUSD,
											marketValueFC:    itemMarketValueFC,
											marketValueUsd:   itemMarketValueUsd,
											profitUSD:        e.profitUSD,
											profitPercentage: e.profitPercentage,
											valueDate:        e.transactionDate.toISOString(),
											portfolioName:
											this.cryptoService.decryptString(portfolio.name,),
											entityName:
											this.cryptoService.decryptString(entity.name,),
											accountName:
											this.cryptoService.decryptString(
												account.accountName,
											),
											bankName:          bank.bankName,
											isin:              e.isin,
											security:          e.security,
											equityType:        e.equityType,
											issuer:            e.issuer ?? '- -',
											currency:          e.currency as CurrencyDataList,
											country:           e.country ?? '- -',
											sector:            e.sector ?? '- -',
											costPrice:         e.costPrice,
											profitUsd:         e.profitUSD,
											currentStockPrice: marketPrice,
											groupId:           group.id,
											isTransferred:     Boolean(group.transferDate,),
										}
									},),
								} :
								{}),
						}
					},)
					.filter(
						(item,): item is NonNullable<typeof item> => {
							return item !== null
						},
					)
				return {
					list: mappedEquities,
				}
			}

			const mappedEquities = equityGroups
				.filter((group,) => {
					return group.equities?.length
				},)
				.map((group,) => {
					const {
						assetName,
						currency,
						security,
						isin,
						issuer,
						country,
						sector,
						totalUnits,
						costPrice,
						costValueFC,
						costValueUSD,
						marketValueFC,
						marketValueUSD,
						profitUSD,
						profitPercentage,
						currentStockPrice,
						isArchived,
						equities,
						account,
						entity,
						bank,
						portfolio,
						transactionDate,
					} = group

					return {
						id:             group.equities[0].id,
						assetName,
						isin,
						issuer:         issuer ?? '- -',
						country:        country ?? '- -',
						sector:         sector ?? '- -',
						currency:       currency as CurrencyDataList,
						costPrice,
						costValueFC,
						costValueUsd:   costValueUSD,
						marketValueFC,
						marketValueUsd: marketValueUSD,
						profitUsd:      profitUSD,
						profitPercentage,
						currentStockPrice,
						isArchived,
						units:          totalUnits,
						portfolioName:  this.cryptoService.decryptString(portfolio.name,),
						entityName:     this.cryptoService.decryptString(entity.name,),
						accountName:    this.cryptoService.decryptString(account.accountName,),
						bankName:       bank.bankName,
						equityType:     equities[0].equityType,
						security,
						valueDate:      transactionDate.toISOString(),
						operation:      AssetOperationType.BUY,
						groupId:        group.id,
						...(equities.length > 1 ?
							{
								assets: equities.map((e,) => {
									return {
										id:               e.id,
										operation:        e.operation as AssetOperationType,
										transactionPrice: e.transactionPrice,
										units:            e.units,
										costValueFC:      e.costValueFC,
										costValueUsd:     e.costValueUSD,
										marketValueFC:    e.marketValueFC,
										marketValueUsd:   e.marketValueUSD,
										profitUSD:        e.profitUSD,
										profitPercentage: e.profitPercentage,
										valueDate:        e.transactionDate.toISOString(),
										portfolioName:
										this.cryptoService.decryptString(portfolio.name,),
										entityName:
										this.cryptoService.decryptString(entity.name,),
										accountName:
										this.cryptoService.decryptString(
											account.accountName,
										),
										bankName:          bank.bankName,
										isin:              e.isin,
										security:          e.security,
										equityType:        e.equityType,
										issuer:            e.issuer ?? '- -',
										currency:          e.currency as CurrencyDataList,
										country:           e.country ?? '- -',
										sector:            e.sector ?? '- -',
										costPrice:         e.costPrice,
										profitUsd:         e.profitUSD,
										currentStockPrice: e.currentStockPrice,
										groupId:           group.id,
									}
								},),
							} :
							{}),
					}
				},)

			return {
				list: mappedEquities,
			}
		} catch (error) {
			return {
				list: [],
			}
		}
	}

	/**
 * 3.5.5
 * Retrieves bond bank analytics based on the provided filter criteria.
 * @remarks
 * - Filters bond assets based on `currencies` and `assetIds`.
 * - Parses the `payload` field of each asset to extract relevant bond details.
 * - Matches assets with bond data from the database.
 * - Calculates the market value of bonds in USD based on `isin` and `units`.
 * - Groups data by banks, associating each asset with its respective bank.
 * - Filters out assets that do not match the provided currency filter.
 * @param {LoanCurrencyFilterDto} filter - The filter criteria for bond bank analytics.
 * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bond bank analytics data.
 */
	// todo: clear if new version good
	// public async getEquityBankAnalytics(
	// 	filters: EquityCurrencyFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TBankAnalytics>> {
	// 	try {
	// 		const targetDate = filters.date ?
	// 			new Date(filters.date,) :
	// 			new Date()

	// 		if (filters.date) {
	// 			const [equityGroups, equitiesData, etfsData, currencyList,] = await Promise.all([
	// 				this.prismaService.assetEquityGroup.findMany({
	// 					where: {
	// 						clientId:    { in: filters.clientIds, },
	// 						portfolioId: { in: filters.portfolioIds, },
	// 						entityId:    { in: filters.entitiesIds, },
	// 						accountId:   { in: filters.accountIds, },
	// 						bankId:      { in: filters.bankIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filters.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						OR: [
	// 							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
	// 							{ transferDate: null, },
	// 						],
	// 					},
	// 					include: {
	// 						equities: {
	// 							where: {
	// 								operation: filters.tradeOperation,
	// 								OR:        [
	// 									{
	// 										...(filters.assetIds?.length ?
	// 											{ id: { in: filters.assetIds, }, } :
	// 											{}),
	// 										assetEquityVersions: {
	// 											none: {},
	// 										},
	// 									},
	// 									{
	// 										assetEquityVersions: {
	// 											some: {
	// 												...(filters.assetIds?.length ?
	// 													{ id: { in: filters.assetIds, }, } :
	// 													{}),
	// 												units:             { gt: 0, },
	// 												currentStockPrice: { not: 0, },
	// 												isin:              { in: filters.isins, },
	// 												security:          { in: filters.securities, },
	// 												currency:          { in: filters.currencies, },
	// 												AND:               [
	// 													{
	// 														transactionDate: {
	// 															lte: endOfDay(targetDate,),
	// 														},
	// 													},
	// 												],
	// 											},
	// 										},
	// 									},
	// 								],
	// 							},
	// 							include: {
	// 								assetEquityVersions: {
	// 									where: {
	// 										createdAt: {
	// 											lte: new Date(filters.date,),
	// 										},
	// 									},
	// 									orderBy: {
	// 										createdAt: 'desc',
	// 									},
	// 									take:    1,
	// 									include: {
	// 										account: { select: { accountName: true, }, },
	// 										bank:    {
	// 											select: {
	// 												bankName:   true,
	// 												bankList:   true,
	// 												bankListId: true,
	// 											},
	// 										},
	// 										entity:    { select: { name: true, }, },
	// 										portfolio: { select: { name: true, }, },
	// 									},
	// 								},
	// 							},
	// 						},
	// 						portfolio: {
	// 							select: {
	// 								name: true,
	// 							},
	// 						},
	// 						entity: {
	// 							select: {
	// 								name: true,
	// 							},
	// 						},
	// 						bank: {
	// 							select: {
	// 								bankList:   true,
	// 								bankName:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account: {
	// 							select: {
	// 								accountName: true,
	// 							},
	// 						},
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,),
	// 				this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
	// 			],)

	// 			const analyticsData = equityGroups
	// 				.filter((group,) => {
	// 					return group.equities.length
	// 				},)
	// 				.map((group,) => {
	// 					return {
	// 						...group,
	// 						equities: group.equities
	// 							.map((e,) => {
	// 								if (e.assetEquityVersions.length > 0) {
	// 									return {
	// 										...e.assetEquityVersions[0],
	// 										mainAssetId: e.id,
	// 									}
	// 								}

	// 								if (
	// 									e.units <= 0 ||
	// 								e.currentStockPrice === 0 ||
	// 								targetDate < new Date(e.transactionDate,)
	// 								) {
	// 									return null
	// 								}
	// 								if (
	// 									filters.currencies &&
	// 								!filters.currencies.includes(e.currency,)
	// 								) {
	// 									return null
	// 								}
	// 								if (
	// 									filters.tradeOperation &&
	// 								filters.tradeOperation !== e.operation
	// 								) {
	// 									return null
	// 								}
	// 								if (
	// 									filters.isins?.length &&
	// 								!filters.isins.includes(e.isin,)
	// 								) {
	// 									return null
	// 								}
	// 								if (
	// 									filters.securities?.length &&
	// 								!filters.securities.includes(e.security,)
	// 								) {
	// 									return null
	// 								}
	// 								return {
	// 									...e,
	// 									mainAssetId: undefined as string | undefined,
	// 								}
	// 							},)
	// 							.filter(
	// 								(item,): item is NonNullable<typeof item> => {
	// 									return item !== null
	// 								},
	// 							),
	// 					}
	// 				},)
	// 				.filter((group,) => {
	// 					return group.equities.length
	// 				},)
	// 				.map((item,) => {
	// 					const filteredUnits = item.equities.reduce((sum, b,) => {
	// 						if (b.operation === AssetOperationType.SELL) {
	// 							return sum - Number(b.units,)
	// 						}
	// 						return sum + Number(b.units,)
	// 					}, 0,)

	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 					currencyList.find((currencyItem,) => {
	// 						return currencyItem.currency === item.currency
	// 					},)
	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ??
	// 						currencyData.rate :
	// 						1
	// 					let cBondsData: Equity | Etf | undefined
	// 					let lastPrice = 0

	// 					if (item.type === EquityType.Equity) {
	// 						const equity = equitiesData.find((e,) => {
	// 							return e.isin === item.isin
	// 						},)
	// 						if (equity) {
	// 							lastPrice =
	// 							equity.equityHistory[0]?.lastPrice ??
	// 							equity.lastPrice ??
	// 							0
	// 						}
	// 						cBondsData = equity
	// 					} else {
	// 						const etf = etfsData.find((e,) => {
	// 							return e.isin === item.isin
	// 						},)
	// 						if (etf) {
	// 							lastPrice =
	// 							etf.etfHistory[0]?.close ?? etf.close ?? 0
	// 						}
	// 						cBondsData = etf
	// 					}

	// 					const marketPrice =
	// 					cBondsData?.currencyName === 'GBX' ?
	// 						lastPrice / 100 :
	// 						lastPrice
	// 					const marketValueUsd = parseFloat(
	// 						((filteredUnits ?? 0) * Number(marketPrice,) * rate).toFixed(
	// 							2,
	// 						),
	// 					)
	// 					return {
	// 						id:
	// 						item.bank.bankListId ??
	// 						item.bank.bankList?.id ??
	// 						'',
	// 						bankName: item.bank.bankName,
	// 						usdValue: marketValueUsd,
	// 					}
	// 				},)
	// 				.filter(
	// 					(item,): item is NonNullable<typeof item> => {
	// 						return item !== null
	// 					},
	// 				)
	// 			return analyticsData
	// 		}

	// 		const [equityGroups,] = await Promise.all([
	// 			this.prismaService.assetEquityGroup.findMany({
	// 				where: {
	// 					clientId:    { in: filters.clientIds, },
	// 					portfolioId: { in: filters.portfolioIds, },
	// 					entityId:    { in: filters.entitiesIds, },
	// 					accountId:   { in: filters.accountIds, },
	// 					bankId:      { in: filters.bankIds, },
	// 					...(clientId ?
	// 						{
	// 							client: {
	// 								id: clientId,
	// 							},
	// 						} :
	// 						{}),
	// 					bank: {
	// 						is: {
	// 							bankListId: { in: filters.bankListIds, },
	// 						},
	// 					},
	// 					portfolio: {
	// 						isActivated: true,
	// 					},
	// 					totalUnits: {
	// 						gt: 0,
	// 					},
	// 					currentStockPrice: {
	// 						not: 0,
	// 					},
	// 					isin: {
	// 						in: filters.isins,
	// 					},
	// 					security: {
	// 						in: filters.securities,
	// 					},
	// 					currency: {
	// 						in: filters.currencies,
	// 					},
	// 					transferDate: null,
	// 				},
	// 				include: {
	// 					equities: {
	// 						where: {
	// 							operation: filters.tradeOperation,
	// 							...(filters.assetIds?.length ?
	// 								{ id: { in: filters.assetIds, }, } :
	// 								{}),
	// 							...(filters.date && {
	// 								transactionDate: {
	// 									lte: endOfDay(new Date(filters.date,),),
	// 								},
	// 							}),
	// 						},
	// 					},
	// 					portfolio: {
	// 						select: {
	// 							name: true,
	// 						},
	// 					},
	// 					entity: {
	// 						select: {
	// 							name: true,
	// 						},
	// 					},
	// 					bank: {
	// 						select: {
	// 							bankList:   true,
	// 							bankName:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					account: {
	// 						select: {
	// 							accountName: true,
	// 						},
	// 					},
	// 				},
	// 			},),
	// 		],)

	// 		const analyticsData = equityGroups
	// 			.filter((group,) => {
	// 				return group.equities?.length
	// 			},)
	// 			.map((item,) => {
	// 				return {
	// 					id:
	// 					item.bank.bankListId ??
	// 					item.bank.bankList?.id ??
	// 					'',
	// 					bankName: item.bank.bankName,
	// 					usdValue: item.marketValueUSD,
	// 				}
	// 			},)
	// 			.filter(
	// 				(item,): item is NonNullable<typeof item> => {
	// 					return item !== null
	// 				},
	// 			)
	// 		return analyticsData
	// 	} catch {
	// 		return []
	// 	}
	// }
	public async getEquityBankAnalytics(
		filters: EquityCurrencyFilterDto,
		clientId?: string,
	): Promise<Array<TBankAnalytics>> {
		try {
			const targetDate = filters.date ?
				new Date(filters.date,) :
				new Date()

			if (filters.date) {
				const [equityGroups, equitiesData, etfsData, currencyList,] = await Promise.all([
					this.prismaService.assetEquityGroup.findMany({
						where: {
							clientId:    { in: filters.clientIds, },
							portfolioId: { in: filters.portfolioIds, },
							entityId:    { in: filters.entitiesIds, },
							accountId:   { in: filters.accountIds, },
							bankId:      { in: filters.bankIds, },
							...(clientId ?
								{
									client: {
										id: clientId,
									},
								} :
								{}),
							bank: {
								is: {
									bankListId: { in: filters.bankListIds, },
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
								{ transferDate: null, },
							],
						},
						include: {
							equities: {
								where: {
									operation:  filters.tradeOperation,
									equityType: {
										in: filters.equityTypes,
									},
									isin: {
										in: filters.isins,
									},
									security: {
										in: filters.securities,
									},
									currency: {
										in: filters.currencies,
									},
									OR:        [
										{
											...(filters.assetIds?.length ?
												{ id: { in: filters.assetIds, }, } :
												{}),
											assetEquityVersions: {
												none: {},
											},
										},
										{
											assetEquityVersions: {
												some: {
													...(filters.assetIds?.length ?
														{ id: { in: filters.assetIds, }, } :
														{}),
													equityType: {
														in: filters.equityTypes,
													},
													units:             { gt: 0, },
													currentStockPrice: { not: 0, },
													isin:              { in: filters.isins, },
													security:          { in: filters.securities, },
													currency:          { in: filters.currencies, },
													AND:               [
														{
															transactionDate: {
																lte: endOfDay(targetDate,),
															},
														},
													],
												},
											},
										},
									],
								},
								include: {
									assetEquityVersions: {
										where: {
											createdAt: {
												lte: endOfDay(new Date(filters.date,),),
											},
										},
										orderBy: {
											createdAt: 'desc',
										},
										take:    1,
										include: {
											account: { select: { accountName: true, }, },
											bank:    {
												select: {
													bankName:   true,
													bankList:   true,
													bankListId: true,
												},
											},
											entity:    { select: { name: true, }, },
											portfolio: { select: { name: true, }, },
										},
									},
								},
							},
							portfolio: {
								select: {
									name: true,
								},
							},
							entity: {
								select: {
									name: true,
								},
							},
							bank: {
								select: {
									bankList:   true,
									bankName:   true,
									bankListId: true,
								},
							},
							account: {
								select: {
									accountName: true,
								},
							},
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
				],)

				const analyticsData = equityGroups
					.filter((group,) => {
						return group.equities.length
					},)
					.map((group,) => {
						return {
							...group,
							equities: group.equities
								.map((e,) => {
									if (e.assetEquityVersions.length > 0) {
										return {
											...e.assetEquityVersions[0],
											mainAssetId: e.id,
										}
									}

									if (
										e.units <= 0 ||
									e.currentStockPrice === 0 ||
									targetDate < new Date(e.transactionDate,)
									) {
										return null
									}
									if (
										filters.currencies &&
									!filters.currencies.includes(e.currency,)
									) {
										return null
									}
									if (
										filters.tradeOperation &&
									filters.tradeOperation !== e.operation
									) {
										return null
									}
									if (
										filters.isins?.length &&
									!filters.isins.includes(e.isin,)
									) {
										return null
									}
									if (
										filters.securities?.length &&
									!filters.securities.includes(e.security,)
									) {
										return null
									}
									return {
										...e,
										mainAssetId: undefined as string | undefined,
									}
								},)
								.filter(
									(item,): item is NonNullable<typeof item> => {
										return item !== null
									},
								),
						}
					},)
					.filter((group,) => {
						return group.equities.length
					},)
					.map((item,) => {
						const filteredUnits = item.equities.reduce((sum, b,) => {
							if (b.operation === AssetOperationType.SELL) {
								return sum - Number(b.units,)
							}
							return sum + Number(b.units,)
						}, 0,)

						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((currencyItem,) => {
							return currencyItem.currency === item.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ??
						currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice = 0

						if (item.type === EquityType.Equity) {
							const equity = equitiesData.find((e,) => {
								return e.isin === item.isin
							},)
							if (equity) {
								lastPrice =
								equity.equityHistory[0]?.lastPrice ??
								equity.lastPrice ??
								0
							}
							cBondsData = equity
						} else {
							const etf = etfsData.find((e,) => {
								return e.isin === item.isin
							},)
							if (etf) {
								lastPrice =
								etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}

						const marketPrice =
						cBondsData?.currencyName === 'GBX' ?
							lastPrice / 100 :
							lastPrice
						const marketValueUsd = parseFloat(
							((filteredUnits ?? 0) * Number(marketPrice,) * rate).toFixed(
								2,
							),
						)
						return {
							id:
							item.bank.bankListId ??
							item.bank.bankList?.id ??
							'',
							bankName: item.bank.bankName,
							usdValue: marketValueUsd,
						}
					},)
					.filter(
						(item,): item is NonNullable<typeof item> => {
							return item !== null
						},
					)
				return analyticsData
			}

			const [equityGroups,] = await Promise.all([
				this.prismaService.assetEquityGroup.findMany({
					where: {
						clientId:    { in: filters.clientIds, },
						portfolioId: { in: filters.portfolioIds, },
						entityId:    { in: filters.entitiesIds, },
						accountId:   { in: filters.accountIds, },
						bankId:      { in: filters.bankIds, },
						...(clientId ?
							{
								client: {
									id: clientId,
								},
							} :
							{}),
						bank: {
							is: {
								bankListId: { in: filters.bankListIds, },
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
						isin: {
							in: filters.isins,
						},
						security: {
							in: filters.securities,
						},
						currency: {
							in: filters.currencies,
						},
						transferDate: null,
					},
					include: {
						equities: {
							where: {
								operation: filters.tradeOperation,
								...(filters.assetIds?.length ?
									{ id: { in: filters.assetIds, }, } :
									{}),
								...(filters.date && {
									transactionDate: {
										lte: endOfDay(new Date(filters.date,),),
									},
								}),
							},
						},
						portfolio: {
							select: {
								name: true,
							},
						},
						entity: {
							select: {
								name: true,
							},
						},
						bank: {
							select: {
								bankList:   true,
								bankName:   true,
								bankListId: true,
							},
						},
						account: {
							select: {
								accountName: true,
							},
						},
					},
				},),
			],)

			const analyticsData = equityGroups
				.filter((group,) => {
					return group.equities?.length
				},)
				.map((item,) => {
					const usdValue = item.equities.reduce<number>((acc, item,) => {
						if (item.operation === AssetOperationType.SELL) {
							return acc - item.marketValueUSD
						}
						return acc + item.marketValueUSD
					}, 0,)
					return {
						id:
						item.bank.bankListId ??
						item.bank.bankList?.id ??
						'',
						bankName: item.bank.bankName,
						usdValue,
					}
				},)
				.filter(
					(item,): item is NonNullable<typeof item> => {
						return item !== null
					},
				)
			return analyticsData
		} catch {
			return []
		}
	}

	/**
 * 3.5.5
 * Retrieves bond currency analytics based on the provided filter criteria.
 * @remarks
 * - Filters bond assets based on `currencies` and `assetIds`.
 * - Parses the `payload` field of each asset to extract relevant bond details.
 * - Matches assets with bond data from the database.
 * - Calculates the market value of bonds in USD based on `isin` and `units`.
 * - Filters out assets that do not match the provided currency filter.
 * @param {LoanCurrencyFilterDto} filter - The filter criteria for bond currency analytics.
 * @returns {Promise<Array<TBondsCurrencyAnalytics>>} - A Promise resolving to an array of bond currency analytics data.
 */
	// todo: clear if new version good
	// public async getEquityCurrencyAnalytics(
	// 	filters: EquityCurrencyFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TBondsCurrencyAnalytics>> {
	// 	try {
	// 		const targetDate = filters.date ?
	// 			new Date(filters.date,) :
	// 			new Date()

	// 		if (filters.date) {
	// 			const [equityGroups, equitiesData, etfsData, currencyList,] = await Promise.all([
	// 				this.prismaService.assetEquityGroup.findMany({
	// 					where: {
	// 						clientId:    { in: filters.clientIds, },
	// 						portfolioId: { in: filters.portfolioIds, },
	// 						entityId:    { in: filters.entitiesIds, },
	// 						accountId:   { in: filters.accountIds, },
	// 						bankId:      { in: filters.bankIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filters.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						OR: [
	// 							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
	// 							{ transferDate: null, },
	// 						],
	// 					},
	// 					include: {
	// 						equities: {
	// 							where: {
	// 								operation: filters.tradeOperation,
	// 								OR:        [
	// 									{
	// 										...(filters.assetIds?.length ?
	// 											{ id: { in: filters.assetIds, }, } :
	// 											{}),
	// 										assetEquityVersions: {
	// 											none: {},
	// 										},
	// 									},
	// 									{
	// 										assetEquityVersions: {
	// 											some: {
	// 												...(filters.assetIds?.length ?
	// 													{ id: { in: filters.assetIds, }, } :
	// 													{}),
	// 												units:             { gt: 0, },
	// 												currentStockPrice: { not: 0, },
	// 												isin:              { in: filters.isins, },
	// 												security:          { in: filters.securities, },
	// 												currency:          { in: filters.currencies, },
	// 												AND:               [
	// 													{
	// 														transactionDate: {
	// 															lte: endOfDay(targetDate,),
	// 														},
	// 													},
	// 												],
	// 											},
	// 										},
	// 									},
	// 								],
	// 							},
	// 							include: {
	// 								assetEquityVersions: {
	// 									where: {
	// 										createdAt: {
	// 											lte: new Date(filters.date,),
	// 										},
	// 									},
	// 									orderBy: {
	// 										createdAt: 'desc',
	// 									},
	// 									take:    1,
	// 									include: {
	// 										account: { select: { accountName: true, }, },
	// 										bank:    {
	// 											select: {
	// 												bankName:   true,
	// 												bankList:   true,
	// 												bankListId: true,
	// 											},
	// 										},
	// 										entity:    { select: { name: true, }, },
	// 										portfolio: { select: { name: true, }, },
	// 									},
	// 								},
	// 							},
	// 						},
	// 						portfolio: {
	// 							select: {
	// 								name: true,
	// 							},
	// 						},
	// 						entity: {
	// 							select: {
	// 								name: true,
	// 							},
	// 						},
	// 						bank: {
	// 							select: {
	// 								bankList:   true,
	// 								bankName:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account: {
	// 							select: {
	// 								accountName: true,
	// 							},
	// 						},
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,),
	// 				this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
	// 			],)

	// 			const analyticsData = equityGroups
	// 				.filter((group,) => {
	// 					return group.equities.length
	// 				},)
	// 				.map((group,) => {
	// 					return {
	// 						...group,
	// 						equities: group.equities
	// 							.map((e,) => {
	// 								if (e.assetEquityVersions.length > 0) {
	// 									return {
	// 										...e.assetEquityVersions[0],
	// 										mainAssetId: e.id,
	// 									}
	// 								}
	// 								if (
	// 									e.units <= 0 ||
	// 								e.currentStockPrice === 0 ||
	// 								targetDate < new Date(e.transactionDate,)
	// 								) {
	// 									return null
	// 								}
	// 								if (filters.currencies && !filters.currencies.includes(e.currency,)) {
	// 									return null
	// 								}
	// 								if (filters.tradeOperation && filters.tradeOperation !== e.operation) {
	// 									return null
	// 								}
	// 								if (filters.isins?.length && !filters.isins.includes(e.isin,)) {
	// 									return null
	// 								}
	// 								if (
	// 									filters.securities?.length &&
	// 								!filters.securities.includes(e.security,)
	// 								) {
	// 									return null
	// 								}
	// 								return {
	// 									...e,
	// 									mainAssetId: undefined as string | undefined,
	// 								}
	// 							},)
	// 							.filter(
	// 								(item,): item is NonNullable<typeof item> => {
	// 									return item !== null
	// 								},
	// 							),
	// 					}
	// 				},)
	// 				.filter((group,) => {
	// 					return group.equities.length
	// 				},)
	// 				.map((item,) => {
	// 					if (!item.currency) {
	// 						return null
	// 					}

	// 					const filteredUnits = item.equities.reduce((sum, b,) => {
	// 						if (b.operation === AssetOperationType.SELL) {
	// 							return sum - Number(b.units,)
	// 						}
	// 						return sum + Number(b.units,)
	// 					}, 0,)

	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 					currencyList.find((currencyItem,) => {
	// 						return currencyItem.currency === item.currency
	// 					},)
	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1
	// 					let cBondsData: Equity | Etf | undefined
	// 					let lastPrice = 0

	// 					if (item.type === EquityType.Equity) {
	// 						const equity = equitiesData.find((e,) => {
	// 							return e.isin === item.isin
	// 						},)
	// 						if (equity) {
	// 							lastPrice =
	// 							equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
	// 						}
	// 						cBondsData = equity
	// 					} else {
	// 						const etf = etfsData.find((e,) => {
	// 							return e.isin === item.isin
	// 						},)
	// 						if (etf) {
	// 							lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
	// 						}
	// 						cBondsData = etf
	// 					}

	// 					const marketPrice =
	// 					cBondsData?.currencyName === 'GBX' ?
	// 						lastPrice / 100 :
	// 						lastPrice

	// 					const usdValue = parseFloat(
	// 						((filteredUnits ?? 0) * Number(marketPrice,) * rate).toFixed(2,),
	// 					)
	// 					return {
	// 						currency:      item.currency as CurrencyDataList,
	// 						currencyValue: filteredUnits,
	// 						usdValue,
	// 					}
	// 				},)
	// 				.filter(
	// 					(item,): item is NonNullable<typeof item> => {
	// 						return item !== null
	// 					},
	// 				)
	// 			return analyticsData
	// 		}

	// 		const [equityGroups,] = await Promise.all([
	// 			this.prismaService.assetEquityGroup.findMany({
	// 				where: {
	// 					clientId:    { in: filters.clientIds, },
	// 					portfolioId: { in: filters.portfolioIds, },
	// 					entityId:    { in: filters.entitiesIds, },
	// 					accountId:   { in: filters.accountIds, },
	// 					bankId:      { in: filters.bankIds, },
	// 					...(clientId ?
	// 						{
	// 							client: {
	// 								id: clientId,
	// 							},
	// 						} :
	// 						{}),
	// 					bank: {
	// 						is: {
	// 							bankListId: { in: filters.bankListIds, },
	// 						},
	// 					},
	// 					portfolio: {
	// 						isActivated: true,
	// 					},
	// 					totalUnits: {
	// 						gt: 0,
	// 					},
	// 					currentStockPrice: {
	// 						not: 0,
	// 					},
	// 					isin: {
	// 						in: filters.isins,
	// 					},
	// 					security: {
	// 						in: filters.securities,
	// 					},
	// 					currency: {
	// 						in: filters.currencies,
	// 					},
	// 					transferDate: null,
	// 				},
	// 				include: {
	// 					equities: {
	// 						where: {
	// 							operation: filters.tradeOperation,
	// 							...(filters.assetIds?.length ?
	// 								{ id: { in: filters.assetIds, }, } :
	// 								{}),
	// 							...(filters.date && {
	// 								transactionDate: {
	// 									lte: endOfDay(new Date(filters.date,),),
	// 								},
	// 							}),
	// 						},
	// 					},
	// 					portfolio: {
	// 						select: {
	// 							name: true,
	// 						},
	// 					},
	// 					entity: {
	// 						select: {
	// 							name: true,
	// 						},
	// 					},
	// 					bank: {
	// 						select: {
	// 							bankList:   true,
	// 							bankName:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					account: {
	// 						select: {
	// 							accountName: true,
	// 						},
	// 					},
	// 				},
	// 			},),
	// 		],)

	// 		const analyticsData = equityGroups
	// 			.filter((group,) => {
	// 				return group.equities?.length
	// 			},)
	// 			.map((item,) => {
	// 				if (!item.currency || !item.totalUnits) {
	// 					return null
	// 				}
	// 				return {
	// 					currency:      item.currency as CurrencyDataList,
	// 					currencyValue: item.totalUnits,
	// 					usdValue:      item.marketValueUSD,
	// 				}
	// 			},)
	// 			.filter(
	// 				(item,): item is NonNullable<typeof item> => {
	// 					return item !== null
	// 				},
	// 			)
	// 		return analyticsData
	// 	} catch {
	// 		return []
	// 	}
	// }
	public async getEquityCurrencyAnalytics(
		filters: EquityCurrencyFilterDto,
		clientId?: string,
	): Promise<Array<TBondsCurrencyAnalytics>> {
		try {
			const targetDate = filters.date ?
				new Date(filters.date,) :
				new Date()

			if (filters.date) {
				const [equityGroups, equitiesData, etfsData, currencyList,] = await Promise.all([
					this.prismaService.assetEquityGroup.findMany({
						where: {
							clientId:    { in: filters.clientIds, },
							portfolioId: { in: filters.portfolioIds, },
							entityId:    { in: filters.entitiesIds, },
							accountId:   { in: filters.accountIds, },
							bankId:      { in: filters.bankIds, },
							...(clientId ?
								{
									client: {
										id: clientId,
									},
								} :
								{}),
							bank: {
								is: {
									bankListId: { in: filters.bankListIds, },
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
								{ transferDate: null, },
							],
						},
						include: {
							equities: {
								where: {
									operation:  filters.tradeOperation,
									equityType: {
										in: filters.equityTypes,
									},
									isin: {
										in: filters.isins,
									},
									security: {
										in: filters.securities,
									},
									currency: {
										in: filters.currencies,
									},
									OR:        [
										{
											...(filters.assetIds?.length ?
												{ id: { in: filters.assetIds, }, } :
												{}),
											assetEquityVersions: {
												none: {},
											},
										},
										{
											assetEquityVersions: {
												some: {
													...(filters.assetIds?.length ?
														{ id: { in: filters.assetIds, }, } :
														{}),
													equityType: {
														in: filters.equityTypes,
													},
													units:             { gt: 0, },
													currentStockPrice: { not: 0, },
													isin:              { in: filters.isins, },
													security:          { in: filters.securities, },
													currency:          { in: filters.currencies, },
													AND:               [
														{
															transactionDate: {
																lte: endOfDay(targetDate,),
															},
														},
													],
												},
											},
										},
									],
								},
								include: {
									assetEquityVersions: {
										where: {
											createdAt: {
												lte: endOfDay(new Date(filters.date,),),
											},
										},
										orderBy: {
											createdAt: 'desc',
										},
										take:    1,
										include: {
											account: { select: { accountName: true, }, },
											bank:    {
												select: {
													bankName:   true,
													bankList:   true,
													bankListId: true,
												},
											},
											entity:    { select: { name: true, }, },
											portfolio: { select: { name: true, }, },
										},
									},
								},
							},
							portfolio: {
								select: {
									name: true,
								},
							},
							entity: {
								select: {
									name: true,
								},
							},
							bank: {
								select: {
									bankList:   true,
									bankName:   true,
									bankListId: true,
								},
							},
							account: {
								select: {
									accountName: true,
								},
							},
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
				],)

				const analyticsData = equityGroups
					.filter((group,) => {
						return group.equities.length
					},)
					.map((group,) => {
						return {
							...group,
							equities: group.equities
								.map((e,) => {
									if (e.assetEquityVersions.length > 0) {
										return {
											...e.assetEquityVersions[0],
											mainAssetId: e.id,
										}
									}
									if (
										e.units <= 0 ||
									e.currentStockPrice === 0 ||
									targetDate < new Date(e.transactionDate,)
									) {
										return null
									}
									if (filters.currencies && !filters.currencies.includes(e.currency,)) {
										return null
									}
									if (filters.tradeOperation && filters.tradeOperation !== e.operation) {
										return null
									}
									if (filters.isins?.length && !filters.isins.includes(e.isin,)) {
										return null
									}
									if (
										filters.securities?.length &&
									!filters.securities.includes(e.security,)
									) {
										return null
									}
									return {
										...e,
										mainAssetId: undefined as string | undefined,
									}
								},)
								.filter(
									(item,): item is NonNullable<typeof item> => {
										return item !== null
									},
								),
						}
					},)
					.filter((group,) => {
						return group.equities.length
					},)
					.map((item,) => {
						if (!item.currency) {
							return null
						}

						const filteredUnits = item.equities.reduce((sum, b,) => {
							if (b.operation === AssetOperationType.SELL) {
								return sum - Number(b.units,)
							}
							return sum + Number(b.units,)
						}, 0,)

						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((currencyItem,) => {
							return currencyItem.currency === item.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice = 0

						if (item.type === EquityType.Equity) {
							const equity = equitiesData.find((e,) => {
								return e.isin === item.isin
							},)
							if (equity) {
								lastPrice =
								equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfsData.find((e,) => {
								return e.isin === item.isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}

						const marketPrice =
						cBondsData?.currencyName === 'GBX' ?
							lastPrice / 100 :
							lastPrice

						const usdValue = parseFloat(
							((filteredUnits ?? 0) * Number(marketPrice,) * rate).toFixed(2,),
						)
						return {
							currency:      item.currency as CurrencyDataList,
							currencyValue: filteredUnits,
							usdValue,
						}
					},)
					.filter(
						(item,): item is NonNullable<typeof item> => {
							return item !== null
						},
					)
				return analyticsData
			}

			const [equityGroups,] = await Promise.all([
				this.prismaService.assetEquityGroup.findMany({
					where: {
						clientId:    { in: filters.clientIds, },
						portfolioId: { in: filters.portfolioIds, },
						entityId:    { in: filters.entitiesIds, },
						accountId:   { in: filters.accountIds, },
						bankId:      { in: filters.bankIds, },
						...(clientId ?
							{
								client: {
									id: clientId,
								},
							} :
							{}),
						bank: {
							is: {
								bankListId: { in: filters.bankListIds, },
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
						isin: {
							in: filters.isins,
						},
						security: {
							in: filters.securities,
						},
						currency: {
							in: filters.currencies,
						},
						transferDate: null,
					},
					include: {
						equities: {
							where: {
								operation: filters.tradeOperation,
								...(filters.assetIds?.length ?
									{ id: { in: filters.assetIds, }, } :
									{}),
								...(filters.date && {
									transactionDate: {
										lte: endOfDay(new Date(filters.date,),),
									},
								}),
							},
						},
						portfolio: {
							select: {
								name: true,
							},
						},
						entity: {
							select: {
								name: true,
							},
						},
						bank: {
							select: {
								bankList:   true,
								bankName:   true,
								bankListId: true,
							},
						},
						account: {
							select: {
								accountName: true,
							},
						},
					},
				},),
			],)

			const analyticsData = equityGroups
				.filter((group,) => {
					return group.equities?.length
				},)
				.map((item,) => {
					if (!item.currency || !item.totalUnits) {
						return null
					}
					const usdValue = item.equities.reduce<number>((acc, item,) => {
						if (item.operation === AssetOperationType.SELL) {
							return acc - item.marketValueUSD
						}
						return acc + item.marketValueUSD
					}, 0,)
					return {
						currency:      item.currency as CurrencyDataList,
						currencyValue: item.totalUnits,
						usdValue,
					}
				},)
				.filter(
					(item,): item is NonNullable<typeof item> => {
						return item !== null
					},
				)
			return analyticsData
		} catch {
			return []
		}
	}

	/**
		 * 3.5.4
		 * Retrieves a list of filtered assets based on the specified criteria.
		 *
		 * @remarks
		 * - Filters assets based on the provided `type`, `portfolioIds`, `entitiesIds`, `bankIds`, and `currencies`.
		 * - If any of the required filter arrays are empty, an empty array is returned.
		 * - Optionally filters assets by `assetIds` if provided.
		 * - Uses Prisma to query assets, including associated `entity` and `bank` details.
		 *
		 * @param {AnalyticsCashFilterDto} filter - The filter criteria for retrieving assets.
		 * @param {Array<string>} [assetIds] - Optional array of asset IDs to further filter the results.
		 * @returns {Promise<Array<TAssetExtended>>} - A Promise resolving to an array of filtered assets.
		 */
	public async getFilteredAssets(filter: EquityCurrencyFilterDto, assetIds?: Array<string>, clientId?: string,): Promise<Array<TAssetExtended>> {
		const where: Prisma.AssetWhereInput = {
			isArchived:  false,
			assetName:   filter.type,
			portfolioId: {
				in: filter.portfolioIds,
			},
			entityId: {
				in: filter.entitiesIds,
			},
			bankId: {
				in: filter.bankIds,
			},
			bank: {
				is: {
					bankListId: { in: filter.bankListIds, },
				},
			},
			accountId: {
				in: filter.accountIds,
			},
			...(assetIds?.length ?
				{ id: { in: assetIds, }, } :
				{}),
			clientId: {
				in: clientId ?
					[clientId,] :
					filter.clientIds,
			},
			portfolio: {
				is: {
					isActivated: true,
				},
			},
		}
		return this.prismaService.asset.findMany({
			where,
			orderBy: {
				createdAt: SortOrder.DESC,
			},
			include: {
				entity: true,
				bank:   {include: { bankList: true, },},
			},
		},)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// New Version
	public syncGetAllByFilters(data: TEquityInitials, filters: AnalyticsEquityFilterDto, clientId?: string,): IEquitiesByFilters {
		const {assets, equities, etfs, currencyList, equityIsins, } = data
		const isinTypeMap = new Map(equityIsins
			.map(({ isin, typeId, },) => {
				return [isin, typeId,]
			},),)
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const assetPayload = assetParser<IEquityAsset>(asset,)
				if (assetPayload) {
					const {currency, isin, units, transactionPrice, equityType, operation, transactionDate,} = assetPayload
					const typeId = isinTypeMap.get(isin,)
					if (!typeId) {
						return null
					}
					const dataItem = typeId === '2' ?
						equities.find((equity,) => {
							return equity.isin === isin
						},) :
						etfs.find((etf,) => {
							return etf.isin === isin
						},)
					if (!dataItem) {
						return null
					}
					let ticker: string | undefined
					let lastPrice: number | undefined
					let issuer: string | undefined
					let stockCountry: string | undefined
					let stockSector: string | null  = null
					if (typeId === '2') {
						const equity = equities.find((equity,) => {
							return equity.isin === isin
						},)
						if (!equity) {
							return null
						}
						({ ticker, lastPrice,} = equity)
						issuer = equity.emitentName
						stockCountry = equity.stockCountryName
						stockSector = equity.branchName
					}
					if (typeId === '3') {
						const etf = etfs.find((equity,) => {
							return equity.isin === isin
						},)
						if (!etf) {
							return null
						}
						({ ticker,} = etf)
						lastPrice = etf.close
						issuer = etf.fundsName
						stockCountry = etf.geographyInvestmentName
						stockSector = etf.sectorName
					}
					if (!lastPrice) {
						return null
					}
					if (filters.currencies && !filters.currencies.includes(currency,)) {
						return null
					}
					if (filters.isins?.length && !filters.isins.includes(isin,)) {
						return null
					}
					if (filters.securities?.length && ticker && !filters.securities.includes(ticker,)) {
						return null
					}
					if (filters.equityTypes?.length && !filters.equityTypes.includes(equityType,)) {
						return null
					}
					if (filters.tradeOperation && filters.tradeOperation !== operation) {
						return null
					}
					if (transactionDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(transactionDate,)) {
						return null
					}
					if (transactionPrice === 0) {
						return null
					}
					const accountAssets = assets.filter((accountAsset,) => {
						const accountAssetPayload = assetParser<IEquityAsset>(accountAsset,)
						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
					},)
					const totalValue = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IEquityAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum
						}
						return assetPayload ?
							sum + (assetPayload.transactionPrice * assetPayload.units) :
							sum
					}, 0,)
					const totalUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IEquityAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IEquityAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum - assetPayload.units
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					const costPrice = totalUnits > 0 ?
						(totalValue / totalUnits).toFixed(2,) :
						1
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === currency
					},)
					const rate = currencyData ?
						filters.date ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							currencyData.rate :
						asset.rate ?? 1
					const currentStockPrice = dataItem.currencyName === 'GBX' ?
						parseFloat((Number(lastPrice,) / 100).toFixed(2,) ,) :
						parseFloat((Number(lastPrice,)).toFixed(2,),)
					const costValueFC = Number(units,) * transactionPrice
					const costValueUsd = Number(units,) * transactionPrice * rate
					const marketValueUsd = dataItem.currencyName === 'GBX' ?
						parseFloat((units * Number(lastPrice,) * rate  / 100).toFixed(2,) ,) :
						parseFloat((units * Number(lastPrice,) * rate).toFixed(2,),)
					const marketValueFC = dataItem.currencyName === 'GBX' ?
						parseFloat((units * Number(lastPrice,) / 100).toFixed(2,) ,) :
						parseFloat((units * Number(lastPrice,)).toFixed(2,),)
					if ((!filters.tradeOperation && totalBuySellUnits <= 0) || marketValueUsd === 0) {
						return null
					}
					const profitUsd = Number(marketValueUsd,) - Number(costValueUsd,)
					const profitPercentage = (Number(currentStockPrice,) - Number(costPrice,)) / Number(costPrice,) * 100
					return {
						id:                asset.id,
						equityType,
						portfolioName:     asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:        asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
						accountName:       asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
						bankName:          asset.bank?.bankName,
						issuer,
						isin,
						security:          ticker,
						currency,
						profitUsd,
						profitPercentage,
						costPrice:         Number(costPrice,),
						units:             Number(units,),
						marketValueUsd,
						currentStockPrice,
						costValueUsd,
						country:           stockCountry,
						sector:            stockSector,
						operation,
						transactionPrice,
						valueDate:         transactionDate,
						costValueFC,
						marketValueFC,
					} as IAnalyticEquity
				}
				return null
			},)
			.filter((item,): item is IAnalyticEquity => {
				return item !== null
			},)
		const groupedAssets = Object.values(
			analyticsData.reduce<Record<string, IAnalyticEquityWithInnerAssets>>((acc, asset,) => {
				const {
					equityType,
					portfolioName,
					entityName,
					bankName,
					accountName,
					isin,
					security,
					profitUsd,
					issuer,
					sector,
					country,
					marketValueUsd,
					currentStockPrice,
					units,
					costPrice,
					profitPercentage,
					operation,
					costValueUsd,
					currency,
					costValueFC,
					marketValueFC,
				} = asset
				const key = `${portfolioName}-${entityName}-${bankName}-${accountName}-${isin}-${currency}`
				if (!(key in acc)) {
					acc[key] = {
						id:                uuid4(),
						equityType,
						portfolioName,
						entityName,
						bankName,
						accountName,
						isin,
						security,
						profitUsd:         0,
						profitPercentage,
						currentStockPrice,
						issuer,
						sector,
						country,
						costPrice,
						units:             0,
						assets:            [],
						operation,
						costValueUsd:      0,
						marketValueUsd:    0,
						costValueFC:    0,
						marketValueFC:  0,
						currency,
					}
				}
				acc[key].profitUsd = operation === AssetOperationType.BUY ?
					acc[key].profitUsd + profitUsd :
					acc[key].profitUsd - profitUsd
				acc[key].costValueUsd = operation === AssetOperationType.BUY ?
					acc[key].costValueUsd + costValueUsd :
					acc[key].costValueUsd - costValueUsd
				acc[key].marketValueUsd = operation === AssetOperationType.BUY ?
					acc[key].marketValueUsd + marketValueUsd :
					acc[key].marketValueUsd - marketValueUsd
				acc[key].costValueFC = operation === AssetOperationType.BUY ?
					acc[key].costValueFC + costValueFC :
					acc[key].costValueFC - costValueFC
				acc[key].marketValueFC = operation === AssetOperationType.BUY ?
					acc[key].marketValueFC + marketValueFC :
					acc[key].marketValueFC - marketValueFC
				acc[key].units = operation === AssetOperationType.BUY ?
					acc[key].units + units :
					acc[key].units - units
				acc[key].assets.push(asset,)
				return acc
			}, {} ,),
		)
		// groupedAssets.sort((a, b,) => {
		// 	const sortField = filters.sortBy as TEquityTableSortVariants

		// 	if (!Object.values(TEquityTableSortVariants,).includes(sortField,)) {
		// 		return 0
		// 	}

		// 	const order = filters.sortOrder === 'asc' ?
		// 		1 :
		// 		-1

		// 	const aValue = a[sortField]
		// 	const bValue = b[sortField]

		// 	if (typeof aValue === 'string' && typeof bValue === 'string') {
		// 		return aValue.localeCompare(bValue,) * order
		// 	}

		// 	if (typeof aValue === 'number' && typeof bValue === 'number') {
		// 		return (aValue - bValue) * order
		// 	}

		// 	return 0
		// },)
		const finalAssets: Array<IAnalyticEquity | IAnalyticEquityWithInnerAssets> = groupedAssets.map((group,) => {
			if (group.assets.length === 1) {
				return {
					...group.assets[0],
					costPrice: group.assets[0].transactionPrice,
				} as IAnalyticEquity
			}
			const totalBuySellUnits = group.assets.reduce((sum, asset,) => {
				if (asset.operation === AssetOperationType.SELL) {
					return sum - asset.units
				}
				return sum + asset.units
			}, 0,)
			const normalizedAssets = group.assets.map((asset,) => {
				const profitPercentage = (Number(asset.currentStockPrice,) - Number(asset.transactionPrice,)) / Number(asset.transactionPrice,) * 100
				return {
					...asset,
					costPrice: asset.transactionPrice,
					profitPercentage,
				}
			},)
			return {
				id:            	   group.id,
				equityType:        group.equityType,
				portfolioName:     group.portfolioName,
				entityName:        group.entityName,
				bankName:          group.bankName,
				accountName:         group.accountName,
				isin:              group.isin,
				security:          group.security,
				profitUsd:         group.profitUsd,
				profitPercentage:  group.profitPercentage,
				assets:            normalizedAssets,
				issuer:            group.issuer,
				sector:            group.sector,
				country:           group.country,
				marketValueUsd:    group.marketValueUsd,
				currentStockPrice:          group.currentStockPrice,
				units:             totalBuySellUnits,
				costPrice: 		      group.costPrice,
				operation: 		      group.operation,
				costValueUsd:      group.costValueUsd,
				costValueFC:       group.costValueFC,
				marketValueFC:     group.marketValueFC,
			} as unknown as IAnalyticEquityWithInnerAssets
		},)

		// finalAssets.sort((a, b,) => {
		// 	const sortField = filters.sortBy as TEquityTableSortVariants

		// 	if (!Object.values(TEquityTableSortVariants,).includes(sortField,)) {
		// 		return 0
		// 	}

		// 	const order = filters.sortOrder === 'asc' ?
		// 		1 :
		// 		-1

		// 	const aValue = a[sortField]
		// 	const bValue = b[sortField]

		// 	if (typeof aValue === 'string' && typeof bValue === 'string') {
		// 		return aValue.localeCompare(bValue,) * order
		// 	}

		// 	if (typeof aValue === 'number' && typeof bValue === 'number') {
		// 		return (aValue - bValue) * order
		// 	}

		// 	return 0
		// },)
		return {
			list:      finalAssets,
		}
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// New Version
	public syncGetEquityBankAnalytics(data: TEquityInitials, filter: EquityCurrencyFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets ,equities, etfs, currencyList,} = data

		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IEquityAsset>(asset,)
				if (parsedPayload) {
					const {currency, isin, units, equityType, operation, security, transactionDate, transactionPrice,} = parsedPayload
					const equityAsset = equities.find((equity,) => {
						return equity.isin === isin
					},) ?? etfs.find((etf,) => {
						return etf.isin === isin
					},) ?? null
					if (!equityAsset) {
						return null
					}
					if (filter.currencies && !filter.currencies.includes(currency,)) {
						return null
					}
					if (filter.isins?.length && !filter.isins.includes(isin,)) {
						return null
					}
					if (filter.securities?.length && !filter.securities.includes(security,)) {
						return null
					}
					if (filter.equityTypes?.length && !filter.equityTypes.includes(equityType,)) {
						return null
					}
					if (filter.tradeOperation && filter.tradeOperation !== operation) {
						return null
					}
					if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
						return null
					}
					if (transactionPrice === 0) {
						return null
					}
					const accountAssets = assets.filter((accountAsset,) => {
						const accountAssetPayload = assetParser<IEquityAsset>(accountAsset,)
						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
					},)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IEquityAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum - assetPayload.units
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0)) {
						return null
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === currency
					},)

					const rate = currencyData ?
						filter.date ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							currencyData.rate :
						asset.rate ?? 1

					const price = 'lastPrice' in equityAsset ?
						Number(equityAsset.lastPrice,) :
						Number(equityAsset.close,)
					const usdValue = equityAsset.currencyName === 'GBX' ?
						parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
						parseFloat((units * price * rate).toFixed(2,),)
					return {
						id:       asset.bank?.bankListId,
						bankName:  asset.bank?.bankList?.name ?? asset.bank?.bankName,
						usdValue: operation === AssetOperationType.BUY ?
							usdValue :
							-usdValue,
					}
				}
				return null
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
		return analyticsData
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// New Version
	public syncGetEquityCurrencyAnalytics(data: TEquityInitials,filter: EquityCurrencyFilterDto, clientId?: string,): Array<TBondsCurrencyAnalytics> {
		const {assets ,equities, etfs, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IEquityAsset>(asset,)
				if (parsedPayload) {
					const {currency, isin, units, equityType, operation, security, transactionDate, transactionPrice,} = parsedPayload
					const equityAsset = equities.find((equity,) => {
						return equity.isin === isin
					},) ?? etfs.find((etf,) => {
						return etf.isin === isin
					},) ?? null
					if (!equityAsset) {
						return null
					}
					if (filter.currencies && !filter.currencies.includes(currency,)) {
						return null
					}
					if (filter.isins?.length && !filter.isins.includes(isin,)) {
						return null
					}
					if (filter.securities?.length && !filter.securities.includes(security,)) {
						return null
					}
					if (filter.equityTypes?.length && !filter.equityTypes.includes(equityType,)) {
						return null
					}
					if (filter.tradeOperation && filter.tradeOperation !== operation) {
						return null
					}
					if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
						return null
					}
					if (transactionPrice === 0) {
						return null
					}
					const accountAssets = assets.filter((accountAsset,) => {
						const accountAssetPayload = assetParser<IEquityAsset>(accountAsset,)
						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
					},)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IEquityAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum - assetPayload.units
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0)) {
						return null
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === currency
					},)

					const rate = currencyData ?
						filter.date ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							currencyData.rate :
						asset.rate ?? 1
					const price = 'lastPrice' in equityAsset ?
						Number(equityAsset.lastPrice,) :
						Number(equityAsset.close,)
					const usdValue = equityAsset.currencyName === 'GBX' ?
						parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
						parseFloat((units * price * rate).toFixed(2,),)
					return {
						currency,
						usdValue: operation === AssetOperationType.BUY ?
							usdValue :
							-usdValue,
					} as TBondsCurrencyAnalytics
				}
				return null
			},)
			.filter((item,): item is TBondsCurrencyAnalytics => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
		return analyticsData
	}
}