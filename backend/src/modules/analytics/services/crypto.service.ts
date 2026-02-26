/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import { PrismaService,} from 'nestjs-prisma'
import { Injectable,} from '@nestjs/common'
import type { Equity, EquityHistory, Etf,} from '@prisma/client'
import { EquityType, CurrencyDataList, type Prisma,} from '@prisma/client'
import { v4 as uuid4, } from 'uuid'

import {assetParser,} from '../../../shared/utils'
import {
	CBondsCurrencyService,
	CBondsEquityStocksService,
} from '../../../modules/apis/cbonds-api/services'

import type {IAnalyticCryptoETF, IAnalyticCryptoETFWithInnerAssets, TCryptoBankAnalytics, TCryptoCurrencyAnalytics, TCurrencyAnalytics,} from '../analytics.types'
import {
	type IAnalyticCrypto,
	type ICryptoByFilters,
	type ICryptoFilterSelectsData,
	type TBankAnalytics,
	TCryptoTableSortVariants,
} from '../analytics.types'
import type {ICryptoAsset, IEquityAsset, TAssetExtended,} from '../../asset/asset.types'
import {AssetNamesType,} from '../../asset/asset.types'
import type {AnalyticsCryptoFilterDto, CryptoCurrencyFilterDto,} from '../dto/crypto-filter.dto'
import {endOfDay,} from 'date-fns'
import { AssetOperationType, CryptoType, } from '../../../shared/types'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'
import { cEquityParser, } from '../../../shared/utils/cbond-parser.util'
import { CryptoService, } from '../../crypto/crypto.service'
import type { IInitialThirdPartyList, TCryptoInitials, } from '../../../modules/common/cache-sync/cache-sync.types'

