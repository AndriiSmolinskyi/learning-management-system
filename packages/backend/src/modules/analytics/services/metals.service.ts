/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable max-depth */
/* eslint-disable max-lines */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Equity, Etf,} from '@prisma/client'
import { CurrencyDataList, EquityType, type MetalData, type Prisma, } from '@prisma/client'
import { v4 as uuid4, } from 'uuid'

import { CBondsCurrencyService, } from '../../apis/cbonds-api/services'
import { assetParser, } from '../../../shared/utils'

import type {
	MetalsFilterDto,
} from '../dto'
import {
	AssetNamesType,
	MetalsSortVariants,
} from '../../asset/asset.types'
import type {
	TAssetExtended,
	IMetalsAsset,
	IMetalsByFilter,
	TMetalsAssetExtended,
	TMetalsWithInnerAssets,
	IEquityAsset,
} from '../../asset/asset.types'
import type {
	IAnalyticMetalETF,
	IAnalyticMetalETFWithInnerAssets,
	TCurrencyAnalytics,
	TMetalBankAnalytics,
	TMetalCurrencyAnalytics,
} from '../analytics.types'
import { AssetOperationType, MetalType, } from '../../../shared/types'
import { endOfDay, } from 'date-fns'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TMetalAssetCache, } from '../../../modules/common/cache-sync/cache-sync.types'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'

@Injectable()
export class MetalsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
	 * 3.5.4
	 * Calculates annual income from metal transactions based on provided filters.
	 * @remarks
	 * Fetches transactions related to assets of type "Metals" for the current year (up to the given date or today),
	 * filtered by portfolios, banks, accounts, entities, and clients.
	 * If the selected date belongs to the previous year, returns 0.
	 * Otherwise, sums each transaction's amount multiplied by its rate (if present).
	 * @param filter - Criteria for filtering metal transactions.
	 * @param clientId - Optional client ID to override filter.
	 * @returns Total metal income for the current year.
	*/
	public async getMetalAnnual(filter: MetalsFilterDto, clientId?: string,): Promise<number> {
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
					annualAssets: { has: AssetNamesType.METALS, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)
		const metalAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return metalAnnual
	}

	/**
 * 3.5.4
 * Retrieves filtered metals based on the provided filter criteria.
 * @remarks
 * - Fetches assets based on the specified criteria such as portfolio, entity, and bank IDs.
 * - Filters assets by metal types, currencies, and date range.
 * - Calculates the total USD value for the filtered metals.
 * @param filter - The filter criteria for retrieving metals.
 * @param clientId - The optional client ID to filter the results.
 * @returns A Promise that resolves to an object containing a list of filtered metals and total USD value.
 */
	// New version after refactor
	public async getFilteredMetals(filter: MetalsFilterDto, clientId?: string,): Promise<IMetalsByFilter> {
		try {
			if (filter.date) {
				const [metalGroups, equities, etfs, currencyList, metalList, historyCurrencyData, metalData,] = await Promise.all([
					this.prismaService.assetMetalGroup.findMany({
						where: {
							clientId:    { in: clientId ?
								[clientId,] :
								filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entitiesIds, },
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filter.date,),), }, },
								{ transferDate: null, },
							],
						},
						orderBy: {
							[filter.sortBy]: filter.sortOrder,
						},
						include: {
							metals: {
								where: {
									operation:       filter.tradeOperation,
									OR:        [
										{
											assetMetalVersions: {
												none: {},
											},
											transactionDate: {
												lte: endOfDay(new Date(filter.date,),),
											},
											metalType: {
												in: filter.metals,
											},
											productType: {
												in: filter.productTypes,
											},
											currency: {
												in: filter.currencies,
											},
											security: {
												in: filter.securities,
											},
											isin: {
												in: filter.isins,
											},
										},
										{
											assetMetalVersions: {
												some: {
													transactionDate: {
														lte: endOfDay(new Date(filter.date,),),
													},
													metalType: {
														in: filter.metals,
													},
													productType: {
														in: filter.productTypes,
													},
													currency: {
														in: filter.currencies,
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
									assetMetalVersions: {
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
							bank:      { select: { bankName: true, }, },
							account:   { select: { accountName: true, }, },
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
					this.prismaService.currencyHistoryData.findMany(),
					this.prismaService.metalData.findMany(),

				],)
				const mappedMetalGroups = metalGroups
					.map((group,) => {
						return {
							...group,
							metals: group.metals.map((metal,) => {
								if (metal.assetMetalVersions.length > 0) {
									return {
										...metal.assetMetalVersions[0],
										mainAssetId: metal.id,
									}
								}
								return {
									...metal,
									mainAssetId: undefined,
								}
							},),
						}
					},)
					.filter((group,) => {
						return group.metals?.length
					},)
					.map((group,) => {
						if (group.productType === MetalType.ETF) {
							const {
								metals,
								currency,
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
							const filteredUnits = group.metals.reduce((sum, b,) => {
								if (b.operation === AssetOperationType.SELL) {
									return sum - Number(b.units,)
								}
								return sum + Number(b.units,)
							}, 0,)
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === currency
							},)
							const rate = currencyData ?
								filter.date ?
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

							const accountAssets = group.metals
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
								id:                 group.metals[0].id,
								productType:        MetalType.ETF,
								portfolioName:      this.cryptoService.decryptString(portfolio.name,),
								entityName:         this.cryptoService.decryptString(entity.name,),
								accountName:        this.cryptoService.decryptString(account.accountName,),
								bankName:           bank.bankName,
								issuer:             issuer ?? '- -',
								isin:               isin ?? '- -',
								security:           security ?? '- -',
								currency,
								profitUsd:          profitUSDGroup,
								profitPercentage:  profitPercentageGroup,
								costPrice:         costPriceGroup,
								units:              filteredUnits,
								marketValueUsd:    marketValueUSDGroup,
								currentStockPrice: marketPrice,
								marketValueFC:     marketValueFCGroup,
								costValueUsd:       costValueUSDGroup,
								country:            country ?? 'Global',
								sector:             sector ?? '- -',
								operation:          AssetOperationType.BUY,
								transactionPrice,
								valueDate:          metals.length === 1 ?
									group.metals[0]?.transactionDate?.toISOString() :
									transactionDate?.toISOString(),
								costValueFC:       costValueFCGroup,
								equityType:         'Metals',
								groupId:           group.id,
								isTransferred:     Boolean(group.transferDate,),
								...(group.metals.length === 1 ?
									{mainAssetId: group.metals[0].mainAssetId,} :
									{}),
								...(metals.length > 1 ?
									{
										assets: metals.map((metal,) => {
											const marketValueUsd = parseFloat(((metal.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
											const marketValueFC = parseFloat(((metal.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
											return {
												id:                 metal.id,
												productType:        MetalType.ETF,
												portfolioName:      this.cryptoService.decryptString(portfolio.name,),
												entityName:         this.cryptoService.decryptString(entity.name,),
												accountName:        this.cryptoService.decryptString(account.accountName,),
												bankName:           bank.bankName,
												issuer:             metal.issuer ?? '- -',
												isin:               metal.isin ?? '- -',
												security:           metal.security ?? '- -',
												currency,
												profitUsd:          metal.profitUSD,
												profitPercentage:   metal.profitPercentage,
												costPrice:          metal.transactionPrice,
												units:              metal.units,
												marketValueUsd,
												marketValueFC,
												currentStockPrice:  marketPrice,
												costValueUsd:       metal.costValueUSD,
												country:            metal.country ?? 'Global',
												sector:             metal.sector ?? '- -',
												operation:          metal.operation,
												transactionPrice:   metal.transactionPrice,
												valueDate:          metal.transactionDate?.toISOString(),
												costValueFC:        metal.costValueFC,
												equityType:        'Metals',
												groupId:           group.id,
												isTransferred:     Boolean(group.transferDate,),
												...(metal.mainAssetId ?
													{mainAssetId: metal.mainAssetId,} :
													{}),
											}
										},),
									} :
									{}),
							} as IAnalyticMetalETFWithInnerAssets
						}
						const accountAssets = group.metals
						let rateSum = 0
						let rateCount = 0
						let totalUnits = 0
						let totalValue = 0
						const {currency,} = group
						const {metalType,} = group
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === currency
						},)
						const metalCurrencyData = metalData.find((c,) => {
							return c.currency === (metalType)
						},)
						const { rate,} = metalCurrencyData ?? {rate: 1,}
						const currencyRate = currencyData ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						for (const a of accountAssets) {
							if (a.operation === AssetOperationType.SELL) {
								continue
							}
							const costRateDate = new Date(a.transactionDate,)
							const costCurrencyHistoryRate = currency === CurrencyDataList.USD ?
								1 :
								historyCurrencyData
									.filter((item,) => {
										return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
									},)
									.sort((a, b,) => {
										return new Date(a.date,).getTime() - new Date(b.date,).getTime()
									},)[0]?.rate
							rateSum = rateSum + ((costCurrencyHistoryRate ?? currencyRate) * a.units)
							rateCount = rateCount + 1
							totalUnits = totalUnits + a.units
							totalValue = totalValue + (a.transactionPrice * a.units)
						}
						const metalMarketPrice =  parseFloat((rate / currencyRate).toFixed(2,),)
						const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
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

						const costValueFCGroup = costPriceGroup * totalBuySellUnits
						const costValueUSDGroup = costValueFCGroup * avgRate
						const marketValueFCGroup = totalBuySellUnits *  metalMarketPrice
						// const marketValueUSDGroup = totalBuySellUnits * rate
						const marketValueUSDGroup = group.metalType ?
							this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
								metalList,
								metalType:   group.metalType,
								units:       totalBuySellUnits,
								historyDate: filter.date,
							},) :
							0
						const profitUSDGroup = marketValueUSDGroup - costValueUSDGroup
						const profitPercentageGroup = costValueUSDGroup > 0	?
							(profitUSDGroup / costValueUSDGroup) * 100	:
							0

						const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
							(latest, current,) => {
								return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
									current :
									latest)
							},
						)
						return {
							id:            	    group.metals[0].id,
							productType:       MetalType.DIRECT_HOLD,
							portfolioName:      this.cryptoService.decryptString(group.portfolio.name,),
							entityName:         this.cryptoService.decryptString(group.entity.name,),
							accountName:        this.cryptoService.decryptString(group.account.accountName,),
							bankName:           group.bank.bankName,
							profitUsd:         profitUSDGroup,
							profitPercentage:  profitPercentageGroup,
							marketValueUsd:    marketValueUSDGroup,
							units:             totalBuySellUnits,
							costPrice: 		      costPriceGroup,
							costValueUsd:      costValueUSDGroup,
							costValueFC:       costValueFCGroup,
							marketValueFC:     marketValueFCGroup,
							currency:          group.currency,
							valueDate:         latestTransactionDate.toISOString(),
							metalType:         group.metalType,
							issuer:             '- -',
							isin:               '- -',
							security:           '- -',
							country:           'Global',
							sector:             '- -',
							operation:          AssetOperationType.BUY,
							currentStockPrice: metalMarketPrice,
							metalName:         group.metalName,
							metalPrice:        group.metalPrice,
							transactionPrice:  group.transactionPrice,
							equityType:        'Metals',
							groupId:           group.id,
							isTransferred:     Boolean(group.transferDate,),
							...(group.metals.length === 1 ?
								{mainAssetId: group.metals[0].mainAssetId,} :
								{}),
							...(group.metals.length > 1 ?
								{
									assets: group.metals.map((metal,) => {
										const marketValueUsd = metal.metalType ?
											this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
												metalList,
												metalType:   metal.metalType,
												units:       metal.units,
												historyDate: filter.date,
											},) :
											0
										const profitUSDGroup = marketValueUsd - metal.costValueUSD
										const profitPercentageGroup = metal.costValueUSD > 0	?
											(profitUSDGroup / metal.costValueUSD) * 100	:
											0
										return {
											id:            	   metal.id,
											productType:       MetalType.DIRECT_HOLD,
											portfolioName:      this.cryptoService.decryptString(group.portfolio.name,),
											entityName:         this.cryptoService.decryptString(group.entity.name,),
											accountName:        this.cryptoService.decryptString(group.account.accountName,),
											bankName:           group.bank.bankName,
											profitUsd:         profitUSDGroup,
											profitPercentage:  profitPercentageGroup,
											marketValueUsd,
											units:             metal.units,
											costPrice: 		      metal.transactionPrice,
											metalType:         metal.metalType,
											costValueUsd:      metal.costValueUSD,
											costValueFC:       metal.costValueFC,
											marketValueFC:     metal.marketValueFC,
											currency:          metal.currency,
											valueDate:         metal.transactionDate.toISOString(),
											transactionPrice:  metal.transactionPrice,
											issuer:             '- -',
											isin:               '- -',
											security:           '- -',
											country:            'Global',
											sector:             '- -',
											operation:          metal.operation,
											currentStockPrice: metal.currentStockPrice,
											metalName:         metal.metalName,
											metalPrice:        metal.metalPrice,
											equityType:        'Metals',
											groupId:           group.id,
											isTransferred:     Boolean(group.transferDate,),
											...(metal.mainAssetId ?
												{mainAssetId: metal.mainAssetId,} :
												{}),
										}
									},),
								} :
								{}),
						}
					},)
				const directHold: typeof mappedMetalGroups = []
				const etf: typeof mappedMetalGroups = []

				for (const asset of mappedMetalGroups) {
					if (asset.productType === MetalType.DIRECT_HOLD) {
						directHold.push(asset,)
					} else if (asset.productType === MetalType.ETF) {
						etf.push(asset,)
					}
				}
				const orderedList = [...directHold, ...etf,]
				const totalUsdValue = mappedMetalGroups.reduce((sum, asset,) => {
					return sum + (asset.marketValueUsd || 0)
				}, 0,)
				return {
					list: orderedList,
					totalUsdValue,
				}
			}
			const [metalGroups,] = await Promise.all([
				this.prismaService.assetMetalGroup.findMany({
					where: {
						clientId:    { in: clientId ?
							[clientId,] :
							filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entitiesIds, },
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
						metalType: {
							in: filter.metals,
						},
						productType: {
							in: filter.productTypes,
						},
						currency: {
							in: filter.currencies,
						},
						security: {
							in: filter.securities,
						},
						isin: {
							in: filter.isins,
						},
						transferDate: null,
					},
					orderBy: {
						[filter.sortBy]: filter.sortOrder,
					},
					include: {
						metals: {
							where: {
								operation: filter.tradeOperation,
								...(filter.date && {
									transactionDate: {
										lte: endOfDay(new Date(filter.date,),),
									},
								}),
							},
						},
						portfolio: { select: { name: true, }, },
						entity:    { select: { name: true, }, },
						bank:      { select: { bankName: true, }, },
						account:   { select: { accountName: true, }, },
					},
				},),
			],)
			// Without filter date
			const mappedMetalGroups = metalGroups
				.filter((group,) => {
					return group.metals?.length
				},)
				.map((group,) => {
					if (group.productType === MetalType.ETF) {
						const {
							metals,
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
							id:                 group.metals[0].id,
							productType:        MetalType.ETF,
							portfolioName:      this.cryptoService.decryptString(portfolio.name,),
							entityName:         this.cryptoService.decryptString(entity.name,),
							accountName:        this.cryptoService.decryptString(account.accountName,),
							bankName:           bank.bankName,
							issuer:             issuer ?? '- -',
							isin:               isin ?? '- -',
							security:           security ?? '- -',
							currency,
							profitUsd:          profitUSD,
							profitPercentage,
							costPrice,
							units:              totalUnits,
							marketValueUsd:     parseFloat(marketValueUSD.toFixed(2,),),
							currentStockPrice,
							costValueUsd:       costValueUSD,
							country:            country ?? 'Global',
							sector:             sector ?? '- -',
							operation:          AssetOperationType.BUY,
							transactionPrice,
							valueDate:          transactionDate?.toISOString(),
							costValueFC,
							marketValueFC,
							equityType:         'Metals',
							groupId:           group.id,
							...(metals.length > 1 ?
								{
									assets: metals.map((crypto,) => {
										return {
											id:                 crypto.id,
											productType:        MetalType.ETF,
											portfolioName:      this.cryptoService.decryptString(portfolio.name,),
											entityName:         this.cryptoService.decryptString(entity.name,),
											accountName:        this.cryptoService.decryptString(account.accountName,),
											bankName:           bank.bankName,
											issuer:             crypto.issuer ?? '- -',
											isin:               crypto.isin ?? '- -',
											security:           crypto.security ?? '- -',
											currency,
											profitUsd:          crypto.profitUSD,
											profitPercentage:   crypto.profitPercentage,
											costPrice:          crypto.transactionPrice,
											units:              crypto.units,
											marketValueUsd:     parseFloat(crypto.marketValueUSD.toFixed(2,),),
											currentStockPrice:  crypto.currentStockPrice,
											costValueUsd:       crypto.costValueUSD,
											country:            crypto.country ?? 'Global',
											sector:             crypto.sector ?? '- -',
											operation:          crypto.operation,
											transactionPrice:   crypto.transactionPrice,
											valueDate:          crypto.transactionDate?.toISOString(),
											costValueFC:        crypto.costValueFC,
											marketValueFC:      crypto.marketValueFC,
											equityType:        'Metals',
											groupId:           group.id,
										}
									},),
								} :
								{}),
						} as IAnalyticMetalETFWithInnerAssets
					}
					return {
						id:            	    group.metals[0].id,
						productType:       MetalType.DIRECT_HOLD,
						portfolioName:      this.cryptoService.decryptString(group.portfolio.name,),
						entityName:         this.cryptoService.decryptString(group.entity.name,),
						accountName:        this.cryptoService.decryptString(group.account.accountName,),
						bankName:           group.bank.bankName,
						profitUsd:         group.profitUSD,
						profitPercentage:  group.profitPercentage,
						marketValueUsd:    parseFloat(group.marketValueUSD.toFixed(2,),),
						units:             group.totalUnits,
						costPrice: 		      group.costPrice,
						costValueUsd:      group.costValueUSD,
						costValueFC:       group.costValueFC,
						marketValueFC:     group.marketValueFC,
						currency:          group.currency,
						valueDate:         group.transactionDate.toISOString(),
						metalType:         group.metalType,
						issuer:             '- -',
						isin:               '- -',
						security:           '- -',
						country:           'Global',
						sector:             '- -',
						operation:          AssetOperationType.BUY,
						currentStockPrice: group.currentStockPrice,
						metalName:         group.metalName,
						metalPrice:        group.metalPrice,
						transactionPrice:  group.transactionPrice,
						equityType:        'Metals',
						groupId:           group.id,
						...(group.metals.length > 1 ?
							{
								assets: group.metals.map((metal,) => {
									return {
										id:            	   metal.id,
										productType:       MetalType.DIRECT_HOLD,
										portfolioName:      this.cryptoService.decryptString(group.portfolio.name,),
										entityName:         this.cryptoService.decryptString(group.entity.name,),
										accountName:        this.cryptoService.decryptString(group.account.accountName,),
										bankName:           group.bank.bankName,
										profitUsd:         metal.profitUSD,
										profitPercentage:  metal.profitPercentage,
										marketValueUsd:    parseFloat(metal.marketValueUSD.toFixed(2,),),
										units:             metal.units,
										costPrice: 		      metal.transactionPrice,
										metalType:         metal.metalType,
										costValueUsd:      metal.costValueUSD,
										costValueFC:       metal.costValueFC,
										marketValueFC:     metal.marketValueFC,
										currency:          metal.currency,
										valueDate:         metal.transactionDate.toISOString(),
										transactionPrice:  metal.transactionPrice,
										issuer:             '- -',
										isin:               '- -',
										security:           '- -',
										country:            'Global',
										sector:             '- -',
										operation:          metal.operation,
										currentStockPrice: metal.currentStockPrice,
										metalName:         metal.metalName,
										metalPrice:        metal.metalPrice,
										equityType:        'Metals',
										groupId:           group.id,
									}
								},),
							} :
							{}),
					}
				},)
			const directHold: typeof mappedMetalGroups = []
			const etf: typeof mappedMetalGroups = []

			for (const asset of mappedMetalGroups) {
				if (asset.productType === MetalType.DIRECT_HOLD) {
					directHold.push(asset,)
				} else if (asset.productType === MetalType.ETF) {
					etf.push(asset,)
				}
			}
			const orderedList = [...directHold, ...etf,]
			const totalUsdValue = mappedMetalGroups.reduce((sum, asset,) => {
				return sum + (asset.marketValueUsd || 0)
			}, 0,)
			return {
				list: orderedList,
				totalUsdValue,
			}
		} catch (error) {
			return {
				list:          [],
				totalUsdValue: 0,
			}
		}
	}

	// public async getFilteredMetals(filter: MetalsFilterDto, clientId?: string,): Promise<IMetalsByFilter> {
	// 	try {
	// 		let totalUsdValue = 0
	// 		const assetsPromise = this.prismaService.asset.findMany({
	// 			where: {
	// 				isArchived:  false,
	// 				assetName:  filter.type,
	// 				clientId:   {
	// 					in: clientId ?
	// 						[clientId,] :
	// 						filter.clientIds,
	// 				},
	// 				portfolioId: {
	// 					in: filter.portfolioIds,
	// 				},
	// 				entityId: {
	// 					in: filter.entitiesIds,
	// 				},
	// 				bankId: {
	// 					in: filter.bankIds,
	// 				},
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filter.bankListIds, },
	// 					},
	// 				},
	// 				accountId: {
	// 					in: filter.accountIds,
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
	// 		const metalListPromise = this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,)
	// 		const [assets, metalList, currencyList, equities, etfs, equityIsins,] = await Promise.all([
	// 			assetsPromise,
	// 			metalListPromise,
	// 			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 			this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 			this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
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
	// 				const assetPayload = assetParser<IMetalsAsset>(asset,)
	// 				if (assetPayload) {
	// 					const {
	// 						productType,

	// 						metalType,
	// 						purchasePrice,

	// 						currency,
	// 						transactionDate,
	// 						isin,
	// 						units,
	// 						transactionPrice,
	// 						operation,
	// 					} = assetPayload
	// 					if (assetPayload.productType === MetalType.DIRECT_HOLD && metalType && purchasePrice && units) {
	// 						if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 							return null
	// 						}
	// 						if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
	// 							return null
	// 						}
	// 						if (filter.metals?.length && !filter.metals.includes(metalType,)) {
	// 							return null
	// 						}
	// 						if (filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.currencies?.length) {
	// 							return null
	// 						}
	// 						if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 							return null
	// 						}
	// 						const marketValueUsd = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
	// 							metalList,
	// 							metalType,
	// 							units,
	// 							historyDate: filter.date,
	// 						},)

	// 						const metalData = this.cBondsCurrencyService.getMetalRateToUSD(
	// 							{
	// 								metalType,
	// 								units,
	// 								metalList,
	// 								historyDate: filter.date,
	// 							},
	// 						)
	// 						const accountAssets = assets.filter((accountAsset,) => {
	// 							const accountAssetPayload = assetParser<IMetalsAsset>(accountAsset,)
	// 							return accountAsset.accountId === asset.accountId && accountAssetPayload?.metalType === metalType
	// 						},)
	// 						const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 							const assetPayload = assetParser<IMetalsAsset>(a,)
	// 							if (assetPayload?.operation === AssetOperationType.SELL) {
	// 								return sum - assetPayload.units
	// 							}
	// 							return assetPayload ?
	// 								sum + assetPayload.units :
	// 								sum
	// 						}, 0,)
	// 						if (!filter.tradeOperation && totalBuySellUnits <= 0) {
	// 							return null
	// 						}
	// 						const totalValue = accountAssets.reduce((sum, a,) => {
	// 							const assetPayload = assetParser<IMetalsAsset>(a,)
	// 							if (assetPayload?.operation === AssetOperationType.SELL) {
	// 								return sum
	// 							}
	// 							return sum + (purchasePrice * units)
	// 						}, 0,)
	// 						const totalUnits = accountAssets.reduce((sum, a,) => {
	// 							const assetPayload = assetParser<IMetalsAsset>(a,)
	// 							if (assetPayload?.operation === AssetOperationType.SELL) {
	// 								return sum
	// 							}
	// 							return assetPayload ?
	// 								sum + assetPayload.units :
	// 								sum
	// 						}, 0,)

	// 						const costPrice = totalUnits > 0 ?
	// 							(totalValue / totalUnits).toFixed(2,) :
	// 							0
	// 						const costValueUsd = units * Number(costPrice,)
	// 						const profitUsd = marketValueUsd - costValueUsd
	// 						const profitPercentage = profitUsd / costValueUsd * 100
	// 						const marketPrice = this.cBondsCurrencyService.getMetalMarketPriceWithHistory({
	// 							metalList,
	// 							metalType,
	// 							currencyList,
	// 							currency,
	// 							historyDate: filter.date,
	// 						},)
	// 						const costValueFC = parseFloat((Number(costPrice,) * units).toFixed(2,),)
	// 						const marketValueFC = parseFloat((marketPrice * units).toFixed(2,),)
	// 						totalUsdValue = totalUsdValue + Number(profitUsd,)
	// 						return {
	// 							id:                asset.id,
	// 							currency,
	// 							productType:       MetalType.DIRECT_HOLD,
	// 							portfolioName:     asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
	// 							entityName:        asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
	// 							accountName:       asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
	// 							bankName:          asset.bank?.bankName,
	// 							metalPrice:        metalData?.rate ?? 1,
	// 							metalName:         metalData?.metalName,
	// 							currentStockPrice:   marketPrice,
	// 							marketValueUsd,
	// 							costPrice:         Number(costPrice,),
	// 							costValueUsd,
	// 							profitUsd,
	// 							profitPercentage,
	// 							metalType,
	// 							units,
	// 							valueDate:         String(transactionDate,),
	// 							operation,
	// 							costValueFC,
	// 							marketValueFC,
	// 						} as TMetalsAssetExtended
	// 					}
	// 					if (productType === MetalType.ETF) {
	// 						if (!isin || !units || !transactionPrice || !transactionDate) {
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
	// 							lastPrice = filter.date && equity.equityHistory[0] ?
	// 								equity.equityHistory[0].lastPrice :
	// 								equity.lastPrice
	// 							issuer = equity.emitentName
	// 							stockCountry = equity.stockCountryName
	// 							stockSector = equity.branchName
	// 						}
	// 						if (typeId === '3') {
	// 							const etf = etfs.find((equity,) => {
	// 								return equity.isin === isin
	// 							},)
	// 							if (!etf) {
	// 								return null
	// 							}
	// 							({ ticker,} = etf)
	// 							lastPrice =  filter.date && etf.etfHistory[0] ?
	// 								etf.etfHistory[0].close :
	// 								etf.close
	// 							issuer = etf.fundsName
	// 							stockCountry = etf.geographyInvestmentName
	// 							stockSector = etf.sectorName
	// 						}

	// 						if (!lastPrice) {
	// 							return null
	// 						}
	// 						if (filter.metals) {
	// 							return null
	// 						}
	// 						if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 							return null
	// 						}
	// 						if (filter.isins?.length && !filter.isins.includes(isin,)) {
	// 							return null
	// 						}
	// 						if (filter.securities?.length && ticker && !filter.securities.includes(ticker,)) {
	// 							return null
	// 						}
	// 						if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 							return null
	// 						}
	// 						if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 							return null
	// 						}
	// 						if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
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
	// 							filter.date ?
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
	// 						if ((!filter.tradeOperation && totalBuySellUnits <= 0) || marketValueUsd === 0) {
	// 							return null
	// 						}
	// 						if ((totalBuySellUnits <= 0) || marketValueUsd === 0) {
	// 							return null
	// 						}
	// 						const profitUsd = Number(marketValueUsd,) - Number(costValueUsd,)
	// 						const profitPercentage = (Number(currentStockPrice,) - Number(costPrice,)) / Number(costPrice,) * 100
	// 						return {
	// 							id:                asset.id,
	// 							productType:       MetalType.ETF,
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
	// 						} as IAnalyticMetalETF
	// 					}
	// 				}
	// 				return null
	// 			},)
	// 			.filter((item,): item is TMetalsAssetExtended | IAnalyticMetalETF => {
	// 				return item !== null
	// 			},)
	// 		const equityAssets = analyticsData.filter(
	// 			(item,): item is IAnalyticMetalETF => {
	// 				return item.productType === MetalType.ETF
	// 			},
	// 		)
	// 		const metalAssets = analyticsData.filter(
	// 			(item,): item is TMetalsAssetExtended => {
	// 				return item.productType === MetalType.DIRECT_HOLD
	// 			},
	// 		)
	// 		const groupedAssets = Object.values(metalAssets.reduce<Record<string, TMetalsWithInnerAssets>>((acc, asset,) => {
	// 			const {
	// 				portfolioName,
	// 				entityName,
	// 				bankName,
	// 				accountName,
	// 				currentStockPrice,
	// 				costPrice,
	// 				costValueUsd,
	// 				profitUsd,
	// 				profitPercentage,
	// 				metalType,
	// 				units,
	// 				valueDate,
	// 				operation,
	// 				metalPrice,
	// 				metalName,
	// 				productType,
	// 				currency,
	// 				costValueFC,
	// 				marketValueUsd,
	// 				marketValueFC,
	// 			} = asset
	// 			if (!metalType) {
	// 				return acc
	// 			}
	// 			const key = `${portfolioName}-${entityName}-${bankName}-${accountName}-${metalType}-${currency}`
	// 			if (!(key in acc)) {
	// 				acc[key] = {
	// 					id:                uuid4(),
	// 					productType,
	// 					portfolioName,
	// 					entityName,
	// 					bankName,
	// 					accountName,
	// 					metalName,
	// 					currentStockPrice,
	// 					costPrice,
	// 					costValueUsd:      0,
	// 					profitUsd:         0,
	// 					profitPercentage,
	// 					metalType,
	// 					units,
	// 					valueDate,
	// 					operation,
	// 					metalPrice,
	// 					currency,
	// 					costValueFC:       0,
	// 					marketValueUsd:    0,
	// 					marketValueFC:     0,
	// 					assets:            [],
	// 				}
	// 			}
	// 			acc[key].marketValueUsd = filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].marketValueUsd + marketValueUsd :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].marketValueUsd + marketValueUsd :
	// 					acc[key].marketValueUsd - marketValueUsd
	// 			acc[key].costValueFC = filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].costValueFC + costValueFC :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].costValueFC + costValueFC :
	// 					acc[key].costValueFC - costValueFC
	// 			acc[key].marketValueFC = filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].marketValueFC + marketValueFC :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].marketValueFC + marketValueFC :
	// 					acc[key].marketValueFC - marketValueFC
	// 			acc[key].costValueUsd = filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].costValueUsd + costValueUsd :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].costValueUsd + costValueUsd :
	// 					acc[key].costValueUsd - costValueUsd
	// 			acc[key].profitUsd = filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].profitUsd + profitUsd  :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].profitUsd + profitUsd :
	// 					acc[key].profitUsd - profitUsd
	// 			acc[key].units = acc[key].units + units
	// 			acc[key].assets.push(asset,)
	// 			return acc
	// 		}, {} ,),
	// 		)

	// 		const finalMetalAssets: Array<TMetalsAssetExtended | TMetalsWithInnerAssets> = groupedAssets.map((group,) => {
	// 			if (group.assets.length === 1) {
	// 				return {
	// 					...group.assets[0],
	// 				} as TMetalsAssetExtended
	// 			}
	// 			const totalBuySellUnits = group.assets.reduce((sum, asset,) => {
	// 				if (asset.operation === AssetOperationType.SELL) {
	// 					return sum - asset.units
	// 				}
	// 				return sum + asset.units
	// 			}, 0,)
	// 			const totalCostValueUSD = group.assets.reduce((sum, asset,) => {
	// 				return sum + asset.costValueUsd
	// 			}, 0,)

	// 			const totalUsdValue = group.assets.reduce((sum, asset,) => {
	// 				return sum + asset.profitUsd
	// 			}, 0,)
	// 			const totalPercentage = totalCostValueUSD > 0 ?
	// 				(totalUsdValue / totalCostValueUSD) * 100 :
	// 				0
	// 			return {
	// 				id:            	   group.id,
	// 				productType:       group.productType,
	// 				portfolioName:     group.portfolioName,
	// 				entityName:        group.entityName,
	// 				bankName:          group.bankName,
	// 				accountName:       group.accountName,
	// 				currentStockPrice:      group.currentStockPrice,
	// 				metalName:         group.metalName,
	// 				metalPrice:        group.metalPrice,
	// 				costPrice:         group.costPrice,
	// 				costValueUsd:      group.costValueUsd,
	// 				costValueFC:       group.costValueFC,
	// 				marketValueUsd:    group.marketValueUsd,
	// 				marketValueFC:     group.marketValueFC,
	// 				profitUsd:         group.profitUsd,
	// 				profitPercentage:         totalPercentage,
	// 				metalType:         group.metalType,
	// 				valueDate:         group.valueDate,
	// 				operation:         group.operation,
	// 				units:             totalBuySellUnits,
	// 				assets:            group.assets,
	// 			} as unknown as TMetalsWithInnerAssets
	// 		},)
	// 		const groupedEquityAssets = Object.values(equityAssets.reduce<Record<string, IAnalyticMetalETFWithInnerAssets>>((acc, asset,) => {
	// 			const {
	// 				productType,
	// 				equityType,
	// 				portfolioName,
	// 				entityName,
	// 				bankName,
	// 				accountName,
	// 				isin,
	// 				security,
	// 				profitUsd,
	// 				issuer,
	// 				sector,
	// 				country,
	// 				marketValueUsd,
	// 				currentStockPrice,
	// 				units,
	// 				costPrice,
	// 				profitPercentage,
	// 				operation,
	// 				costValueUsd,
	// 				currency,
	// 				costValueFC,
	// 				marketValueFC,
	// 			} = asset
	// 			const key = `${portfolioName}-${entityName}-${bankName}-${accountName}-${isin}-${currency}`
	// 			if (!(key in acc)) {
	// 				acc[key] = {
	// 					productType,
	// 					id:                uuid4(),
	// 					equityType,
	// 					portfolioName,
	// 					entityName,
	// 					bankName,
	// 					accountName,
	// 					isin,
	// 					security,
	// 					profitUsd:         0,
	// 					profitPercentage,
	// 					currentStockPrice,
	// 					issuer,
	// 					sector,
	// 					country,
	// 					costPrice,
	// 					units:             0,
	// 					assets:            [],
	// 					operation,
	// 					costValueUsd:      0,
	// 					marketValueUsd:    0,
	// 					costValueFC:    0,
	// 					marketValueFC:  0,
	// 					currency,
	// 				}
	// 			}
	// 			acc[key].profitUsd = acc[key].profitUsd + profitUsd
	// 			acc[key].costValueUsd =  filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].costValueUsd + costValueUsd :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].costValueUsd + costValueUsd :
	// 					acc[key].costValueUsd - costValueUsd
	// 			acc[key].marketValueUsd =  filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].marketValueUsd + marketValueUsd :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].marketValueUsd + marketValueUsd :
	// 					acc[key].marketValueUsd - marketValueUsd
	// 			acc[key].costValueFC =  filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].costValueFC + costValueFC :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].costValueFC + costValueFC :
	// 					acc[key].costValueFC - costValueFC
	// 			acc[key].marketValueFC =  filter.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].marketValueFC + marketValueFC :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].marketValueFC + marketValueFC :
	// 					acc[key].marketValueFC - marketValueFC
	// 			acc[key].units = acc[key].units + units
	// 			acc[key].assets.push(asset,)
	// 			return acc
	// 		}, {} ,),
	// 		)
	// 		const finalEquityAssets: Array<IAnalyticMetalETF | IAnalyticMetalETFWithInnerAssets> = groupedEquityAssets.map((group,) => {
	// 			if (group.assets.length === 1) {
	// 				return {
	// 					...group.assets[0],
	// 					costPrice: group.assets[0].transactionPrice,
	// 				} as IAnalyticMetalETF
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
	// 			} as unknown as IAnalyticMetalETFWithInnerAssets
	// 		},)
	// 		const finalAssets = [...finalMetalAssets, ...finalEquityAssets,].sort((a, b,) => {
	// 			const { sortBy, sortOrder, } = filter
	// 			const order = sortOrder === 'asc' ?
	// 				1 :
	// 				-1
	// 			const isDateSort = [
	// 				MetalsSortVariants.VALUE_DATE,
	// 			].includes(sortBy,)
	// 			const getComparableValue = (item: TMetalsAssetExtended | TMetalsWithInnerAssets | IAnalyticMetalETF | IAnalyticMetalETFWithInnerAssets,): number | undefined => {
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
	// 		return {
	// 			list: finalAssets,
	// 			totalUsdValue,
	// 		}
	// 	} catch (error) {
	// 		return {
	// 			list:          [],
	// 			totalUsdValue: 0,
	// 		}
	// 	}
	// }

	/**
 * Retrieves filtered assets based on the provided filter and criteria.
 * @remarks
 * - Filters assets by type, portfolio, entity, bank, date range, and other criteria.
 * - Optionally filters by asset IDs and client ID.
 * - Fetches assets that are not archived and belong to activated portfolios.
 * - Returns a list of assets that match the filter criteria, along with associated bank and entity data.
 * @param filter - The filter criteria for retrieving assets (e.g., asset type, portfolio IDs, bank IDs, etc.).
 * @param assetIds - An optional array of asset IDs to filter the results by.
 * @param clientId - An optional client ID to filter the results by.
 * @returns A Promise resolving to an array of filtered assets that match the provided criteria.
 */
	public async getFilteredAssets(filter: MetalsFilterDto, assetIds?: Array<string>, clientId?: string,): Promise<Array<TAssetExtended>> {
		const where: Prisma.AssetWhereInput = {
			isArchived:  false,
			assetName:  filter.type,
			clientId:   {
				in: clientId ?
					[clientId,] :
					filter.clientIds,
			},
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

		}

		return this.prismaService.asset.findMany({
			where,
			include: {
				bank:   {include: { bankList: true, },},
				entity: true,
			},
		},)
	}

	/**
	 * 3.5.4
	 * Retrieves bank analytics based on the provided filter criteria.
	 *
	 * @remarks
	 * - Uses `getFilteredAssets` to fetch assets matching the filter.
	 * - Loads the currency list via `cBondsCurrencyService.getAllCurrencies()`.
	 * - Parses the `payload` of each asset to extract currency and value.
	 * - filter assets based on `filter.currencies`, if provided.
	 * - Returns an array of bank analytics, including bank IDs, names, and USD values.
	 *
	 * @param {MetalsFilterDto} filter - The filter criteria for retrieving bank analytics.
	 * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics data.
	 */
	public async getBankAnalytics(filter: MetalsFilterDto, clientId?: string,): Promise<Array<TMetalBankAnalytics>> {
		try {
			// With date filter
			if (filter.date) {
				const [metalGroups, equities, etfs, currencyList, metalList,] = await Promise.all([
					this.prismaService.assetMetalGroup.findMany({
						where: {
							clientId:    { in: clientId ?
								[clientId,] :
								filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entitiesIds, },
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filter.date,),), }, },
								{ transferDate: null, },
							],
						},
						include: {
							metals: {
								where: {
									operation: filter.tradeOperation,
									OR:        [
										{
											...(filter.assetIds?.length ?
												{ id: { in: filter.assetIds, }, } :
												{}),
											assetMetalVersions: {
												none: {},
											},
											transactionDate: {
												lte: endOfDay(new Date(filter.date,),),
											},
											metalType: {
												in: filter.metals,
											},
											productType: {
												in: filter.productTypes,
											},
											currency: {
												in: filter.currencies,
											},
											security: {
												in: filter.securities,
											},
											isin: {
												in: filter.isins,
											},
										},
										{
											assetMetalVersions: {
												some: {
													...(filter.assetIds?.length ?
														{ id: { in: filter.assetIds, }, } :
														{}),
													transactionDate: {
														lte: endOfDay(new Date(filter.date,),),
													},
													metalType: {
														in: filter.metals,
													},
													productType: {
														in: filter.productTypes,
													},
													currency: {
														in: filter.currencies,
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
									assetMetalVersions: {
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
							bank:      { select: { bankName: true, bankList: true, bankListId: true,}, },
							account:   { select: { accountName: true, }, },
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
				],)
				const analyticsData = metalGroups
					.map((group,) => {
						return {
							...group,
							metals: group.metals.map((metal,) => {
								if (metal.assetMetalVersions.length > 0) {
									return {
										...metal.assetMetalVersions[0],
										mainAssetId: metal.id,
									}
								}
								return {
									...metal,
									mainAssetId: undefined,
								}
							},),
						}
					},)
					.filter((group,) => {
						return group.metals?.length
					},)
					.map((item,) => {
						if (item.productType === MetalType.DIRECT_HOLD) {
							const filteredUnits = item.metals.reduce((sum, b,) => {
								if (b.operation === AssetOperationType.SELL) {
									return sum - Number(b.units,)
								}
								return sum + Number(b.units,)
							}, 0,)
							const usdValue = item.metalType ?
								this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
									metalList,
									metalType:   item.metalType,
									units:       filteredUnits,
									historyDate: filter.date,
								},) :
								0
							return {
								id:          item.bank.bankListId ?? item.bank.bankList?.id ?? '',
								bankName:    item.bank.bankName,
								productType: item.productType as MetalType,
								usdValue,
							}
						}
						if (!item.currency || !item.totalUnits) {
							return null
						}
						const filteredUnits = item.metals.reduce((sum, b,) => {
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
							productType: item.productType as MetalType,
							usdValue:    marketValueUsd,
						}
					},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)

				return analyticsData
			}
			const [metalGroups,] = await Promise.all([
				this.prismaService.assetMetalGroup.findMany({
					where: {
						clientId:    { in: clientId ?
							[clientId,] :
							filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entitiesIds, },
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
						metalType: {
							in: filter.metals,
						},
						productType: {
							in: filter.productTypes,
						},
						currency: {
							in: filter.currencies,
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
						metals: {
							where: {
								...(filter.assetIds?.length ?
									{ id: { in: filter.assetIds, }, } :
									{}),
								operation: filter.tradeOperation,
								...(filter.date && {
									transactionDate: {
										lte: endOfDay(new Date(filter.date,),),
									},
								}),
							},
						},
						portfolio: { select: { name: true, }, },
						entity:    { select: { name: true, }, },
						bank:      { select: { bankName: true, bankList: true, bankListId: true,}, },
						account:   { select: { accountName: true, }, },
					},
				},),
			],)
			// Without date filter
			const analyticsData = metalGroups
				.filter((group,) => {
					return group.metals?.length
				},)
				.map((item,) => {
					if (item.productType === MetalType.DIRECT_HOLD) {
						const usdValue = item.metals.reduce<number>((acc, item,) => {
							if (item.operation === AssetOperationType.SELL) {
								return acc - item.marketValueUSD
							}
							return acc + item.marketValueUSD
						}, 0,)
						return {
							id:          item.bank.bankListId ?? item.bank.bankList?.id ?? '',
							bankName:    item.bank.bankName,
							productType: item.productType as MetalType,
							usdValue:    parseFloat(usdValue.toFixed(2,),),
						}
					}
					const usdValue = item.metals.reduce<number>((acc, item,) => {
						if (item.operation === AssetOperationType.SELL) {
							return acc - item.marketValueUSD
						}
						return acc + item.marketValueUSD
					}, 0,)
					return {
						id:          item.bank.bankListId ?? item.bank.bankList?.id ?? '',
						bankName:    item.bank.bankName,
						productType: item.productType as MetalType,
						usdValue:    parseFloat(usdValue.toFixed(2,),),
					}
				},)
			return analyticsData
		} catch (error) {
			return []
		}
	}

	// public async getBankAnalytics(filter: MetalsFilterDto, clientId?: string,): Promise<Array<TMetalBankAnalytics>> {
	// 	const [assets, metalList, currencyList, equities, etfs,] = await Promise.all([
	// 		this.getFilteredAssets(filter, filter.assetIds, clientId,),
	// 		this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 	],)
	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const parsedPayload = assetParser<IMetalsAsset>(asset,)
	// 			if (parsedPayload) {
	// 				const {
	// 					productType,

	// 					metalType,
	// 					purchasePrice,

	// 					currency,
	// 					transactionDate,
	// 					isin,
	// 					units,
	// 					transactionPrice,
	// 					operation,
	// 					security,
	// 				} = parsedPayload
	// 				if (productType === MetalType.DIRECT_HOLD && metalType && purchasePrice && units) {
	// 					if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 						return null
	// 					}
	// 					if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
	// 						return null
	// 					}
	// 					const accountAssets = assets.filter((accountAsset,) => {
	// 						const accountAssetPayload = assetParser<IMetalsAsset>(accountAsset,)
	// 						return accountAsset.accountId === asset.accountId && accountAssetPayload?.metalType === metalType
	// 					},)
	// 					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 						const assetPayload = assetParser<IMetalsAsset>(a,)
	// 						if (assetPayload?.operation === AssetOperationType.SELL) {
	// 							return sum - assetPayload.units
	// 						}
	// 						return assetPayload ?
	// 							sum + assetPayload.units :
	// 							sum
	// 					}, 0,)
	// 					if (!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0) {
	// 						return null
	// 					}
	// 					if (filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.currencies?.length) {
	// 						return null
	// 					}
	// 					if (filter.metals && !filter.metals.includes(metalType,)) {
	// 						return null
	// 					}
	// 					const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
	// 						metalList,
	// 						metalType,
	// 						units,
	// 						historyDate: filter.date,
	// 					},)
	// 					return {
	// 						id:       asset.bank?.bankListId,
	// 						bankName: asset.bank?.bankList?.name ?? asset.bank?.bankName,
	// 						productType,
	// 						usdValue: filter.tradeOperation === AssetOperationType.SELL ?
	// 							usdValue :
	// 							operation === AssetOperationType.BUY ?
	// 								usdValue :
	// 								-usdValue,
	// 					}
	// 				}
	// 				if (productType === MetalType.ETF) {
	// 					const equityAsset = equities.find((equity,) => {
	// 						return equity.isin === isin
	// 					},) ?? etfs.find((etf,) => {
	// 						return etf.isin === isin
	// 					},) ?? null
	// 					if (!equityAsset) {
	// 						return null
	// 					}
	// 					if (filter.metals) {
	// 						return null
	// 					}
	// 					if (!isin || !units || !transactionPrice || !transactionDate || !security) {
	// 						return null
	// 					}
	// 					if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 						return null
	// 					}
	// 					if (filter.isins?.length && !filter.isins.includes(isin,)) {
	// 						return null
	// 					}
	// 					if (filter.securities?.length && !filter.securities.includes(security,)) {
	// 						return null
	// 					}
	// 					if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 						return null
	// 					}
	// 					if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
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
	// 		.filter((item,): item is TMetalBankAnalytics => {
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
	 *
	 * @remarks
	 * - filter assets by `assetIds` and `currencies` if specified.
	 * - Parses the `payload` field to extract currency details.
	 * - Converts currency values to USD using the exchange service.
	 * - Returns an array of currency analytics, including original and USD values.
	 * - In case of an error during processing, an empty array is returned.
	 *
	 * @param {MetalsFilterDto} filter - The filter criteria for retrieving currency analytics.
	 * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
	 */
	public async getCurrencyAnalytics(filter: MetalsFilterDto, clientId?: string,): Promise<Array<TMetalCurrencyAnalytics>> {
		try {
			if (filter.date) {
				const [metalGroups, equities, etfs, currencyList, metalList,] = await Promise.all([
					this.prismaService.assetMetalGroup.findMany({
						where: {
							clientId:    { in: clientId ?
								[clientId,] :
								filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entitiesIds, },
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
							OR: [
								{ transferDate: { gte: endOfDay(new Date(filter.date,),), }, },
								{ transferDate: null, },
							],
						},
						include: {
							metals: {
								where: {
									operation:       filter.tradeOperation,
									OR:        [
										{
											...(filter.assetIds?.length ?
												{ id: { in: filter.assetIds, }, } :
												{}),
											assetMetalVersions: {
												none: {},
											},
											transactionDate: {
												lte: endOfDay(new Date(filter.date,),),
											},
											metalType: {
												in: filter.metals,
											},
											productType: {
												in: filter.productTypes,
											},
											currency: {
												in: filter.currencies,
											},
											security: {
												in: filter.securities,
											},
											isin: {
												in: filter.isins,
											},
										},
										{
											assetMetalVersions: {
												some: {
													...(filter.assetIds?.length ?
														{ id: { in: filter.assetIds, }, } :
														{}),
													transactionDate: {
														lte: endOfDay(new Date(filter.date,),),
													},
													metalType: {
														in: filter.metals,
													},
													productType: {
														in: filter.productTypes,
													},
													currency: {
														in: filter.currencies,
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
									assetMetalVersions: {
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
							bank:      { select: { bankName: true, bankList: true, bankListId: true,}, },
							account:   { select: { accountName: true, }, },
						},
					},),
					this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
					this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
				],)
				const analyticsData = metalGroups
					.map((group,) => {
						return {
							...group,
							metals: group.metals.map((metal,) => {
								if (metal.assetMetalVersions.length > 0) {
									return {
										...metal.assetMetalVersions[0],
										mainAssetId: metal.id,
									}
								}
								return {
									...metal,
									mainAssetId: undefined,
								}
							},),
						}
					},)
					.filter((group,) => {
						return group.metals?.length
					},)
					.map((item,) => {
						if (item.productType === MetalType.DIRECT_HOLD) {
							const filteredUnits = item.metals.reduce((sum, b,) => {
								if (b.operation === AssetOperationType.SELL) {
									return sum - Number(b.units,)
								}
								return sum + Number(b.units,)
							}, 0,)
							const usdValue = item.metalType ?
								this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
									metalList,
									metalType:   item.metalType,
									units:       filteredUnits,
									historyDate: filter.date,
								},) :
								0
							return {
								currency:      item.currency,
								currencyValue: filteredUnits,
								usdValue,
								productType:   MetalType.DIRECT_HOLD,
							}
						}
						if (!item.currency || !item.totalUnits) {
							return null
						}
						const filteredUnits = item.metals.reduce((sum, b,) => {
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
							currency:      item.currency,
							currencyValue: filteredUnits,
							productType:   MetalType.ETF,
							usdValue,
						}
					},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)

				return analyticsData
			}
			const [metalGroups,] = await Promise.all([
				this.prismaService.assetMetalGroup.findMany({
					where: {
						clientId:    { in: clientId ?
							[clientId,] :
							filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entitiesIds, },
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
						metalType: {
							in: filter.metals,
						},
						productType: {
							in: filter.productTypes,
						},
						currency: {
							in: filter.currencies,
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
						metals: {
							where: {
								operation: filter.tradeOperation,
								...(filter.assetIds?.length ?
									{ id: { in: filter.assetIds, }, } :
									{}),
								...(filter.date && {
									transactionDate: {
										lte: endOfDay(new Date(filter.date,),),
									},
								}),
							},
						},
						portfolio: { select: { name: true, }, },
						entity:    { select: { name: true, }, },
						bank:      { select: { bankName: true, bankList: true, bankListId: true,}, },
						account:   { select: { accountName: true, }, },
					},
				},),
			],)

			const analyticsData = metalGroups
				.filter((group,) => {
					return group.metals?.length
				},).map((item,) => {
					if (item.productType === MetalType.DIRECT_HOLD) {
						const usdValue = item.metals.reduce<number>((acc, item,) => {
							if (item.operation === AssetOperationType.SELL) {
								return acc - item.marketValueUSD
							}
							return acc + item.marketValueUSD
						}, 0,)
						return {
							currency:      item.currency,
							currencyValue: item.totalUnits,
							usdValue,
							productType:   MetalType.DIRECT_HOLD,
						}
					}
					if (!item.totalUnits) {
						return null
					}
					const usdValue = item.metals.reduce<number>((acc, item,) => {
						if (item.operation === AssetOperationType.SELL) {
							return acc - item.marketValueUSD
						}
						return acc + item.marketValueUSD
					}, 0,)
					return {
						currency:      item.currency,
						currencyValue: item.totalUnits,
						productType:   MetalType.ETF,
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

	// public async getCurrencyAnalytics(filter: MetalsFilterDto, clientId?: string,): Promise<Array<TMetalCurrencyAnalytics>> {
	// 	const [assets, metalList, currencyList, equities, etfs,] = await Promise.all([
	// 		this.getFilteredAssets(filter, filter.assetIds, clientId,),
	// 		this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 	],)

	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const parsedPayload = assetParser<IMetalsAsset>(asset,)
	// 			if (parsedPayload) {
	// 				const {
	// 					productType,

	// 					metalType,
	// 					purchasePrice,

	// 					currency,
	// 					transactionDate,
	// 					isin,
	// 					units,
	// 					transactionPrice,
	// 					operation,
	// 					security,
	// 				} = parsedPayload
	// 				if (productType === MetalType.DIRECT_HOLD && metalType && purchasePrice && units) {
	// 					if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 						return null
	// 					}
	// 					const accountAssets = assets.filter((accountAsset,) => {
	// 						const accountAssetPayload = assetParser<IMetalsAsset>(accountAsset,)
	// 						return accountAsset.accountId === asset.accountId && accountAssetPayload?.metalType === metalType
	// 					},)
	// 					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 						const assetPayload = assetParser<IMetalsAsset>(a,)
	// 						if (assetPayload?.operation === AssetOperationType.SELL) {
	// 							return sum - assetPayload.units
	// 						}
	// 						return assetPayload ?
	// 							sum + assetPayload.units :
	// 							sum
	// 					}, 0,)
	// 					if (filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.currencies?.length) {
	// 						return null
	// 					}
	// 					if (filter.metals && !filter.metals.includes(metalType,)) {
	// 						return null
	// 					}
	// 					if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 						return null
	// 					}
	// 					if (!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
	// 						return null
	// 					}
	// 					const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
	// 						metalList,
	// 						metalType,
	// 						units,
	// 						historyDate: filter.date,
	// 					},)

	// 					return {
	// 						currency:      metalType,
	// 						currencyValue: units,
	// 						productType,
	// 						usdValue:      filter.tradeOperation === AssetOperationType.SELL ?
	// 							usdValue :
	// 							operation === AssetOperationType.BUY ?
	// 								usdValue :
	// 								-usdValue,
	// 					} as TCurrencyAnalytics
	// 				}
	// 				if (productType === MetalType.ETF) {
	// 					const equityAsset = equities.find((equity,) => {
	// 						return equity.isin === isin
	// 					},) ?? etfs.find((etf,) => {
	// 						return etf.isin === isin
	// 					},) ?? null
	// 					if (!equityAsset) {
	// 						return null
	// 					}
	// 					if (filter.metals) {
	// 						return null
	// 					}
	// 					if (!isin || !units || !transactionPrice || !transactionDate || !security) {
	// 						return null
	// 					}
	// 					if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 						return null
	// 					}
	// 					if (filter.isins?.length && !filter.isins.includes(isin,)) {
	// 						return null
	// 					}
	// 					if (filter.securities?.length && !filter.securities.includes(security,)) {
	// 						return null
	// 					}
	// 					if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 						return null
	// 					}
	// 					if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 						return null
	// 					}
	// 					if (filter.productTypes?.length && !filter.productTypes.includes(productType,)) {
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
	// 						productType,
	// 						currencyValue: units,
	// 						usdValue:      filter.tradeOperation === AssetOperationType.SELL ?
	// 							usdValue   :
	// 							operation === AssetOperationType.BUY ?
	// 								usdValue :
	// 								-usdValue,
	// 					}
	// 				}
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is TMetalCurrencyAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.filter((item,) => {
	// 			return item.usdValue !== 0
	// 		},)
	// 	return analyticsData
	// }

	/**
	 * 	 * 3.5.3
		 * Retrieves a list of all metal films from the database.
		 *
		 * @remarks
		 * - Uses Prisma to fetch data from the `metalData` table.
		 * - Returns an array of metal films matching the `MetalData` type.
		 *
		 * @returns A Promise that resolves to an array of `MetalData` objects.
		 */
	public async getAllMetals(): Promise<Array<MetalData>> {
		return this.prismaService.metalData.findMany()
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetFilteredMetals(data: TMetalAssetCache, filter: MetalsFilterDto, clientId?: string,): IMetalsByFilter {
		let totalUsdValue = 0
		const {assets, metalList, currencyList, equities, etfs, equityIsins,} = data
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
				const assetPayload = assetParser<IMetalsAsset>(asset,)
				if (assetPayload) {
					const {
						productType,

						metalType,
						purchasePrice,

						currency,
						transactionDate,
						isin,
						units,
						transactionPrice,
						operation,
					} = assetPayload
					if (assetPayload.productType === MetalType.DIRECT_HOLD && metalType && purchasePrice && units) {
						if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
							return null
						}
						if (filter.metals?.length && !filter.metals.includes(metalType,)) {
							return null
						}
						if (filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.currencies?.length) {
							return null
						}
						const marketValueUsd = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
							metalList,
							metalType,
							units,
							historyDate: filter.date,
						},)

						const metalData = this.cBondsCurrencyService.getMetalRateToUSD(
							{
								metalType,
								units,
								metalList,
								historyDate: filter.date,
							},
						)
						const accountAssets = assets.filter((accountAsset,) => {
							const accountAssetPayload = assetParser<IMetalsAsset>(accountAsset,)
							return accountAsset.accountId === asset.accountId && accountAssetPayload?.metalType === metalType
						},)
						const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
							const assetPayload = assetParser<IMetalsAsset>(a,)
							if (assetPayload?.operation === AssetOperationType.SELL) {
								return sum - assetPayload.units
							}
							return assetPayload ?
								sum + assetPayload.units :
								sum
						}, 0,)
						if (!filter.tradeOperation && totalBuySellUnits <= 0) {
							return null
						}
						const totalValue = accountAssets.reduce((sum, a,) => {
							const assetPayload = assetParser<IMetalsAsset>(a,)
							if (assetPayload?.operation === AssetOperationType.SELL) {
								return sum
							}
							return assetPayload?.purchasePrice ?
								sum + (assetPayload.purchasePrice * assetPayload.units) :
								sum
						}, 0,)
						const totalUnits = accountAssets.reduce((sum, a,) => {
							const assetPayload = assetParser<IMetalsAsset>(a,)
							if (assetPayload?.operation === AssetOperationType.SELL) {
								return sum
							}
							return assetPayload ?
								sum + assetPayload.units :
								sum
						}, 0,)

						const costPrice = totalUnits > 0 ?
							(totalValue / totalUnits).toFixed(2,) :
							0
						const currencyData: TCurrencyDataWithHistory | undefined  = currencyList.find((item,) => {
							return item.currency === currency
						},)
						const currencyRate = currencyData  ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						const costValueFC = purchasePrice * units
						const costValueUsd = costValueFC * currencyRate
						const profitUsd = marketValueUsd - costValueUsd
						const profitPercentage = profitUsd / costValueUsd * 100
						const marketPrice = this.cBondsCurrencyService.getMetalMarketPriceWithHistory({
							metalList,
							metalType,
							currencyList,
							currency,
							historyDate: filter.date,
						},)
						const marketValueFC = parseFloat((marketPrice * units).toFixed(2,),)
						totalUsdValue = totalUsdValue + Number(profitUsd,)
						return {
							id:                asset.id,
							productType:       MetalType.DIRECT_HOLD,
							portfolioName:     asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
							entityName:        asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
							accountName:       asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
							bankName:          asset.bank?.bankName,
							metalPrice:        metalData?.rate ?? 1,
							metalName:         metalData?.metalName,
							currentStockPrice:   marketPrice,
							costPrice:         Number(costPrice,),
							costValueFC,
							marketValueFC,
							marketValueUsd,
							costValueUsd,
							profitUsd,
							profitPercentage,
							metalType,
							currency,
							units,
							valueDate:         String(transactionDate,),
							operation,
							transactionPrice:  purchasePrice,
						} as TMetalsAssetExtended
					}
					if (productType === MetalType.ETF) {
						if (!isin || !units || !transactionPrice || !transactionDate) {
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
							lastPrice =  etf.close
							issuer = etf.fundsName
							stockCountry = etf.geographyInvestmentName
							stockSector = etf.sectorName
						}

						if (!lastPrice) {
							return null
						}
						if (filter.metals) {
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
							filter.date ?
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
						if ((!filter.tradeOperation && totalBuySellUnits <= 0) || marketValueUsd === 0) {
							return null
						}
						if ((totalBuySellUnits <= 0) || marketValueUsd === 0) {
							return null
						}
						const profitUsd = Number(marketValueUsd,) - Number(costValueUsd,)
						const profitPercentage = (Number(currentStockPrice,) - Number(costPrice,)) / Number(costPrice,) * 100
						return {
							id:                asset.id,
							productType:       MetalType.ETF,
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
						} as IAnalyticMetalETF
					}
				}
				return null
			},)
			.filter((item,): item is TMetalsAssetExtended | IAnalyticMetalETF => {
				return item !== null
			},)
		const equityAssets = analyticsData.filter(
			(item,): item is IAnalyticMetalETF => {
				return item.productType === MetalType.ETF
			},
		)
		const metalAssets = analyticsData.filter(
			(item,): item is TMetalsAssetExtended => {
				return item.productType === MetalType.DIRECT_HOLD
			},
		)
		const groupedAssets = Object.values(
			metalAssets.reduce<Record<string, TMetalsWithInnerAssets>>((acc, asset,) => {
				const {
					portfolioName,
					entityName,
					bankName,
					accountName,
					currentStockPrice,
					costPrice,
					costValueUsd,
					profitPercentage,
					profitUsd,
					metalType,
					units,
					valueDate,
					operation,
					metalPrice,
					metalName,
					productType,
					currency,
					costValueFC,
					marketValueUsd,
					marketValueFC,
					transactionPrice,
				} = asset
				const key = `${portfolioName}-${entityName}-${bankName}-${accountName}-${metalType}-${currency}`
				if (!metalType) {
					return acc
				}
				if (!(key in acc)) {
					acc[key] = {
						id:                uuid4(),
						productType,
						portfolioName,
						entityName,
						bankName,
						accountName,
						metalName,
						currentStockPrice:  0,
						costPrice,
						costValueUsd:      0,
						profitUsd:         0,
						profitPercentage,
						metalType,
						units,
						valueDate,
						operation,
						metalPrice,
						currency,
						transactionPrice,
						costValueFC:       0,
						marketValueUsd:    0,
						marketValueFC:     0,
						assets:            [],
					}
				}
				acc[key].currentStockPrice = acc[key].currentStockPrice + currentStockPrice
				acc[key].costValueUsd = acc[key].costValueUsd + costValueUsd
				acc[key].profitUsd = acc[key].profitUsd + profitUsd
				acc[key].units = acc[key].units + units
				acc[key].marketValueUsd = operation === AssetOperationType.BUY ?
					acc[key].marketValueUsd + marketValueUsd :
					acc[key].marketValueUsd - marketValueUsd
				acc[key].costValueFC = operation === AssetOperationType.BUY ?
					acc[key].costValueFC + costValueFC :
					acc[key].costValueFC - costValueFC
				acc[key].marketValueFC = operation === AssetOperationType.BUY ?
					acc[key].marketValueFC + marketValueFC :
					acc[key].marketValueFC - marketValueFC
				acc[key].assets.push(asset,)
				return acc
			}, {} ,),
		)
		// groupedAssets.sort((a, b,) => {
		// 	const { sortBy, sortOrder, } = filter
		// 	const order = sortOrder === 'asc' ?
		// 		1 :
		// 		-1

		// 	switch (sortBy) {
		// 	case MetalsSortVariants.COST_VALUE_USD:
		// 		return (a.costValueUsd - b.costValueUsd) * order
		// 	case MetalsSortVariants.COST_PRICE:
		// 		return (a.costPrice - b.costPrice) * order
		// 	case MetalsSortVariants.MARKET_PRICE:
		// 		return (a.marketPrice - b.marketPrice) * order
		// 	case MetalsSortVariants.PERCENT:
		// 		return (a.percent - b.percent) * order
		// 	case MetalsSortVariants.USD_VALUE:
		// 		return (a.usdValue - b.usdValue) * order
		// 	case MetalsSortVariants.TRANSACTION_DATE:
		// 		return (new Date(a.transactionDate,).getTime() - new Date(b.transactionDate,).getTime()) * order
		// 	default:
		// 		return (new Date(a.transactionDate,).getTime() - new Date(b.transactionDate,).getTime()) * order
		// 	}
		// },)
		const finalMetalAssets: Array<TMetalsAssetExtended | TMetalsWithInnerAssets> = groupedAssets.map((group,) => {
			if (group.assets.length === 1) {
				return {
					...group.assets[0],
				} as TMetalsAssetExtended
			}
			const totalBuySellUnits = group.assets.reduce((sum, asset,) => {
				if (asset.operation === AssetOperationType.SELL) {
					return sum - asset.units
				}
				return sum + asset.units
			}, 0,)
			const totalCostValueUSD = group.assets.reduce((sum, asset,) => {
				return sum + asset.costValueUsd
			}, 0,)

			const totalUsdValue = group.assets.reduce((sum, asset,) => {
				return sum + asset.profitUsd
			}, 0,)
			const totalPercentage = totalCostValueUSD > 0 ?
				(totalUsdValue / totalCostValueUSD) * 100 :
				0
			const normalizedAssets = group.assets.map((asset,) => {
				return {
					...asset,
					costPrice: asset.transactionPrice,
				}
			},)
			return {
				id:            	   group.id,
				productType:       group.productType,
				portfolioName:     group.portfolioName,
				entityName:        group.entityName,
				bankName:          group.bankName,
				accountName:       group.accountName,
				currentStockPrice:      group.currentStockPrice,
				metalName:         group.metalName,
				metalPrice:        group.metalPrice,
				costPrice:         group.costPrice,
				costValueUsd:      group.costValueUsd,
				costValueFC:       group.costValueFC,
				marketValueUsd:    group.marketValueUsd,
				marketValueFC:     group.marketValueFC,
				profitUsd:         group.profitUsd,
				profitPercentage:         totalPercentage,
				metalType:         group.metalType,
				valueDate:         group.valueDate,
				operation:         group.operation,
				units:             totalBuySellUnits,
				assets:            normalizedAssets,
			} as unknown as TMetalsWithInnerAssets
		},)
		const groupedEquityAssets = Object.values(
			equityAssets.reduce<Record<string, IAnalyticMetalETFWithInnerAssets>>((acc, asset,) => {
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
		const finalEquityAssets: Array<IAnalyticMetalETF | IAnalyticMetalETFWithInnerAssets> = groupedEquityAssets.map((group,) => {
			if (group.assets.length === 1) {
				return {
					...group.assets[0],
					costPrice: group.assets[0].transactionPrice,
				} as IAnalyticMetalETF
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
			} as unknown as IAnalyticMetalETFWithInnerAssets
		},)
		const finalAssets = [...finalMetalAssets, ...finalEquityAssets,].sort((a, b,) => {
			const { sortBy, sortOrder, } = filter
			const order = sortOrder === 'asc' ?
				1 :
				-1
			const isDateSort = [
				MetalsSortVariants.VALUE_DATE,
			].includes(sortBy,)
			const getComparableValue = (item: TMetalsAssetExtended | TMetalsWithInnerAssets | IAnalyticMetalETF | IAnalyticMetalETFWithInnerAssets,): number | undefined => {
				const value = (item as unknown as Record<string, unknown>)[sortBy]
				if (value === undefined || value === null || value === '') {
					return undefined
				}
				if (isDateSort) {
					if (typeof value === 'string' || typeof value === 'number') {
						const timestamp = new Date(value,).getTime()
						return isNaN(timestamp,) ?
							undefined :
							timestamp
					}
					return undefined
				}
				return typeof value === 'number' ?
					value :
					Number(value,)
			}
			const aValue = getComparableValue(a,)
			const bValue = getComparableValue(b,)

			if (aValue === undefined && bValue !== undefined) {
				return 1
			}
			if (aValue !== undefined && bValue === undefined) {
				return -1
			}
			if (aValue === undefined && bValue === undefined) {
				return 0
			}

			return (aValue! - bValue!) * order
			// switch (sortBy) {
			// case MetalsSortVariants.COST_VALUE_USD:
			// 	return (a.costValueUsd - b.costValueUsd) * order
			// case MetalsSortVariants.COST_PRICE:
			// 	return (a.costPrice - b.costPrice) * order
			// case MetalsSortVariants.MARKET_PRICE:
			// 	return (a.marketPrice - b.marketPrice) * order
			// case MetalsSortVariants.PERCENT:
			// 	return (a.percent - b.percent) * order
			// case MetalsSortVariants.USD_VALUE:
			// 	return (a.usdValue - b.usdValue) * order
			// case MetalsSortVariants.TRANSACTION_DATE:
			// 	return (new Date(a.transactionDate,).getTime() - new Date(b.transactionDate,).getTime()) * order
			// default:
			// 	return (new Date(a.transactionDate,).getTime() - new Date(b.transactionDate,).getTime()) * order
			// }
		},)
		return {
			list: finalAssets,
			totalUsdValue,
		}
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetBankAnalytics(data: TMetalAssetCache, filter: MetalsFilterDto, clientId?: string,): Array<TMetalBankAnalytics> {
		const {assets, metalList,  currencyList, equities, etfs,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IMetalsAsset>(asset,)
				if (parsedPayload) {
					const {
						productType,

						metalType,
						purchasePrice,

						currency,
						transactionDate,
						isin,
						units,
						transactionPrice,
						operation,
						security,
					} = parsedPayload
					if (productType === MetalType.DIRECT_HOLD && metalType && purchasePrice && units) {
						if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
							return null
						}
						if (filter.tradeOperation && filter.tradeOperation !== operation) {
							return null
						}
						const accountAssets = assets.filter((accountAsset,) => {
							const accountAssetPayload = assetParser<IMetalsAsset>(accountAsset,)
							return accountAsset.accountId === asset.accountId && accountAssetPayload?.metalType === metalType
						},)
						const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
							const assetPayload = assetParser<IMetalsAsset>(a,)
							if (assetPayload?.operation === AssetOperationType.SELL) {
								return sum - assetPayload.units
							}
							return assetPayload ?
								sum + assetPayload.units :
								sum
						}, 0,)
						if (!filter.tradeOperation && totalBuySellUnits <= 0) {
							return null
						}
						if (filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.currencies?.length) {
							return null
						}
						if (filter.metals && !filter.metals.includes(metalType,)) {
							return null
						}
						const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
							metalList,
							metalType,
							units,
							historyDate: filter.date,
						},)
						return {
							id:       asset.bank?.bankListId,
							bankName: asset.bank?.bankList?.name ?? asset.bank?.bankName,
							productType,
							usdValue: operation === AssetOperationType.BUY ?
								usdValue :
								-usdValue,
						}
					}
					if (productType === MetalType.ETF) {
						const equityAsset = equities.find((equity,) => {
							return equity.isin === isin
						},) ?? etfs.find((etf,) => {
							return etf.isin === isin
						},) ?? null
						if (!equityAsset) {
							return null
						}
						if (filter.metals) {
							return null
						}
						if (!isin || !units || !transactionPrice || !transactionDate || !security) {
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
						if (filter.tradeOperation && filter.tradeOperation !== operation) {
							return null
						}
						if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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
			.filter((item,): item is TMetalBankAnalytics => {
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
	public syncGetCurrencyAnalytics(data: TMetalAssetCache, filter: MetalsFilterDto, clientId?: string,): Array<TMetalCurrencyAnalytics> {
		const {assets, metalList, currencyList, equities, etfs,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IMetalsAsset>(asset,)
				if (parsedPayload) {
					const {
						productType,

						metalType,
						purchasePrice,

						currency,
						transactionDate,
						isin,
						units,
						transactionPrice,
						operation,
						security,
					} = parsedPayload
					if (productType === MetalType.DIRECT_HOLD && metalType && purchasePrice && units) {
						if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
							return null
						}
						const accountAssets = assets.filter((accountAsset,) => {
							const accountAssetPayload = assetParser<IMetalsAsset>(accountAsset,)
							return accountAsset.accountId === asset.accountId && accountAssetPayload?.metalType === metalType
						},)
						const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
							const assetPayload = assetParser<IMetalsAsset>(a,)
							if (assetPayload?.operation === AssetOperationType.SELL) {
								return sum - assetPayload.units
							}
							return assetPayload ?
								sum + assetPayload.units :
								sum
						}, 0,)
						if (filter.isins?.length || filter.securities?.length || filter.equityTypes?.length || filter.currencies?.length) {
							return null
						}
						if (filter.metals && !filter.metals.includes(metalType,)) {
							return null
						}
						if (filter.tradeOperation && filter.tradeOperation !== operation) {
							return null
						}
						if (!filter.tradeOperation && totalBuySellUnits <= 0) {
							return null
						}

						const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
							metalList,
							metalType,
							units,
							historyDate: filter.date,
						},)

						return {
							currency:      metalType,
							currencyValue: units,
							productType,
							usdValue:      operation === AssetOperationType.BUY ?
								usdValue :
								-usdValue,
						} as TCurrencyAnalytics
					}
					if (productType === MetalType.ETF) {
						const equityAsset = equities.find((equity,) => {
							return equity.isin === isin
						},) ?? etfs.find((etf,) => {
							return etf.isin === isin
						},) ?? null
						if (!equityAsset) {
							return null
						}
						if (filter.metals) {
							return null
						}
						if (!isin || !units || !transactionPrice || !transactionDate || !security) {
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
						if (filter.tradeOperation && filter.tradeOperation !== operation) {
							return null
						}
						if (filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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
						}
					}
				}
				return null
			},)
			.filter((item,): item is TMetalCurrencyAnalytics => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
		return analyticsData
	}
}