@Injectable()
export class CryptoAssetService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cBondsEquityStocksService: CBondsEquityStocksService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
		* 3.5.4
		* Calculates the annual income from deposit transactions based on the provided filter criteria.
		* @remarks
		* This method queries the database for deposit transactions matching the given filter parameters,
		* including portfolio, bank, account, and client associations. It filters transactions that occurred
		* from the beginning of the current year up to the specified date (or the current date if not provided),
		* and calculates the total amount by multiplying each transaction amount by its rate (if present).
		* If the selected year is the previous year, the method returns 0.
		* This function is used as a general utility for calculating crypto-related income across the system.
		* Specific filters (e.g., by transaction name or type) should be applied externally when calling this method.
		* @param filter - The filter criteria used to narrow down transactions (e.g., portfolios, banks, accounts, etc.).
		* @param clientId - Optional client ID to override client filtering in the request.
		* @returns A promise that resolves to a number representing the total deposit income for the current year.
	*/
	public async getCryptoAnnual(filter: AnalyticsCryptoFilterDto, clientId?: string,): Promise<number> {
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
					annualAssets: { has: AssetNamesType.CRYPTO, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)
		const cryptoAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return cryptoAnnual
	}

	/**
 * 3.5.3
 * Retrieves filter data for crypto assets based on the provided bank IDs.
 * @remarks
 * - Fetches all assets with the specified bank IDs and filters those with the asset name "CRYPTO".
 * - Parses the payload field of each asset to extract the cryptocurrency types and exchange wallets.
 * - Returns an object containing arrays of crypto types and wallets.
 * @param ids - An array of bank IDs to filter the assets by.
 * @returns A Promise that resolves to an object containing arrays of cryptocurrency types (`cryptoTypes`) and exchange wallets (`wallets`).
 * @throws Returns empty arrays if an error occurs during the payload parsing process.
 */
	public async getCryptoFilterSelectsByBanksIds(ids?: Array<string>, clientId?: string,): Promise<ICryptoFilterSelectsData> {
		const assets = await this.prismaService.assetCryptoGroup.findMany({
			where: {
				...(ids && ids.length > 0 ?
					{
						OR: ids.map((id,) => {
							return { bankId: id, }
						},),
					} :
					{}),
				assetName: AssetNamesType.CRYPTO,
				portfolio: {
					is: {
						isActivated: true,
						client:      {
							id: clientId,
						},
					},
				},
			},
		},)
		const cryptoTypes = Array.from(
			new Set(
				assets.map((asset,) => {
					if (!asset.cryptoCurrencyType) {
						return null
					}
					return asset.cryptoCurrencyType
				},),
			),
		)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)

		const wallets = Array.from(
			new Set(
				assets.map((asset,) => {
					if (!asset.exchangeWallet) {
						return null
					}
					return asset.exchangeWallet
				},),
			),
		)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const productTypes = Array.from(
			new Set(
				assets.map((asset,) => {
					return asset.productType
				},),
			),
		)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		return {
			cryptoTypes,
			wallets,
			productTypes,
		}
	}

	/**
 * 3.5.4
 * Retrieves a list of crypto assets by applying the specified filters.
 * @remarks
 * - Fetches assets based on multiple criteria such as portfolio, entity, and bank IDs, along with currency types and wallets.
 * - Calculates the total income in USD from crypto transactions.
 * @param filters - The filter criteria for retrieving the assets.
 * @param clientId - The optional client ID to filter the results.
 * @returns A Promise that resolves to an object containing a list of filtered assets and total income in USD.
 */
	// New version after refactor
	public async getAllByFilters(filters: AnalyticsCryptoFilterDto,clientId?: string,): Promise<ICryptoByFilters> {
		try {
			let {productTypes,} = filters
			if (filters.wallets?.length) {
				productTypes = [CryptoType.DIRECT_HOLD,]
			}
			// With date filter
			if (filters.date) {
				const [cryptoGroups, equities, etfs, currencyList, historyCurrencyData,] = await Promise.all([
					this.prismaService.assetCryptoGroup.findMany({
						where: {
							clientId:    { in: clientId ?
								[clientId,] :
								filters.clientIds, },
							portfolioId: { in: filters.portfolioIds, },
							entityId:    { in: filters.entitiesIds, },
							accountId:   { in: filters.accountIds, },
							bankId:      {in: filters.bankIds,},
							bank:        {
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
								{ transferDate: null, },
							],
						},
						orderBy:
						filters.sortBy === TCryptoTableSortVariants.VALUE_DATE ?
							[
								{ transactionDate: filters.sortOrder, },
								{ purchaseDate: filters.sortOrder, },
							] :
							{
								[filters.sortBy]: filters.sortOrder,
							},
						include: {
							cryptos: {
								where: {
									operation: filters.tradeOperation,
									OR:        [
										{
											assetCryptoVersions: {
												none: {},
											},
											AND:       [
												{
													OR: [
														{ purchaseDate: null, },
														{ purchaseDate: { lte: endOfDay(new Date(filters.date,),), }, },
													],
												},
												{
													OR: [
														{ transactionDate: null, },
														{ transactionDate: { lte: endOfDay(new Date(filters.date,),), }, },
													],
												},
											],
											cryptoCurrencyType: {
												in: filters.cryptoTypes,
											},
											productType: {
												in: productTypes,
											},
											currency: {
												in: filters.currencies,
											},
											exchangeWallet: {
												in: filters.wallets,
											},
											security: {
												in: filters.securities,
											},
											isin: {
												in: filters.isins,
											},
										},
										{
											assetCryptoVersions: {
												some: {
													AND:       [
														{
															OR: [
																{ purchaseDate: null, },
																{ purchaseDate: { lte: endOfDay(new Date(filters.date,),), }, },
															],
														},
														{
															OR: [
																{ transactionDate: null, },
																{ transactionDate: { lte: endOfDay(new Date(filters.date,),), }, },
															],
														},
													],
													cryptoCurrencyType: {
														in: filters.cryptoTypes,
													},
													productType: {
														in: productTypes,
													},
													currency: {
														in: filters.currencies,
													},
													exchangeWallet: {
														in: filters.wallets,
													},
													security: {
														in: filters.securities,
													},
													isin: {
														in: filters.isins,
													},
												},
											},
										},
									],

								},
								include: {
									assetCryptoVersions: {
										where: {
											createdAt: {
												lte: endOfDay(new Date(filters.date,),),
											},
										},
										orderBy: {
											createdAt: 'desc',
										},
										take: 1,
									},
								},
							},
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      { select: { bankName: true, }, },
							account:   { select: { accountName: true, }, },
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
					this.prismaService.currencyHistoryData.findMany(),
				],)

				const mappedCryptoGroups = cryptoGroups
					.map((group,) => {
						return {
							...group,
							cryptos: group.cryptos.map((crypto,) => {
								if (crypto.assetCryptoVersions.length > 0) {
									return {
										...crypto.assetCryptoVersions[0],
										mainAssetId: crypto.id,
									}
								}
								return {
									...crypto,
									mainAssetId: undefined,
								}
							},),
						}
					},)
					.filter((group,) => {
						return group.cryptos?.length
					},)
					.map((group,) => {
						if (group.productType === CryptoType.ETF) {
							const {
								cryptos,
								currency,
								currentStockPrice,
								account,
								entity,
								bank,
								portfolio,
								transactionDate,
								issuer,
								isin,
								security,
								country,
								sector,
								transactionPrice,
							} = group
							const filteredUnits = group.cryptos.reduce((sum, b,) => {
								if (b.operation === AssetOperationType.SELL) {
									return sum - Number(b.units,)
								}
								return sum + Number(b.units,)
							}, 0,)
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === currency
							},)
							const rate = currencyData ?
								filters.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (group.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice

							const accountAssets = group.cryptos
							let rateSum = 0
							let rateCount = 0
							let totalUnits = 0
							let totalValue = 0
							for (const a of accountAssets) {
								if (a.operation === AssetOperationType.SELL) {
									continue
								}
								const units = a.units ?? 0
								const transactionPrice = a.transactionPrice ?? 0
								const costRateDate = a.transactionDate ?
									new Date(a.transactionDate,) :
									new Date()
								const costCurrencyDataRate = a.currency === CurrencyDataList.USD ?
									1 :
									historyCurrencyData
										.filter((item,) => {
											return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
										},)
										.sort((a, b,) => {
											return new Date(a.date,).getTime() - new Date(b.date,).getTime()
										},)[0]?.rate
								rateSum = rateSum + ((costCurrencyDataRate ?? rate) * units)
								rateCount = rateCount + 1
								totalUnits = totalUnits + units
								totalValue = totalValue + (transactionPrice * units)
							}

							const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
								return a.operation === AssetOperationType.SELL ?
									sum - (a.units ?? 0) :
									sum + (a.units ?? 0)
							}, 0,)

							const avgRate = totalUnits > 0 ?
								parseFloat((rateSum / totalUnits).toFixed(4,),) :
								0
							const costPriceGroup = totalUnits > 0 ?
								parseFloat((totalValue / totalUnits).toFixed(2,),) :
								0

							const costValueFCGroup = totalBuySellUnits * costPriceGroup
							const costValueUSDGroup = costValueFCGroup * avgRate
							const marketValueFCGroup = totalBuySellUnits * lastPrice
							const marketValueUSDGroup = marketValueFCGroup * rate
							const profitUSDGroup = marketValueUSDGroup - costValueUSDGroup
							const profitPercentageGroup =	costPriceGroup > 0 ?
								((Number(lastPrice,) - Number(costPriceGroup,)) / Number(costPriceGroup,)) * 100 :
								0

							return {
								id:					            group.cryptos[0].id,
								productType:        CryptoType.ETF,
								portfolioName:      this.cryptoService.decryptString(portfolio.name,),
								entityName:         this.cryptoService.decryptString(entity.name,),
								accountName:        this.cryptoService.decryptString(account.accountName,),
								bankName:           bank.bankName,
								isin:               isin ?? '- -',
								security:           security ?? '- -',
								currency:           currency ?? '- -',
								profitUsd:          profitUSDGroup,
								profitPercentage:   profitPercentageGroup,
								costPrice:          costPriceGroup,
								units:              filteredUnits ?? undefined,
								costValueFC:        costValueFCGroup,
								costValueUsd:       costValueUSDGroup,
								marketValueFC:      marketValueFCGroup,
								marketValueUsd:     marketValueUSDGroup,
								currentStockPrice:  marketPrice ?? currentStockPrice ?? undefined,
								issuer:             issuer ?? '- -',
								country:            country ?? '- -',
								sector:             sector ?? '- -',
								transactionPrice,
								valueDate:          cryptos.length === 1 ?
									group.cryptos[0]?.transactionDate?.toISOString() :
									transactionDate?.toISOString(),
								operation:          AssetOperationType.BUY,
								equityType:         'Crypto',
								exchangeWallet:     '- -',
								cryptoCurrencyType: '- -',
								cryptoAmount:       0,
								usdAmount:          0,
								purchasePrice:      0,
								groupId:            group.id,
								isTransferred:      Boolean(group.transferDate,),
								...(cryptos.length === 1 ?
									{mainAssetId: group.cryptos[0].mainAssetId,} :
									{}),
								...(cryptos.length > 1 ?
									{
										assets: cryptos.map((crypto,) => {
											const marketValueUsd = parseFloat(((crypto.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
											const marketValueFC = parseFloat(((crypto.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
											return {
												id:                 crypto.id,
												productType:        CryptoType.ETF,
												portfolioName:      this.cryptoService.decryptString(portfolio.name,),
												entityName:         this.cryptoService.decryptString(entity.name,),
												accountName:        this.cryptoService.decryptString(account.accountName,),
												bankName:           bank.bankName,
												issuer:             crypto.issuer ?? '- -',
												isin:               crypto.isin ?? '- -',
												security:           crypto.security ?? '- -',
												currency:           crypto.currency ?? '- -',
												profitUsd:          crypto.profitUSD,
												profitPercentage:   crypto.profitPercentage,
												costPrice:          crypto.transactionPrice,
												units:              crypto.units ?? undefined,
												currentStockPrice:  marketPrice ?? crypto.currentStockPrice,
												costValueUsd:       crypto.costValueUSD,
												country:            crypto.country ?? '- -',
												sector:             crypto.sector ?? '- -',
												operation:          crypto.operation,
												transactionPrice:   crypto.transactionPrice,
												valueDate:          crypto.transactionDate?.toISOString(),
												costValueFC:        crypto.costValueFC,
												marketValueUsd,
												marketValueFC,
												exchangeWallet:     '- -',
												cryptoCurrencyType: '- -',
												cryptoAmount:       0,
												usdAmount:          0,
												purchasePrice:      0,
												groupId:            group.id,
												isTransferred:      Boolean(group.transferDate,),
												...(crypto.mainAssetId ?
													{mainAssetId: crypto.mainAssetId,} :
													{}),
											}
										},),
									} :
									{}),
							}
						}
						const [directHoldItem,] = group.cryptos
						return {
							productType:        CryptoType.DIRECT_HOLD,
							id:                 directHoldItem.id,
							portfolioName:      this.cryptoService.decryptString(group.portfolio.name,),
							entityName:         this.cryptoService.decryptString(group.entity.name,),
							accountName:        this.cryptoService.decryptString(group.account.accountName,),
							bankName:           group.bank.bankName,
							exchangeWallet:     directHoldItem.exchangeWallet ?? '',
							cryptoCurrencyType: directHoldItem.cryptoCurrencyType ?? '',
							cryptoAmount:       directHoldItem.cryptoAmount ?? 0,
							usdAmount:          directHoldItem.marketValueUSD,
							purchaseDate:       directHoldItem.purchaseDate  ?
								directHoldItem.purchaseDate.toISOString() :
								'N/A',
							purchasePrice:      directHoldItem.purchasePrice ?? 0,
							currentStockPrice: directHoldItem.currentStockPrice  ?? undefined,
							costValueUsd:       directHoldItem.costValueUSD,
							marketValueUsd:     directHoldItem.marketValueUSD,
							profitUsd:          directHoldItem.profitUSD,
							profitPercentage:   directHoldItem.profitPercentage,
							units:              directHoldItem.units ?? 0,
							groupId:            group.id,
							isTransferred:      Boolean(group.transferDate,),
							...(directHoldItem.mainAssetId ?
								{mainAssetId: directHoldItem.mainAssetId,} :
								{}),
						}
					},)
				const directHold: typeof mappedCryptoGroups = []
				const etf: typeof mappedCryptoGroups = []

				for (const asset of mappedCryptoGroups) {
					if (asset.productType === CryptoType.DIRECT_HOLD) {
						directHold.push(asset,)
					} else if (asset.productType === CryptoType.ETF) {
						etf.push(asset,)
					}
				}
				const orderedList = [...directHold, ...etf,]
				const totalAssets = mappedCryptoGroups.reduce((sum, asset,) => {
					return sum + (asset.marketValueUsd || 0)
				}, 0,)
				return {
					list: orderedList,
					totalAssets,
				}
			}
			const [cryptoGroups,] = await Promise.all([
				this.prismaService.assetCryptoGroup.findMany({
					where: {
						clientId:    { in: clientId ?
							[clientId,] :
							filters.clientIds, },
						portfolioId: { in: filters.portfolioIds, },
						entityId:    { in: filters.entitiesIds, },
						accountId:   { in: filters.accountIds, },
						bankId:      {in: filters.bankIds,},
						bank:        {
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
						cryptoCurrencyType: {
							in: filters.cryptoTypes,
						},
						productType: {
							in: productTypes,
						},
						currency: {
							in: filters.currencies,
						},
						exchangeWallet: {
							in: filters.wallets,
						},
						security: {
							in: filters.securities,
						},
						isin: {
							in: filters.isins,
						},
						transferDate: null,
					},
					orderBy:
						filters.sortBy === TCryptoTableSortVariants.VALUE_DATE ?
							[
								{ transactionDate: filters.sortOrder, },
								{ purchaseDate: filters.sortOrder, },
							] :
							{
								[filters.sortBy]: filters.sortOrder,
							},
					include: {
						cryptos: {
							where: {
								operation: filters.tradeOperation,
							},
						},
						portfolio: { select: { name: true, }, },
						entity:    { select: { name: true, }, },
						bank:      { select: { bankName: true, }, },
						account:   { select: { accountName: true, }, },
					},
				},),
			],)
			// Without date filter
			const mappedCryptoGroups = cryptoGroups
				.filter((group,) => {
					return group.cryptos?.length
				},)
				.map((group,) => {
					if (group.productType === CryptoType.ETF) {
						const {
							cryptos,
							currency,
							totalUnits,
							costPrice,
							costValueFC,
							costValueUSD,
							marketValueFC,
							marketValueUSD,
							profitUSD,
							profitPercentage,
							currentStockPrice,
							account,
							entity,
							bank,
							portfolio,
							transactionDate,
							issuer,
							isin,
							security,
							country,
							sector,
							transactionPrice,
						} = group

						return {
							id:					            group.cryptos[0].id,
							productType:        CryptoType.ETF,
							portfolioName:      this.cryptoService.decryptString(portfolio.name,),
							entityName:         this.cryptoService.decryptString(entity.name,),
							accountName:        this.cryptoService.decryptString(account.accountName,),
							bankName:           bank.bankName,
							isin:               isin ?? '- -',
							security:           security ?? '- -',
							currency:           currency ?? '- -',
							profitUsd:          profitUSD,
							profitPercentage,
							costPrice:          costPrice ?? undefined,
							units:              totalUnits ?? undefined,
							marketValueUsd:     marketValueUSD,
							currentStockPrice:  currentStockPrice ?? undefined,
							costValueUsd:       costValueUSD,
							issuer:             issuer ?? '- -',
							country:            country ?? '- -',
							sector:             sector ?? '- -',
							transactionPrice,
							valueDate:          transactionDate?.toISOString(),
							costValueFC,
							marketValueFC,
							operation:          AssetOperationType.BUY,
							equityType:         'Crypto',
							exchangeWallet:     '- -',
							cryptoCurrencyType: '- -',
							cryptoAmount:       0,
							usdAmount:          0,
							purchasePrice:      0,
							groupId:            group.id,
							...(cryptos.length > 1 ?
								{
									assets: cryptos.map((crypto,) => {
										return {
											id:                 crypto.id,
											productType:        CryptoType.ETF,
											portfolioName:      this.cryptoService.decryptString(portfolio.name,),
											entityName:         this.cryptoService.decryptString(entity.name,),
											accountName:        this.cryptoService.decryptString(account.accountName,),
											bankName:           bank.bankName,
											issuer:             crypto.issuer ?? '- -',
											isin:               crypto.isin ?? '- -',
											security:           crypto.security ?? '- -',
											currency:           crypto.currency ?? '- -',
											profitUsd:          crypto.profitUSD,
											profitPercentage:   crypto.profitPercentage,
											costPrice:          crypto.transactionPrice,
											units:              crypto.units ?? undefined,
											marketValueUsd:     crypto.marketValueUSD,
											currentStockPrice:  crypto.currentStockPrice,
											costValueUsd:       crypto.costValueUSD,
											country:            crypto.country ?? 'Global',
											sector:             crypto.sector ?? '- -',
											operation:          crypto.operation,
											transactionPrice:   crypto.transactionPrice,
											valueDate:          crypto.transactionDate?.toISOString(),
											costValueFC:        crypto.costValueFC,
											marketValueFC:      crypto.marketValueFC,
											exchangeWallet:     '- -',
											cryptoCurrencyType: '- -',
											cryptoAmount:       0,
											usdAmount:          0,
											purchasePrice:      0,
											groupId:            group.id,
										}
									},),
								} :
								{}),
						}
					}
					return {
						productType:        CryptoType.DIRECT_HOLD,
						id:                 group.cryptos[0].id,
						portfolioName:      this.cryptoService.decryptString(group.portfolio.name,),
						entityName:         this.cryptoService.decryptString(group.entity.name,),
						accountName:        this.cryptoService.decryptString(group.account.accountName,),
						bankName:           group.bank.bankName,
						exchangeWallet:     group.exchangeWallet ?? '',
						cryptoCurrencyType: group.cryptoCurrencyType ?? '',
						cryptoAmount:       group.cryptoAmount ?? 0,
						usdAmount:          group.marketValueUSD,
						purchaseDate:       group.purchaseDate  ?
							group.purchaseDate.toISOString() :
							'N/A',
						purchasePrice:      group.purchasePrice ?? 0,
						costValueUsd:       group.costValueUSD,
						marketValueUsd:     group.marketValueUSD,
						profitUsd:          group.profitUSD,
						profitPercentage:   group.profitPercentage,
						units:              group.totalUnits ?? 0,
						currentStockPrice: group.currentStockPrice  ?? undefined,
						groupId:            group.id,
					}
				},)
			const totalAssets = mappedCryptoGroups.reduce((sum, asset,) => {
				return sum + (asset.marketValueUsd || 0)
			}, 0,)
			const directHold: typeof mappedCryptoGroups = []
			const etf: typeof mappedCryptoGroups = []

			for (const asset of mappedCryptoGroups) {
				if (asset.productType === CryptoType.DIRECT_HOLD) {
					directHold.push(asset,)
				} else if (asset.productType === CryptoType.ETF) {
					etf.push(asset,)
				}
			}
			const orderedList = [...directHold, ...etf,]
			return {
				list: orderedList,
				totalAssets,
			}
		} catch (error) {
			return {
				list:        [],
				totalAssets: 0,
			}
		}
	}

	// public async getAllByFilters(filters: AnalyticsCryptoFilterDto, clientId?: string,): Promise<ICryptoByFilters> {
	// 	try {
	// 		const assetsPromise = this.prismaService.asset.findMany({
	// 			where: {
	// 				isArchived:  false,
	// 				assetName:   filters.type,
	// 				portfolioId: {
	// 					in: filters.portfolioIds,
	// 				},
	// 				entityId: {
	// 					in: filters.entitiesIds,
	// 				},
	// 				bankId: {
	// 					in: filters.bankIds,
	// 				},
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filters.bankListIds, },
	// 					},
	// 				},
	// 				accountId: {
	// 					in: filters.accountIds,
	// 				},
	// 				clientId: {
	// 					in: clientId ?
	// 						[clientId,] :
	// 						filters.clientIds,
	// 				},
	// 				portfolio: {
	// 					is: {
	// 						isActivated: true,
	// 					},
	// 				},
	// 			},
	// 			include: {
	// 				portfolio: true,
	// 				entity:    true,
	// 				bank:      true,
	// 				account:   true,
	// 			},
	// 		},)
	// 		const [assets, cryptoList, currencyList, equities, etfs, equityIsins,] = await Promise.all([
	// 			assetsPromise,
	// 			this.prismaService.cryptoData.findMany(),
	// 			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
	// 			this.cBondsCurrencyService.getAllEquitiesWithHistory(filters.date,),
	// 			this.cBondsCurrencyService.getAllEtfsWithHistory(filters.date,),
	// 			this.prismaService.isins.findMany({
	// 				where: {
	// 					typeId: { in: ['2', '3',], },
	// 				},
	// 			},),
	// 		],)
	// 		const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
	// 			return [isin, typeId,]
	// 		},),)
	// 		const analyticsData = assets
	// 			.map((asset,) => {
	// 				const assetPayload = assetParser<ICryptoAsset>(asset,)
	// 				if (assetPayload) {
	// 					const {
	// 						productType,

	// 						cryptoCurrencyType,
	// 						cryptoAmount,
	// 						exchangeWallet,
	// 						purchaseDate,
	// 						purchasePrice,

	// 						currency,
	// 						transactionDate,
	// 						isin,
	// 						units,
	// 						transactionPrice,
	// 						operation,
	// 					} = assetPayload
	// 					if (productType === CryptoType.DIRECT_HOLD && cryptoAmount && purchasePrice && cryptoCurrencyType && exchangeWallet) {
	// 						if (filters.productTypes?.length && !filters.productTypes.includes(productType,)) {
	// 							return null
	// 						}
	// 						if (filters.currencies?.length || filters.isins?.length || filters.securities?.length || filters.equityTypes?.length || filters.tradeOperation) {
	// 							return null
	// 						}
	// 						if (filters.wallets?.length && !filters.wallets.includes(exchangeWallet,)) {
	// 							return null
	// 						}
	// 						if (filters.cryptoTypes?.length && !filters.cryptoTypes.includes(cryptoCurrencyType,)) {
	// 							return null
	// 						}
	// 						if (purchaseDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(purchaseDate,)) {
	// 							return null
	// 						}
	// 						const marketValueUsd = this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
	// 							token: cryptoCurrencyType,
	// 							cryptoAmount,
	// 						},
	// 						cryptoList
	// 							,)

	// 						const costValueUsd = purchasePrice * cryptoAmount
	// 						const profitUsd = marketValueUsd - costValueUsd
	// 						const profitPercentage = profitUsd / costValueUsd * 100
	// 						return {
	// 							productType,
	// 							id:            asset.id,
	// 							portfolioName:     asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
	// 							entityName:        asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
	// 							accountName:       asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
	// 							bankName:      asset.bank?.bankName,
	// 							exchangeWallet,
	// 							cryptoCurrencyType,
	// 							cryptoAmount:  Number(cryptoAmount,),
	// 							usdAmount:     marketValueUsd,
	// 							purchaseDate:  String(purchaseDate,),
	// 							purchasePrice: Number(purchasePrice,),
	// 							costValueUsd,
	// 							marketValueUsd,
	// 							profitUsd,
	// 							profitPercentage,
	// 						} as IAnalyticCrypto
	// 					}
	// 					if (productType === CryptoType.ETF) {
	// 						if (filters.wallets?.length || filters.cryptoTypes?.length) {
	// 							return null
	// 						}
	// 						if (filters.productTypes?.length && !filters.productTypes.includes(productType,)) {
	// 							return null
	// 						}
	// 						if (!isin || !units || !transactionPrice || !operation || !transactionDate || !currency) {
	// 							return null
	// 						}
	// 						const typeId = isinTypeMap.get(isin,)
	// 						if (!typeId) {
	// 							return null
	// 						}
	// 						let ticker: string | undefined
	// 						let lastPrice: number | undefined
	// 						let issuer: string | undefined
	// 						let stockCountry: string | undefined
	// 						let stockSector: string | null  = null
	// 						const dataItem = typeId === '2' ?
	// 							equities.find((equity,) => {
	// 								return equity.isin === isin
	// 							},) :
	// 							etfs.find((etf,) => {
	// 								return etf.isin === isin
	// 							},)
	// 						if (!dataItem) {
	// 							return null
	// 						}
	// 						if (typeId === '2') {
	// 							const equity = equities.find((equity,) => {
	// 								return equity.isin === isin
	// 							},)
	// 							if (!equity) {
	// 								return null
	// 							}
	// 							({ ticker,} = equity)
	// 							lastPrice = filters.date && equity.equityHistory[0] ?
	// 								equity.equityHistory[0].lastPrice :
	// 								equity.lastPrice
	// 							issuer = equity.emitentName
	// 							stockCountry = equity.stockCountryName
	// 							stockSector = equity.branchName === 'Undefined' ?
	// 								null :
	// 								equity.branchName
	// 						}
	// 						if (typeId === '3') {
	// 							const etf = etfs.find((equity,) => {
	// 								return equity.isin === isin
	// 							},)
	// 							if (!etf) {
	// 								return null
	// 							}
	// 							({ ticker,} = etf)
	// 							lastPrice =  filters.date && etf.etfHistory[0] ?
	// 								etf.etfHistory[0].close :
	// 								etf.close
	// 							issuer = etf.fundsName
	// 							stockCountry = etf.geographyInvestmentName
	// 							stockSector = etf.sectorName === 'Undefined' ?
	// 								null :
	// 								etf.sectorName
	// 						}

	// 						if (!lastPrice) {
	// 							return null
	// 						}
	// 						if (filters.currencies && !filters.currencies.includes(currency,)) {
	// 							return null
	// 						}
	// 						if (filters.isins?.length && !filters.isins.includes(isin,)) {
	// 							return null
	// 						}
	// 						if (filters.securities?.length && ticker && !filters.securities.includes(ticker,)) {
	// 							return null
	// 						}
	// 						if (filters.tradeOperation && filters.tradeOperation !== operation) {
	// 							return null
	// 						}
	// 						if (filters.date && endOfDay(new Date(filters.date,),) < new Date(transactionDate,)) {
	// 							return null
	// 						}
	// 						const accountAssets = assets.filter((accountAsset,) => {
	// 							const accountAssetPayload = assetParser<IEquityAsset>(accountAsset,)
	// 							return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
	// 						},)
	// 						const totalValue = accountAssets.reduce((sum, a,) => {
	// 							const assetPayload = assetParser<IEquityAsset>(a,)
	// 							if (assetPayload?.operation === AssetOperationType.SELL) {
	// 								return sum
	// 							}
	// 							return assetPayload ?
	// 								sum + (assetPayload.transactionPrice * assetPayload.units) :
	// 								sum
	// 						}, 0,)
	// 						const totalUnits = accountAssets.reduce((sum, a,) => {
	// 							const assetPayload = assetParser<IEquityAsset>(a,)
	// 							if (assetPayload?.operation === AssetOperationType.SELL) {
	// 								return sum
	// 							}
	// 							return assetPayload ?
	// 								sum + assetPayload.units :
	// 								sum
	// 						}, 0,)
	// 						const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 							const assetPayload = assetParser<IEquityAsset>(a,)
	// 							if (assetPayload?.operation === AssetOperationType.SELL) {
	// 								return sum - assetPayload.units
	// 							}
	// 							return assetPayload ?
	// 								sum + assetPayload.units :
	// 								sum
	// 						}, 0,)
	// 						const costPrice = totalUnits > 0 ?
	// 							(totalValue / totalUnits).toFixed(2,) :
	// 							1
	// 						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 							return item.currency === currency
	// 						},)
	// 						const rate = currencyData ?
	// 							filters.date ?
	// 								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 								currencyData.rate :
	// 							asset.rate ?? 1
	// 						const costValueFC = Number(units,) * Number(costPrice,)
	// 						const costValueUsd = Number(units,) * Number(costPrice,) * rate
	// 						const marketValueUsd = dataItem.currencyName === 'GBX' ?
	// 							parseFloat((units * Number(lastPrice,) * rate  / 100).toFixed(2,) ,) :
	// 							parseFloat((units * Number(lastPrice,) * rate).toFixed(2,),)
	// 						const marketValueFC = dataItem.currencyName === 'GBX' ?
	// 							parseFloat((units * Number(lastPrice,) / 100).toFixed(2,) ,) :
	// 							parseFloat((units * Number(lastPrice,)).toFixed(2,),)
	// 						const currentStockPrice = dataItem.currencyName === 'GBX' ?
	// 							parseFloat((Number(lastPrice,) / 100).toFixed(2,) ,) :
	// 							parseFloat((Number(lastPrice,)).toFixed(2,),)
	// 						if ((!filters.tradeOperation && totalBuySellUnits <= 0) || marketValueUsd === 0) {
	// 							return null
	// 						}
	// 						if ((totalBuySellUnits <= 0) || marketValueUsd === 0) {
	// 							return null
	// 						}
	// 						const profitUsd = Number(marketValueUsd,) - Number(costValueUsd,)
	// 						const profitPercentage = (Number(currentStockPrice,) - Number(costPrice,)) / Number(costPrice,) * 100
	// 						return {
	// 							id:                asset.id,
	// 							productType:       CryptoType.ETF,
	// 							portfolioName:     asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
	// 							entityName:        asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
	// 							accountName:       asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
	// 							bankName:          asset.bank?.bankName,
	// 							issuer,
	// 							isin,
	// 							security:          ticker,
	// 							currency,
	// 							profitUsd,
	// 							profitPercentage,
	// 							costPrice:         Number(costPrice,),
	// 							units:             Number(units,),
	// 							marketValueUsd,
	// 							currentStockPrice,
	// 							costValueUsd,
	// 							country:           stockCountry,
	// 							sector:            stockSector,
	// 							operation,
	// 							transactionPrice,
	// 							valueDate:         String(transactionDate,),
	// 							costValueFC,
	// 							marketValueFC,
	// 						} as IAnalyticCryptoETF
	// 					}
	// 				}
	// 				return null
	// 			},)
	// 			.filter((item,): item is IAnalyticCrypto | IAnalyticCryptoETF => {
	// 				return item !== null
	// 			},)
	// 		const equityAssets = analyticsData.filter(
	// 			(item,): item is IAnalyticCryptoETF => {
	// 				return item.productType === CryptoType.ETF
	// 			},
	// 		)
	// 		const cryptoAssets = analyticsData.filter(
	// 			(item,): item is IAnalyticCrypto => {
	// 				return item.productType === CryptoType.DIRECT_HOLD
	// 			},
	// 		)
	// 		const groupedAssets = Object.values(
	// 			equityAssets.reduce<Record<string, IAnalyticCryptoETFWithInnerAssets>>((acc, asset,) => {
	// 				const {
	// 					productType,
	// 					equityType,
	// 					portfolioName,
	// 					entityName,
	// 					bankName,
	// 					accountName,
	// 					isin,
	// 					security,
	// 					profitUsd,
	// 					issuer,
	// 					sector,
	// 					country,
	// 					marketValueUsd,
	// 					currentStockPrice,
	// 					units,
	// 					costPrice,
	// 					profitPercentage,
	// 					operation,
	// 					costValueUsd,
	// 					currency,
	// 					costValueFC,
	// 					marketValueFC,
	// 				} = asset
	// 				const key = `${portfolioName}-${entityName}-${bankName}-${accountName}-${isin}-${currency}`
	// 				if (!(key in acc)) {
	// 					acc[key] = {
	// 						productType,
	// 						id:                uuid4(),
	// 						equityType,
	// 						portfolioName,
	// 						entityName,
	// 						bankName,
	// 						accountName,
	// 						isin,
	// 						security,
	// 						profitUsd:         0,
	// 						profitPercentage,
	// 						currentStockPrice,
	// 						issuer,
	// 						sector,
	// 						country,
	// 						costPrice,
	// 						units:             0,
	// 						assets:            [],
	// 						operation,
	// 						costValueUsd:      0,
	// 						marketValueUsd:    0,
	// 						costValueFC:    0,
	// 						marketValueFC:  0,
	// 						currency,
	// 					}
	// 				}
	// 				acc[key].profitUsd = filters.tradeOperation === AssetOperationType.SELL ?
	// 					acc[key].profitUsd + profitUsd  :
	// 					operation === AssetOperationType.BUY ?
	// 						acc[key].profitUsd + profitUsd :
	// 						acc[key].profitUsd - profitUsd
	// 				acc[key].costValueUsd = filters.tradeOperation === AssetOperationType.SELL ?
	// 					acc[key].costValueUsd + costValueUsd :
	// 					operation === AssetOperationType.BUY ?
	// 						acc[key].costValueUsd + costValueUsd :
	// 						acc[key].costValueUsd - costValueUsd
	// 				acc[key].marketValueUsd = filters.tradeOperation === AssetOperationType.SELL ?
	// 					acc[key].marketValueUsd + marketValueUsd :
	// 					operation === AssetOperationType.BUY ?
	// 						acc[key].marketValueUsd + marketValueUsd :
	// 						acc[key].marketValueUsd - marketValueUsd
	// 				acc[key].costValueFC = filters.tradeOperation === AssetOperationType.SELL ?
	// 					acc[key].costValueFC + costValueFC :
	// 					operation === AssetOperationType.BUY ?
	// 						acc[key].costValueFC + costValueFC :
	// 						acc[key].costValueFC - costValueFC
	// 				acc[key].marketValueFC = filters.tradeOperation === AssetOperationType.SELL ?
	// 					acc[key].marketValueFC + marketValueFC :
	// 					operation === AssetOperationType.BUY ?
	// 						acc[key].marketValueFC + marketValueFC :
	// 						acc[key].marketValueFC - marketValueFC
	// 				acc[key].units = acc[key].units + units
	// 				acc[key].assets.push(asset,)
	// 				return acc
	// 			}, {} ,),
	// 		)
	// 		const finalEquityAssets: Array<IAnalyticCryptoETF | IAnalyticCryptoETFWithInnerAssets> = groupedAssets.map((group,) => {
	// 			if (group.assets.length === 1) {
	// 				return {
	// 					...group.assets[0],
	// 					costPrice: group.assets[0].transactionPrice,
	// 				} as IAnalyticCryptoETF
	// 			}
	// 			const totalBuySellUnits = group.assets.reduce((sum, asset,) => {
	// 				if (asset.operation === AssetOperationType.SELL) {
	// 					return sum - asset.units
	// 				}
	// 				return sum + asset.units
	// 			}, 0,)
	// 			const normalizedAssets = group.assets.map((asset,) => {
	// 				const profitPercentage = (Number(asset.currentStockPrice,) - Number(asset.transactionPrice,)) / Number(asset.transactionPrice,) * 100
	// 				return {
	// 					...asset,
	// 					costPrice: asset.transactionPrice,
	// 					profitPercentage,
	// 				}
	// 			},)

	// 			return {
	// 				id:            	   group.id,
	// 				productType:       group.productType,
	// 				equityType:        group.equityType,
	// 				portfolioName:     group.portfolioName,
	// 				entityName:        group.entityName,
	// 				bankName:          group.bankName,
	// 				accountName:         group.accountName,
	// 				isin:              group.isin,
	// 				security:          group.security,
	// 				profitUsd:         group.profitUsd,
	// 				profitPercentage:  group.profitPercentage,
	// 				assets:            normalizedAssets,
	// 				issuer:            group.issuer,
	// 				sector:            group.sector,
	// 				country:           group.country,
	// 				marketValueUsd:    group.marketValueUsd,
	// 				currentStockPrice:          group.currentStockPrice,
	// 				units:             totalBuySellUnits,
	// 				costPrice: 		      group.costPrice,
	// 				operation: 		      group.operation,
	// 				costValueUsd:      group.costValueUsd,
	// 				costValueFC:       group.costValueFC,
	// 				marketValueFC:     group.marketValueFC,
	// 				currency:          group.currency,
	// 			} as unknown as IAnalyticCryptoETFWithInnerAssets
	// 		},)

	// 		const finalAssets = [...cryptoAssets,...finalEquityAssets,].sort((a, b,) => {
	// 			const { sortBy, sortOrder, } = filters
	// 			const order = sortOrder === 'asc' ?
	// 				1 :
	// 				-1

	// 			const isDateSort = [
	// 				TCryptoTableSortVariants.PURCHASE_DATE,
	// 				TCryptoTableSortVariants.VALUE_DATE,
	// 			].includes(sortBy,)

	// 			const getComparableValue = (item: IAnalyticCrypto | IAnalyticCryptoETF | IAnalyticCryptoETFWithInnerAssets,): number | undefined => {
	// 				const value = (item as unknown as Record<string, unknown>)[sortBy]
	// 				if (value === undefined || value === null || value === '') {
	// 					return undefined
	// 				}
	// 				if (isDateSort) {
	// 					if (typeof value === 'string' || typeof value === 'number') {
	// 						const timestamp = new Date(value,).getTime()
	// 						return isNaN(timestamp,) ?
	// 							undefined :
	// 							timestamp
	// 					}
	// 					return undefined
	// 				}
	// 				return typeof value === 'number' ?
	// 					value :
	// 					Number(value,)
	// 			}
	// 			const aValue = getComparableValue(a,)
	// 			const bValue = getComparableValue(b,)

	// 			if (aValue === undefined && bValue !== undefined) {
	// 				return 1
	// 			}
	// 			if (aValue !== undefined && bValue === undefined) {
	// 				return -1
	// 			}
	// 			if (aValue === undefined && bValue === undefined) {
	// 				return 0
	// 			}

	// 			return (aValue! - bValue!) * order
	// 		},)
	// 		const totalAssets = finalAssets.reduce((sum, asset,) => {
	// 			return sum + (asset.marketValueUsd || 0)
	// 		}, 0,)

	// 		return {
	// 			list: finalAssets,
	// 			totalAssets,
	// 		}
	// 	} catch (error) {
	// 		return {
	// 			list:         [],
	// 			totalAssets:  0,
	// 		}
	// 	}
	// }

	/**
 * 3.5.4
 * Retrieves bank analytics based on the provided filter.
 * @remarks
 * - Filters assets based on the specified criteria.
 * - Calculates the USD value of each asset and returns the total value per bank.
 * @param filter - The filter criteria for retrieving bank analytics.
 * @param clientId - The optional client ID to filter the results.
 * @returns A Promise that resolves to an array of bank analytics data.
 */
	// New version after refactor
	public async getCryptoBankAnalytics(filter: CryptoCurrencyFilterDto, clientId?: string,): Promise<Array<TCryptoBankAnalytics>> {
		try {
			// With date filter
			if (filter.date) {
				const [cryptoGroups, equities, etfs, currencyList,] = await Promise.all([
					this.prismaService.assetCryptoGroup.findMany({
						where: {
							clientId:    { in: clientId ?
								[clientId,] :
								filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entitiesIds, },
							accountId:   { in: filter.accountIds, },
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filter.date,),), }, },
								{ transferDate: null, },
							],
						},
						include: {
							cryptos: {
								where: {
									operation: filter.tradeOperation,

									OR:        [
										{
											assetCryptoVersions: {
												none: {},
											},
											...(filter.assetIds?.length ?
												{ id: { in: filter.assetIds, }, } :
												{}),
											AND:       [
												{
													OR: [
														{ purchaseDate: null, },
														{ purchaseDate: { lte: endOfDay(new Date(filter.date,),), }, },
													],
												},
												{
													OR: [
														{ transactionDate: null, },
														{ transactionDate: { lte: endOfDay(new Date(filter.date,),), }, },
													],
												},
											],
											cryptoCurrencyType: {
												in: filter.cryptoTypes,
											},
											productType: {
												in: filter.productTypes,
											},
											currency: {
												in: filter.currencies,
											},
											exchangeWallet: {
												in: filter.wallets,
											},
											security: {
												in: filter.securities,
											},
											isin: {
												in: filter.isins,
											},
										},
										{
											assetCryptoVersions: {
												some: {
													...(filter.assetIds?.length ?
														{ id: { in: filter.assetIds, }, } :
														{}),
													AND:       [
														{
															OR: [
																{ purchaseDate: null, },
																{ purchaseDate: { lte: endOfDay(new Date(filter.date,),), }, },
															],
														},
														{
															OR: [
																{ transactionDate: null, },
																{ transactionDate: { lte: endOfDay(new Date(filter.date,),), }, },
															],
														},
													],
													cryptoCurrencyType: {
														in: filter.cryptoTypes,
													},
													productType: {
														in: filter.productTypes,
													},
													currency: {
														in: filter.currencies,
													},
													exchangeWallet: {
														in: filter.wallets,
													},
													security: {
														in: filter.securities,
													},
													isin: {
														in: filter.isins,
													},
												},
											},
										},
									],

								},
								include: {
									assetCryptoVersions: {
										where: {
											createdAt: {
												lte: endOfDay(new Date(filter.date,),),
											},
										},
										orderBy: {
											createdAt: 'desc',
										},
										take: 1,
									},
								},
							},
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      { select: { bankName: true, bankListId: true, bankList: true,}, },
							account:   { select: { accountName: true, }, },
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				],)
				const analyticsData = cryptoGroups
					.map((group,) => {
						return {
							...group,
							cryptos: group.cryptos.map((crypto,) => {
								if (crypto.assetCryptoVersions.length > 0) {
									return {
										...crypto.assetCryptoVersions[0],
										mainAssetId: crypto.id,
									}
								}
								return {
									...crypto,
									mainAssetId: undefined,
								}
							},),
						}
					},)
					.filter((group,) => {
						return group.cryptos?.length
					},)
					.map((item,) => {
						if (item.productType === CryptoType.DIRECT_HOLD) {
							if (!item.exchangeWallet) {
								return null
							}
							const [crypto,] = item.cryptos
							return {
								id:          item.id,
								bankName:    crypto.exchangeWallet!,
								productType: crypto.productType as CryptoType,
								usdValue:    crypto.marketValueUSD,
							}
						}
						if (!item.currency || !item.totalUnits) {
							return null
						}
						const filteredUnits = item.cryptos.reduce((sum, b,) => {
							if (b.operation === AssetOperationType.SELL) {
								return sum - Number(b.units,)
							}
							return sum + Number(b.units,)
						}, 0,)
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((currencyItem,) => {
							return currencyItem.currency === item.currency
						},)
						const rate = currencyData ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice: number = 0

						if (item.type === EquityType.Equity) {
							const equity = equities.find((e,) => {
								return e.isin === item.isin
							},)
							if (equity) {
								lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfs.find((e,) => {
								return e.isin === item.isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}
						const marketPrice = cBondsData?.currencyName ===  'GBX' ?
							lastPrice / 100 :
							lastPrice
						const marketValueUsd = parseFloat(((filteredUnits ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
						return {
							id:          item.bank.bankListId ?? item.bank.bankList?.id ?? '',
							bankName:    item.bank.bankName,
							productType: item.productType as CryptoType,
							usdValue:    marketValueUsd,
						}
					},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)

				return analyticsData
			}
			const [cryptoGroups,] = await Promise.all([
				this.prismaService.assetCryptoGroup.findMany({
					where: {
						clientId:    { in: clientId ?
							[clientId,] :
							filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entitiesIds, },
						accountId:   { in: filter.accountIds, },
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
						cryptoCurrencyType: {
							in: filter.cryptoTypes,
						},
						productType: {
							in: filter.productTypes,
						},
						currency: {
							in: filter.currencies,
						},
						exchangeWallet: {
							in: filter.wallets,
						},
						security: {
							in: filter.securities,
						},
						isin: {
							in: filter.isins,
						},
						transferDate: null,
					},
					include: {
						cryptos: {
							where: {
								operation: filter.tradeOperation,
								...(filter.assetIds?.length ?
									{ id: { in: filter.assetIds, }, } :
									{}),
							},
						},
						portfolio: { select: { name: true, }, },
						entity:    { select: { name: true, }, },
						bank:      { select: { bankName: true, bankListId: true, bankList: true,}, },
						account:   { select: { accountName: true, }, },
					},
				},),
			],)

			// Without date filter
			const analyticsData = cryptoGroups
				.filter((group,) => {
					return group.cryptos.length
				},)
				.map((item,) => {
					if (item.productType === CryptoType.DIRECT_HOLD) {
						if (!item.exchangeWallet) {
							return null
						}
						return {
							id:          item.id,
							bankName:    item.exchangeWallet,
							productType: item.productType as CryptoType,
							usdValue:    item.marketValueUSD,
						}
					}
					if (!item.currency || !item.totalUnits) {
						return null
					}
					const usdValue = item.cryptos.reduce<number>((acc, item,) => {
						if (item.operation === AssetOperationType.SELL) {
							return acc - item.marketValueUSD
						}
						return acc + item.marketValueUSD
					}, 0,)
					return {
						id:          item.bank.bankListId ?? item.bank.bankList?.id ?? '',
						bankName:    item.bank.bankName,
						productType: item.productType as CryptoType,
						usdValue,
					}
				},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			return analyticsData
		} catch (error) {
			return []
		}
	}

	// public async getCryptoBankAnalytics(filter: CryptoCurrencyFilterDto, clientId?: string,): Promise<Array<TCryptoBankAnalytics>> {
	// 	const [assets, cryptoList, currencyList, equities, etfs,]  = await Promise.all([
	// 		this.getFilteredAssets(filter, filter.assetIds, clientId,),
	// 		this.prismaService.cryptoData.findMany(),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 	],)

	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const assetPayload = assetParser<ICryptoAsset>(asset,)
	// 			if (assetPayload) {
	// 				const {
	// 					productType,

	// 					cryptoCurrencyType,
	// 					cryptoAmount,
	// 					exchangeWallet,
	// 					purchaseDate,
	// 					purchasePrice,

	// 					currency,
	// 					transactionDate,
	// 					isin,
	// 					units,
	// 					transactionPrice,
	// 					operation,
	// 					security: ticker,
	// 				} = assetPayload
	// 				if (productType === CryptoType.DIRECT_HOLD && cryptoAmount && purchasePrice && cryptoCurrencyType && exchangeWallet) {
	// 					if (filter.currencies?.length || filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.tradeOperation) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
	// 						return null
	// 					}
	// 					if (filter.wallets?.length && !filter.wallets.includes(exchangeWallet,)) {
	// 						return null
	// 					}
	// 					if (filter.cryptoTypes?.length && !filter.cryptoTypes.includes(cryptoCurrencyType,)) {
	// 						return null
	// 					}
	// 					if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
	// 						return null
	// 					}
	// 					const marketValueUsd = this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
	// 						token: cryptoCurrencyType,
	// 						cryptoAmount,
	// 					},
	// 					cryptoList
	// 						,)
	// 					return {
	// 						id:       asset.id,
	// 						bankName: assetPayload.exchangeWallet,
	// 						productType,
	// 						usdValue: marketValueUsd,
	// 					} as TBankAnalytics
	// 				}
	// 				if (productType === CryptoType.ETF) {
	// 					const equityAsset = equities.find((equity,) => {
	// 						return equity.isin === isin
	// 					},) ?? etfs.find((etf,) => {
	// 						return etf.isin === isin
	// 					},) ?? null
	// 					if (!equityAsset) {
	// 						return null
	// 					}
	// 					if (filter.wallets?.length || filter.cryptoTypes?.length) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
	// 						return null
	// 					}
	// 					if (!isin || !units || !transactionPrice || !operation || !transactionDate || !currency) {
	// 						return null
	// 					}
	// 					if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 						return null
	// 					}
	// 					if (filter.isins?.length && !filter.isins.includes(isin,)) {
	// 						return null
	// 					}
	// 					if (filter.securities?.length && ticker && !filter.securities.includes(ticker,)) {
	// 						return null
	// 					}
	// 					if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 						return null
	// 					}
	// 					if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 						return null
	// 					}
	// 					const accountAssets = assets.filter((accountAsset,) => {
	// 						const accountAssetPayload = assetParser<IEquityAsset>(accountAsset,)
	// 						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
	// 					},)
	// 					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 						const assetPayload = assetParser<IEquityAsset>(a,)
	// 						if (assetPayload?.operation === AssetOperationType.SELL) {
	// 							return sum - assetPayload.units
	// 						}
	// 						return assetPayload ?
	// 							sum + assetPayload.units :
	// 							sum
	// 					}, 0,)
	// 					if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0)) {
	// 						return null
	// 					}
	// 					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 						return item.currency === currency
	// 					},)

	// 					const rate = currencyData ?
	// 						filter.date ?
	// 							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 							currencyData.rate :
	// 						asset.rate ?? 1
	// 					const price = 'lastPrice' in equityAsset ?
	// 						filter.date && equityAsset.equityHistory[0] ?
	// 							Number(equityAsset.equityHistory[0].lastPrice,) :
	// 							Number(equityAsset.lastPrice,) :
	// 						filter.date && equityAsset.etfHistory[0] ?
	// 							Number(equityAsset.etfHistory[0].close,) :
	// 							Number(equityAsset.close,)
	// 					const usdValue = equityAsset.currencyName === 'GBX' ?
	// 						parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 						parseFloat((units * price * rate).toFixed(2,),)
	// 					return {
	// 						id:       asset.bank?.bankListId,
	// 						bankName:  asset.bank?.bankList?.name ?? asset.bank?.bankName,
	// 						productType,
	// 						usdValue: filter.tradeOperation === AssetOperationType.SELL ?
	// 							usdValue :
	// 							operation === AssetOperationType.BUY ?
	// 								usdValue :
	// 								-usdValue,
	// 					}
	// 				}
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is TCryptoBankAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.filter((item,) => {
	// 			return item.usdValue !== 0
	// 		},)
	// 	return analyticsData
	// }

	/**
 * 3.5.4
 * Retrieves currency analytics based on the provided filter.
 * @remarks
 * - Filters assets based on the specified currencies and wallets.
 * - Converts crypto amounts to USD and returns the total value per currency.
 * @param filter - The filter criteria for retrieving currency analytics.
 * @param clientId - The optional client ID to filter the results.
 * @returns A Promise that resolves to an array of currency analytics data.
 */
	// New version after refactor
	public async getCryptoCurrencyAnalytics(filter: CryptoCurrencyFilterDto, clientId?: string,): Promise<Array<TCryptoCurrencyAnalytics>> {
		try {
			let {productTypes,} = filter
			if (filter.wallets?.length) {
				productTypes = [CryptoType.DIRECT_HOLD,]
			}
			// With date filter
			if (filter.date) {
				const [cryptoGroups, equities, etfs, currencyList,] = await Promise.all([
					this.prismaService.assetCryptoGroup.findMany({
						where: {
							clientId:    { in: clientId ?
								[clientId,] :
								filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entitiesIds, },
							accountId:   { in: filter.accountIds, },
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filter.date,),), }, },
								{ transferDate: null, },
							],
						},
						include: {
							cryptos: {
								where: {
									operation: filter.tradeOperation,

									OR:        [
										{
											...(filter.assetIds?.length ?
												{ id: { in: filter.assetIds, }, } :
												{}),
											assetCryptoVersions: {
												none: {},
											},
											cryptoCurrencyType: {
												in: filter.cryptoTypes,
											},
											productType: {
												in: filter.productTypes,
											},
											currency: {
												in: filter.currencies,
											},
											exchangeWallet: {
												in: filter.wallets,
											},
											security: {
												in: filter.securities,
											},
											isin: {
												in: filter.isins,
											},
											AND:       [
												{
													OR: [
														{ purchaseDate: null, },
														{ purchaseDate: { lte: endOfDay(new Date(filter.date,),), }, },
													],
												},
												{
													OR: [
														{ transactionDate: null, },
														{ transactionDate: { lte: endOfDay(new Date(filter.date,),), }, },
													],
												},
											],
										},
										{
											assetCryptoVersions: {
												some: {
													...(filter.assetIds?.length ?
														{ id: { in: filter.assetIds, }, } :
														{}),
													cryptoCurrencyType: {
														in: filter.cryptoTypes,
													},
													productType: {
														in: filter.productTypes,
													},
													currency: {
														in: filter.currencies,
													},
													exchangeWallet: {
														in: filter.wallets,
													},
													security: {
														in: filter.securities,
													},
													isin: {
														in: filter.isins,
													},
													AND:       [
														{
															OR: [
																{ purchaseDate: null, },
																{ purchaseDate: { lte: endOfDay(new Date(filter.date,),), }, },
															],
														},
														{
															OR: [
																{ transactionDate: null, },
																{ transactionDate: { lte: endOfDay(new Date(filter.date,),), }, },
															],
														},
													],
												},
											},
										},
									],

								},
								include: {
									assetCryptoVersions: {
										where: {
											createdAt: {
												lte: endOfDay(new Date(filter.date,),),
											},
										},
										orderBy: {
											createdAt: 'desc',
										},
										take: 1,
									},
								},
							},
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      { select: { bankName: true, bankListId: true, bankList: true,}, },
							account:   { select: { accountName: true, }, },
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				],)
				const analyticsData = cryptoGroups
					.map((group,) => {
						return {
							...group,
							cryptos: group.cryptos.map((crypto,) => {
								if (crypto.assetCryptoVersions.length > 0) {
									return {
										...crypto.assetCryptoVersions[0],
										mainAssetId: crypto.id,
									}
								}
								return {
									...crypto,
									mainAssetId: undefined,
								}
							},),
						}
					},)
					.filter((group,) => {
						return group.cryptos?.length
					},)
					.map((item,) => {
						if (item.productType === CryptoType.DIRECT_HOLD) {
							const [crypto,] = item.cryptos
							return {
								currency:      crypto.cryptoCurrencyType,
								currencyValue: crypto.cryptoAmount,
								usdValue:      crypto.marketValueUSD,
								productType:   CryptoType.DIRECT_HOLD,
							} as TCryptoCurrencyAnalytics
						}
						if (!item.currency || !item.totalUnits) {
							return null
						}
						const filteredUnits = item.cryptos.reduce((sum, b,) => {
							if (b.operation === AssetOperationType.SELL) {
								return sum - Number(b.units,)
							}
							return sum + Number(b.units,)
						}, 0,)
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((currencyItem,) => {
							return currencyItem.currency === item.currency
						},)
						const rate = currencyData ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice: number = 0

						if (item.type === EquityType.Equity) {
							const equity = equities.find((e,) => {
								return e.isin === item.isin
							},)
							if (equity) {
								lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfs.find((e,) => {
								return e.isin === item.isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}
						const marketPrice = cBondsData?.currencyName ===  'GBX' ?
							lastPrice / 100 :
							lastPrice
						const usdValue = parseFloat(((filteredUnits ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
						return {
							currency:      item.currency as CurrencyDataList ,
							currencyValue: filteredUnits,
							productType:   CryptoType.ETF,
							usdValue,
						}
					},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)

				return analyticsData
			}
			const [cryptoGroups,] = await Promise.all([
				this.prismaService.assetCryptoGroup.findMany({
					where: {
						clientId:    { in: clientId ?
							[clientId,] :
							filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entitiesIds, },
						accountId:   { in: filter.accountIds, },
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
						cryptoCurrencyType: {
							in: filter.cryptoTypes,
						},
						productType: {
							in: productTypes,
						},
						currency: {
							in: filter.currencies,
						},
						exchangeWallet: {
							in: filter.wallets,
						},
						security: {
							in: filter.securities,
						},
						isin: {
							in: filter.isins,
						},
						transferDate: null,
					},
					include: {
						cryptos: {
							where: {
								operation: filter.tradeOperation,
								...(filter.assetIds?.length ?
									{ id: { in: filter.assetIds, }, } :
									{}),
							},
						},
						portfolio: { select: { name: true, }, },
						entity:    { select: { name: true, }, },
						bank:      { select: { bankName: true, bankListId: true, bankList: true,}, },
						account:   { select: { accountName: true, }, },
					},
				},),
			],)

			// Without date filter
			const analyticsData = cryptoGroups
				.filter((group,) => {
					return group.cryptos.length
				},)
				.map((item,) => {
					if (item.productType === CryptoType.DIRECT_HOLD) {
						return {
							currency:      item.cryptoCurrencyType,
							currencyValue: item.cryptoAmount,
							usdValue:      item.marketValueUSD,
							productType:   CryptoType.DIRECT_HOLD,
						} as TCryptoCurrencyAnalytics
					}
					if (!item.currency || !item.totalUnits) {
						return null
					}
					const usdValue = item.cryptos.reduce<number>((acc, item,) => {
						if (item.operation === AssetOperationType.SELL) {
							return acc - item.marketValueUSD
						}
						return acc + item.marketValueUSD
					}, 0,)
					return {
						currency:      item.currency as CurrencyDataList ,
						currencyValue: item.totalUnits,
						productType:   CryptoType.ETF,
						usdValue,
					}
				},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)

			return analyticsData
		} catch (error) {
			return []
		}
	}

	// public async getCryptoCurrencyAnalytics(filter: CryptoCurrencyFilterDto, clientId?: string,): Promise<Array<TCryptoCurrencyAnalytics>> {
	// 	const assetsPromise = this.getFilteredAssets(filter, filter.assetIds, clientId,)
	// 	const cryptoListPromise = this.prismaService.cryptoData.findMany()
	// 	const currencyDataPromise = this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,)
	// 	const [assets, cryptoList, currencyList, equities, etfs,] = await Promise.all([
	// 		assetsPromise,
	// 		cryptoListPromise,
	// 		currencyDataPromise,
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 	],)

	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const parsedPayload = assetParser<ICryptoAsset>(asset,)
	// 			if (parsedPayload) {
	// 				const {
	// 					productType,

	// 					cryptoCurrencyType,
	// 					cryptoAmount,
	// 					exchangeWallet,
	// 					purchaseDate,
	// 					purchasePrice,

	// 					currency,
	// 					transactionDate,
	// 					isin,
	// 					units,
	// 					transactionPrice,
	// 					operation,
	// 					security: ticker,
	// 				} = parsedPayload
	// 				if (productType === CryptoType.DIRECT_HOLD && cryptoAmount && purchasePrice && cryptoCurrencyType && exchangeWallet) {
	// 					if (filter.currencies?.length || filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.tradeOperation) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
	// 						return null
	// 					}
	// 					if (filter.wallets?.length && !filter.wallets.includes(exchangeWallet,)) {
	// 						return null
	// 					}
	// 					if (filter.cryptoTypes?.length && !filter.cryptoTypes.includes(cryptoCurrencyType,)) {
	// 						return null
	// 					}
	// 					if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
	// 						return null
	// 					}
	// 					const marketValueUsd = this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
	// 						token: cryptoCurrencyType,
	// 						cryptoAmount,
	// 					},
	// 					cryptoList
	// 						,)

	// 					const costValueUsd = purchasePrice * cryptoAmount
	// 					const profitUsd = marketValueUsd - costValueUsd
	// 					const profitPercentage = profitUsd / costValueUsd * 100
	// 					return {
	// 						currency:      cryptoCurrencyType,
	// 						currencyValue: cryptoAmount,
	// 						usdValue:      marketValueUsd,
	// 						productType,
	// 					} as TCryptoCurrencyAnalytics
	// 				}
	// 				if (productType === CryptoType.ETF) {
	// 					const equityAsset = equities.find((equity,) => {
	// 						return equity.isin === isin
	// 					},) ?? etfs.find((etf,) => {
	// 						return etf.isin === isin
	// 					},) ?? null
	// 					if (!equityAsset) {
	// 						return null
	// 					}
	// 					if (filter.wallets?.length || filter.cryptoTypes?.length) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
	// 						return null
	// 					}
	// 					if (!isin || !units || !transactionPrice || !operation || !transactionDate || !currency) {
	// 						return null
	// 					}
	// 					if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 						return null
	// 					}
	// 					if (filter.isins?.length && !filter.isins.includes(isin,)) {
	// 						return null
	// 					}
	// 					if (filter.securities?.length && ticker && !filter.securities.includes(ticker,)) {
	// 						return null
	// 					}
	// 					if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 						return null
	// 					}
	// 					if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 						return null
	// 					}
	// 					const accountAssets = assets.filter((accountAsset,) => {
	// 						const accountAssetPayload = assetParser<IEquityAsset>(accountAsset,)
	// 						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
	// 					},)
	// 					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 						const assetPayload = assetParser<IEquityAsset>(a,)
	// 						if (assetPayload?.operation === AssetOperationType.SELL) {
	// 							return sum - assetPayload.units
	// 						}
	// 						return assetPayload ?
	// 							sum + assetPayload.units :
	// 							sum
	// 					}, 0,)
	// 					if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0)) {
	// 						return null
	// 					}
	// 					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 						return item.currency === currency
	// 					},)

	// 					const rate = currencyData ?
	// 						filter.date ?
	// 							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 							currencyData.rate :
	// 						asset.rate ?? 1

	// 					const price = 'lastPrice' in equityAsset ?
	// 						filter.date && equityAsset.equityHistory[0] ?
	// 							Number(equityAsset.equityHistory[0].lastPrice,) :
	// 							Number(equityAsset.lastPrice,) :
	// 						filter.date && equityAsset.etfHistory[0] ?
	// 							Number(equityAsset.etfHistory[0].close,) :
	// 							Number(equityAsset.close,)
	// 					const usdValue = equityAsset.currencyName === 'GBX' ?
	// 						parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 						parseFloat((units * price * rate).toFixed(2,),)
	// 					return {
	// 						currency,
	// 						currencyValue: units,
	// 						productType,
	// 						usdValue:      filter.tradeOperation === AssetOperationType.SELL ?
	// 							usdValue :
	// 							operation === AssetOperationType.BUY ?
	// 								usdValue :
	// 								-usdValue,
	// 					} as TCryptoCurrencyAnalytics
	// 				}
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is TCryptoCurrencyAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.filter((item,) => {
	// 			return item.usdValue !== 0
	// 		},)
	// 	return analyticsData
	// }

	/**
 * 3.5.4
 * Retrieves filtered assets based on the provided filter and criteria.
 * @remarks
 * - Filters assets by type, portfolio, entity, and other criteria such as dates and client IDs.
 * @param filter - The filter criteria for retrieving assets.
 * @param assetIds - An optional list of asset IDs to filter the results.
 * @param clientId - The optional client ID to filter the results.
 * @returns A Promise that resolves to a list of filtered assets.
 */
	public async getFilteredAssets(filter: CryptoCurrencyFilterDto, assetIds?: Array<string>, clientId?: string,): Promise<Array<TAssetExtended>> {
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
			portfolio: {
				is: {
					isActivated: true,
				},
			},
			...(assetIds?.length ?
				{ id: { in: assetIds, }, } :
				{}),
			clientId: {
				in: clientId ?
					[clientId,] :
					filter.clientIds,
			},
		}

		return this.prismaService.asset.findMany({
			where,
			include: {
				entity: true,
				bank:   true,
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
	public syncGetAllByFilters(data: TCryptoInitials, filters: AnalyticsCryptoFilterDto, clientId?: string,): ICryptoByFilters {
		try {
			const {assets, cryptoList, currencyList, equities, etfs, equityIsins,} = data
			const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
				return [isin, typeId,]
			},),)
			const analyticsData = assets
				.filter((asset,) => {
					return clientId ?
						asset.clientId === clientId :
						true
				},)
				.map((asset,) => {
					const assetPayload = assetParser<ICryptoAsset>(asset,)
					if (assetPayload) {
						const {
							productType,

							cryptoCurrencyType,
							cryptoAmount,
							exchangeWallet,
							purchaseDate,
							purchasePrice,

							currency,
							transactionDate,
							isin,
							units,
							transactionPrice,
							operation,
						} = assetPayload
						if (productType === CryptoType.DIRECT_HOLD && cryptoAmount && purchasePrice && cryptoCurrencyType && exchangeWallet) {
							if (filters.productTypes?.length && !filters.productTypes.includes(productType,)) {
								return null
							}
							if (filters.wallets?.length && !filters.wallets.includes(exchangeWallet,)) {
								return null
							}
							if (filters.cryptoTypes?.length && !filters.cryptoTypes.includes(cryptoCurrencyType,)) {
								return null
							}
							if (purchaseDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(purchaseDate,)) {
								return null
							}
							const marketValueUsd = this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
								token: cryptoCurrencyType,
								cryptoAmount,
							},
							cryptoList
								,)
							const currencyData = cryptoList.find((item,) => {
								return item.token === cryptoCurrencyType
							},)
							const costValueUsd = purchasePrice * cryptoAmount
							const profitUsd = marketValueUsd - costValueUsd
							const profitPercentage = profitUsd / costValueUsd * 100
							return {
								productType,
								id:                asset.id,
								portfolioName:     asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
								entityName:        asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
								accountName:       asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
								bankName:          asset.bank?.bankName,
								exchangeWallet,
								cryptoCurrencyType,
								cryptoAmount:      Number(cryptoAmount,),
								usdAmount:         marketValueUsd,
								purchaseDate:      String(purchaseDate,),
								purchasePrice:     Number(purchasePrice,),
								currentStockPrice: currencyData?.rate ?
									Number(currencyData.rate,) :
									1,
								costValueUsd,
								marketValueUsd,
								profitUsd,
								profitPercentage,
							} as IAnalyticCrypto
						}
						if (productType === CryptoType.ETF) {
							if (filters.productTypes?.length && !filters.productTypes.includes(productType,)) {
								return null
							}
							if (!isin || !units || !transactionPrice || !operation || !transactionDate || !currency) {
								return null
							}
							const typeId = isinTypeMap.get(isin,)
							if (!typeId) {
								return null
							}
							let ticker: string | undefined
							let lastPrice: number | undefined
							let issuer: string | undefined
							let stockCountry: string | undefined
							let stockSector: string | null  = null
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
								stockSector = equity.branchName === 'Undefined' ?
									null :
									equity.branchName
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
								stockSector = etf.sectorName === 'Undefined' ?
									null :
									etf.sectorName
							}
							if (!lastPrice) {
								return null
							}
							if (filters.date && endOfDay(new Date(filters.date,),) < new Date(transactionDate,)) {
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
							const costValueFC = Number(units,) * transactionPrice
							const costValueUsd = Number(units,) * transactionPrice * rate
							const marketValueUsd = dataItem.currencyName === 'GBX' ?
								parseFloat((units * Number(lastPrice,) * rate  / 100).toFixed(2,) ,) :
								parseFloat((units * Number(lastPrice,) * rate).toFixed(2,),)
							const marketValueFC = dataItem.currencyName === 'GBX' ?
								parseFloat((units * Number(lastPrice,) / 100).toFixed(2,) ,) :
								parseFloat((units * Number(lastPrice,)).toFixed(2,),)
							const currentStockPrice = dataItem.currencyName === 'GBX' ?
								parseFloat((Number(lastPrice,) / 100).toFixed(2,) ,) :
								parseFloat((Number(lastPrice,)).toFixed(2,),)
							if ((totalBuySellUnits <= 0) || marketValueUsd === 0) {
								return null
							}
							const profitUsd = Number(marketValueUsd,) - Number(costValueUsd,)
							const profitPercentage = (Number(currentStockPrice,) - Number(costPrice,)) / Number(costPrice,) * 100
							return {
								id:                asset.id,
								productType:       CryptoType.ETF,
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
								valueDate:         String(transactionDate,),
								costValueFC,
								marketValueFC,
							} as IAnalyticCryptoETF
						}
					}
					return null
				},)
				.filter((item,): item is IAnalyticCrypto | IAnalyticCryptoETF => {
					return item !== null
				},)
			const equityAssets = analyticsData.filter(
				(item,): item is IAnalyticCryptoETF => {
					return item.productType === CryptoType.ETF
				},
			)
			const cryptoAssets = analyticsData.filter(
				(item,): item is IAnalyticCrypto => {
					return item.productType === CryptoType.DIRECT_HOLD
				},
			)
			const groupedAssets = Object.values(
				equityAssets.reduce<Record<string, IAnalyticCryptoETFWithInnerAssets>>((acc, asset,) => {
					const {
						productType,
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
							productType,
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
					acc[key].units = acc[key].units + units
					acc[key].assets.push(asset,)
					return acc
				}, {} ,),
			)
			const finalEquityAssets: Array<IAnalyticCryptoETF | IAnalyticCryptoETFWithInnerAssets> = groupedAssets.map((group,) => {
				if (group.assets.length === 1) {
					return {
						...group.assets[0],
						costPrice: group.assets[0].transactionPrice,
					} as IAnalyticCryptoETF
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
					productType:       group.productType,
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
					currency:          group.currency,
				} as unknown as IAnalyticCryptoETFWithInnerAssets
			},)
			const finalAssets = [...cryptoAssets,...finalEquityAssets,]
			const totalAssets = finalAssets.reduce((sum, asset,) => {
				return sum + (asset.marketValueUsd || 0)
			}, 0,)

			return {
				list: finalAssets,
				totalAssets,
			}
		} catch (error) {
			return {
				list:         [],
				totalAssets:  0,
			}
		}
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetCryptoBankAnalytics(data: TCryptoInitials,filter: CryptoCurrencyFilterDto, clientId?: string,): Array<TCryptoBankAnalytics> {
		const {assets, cryptoList, currencyList, equities, etfs,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const assetPayload = assetParser<ICryptoAsset>(asset,)
				if (assetPayload) {
					const {
						productType,

						cryptoCurrencyType,
						cryptoAmount,
						exchangeWallet,
						purchaseDate,
						purchasePrice,

						currency,
						transactionDate,
						isin,
						units,
						transactionPrice,
						operation,
					} = assetPayload
					if (productType === CryptoType.DIRECT_HOLD && cryptoAmount && purchasePrice && cryptoCurrencyType && exchangeWallet) {
						if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
							return null
						}
						if (filter.wallets?.length && !filter.wallets.includes(exchangeWallet,)) {
							return null
						}
						if (filter.cryptoTypes?.length && !filter.cryptoTypes.includes(cryptoCurrencyType,)) {
							return null
						}
						if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
							return null
						}
						const marketValueUsd = this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
							token: cryptoCurrencyType,
							cryptoAmount,
						},
						cryptoList
							,)

						const costValueUsd = purchasePrice * cryptoAmount
						const profitUsd = marketValueUsd - costValueUsd
						const profitPercentage = profitUsd / costValueUsd * 100
						return {
							id:       asset.id,
							bankName: assetPayload.exchangeWallet,
							productType,
							usdValue: marketValueUsd,
						} as TCryptoBankAnalytics
					}
					if (productType === CryptoType.ETF) {
						if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
							return null
						}
						if (!isin || !units || !transactionPrice || !operation || !transactionDate || !currency) {
							return null
						}
						if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
							return null
						}
						const equityAsset = equities.find((equity,) => {
							return equity.isin === isin
						},) ?? etfs.find((etf,) => {
							return etf.isin === isin
						},) ?? null
						if (!equityAsset) {
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
						if ((!filter.assetIds && totalBuySellUnits <= 0)) {
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
							productType,
							usdValue: operation === AssetOperationType.BUY ?
								usdValue :
								-usdValue,
						}
					}
				}
				return null
			},)
			.filter((item,): item is TCryptoBankAnalytics => {
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
	public syncGetCryptoCurrencyAnalytics(data: TCryptoInitials, filter: CryptoCurrencyFilterDto, clientId?: string,): Array<TCryptoCurrencyAnalytics> {
		const {assets, cryptoList, currencyList, equities, etfs,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<ICryptoAsset>(asset,)
				if (parsedPayload) {
					const {
						productType,

						cryptoCurrencyType,
						cryptoAmount,
						exchangeWallet,
						purchaseDate,
						purchasePrice,

						currency,
						transactionDate,
						isin,
						units,
						transactionPrice,
						operation,
						security: ticker,
					} = parsedPayload
					if (productType === CryptoType.DIRECT_HOLD && cryptoAmount && purchasePrice && cryptoCurrencyType && exchangeWallet) {
						if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
							return null
						}

						if (filter.currencies?.length || filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.tradeOperation) {
							return null
						}

						if (filter.wallets?.length && !filter.wallets.includes(exchangeWallet,)) {
							return null
						}
						if (filter.cryptoTypes?.length && !filter.cryptoTypes.includes(cryptoCurrencyType,)) {
							return null
						}
						if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
							return null
						}
						const marketValueUsd = this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
							token: cryptoCurrencyType,
							cryptoAmount,
						},
						cryptoList
							,)

						const costValueUsd = purchasePrice * cryptoAmount
						const profitUsd = marketValueUsd - costValueUsd
						const profitPercentage = profitUsd / costValueUsd * 100
						return {
							currency:      cryptoCurrencyType,
							currencyValue: cryptoAmount,
							productType,
							usdValue:      marketValueUsd,
						} as TCryptoCurrencyAnalytics
					}
					if (productType === CryptoType.ETF) {
						if (filter.wallets?.length || filter.cryptoTypes?.length) {
							return null
						}

						if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
							return null
						}
						if (!isin || !units || !transactionPrice || !operation || !transactionDate || !currency) {
							return null
						}
						if (filter.currencies && !filter.currencies.includes(currency,)) {
							return null
						}
						if (filter.isins?.length && !filter.isins.includes(isin,)) {
							return null
						}
						if (filter.securities?.length && ticker && !filter.securities.includes(ticker,)) {
							return null
						}
						if (filter.tradeOperation && filter.tradeOperation !== operation) {
							return null
						}
						if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
							return null
						}
						const equityAsset = equities.find((equity,) => {
							return equity.isin === isin
						},) ?? etfs.find((etf,) => {
							return etf.isin === isin
						},) ?? null
						if (!equityAsset) {
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
						if ((!filter.tradeOperation && totalBuySellUnits <= 0)) {
							return null
						}
						if ((totalBuySellUnits <= 0)) {
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
							productType,
							currencyValue: units,
							usdValue:      operation === AssetOperationType.BUY ?
								usdValue :
								-usdValue,
						} as TCryptoCurrencyAnalytics
					}
				}
				return null
			},)
			.filter((item,): item is TCryptoCurrencyAnalytics => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
		return analyticsData
	}
}