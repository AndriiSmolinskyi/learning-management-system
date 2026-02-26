/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable max-lines */
import {
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
} from '@nestjs/common'
import {  CBondsCurrencyService, } from '../../apis/cbonds-api/services'
import { PrismaService,} from 'nestjs-prisma'
import type {  CurrencyData,} from '@prisma/client'
import { CurrencyDataList, } from '@prisma/client'
import { AssetOperationType, CryptoType, MetalType, } from '../../../shared/types'
import type { ITransactionSelected, } from '../cache-sync/cache-sync.types'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import { cacheKeysToDeleteAsset, } from '../../../modules/asset/asset.constants'

@Injectable()
export class ComputationsService {
	constructor(
		private readonly logger: Logger = new Logger(ComputationsService.name,),
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cacheService: RedisCacheService,

	) {}

	public async updateCryptoBinanceComputations(): Promise<void> {
		try {
			await this.updateAssetCryptos()
			await	this.updateAllClientsTotals()
			await this.cacheService.deleteByUrl([
				...cacheKeysToDeleteAsset.crypto,
				...cacheKeysToDeleteAsset.portfolio,
				...cacheKeysToDeleteAsset.client,
			],)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	public async updateAllComputations(): Promise<void> {
		try {
			await Promise.all([
				this.updateAssetBonds(),
				this.updateAssetEquities(),
				this.updateAssetCryptos(),
				this.updateAssetDeposits(),
				this.updateAssetMetals(),
				this.updateAssetLoans(),
				this.updateAssetOptions(),
				this.updateAssetRealEstate(),
				this.updateAssetOthers(),
				this.updateAssetPrivateEquity(),
			],)
			await	this.updateAllClientsTotals()
		} catch (error) {
			this.logger.error(error,)
		}
	}

	public async updateAssetPrivateEquity(): Promise<void> {
		const [currencyList, privateEquities,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetPrivateEquity.findMany(),
		],)

		await Promise.all(privateEquities.map(async(pe,) => {
			const currencyData = currencyList.find((c,) => {
				return c.currency === pe.currency
			},)
			if (!currencyData) {
				return
			}
			const { rate, } = currencyData
			const marketValueUSD = parseFloat((pe.currencyValue * rate).toFixed(2,),)
			const pl = parseFloat(((pe.currencyValue - pe.capitalCalled - (pe.managementExpenses ?? 0) - (pe.otherExpenses ?? 0)) / pe.capitalCalled * 100).toFixed(2,),)
			await this.prismaService.assetPrivateEquity.update({
				where: { id: pe.id, },
				data:  {
					marketValueUSD,
					pl,
				},
			},)
		},
		),)
	}

	public async updateAssetLoans(): Promise<void> {
		const [currencyList, loans,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetLoan.findMany(),
		],)

		await Promise.all(loans.map(async(loan,) => {
			const currencyData = currencyList.find((c,) => {
				return c.currency === loan.currency
			},)
			if (!currencyData) {
				return
			}
			const { rate, } = currencyData
			const marketValueUSD = rate * loan.currencyValue
			await this.prismaService.assetLoan.update({
				where: { id: loan.id, },
				data:  {
					marketValueUSD,
				},
			},)
		},
		),)
	}

	public async updateAssetOptions(): Promise<void> {
		const [currencyList, options,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetOption.findMany(),
		],)

		await Promise.all(options.map(async(option,) => {
			const currencyData = currencyList.find((c,) => {
				return c.currency === option.currency
			},)
			if (!currencyData) {
				return
			}
			const { rate, } = currencyData
			const marketValueUSD = parseFloat((option.currentMarketValue * rate).toFixed(2,),)
			await this.prismaService.assetOption.update({
				where: { id: option.id, },
				data:  {
					marketValueUSD,
				},
			},)
		},),)
	}

	public async updateAssetRealEstate(): Promise<void> {
		const [currencyList, realEstates,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetRealEstate.findMany(),
		],)

		await Promise.all(realEstates.map(async(realEstate,) => {
			const currencyData = currencyList.find((c,) => {
				return c.currency === realEstate.currency
			},)
			if (!currencyData) {
				return
			}

			const { rate, } = currencyData
			const marketValueUSD = parseFloat((realEstate.marketValueFC * rate).toFixed(2,),)
			const profitUSD = parseFloat(((marketValueUSD - realEstate.usdValue).toFixed(2,)),)
			const profitPercentage = realEstate.usdValue ?
				parseFloat(((profitUSD / realEstate.usdValue) * 100).toFixed(2,),) :
				0

			await this.prismaService.assetRealEstate.update({
				where: { id: realEstate.id, },
				data:  {
					marketValueUSD,
					profitPercentage,
					profitUSD,
				},
			},)
		},),
		)
	}

	public async updateAssetOthers(): Promise<void> {
		const [currencyList, others, historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetOtherInvestment.findMany(),
			this.prismaService.currencyHistoryData.findMany(),
		],)

		await Promise.all(others.map(async(other,) => {
			const currencyData = currencyList.find((c,) => {
				return c.currency === other.currency
			},)
			if (!currencyData) {
				return
			}
			const costRateDate = new Date(other.investmentDate,)
			const costCurrencyDataRate = other.currency === CurrencyDataList.USD ?
				1 :
				historyCurrencyData
					.filter((item,) => {
						return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
					},)
					.sort((a, b,) => {
						return new Date(a.date,).getTime() - new Date(b.date,).getTime()
					},)[0]?.rate
			const { rate, } = currencyData
			const usdValue = other.currencyValue * (costCurrencyDataRate ?? rate)
			const marketValueUSD = other.currencyValue * rate
			const profitUSD = marketValueUSD - usdValue
			const profitPercentage = profitUSD ?
				profitUSD / usdValue * 100 :
				0

			await this.prismaService.assetOtherInvestment.update({
				where: { id: other.id, },
				data:  {
					marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
					profitPercentage: parseFloat(profitPercentage.toFixed(2,),) ,
					profitUSD:        parseFloat(profitUSD.toFixed(2,),),
					costValueUSD:     parseFloat(usdValue.toFixed(2,),),
				},
			},)
		},),
		)
	}

	public async updateAssetMetals(): Promise<void> {
		const [equities, etfs, metalData, currencyList, metalGroups, historyCurrencyData, historyMetalData,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.prismaService.metalData.findMany(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetMetalGroup.findMany({
				include: { metals: true, },
			},),
			this.prismaService.currencyHistoryData.findMany(),
			this.prismaService.metalHistoryData.findMany(),
		],)

		for (const group of metalGroups) {
			if (group.productType === MetalType.ETF) {
				const equity = equities.find((e,) => {
					return e.isin === group.isin
				},)
				const etf = etfs.find((e,) => {
					return e.isin === group.isin
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === group.currency
				},)
				if (!currencyData) {
					continue
				}
				const { rate, } = currencyData
				const rawLastPrice = equity ?
					equity.currencyName === 'GBX' ?
						equity.lastPrice / 100 :
						equity.lastPrice :
					etf ?
						etf.currencyName === 'GBX' ?
							etf.close / 100 :
							etf.close :
						0
				const lastPrice = parseFloat(rawLastPrice.toFixed(2,),)

				const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
				const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
				const security = equity?.ticker ?? etf?.ticker ?? undefined
				const stockCountryName =
			equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
				let rateSum = 0
				let rateCount = 0
				let totalUnits = 0
				let totalValue = 0
				for (const a of group.metals) {
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
				for (const a of group.metals) {
					const costPrice = a.transactionPrice ?? 0
					const costValueFC = Number(a.units,) * costPrice
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
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(a.units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					await this.prismaService.assetMetal.update({
						where: { id: a.id, },
						data:  {
							costPrice,
							costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:       parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:      parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:      parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:      parseFloat(profitPercentage.toFixed(2,),),
							rate:              costCurrencyDataRate ?? rate,
							currentStockPrice: lastPrice,
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							...(security ?
								{security,} :
								{}),
						},
					},)
				}
				const accountAssets = group.metals.map((a,) => {
					return {
						...a,
						transactionPrice: a.transactionPrice ?? 0,
					}
				},)
				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
					const next = a.operation === AssetOperationType.SELL ?
						sum - a.units :
						sum + a.units
					return this.roundNumber(next,)
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
				const { transactionDate, } = accountAssets.reduce((latest, current,) => {
					const latestDate = latest.transactionDate ?
						new Date(latest.transactionDate,) :
						new Date(0,)
					const currentDate = current.transactionDate ?
						new Date(current.transactionDate,) :
						new Date(0,)

					return currentDate > latestDate ?
						current :
						latest
				},)

				await this.prismaService.assetMetalGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:        totalBuySellUnits,
						costPrice:         costPriceGroup,
						costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),) ,
						costValueUSD:      parseFloat(costValueUSDGroup.toFixed(2,),) ,
						marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),) ,
						marketValueUSD:    parseFloat(marketValueUSDGroup.toFixed(2,),) ,
						profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),) ,
						profitPercentage:   parseFloat(profitPercentageGroup.toFixed(2,),),
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						transactionDate:   transactionDate ?
							transactionDate :
							undefined,
						avgRate,
						...(security ?
							{security,} :
							{}),
					},
				},)
			}	else if (group.productType === MetalType.DIRECT_HOLD) {
				const metalCurrencyData = metalData.find((m,) => {
					return m.currency === group.metalType
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === group.currency
				},)
				if (!metalCurrencyData || !currencyData) {
					continue
				}

				const { rate, id: metalCurrencyId,} = metalCurrencyData
				const { rate: currencyRate, } = currencyData
				const metalMarketPrice = parseFloat((rate / currencyRate).toFixed(2,),)

				const accountAssets = group.metals.map((a,) => {
					return {
						...a,
						transactionPrice: a.transactionPrice ?? 0,
					}
				},)
				let rateSum = 0
				let rateCount = 0
				let totalUnits = 0
				let totalValue = 0
				for (const a of accountAssets) {
					if (a.operation === AssetOperationType.SELL) {
						continue
					}
					const costRateDate = new Date(a.transactionDate,)
					const costCurrencyHistoryRate = a.currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
							// todo: Remove after qa tested
					// const costCurrencyDataRate = historyMetalData
					// 	.filter((item,) => {
					// 		return (new Date(item.date,).getTime() >= costRateDate.getTime() && metalCurrencyId === item.currencyId)
					// 	},)
					// 	.sort((a, b,) => {
					// 		return new Date(a.date,).getTime() - new Date(b.date,).getTime()
					// 	},)[0]?.rate
					// rateSum = rateSum + (((costCurrencyDataRate  ?? rate) / (costCurrencyHistoryRate ?? currencyRate)) * a.units)
					rateSum = rateSum + ((costCurrencyHistoryRate ?? currencyRate) * a.units)
					rateCount = rateCount + 1
					totalUnits = totalUnits + a.units
					totalValue = totalValue + (a.transactionPrice * a.units)
				}

				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
					const next = a.operation === AssetOperationType.SELL ?
						sum - a.units :
						sum + a.units
					return this.roundNumber(next,)
				}, 0,)
				const avgRate = totalUnits > 0 ?
					parseFloat((rateSum / totalUnits).toFixed(4,),) :
					0
				const costPriceGroup = totalUnits > 0 ?
					parseFloat((totalValue / totalUnits).toFixed(2,),) :
					0

				const costValueFCGroup = costPriceGroup * totalBuySellUnits
				const costValueUSDGroup = costValueFCGroup * avgRate
				const marketValueFCGroup = totalBuySellUnits * metalMarketPrice
				const marketValueUSDGroup = totalBuySellUnits *  rate
				const profitUSDGroup = marketValueUSDGroup - costValueUSDGroup
				const profitPercentageGroup = costValueUSDGroup > 0	?
					(profitUSDGroup / costValueUSDGroup) * 100	:
					0

				const { transactionDate, } = accountAssets.reduce((latest, current,) => {
					const latestDate = new Date(latest.transactionDate ?? 0,)
					const currentDate = new Date(current.transactionDate ?? 0,)
					return currentDate > latestDate ?
						current :
						latest
				},)
				await this.prismaService.assetMetalGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:        totalBuySellUnits,
						costPrice:         costPriceGroup,
						costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),),
						costValueUSD:      parseFloat(costValueUSDGroup.toFixed(2,),),
						marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),),
						marketValueUSD:    parseFloat(marketValueUSDGroup.toFixed(2,),),
						profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),),
						profitPercentage:  parseFloat(profitPercentageGroup.toFixed(2,),),
						currentStockPrice: metalMarketPrice,
						transactionDate:   transactionDate ?? undefined,
						metalPrice:        rate,
						avgRate,
					},
				},)

				for (const a of group.metals) {
					const costRateDate = new Date(a.transactionDate,)
					const costCurrencyHistoryRate = a.currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
							// todo: Remove after qa tested
					// const costCurrencyDataRate = historyMetalData
					// 	.filter((item,) => {
					// 		return (new Date(item.date,).getTime() >= costRateDate.getTime() && metalCurrencyId === item.currencyId)
					// 	},)
					// 	.sort((a, b,) => {
					// 		return new Date(a.date,).getTime() - new Date(b.date,).getTime()
					// 	},)[0]?.rate
					const costValueFC = a.transactionPrice * a.units
					const costValueUSD = costValueFC * (costCurrencyHistoryRate ?? currencyRate)
					const marketValueFC = a.units * metalMarketPrice
					const marketValueUSD = a.units * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costValueUSD > 0 ?
						(profitUSD / costValueUSD) * 100	:
						0

					await this.prismaService.assetMetal.update({
						where: { id: a.id, },
						data:  {
							costPrice:         a.transactionPrice,
							costValueUSD:       parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:       parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:       parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:       parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:       parseFloat(profitPercentage.toFixed(2,),),
							rate,
							currentStockPrice: metalMarketPrice,
							metalPrice:        rate,
						},
					},)
				}
			}
		}
	}

	public async updateAssetCryptos(): Promise<void> {
		const [equities, etfs,currencyList, cryptoData, groups, historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.assetCryptoGroup.findMany({
				include: { cryptos: true, },
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		for (const group of groups) {
			if (group.productType === CryptoType.ETF) {
				const equity = equities.find((e,) => {
					return e.isin === group.isin
				},)
				const etf = etfs.find((e,) => {
					return e.isin === group.isin
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === group.currency
				},)
				if (!currencyData) {
					continue
				}
				const { rate, } = currencyData
				const rawLastPrice = equity ?
					equity.currencyName === 'GBX' ?
						equity.lastPrice / 100 :
						equity.lastPrice :
					etf ?
						etf.currencyName === 'GBX' ?
							etf.close / 100 :
							etf.close :
						0
				const lastPrice = parseFloat(rawLastPrice.toFixed(2,),)
				const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
				const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
				const security = equity?.ticker ?? etf?.ticker ?? 'N/A'
				const stockCountryName =
			equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
				let rateSum = 0
				let rateCount = 0
				let totalUnits = 0
				let totalValue = 0
				for (const a of group.cryptos) {
					if (a.operation === AssetOperationType.SELL || !a.units || !a.transactionPrice || !a.transactionDate) {
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
				for (const a of group.cryptos) {
					const costPrice = a.transactionPrice ?? 0
					const costValueFC = Number(a.units,) * costPrice
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
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(a.units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					await this.prismaService.assetCrypto.update({
						where: { id: a.id, },
						data:  {
							costPrice,
							costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:       parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:      parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:      parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:      parseFloat(profitPercentage.toFixed(2,),),
							rate:              costCurrencyDataRate ?? rate,
							currentStockPrice: lastPrice,
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							...(security ?
								{
									security,
								} :
								{}),
						},
					},)
				}
				const accountAssets = group.cryptos.map((a,) => {
					return {
						...a,
						transactionPrice: a.transactionPrice ?? 0,
					}
				},)
				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
					const next = a.operation === AssetOperationType.SELL ?
						sum - (a.units ?? 0) :
						sum + (a.units ?? 0)
					return this.roundNumber(next,)
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
				const { transactionDate, } = accountAssets.reduce((latest, current,) => {
					const latestDate = latest.transactionDate ?
						new Date(latest.transactionDate,) :
						new Date(0,)
					const currentDate = current.transactionDate ?
						new Date(current.transactionDate,) :
						new Date(0,)

					return currentDate > latestDate ?
						current :
						latest
				},)

				await this.prismaService.assetCryptoGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:        totalBuySellUnits,
						costPrice:         costPriceGroup,
						costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),) ,
						costValueUSD:      parseFloat(costValueUSDGroup.toFixed(2,),) ,
						marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),) ,
						marketValueUSD:    parseFloat(marketValueUSDGroup.toFixed(2,),) ,
						profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),),
						profitPercentage:   parseFloat(profitPercentageGroup.toFixed(2,),),
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						transactionDate:   transactionDate ?
							transactionDate :
							undefined,
						avgRate,
						...(security ?
							{
								security,
							} :
							{}),
					},
				},)
			} else if (group.productType === CryptoType.DIRECT_HOLD) {
				const {cryptoAmount,purchasePrice,} = group
				const cryptoCurrencyData = cryptoData.find(
					(c,) => {
						return c.token === group.cryptoCurrencyType
					},
				)
				if (!cryptoCurrencyData || !cryptoAmount || !purchasePrice) {
					continue
				}
				const { rate, } = cryptoCurrencyData
				const marketValueUsd = cryptoAmount * rate
				const costValueUsd = purchasePrice * cryptoAmount
				const profitUsd = marketValueUsd - costValueUsd
				const profitPercentage =
				costValueUsd > 0 ?
					(profitUsd / costValueUsd) * 100 :
					0

				await this.prismaService.assetCryptoGroup.update({
					where: { id: group.id, },
					data:  {
						marketValueUSD:    marketValueUsd,
						marketValueFC:     marketValueUsd,
						costValueUSD:      costValueUsd,
						costValueFC:       costValueUsd,
						profitUSD:         profitUsd,
						profitPercentage,
						totalUnits:        group.cryptoAmount,
						currentStockPrice: rate,
					},
				},)

				for (const a of group.cryptos) {
					const {cryptoAmount,purchasePrice,} = a
					if (!cryptoAmount || !purchasePrice) {
						continue
					}
					const marketValueUsdA = cryptoAmount * rate
					const costValueUsdA = purchasePrice * cryptoAmount
					const profitUsdA = marketValueUsdA - costValueUsdA
					const profitPercentageA = costValueUsdA > 0 ?
						(profitUsdA / costValueUsdA) * 100 :
						0
					await this.prismaService.assetCrypto.update({
						where: { id: a.id, },
						data:  {
							marketValueUSD:    marketValueUsdA,
							marketValueFC:     marketValueUsdA,
							costValueUSD:      costValueUsdA,
							costValueFC:       costValueUsdA,
							profitUSD:         profitUsdA,
							profitPercentage:  profitPercentageA,
							rate,
							currentStockPrice: rate,
						},
					},)
				}
			}
		}
	}

	public async updateAssetDeposits(): Promise<void> {
		const [currencyList, deposits,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetDeposit.findMany(),
		],)

		await Promise.all(deposits.map(async(deposit,) => {
			const currencyData = currencyList.find((c,) => {
				return c.currency === deposit.currency
			},)
			if (!currencyData) {
				return
			}
			const { rate, } = currencyData
			const usdValue = rate * deposit.currencyValue
			await this.prismaService.assetDeposit.update({
				where: { id: deposit.id, },
				data:  {
					usdValue,
				},
			},)
		},),)
	}

	public async updateAssetEquities(): Promise<void> {
		const [equities, etfs, currencyList, groups, historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetEquityGroup.findMany({
				include: { equities: true, },
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)

		for (const group of groups) {
			const equity = equities.find((e,) => {
				return e.isin === group.isin
			},)
			const etf = etfs.find((e,) => {
				return e.isin === group.isin
			},)
			const currencyData = currencyList.find((c,) => {
				return c.currency === group.currency
			},)
			if (!currencyData) {
				continue
			}
			const { rate, } = currencyData
			const rawLastPrice = equity ?
				equity.currencyName === 'GBX' ?
					equity.lastPrice / 100 :
					equity.lastPrice :
				etf ?
					etf.currencyName === 'GBX' ?
						etf.close / 100 :
						etf.close :
					0
			const lastPrice = parseFloat(rawLastPrice.toFixed(2,),)
			const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
			const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
			const security = equity?.ticker ?? etf?.ticker ?? undefined
			const stockCountryName =
			equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
			let rateSum = 0
			let rateCount = 0
			let totalUnits = 0
			let totalValue = 0
			for (const a of group.equities) {
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

			for (const a of group.equities) {
				const costPrice = a.transactionPrice ?? 0
				const costValueFC = Number(a.units,) * costPrice
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
				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
				const marketValueFC = Number(a.units,) * Number(lastPrice,)
				const marketValueUSD = marketValueFC * rate
				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = costPrice > 0 ?
					((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
					0
				await this.prismaService.assetEquity.update({
					where: { id: a.id, },
					data:  {
						costPrice,
						costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
						costValueFC:       parseFloat(costValueFC.toFixed(2,),),
						marketValueUSD:      parseFloat(marketValueUSD.toFixed(2,),),
						marketValueFC:      parseFloat(marketValueFC.toFixed(2,),),
						profitUSD:         parseFloat(profitUSD.toFixed(2,),),
						profitPercentage:      parseFloat(profitPercentage.toFixed(2,),),
						currentStockPrice: lastPrice,
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						rate:              costCurrencyDataRate ?? rate,
						...(security ?
							{
								security,
							} :
							{}),
					},
				},)
			}
			const accountAssets = group.equities.map((a,) => {
				return {
					...a,
					transactionPrice: a.transactionPrice ?? 0,
				}
			},)
			const avgRate = totalUnits > 0 ?
				parseFloat((rateSum / totalUnits).toFixed(4,),) :
				0
			const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
				const next = a.operation === AssetOperationType.SELL ?
					sum - a.units :
					sum + a.units
				return this.roundNumber(next,)
			}, 0,)

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
			const { transactionDate, } = accountAssets.reduce((latest, current,) => {
				return new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
					current :
					latest
			},)

			await this.prismaService.assetEquityGroup.update({
				where: { id: group.id, },
				data:  {
					totalUnits:        totalBuySellUnits,
					costPrice:         costPriceGroup,
					costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),) ,
					costValueUSD:      parseFloat(costValueUSDGroup.toFixed(2,),) ,
					marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),) ,
					marketValueUSD:    parseFloat(marketValueUSDGroup.toFixed(2,),) ,
					profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),) ,
					profitPercentage:   parseFloat(profitPercentageGroup.toFixed(2,),),
					issuer:            emitentName,
					sector:            branchName,
					country:           stockCountryName,
					currentStockPrice: lastPrice,
					transactionDate,
					avgRate,
					...(security ?
						{
							security,
						} :
						{}),
				},
			},)
		}
	}

	public async updateAssetBonds(): Promise<void> {
		const [bonds, currencyList, groups, historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllBondsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.assetBondGroup.findMany({
				include: { bonds: true, },
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		for (const group of groups) {
			const bond = bonds.find((b,) => {
				return b.isin === group.isin
			},)
			const currencyData = currencyList.find((c,) => {
				return c.currency === group.currency
			},)

			if (!bond || !currencyData) {
				continue
			}

			const { rate, } = currencyData
			const marketPrice = bond.marketPrice ?
				parseFloat(bond.marketPrice.toFixed(2,),)  :
				0
			const dirtyPriceCurrency = bond.dirtyPriceCurrency ?? null
			const nominalPrice = bond.nominalPrice ?
				String(bond.nominalPrice,) :
				null

			let rateSum = 0
			let rateCount = 0
			let totalUnits = 0
			let totalValue = 0
			for (const a of group.bonds) {
				if (a.operation === AssetOperationType.SELL) {
					continue
				}
				const costRateDate = new Date(a.valueDate,)
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
				totalValue = totalValue + (a.unitPrice * a.units)
			}

			const avgRate = totalUnits > 0 ?
				parseFloat((rateSum / totalUnits).toFixed(4,),) :
				0
			const accruedTotal = group.bonds.reduce((sum, a,) => {
				return sum + (a.accrued ?? 0)
			}, 0,)
			const costPrice = totalUnits > 0 ?
				parseFloat((totalValue / totalUnits).toFixed(2,),) :
				1

			const totalBuySellUnits = group.bonds.reduce((sum, a,) => {
				const next = a.operation === AssetOperationType.SELL ?
					sum - a.units :
					sum + a.units
				return this.roundNumber(next,)
			}, 0,)
			const costValueFC = (costPrice * totalBuySellUnits * 10) + accruedTotal
			const costValueUSD = costValueFC * avgRate
			const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
				isin:  group.isin,
				units: totalBuySellUnits,
				dirtyPriceCurrency,
				nominalPrice,
				rate:  1,
				marketPrice,
			},)
			const marketValueUSD = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
				isin:  group.isin,
				units: totalBuySellUnits,
				dirtyPriceCurrency,
				nominalPrice,
				rate,
				marketPrice,
			},)
			const profitUSD = marketValueUSD - costValueUSD
			const profitPercentage = costPrice > 0 ?
				((marketPrice - costPrice) / costPrice) * 100 :
				0

			const yieldValue = bond.yield ?
				bond.yield * 100 :
				0
			const accrued = bond.accrued && nominalPrice ?
				(Number(bond.accrued,) / Number(nominalPrice,)) *  totalUnits *  1000 *  rate :
				0

			await this.prismaService.assetBondGroup.update({
				where: { id: group.id, },
				data:  {
					totalUnits:     totalBuySellUnits,
					costPrice,
					marketPrice,
					marketValueUSD:      parseFloat(marketValueUSD.toFixed(2,),),
					marketValueFC:      parseFloat(marketValueFC.toFixed(2,),),
					costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
					costValueFC:      parseFloat(costValueFC.toFixed(2,),),
					profitUSD:      parseFloat(profitUSD.toFixed(2,),),
					profitPercentage,
					yield:          yieldValue,
					accrued,
					nextCouponDate: bond.nextCouponDate ?? null,
					maturityDate:   bond.maturityDate ?? null,
					avgRate,
					security:       bond.security,
				},
			},)

			for (const a of group.bonds) {
				const marketValueUSDChild = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin:  a.isin,
					units: a.units,
					dirtyPriceCurrency,
					nominalPrice,
					rate,
					marketPrice,
				},)

				const marketValueFCChild = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin:  a.isin,
					units: a.units,
					dirtyPriceCurrency,
					nominalPrice,
					rate:  1,
					marketPrice,
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === a.currency
				},)
				if (!currencyData) {
					continue
				}
				const costRateDate = new Date(a.valueDate,)
				const costCurrencyDataRate = a.currency === CurrencyDataList.USD ?
					1 :
					historyCurrencyData
						.filter((item,) => {
							return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate
				const costValueFCChild = (a.unitPrice * a.units * 10) + a.accrued
				const costValueUSDChild = costValueFCChild * (costCurrencyDataRate ?? currencyData.rate)

				const profitUSDChild =	marketValueUSDChild - costValueUSDChild

				const profitPercentageChild =
				a.unitPrice > 0 ?
					((marketPrice - a.unitPrice) / a.unitPrice) * 100 :
					0

				await this.prismaService.assetBond.update({
					where: { id: a.id, },
					data:  {
						marketPrice,
						marketValueUSD:   parseFloat(marketValueUSDChild.toFixed(2,),),
						marketValueFC:    parseFloat(marketValueFCChild.toFixed(2,),),
						costValueUSD:     parseFloat(costValueUSDChild.toFixed(2,),),
						costValueFC:      parseFloat(costValueFCChild.toFixed(2,),),
						profitUSD:        parseFloat(profitUSDChild.toFixed(2,),),
						profitPercentage: parseFloat(profitPercentageChild.toFixed(2,),),
						yield:            yieldValue,
						nextCouponDate:   bond.nextCouponDate ?? null,
						maturityDate:     bond.maturityDate ?? null,
						rate:             costCurrencyDataRate ?? currencyData.rate,
						security:         bond.security,
					},
				},)
			}
		}
	}

	// New version
	public async updateClientTotals(clientId: string,): Promise<void> {
		try {
			const [
				client,
				currencyList,
			] = await Promise.all([
				this.prismaService.client.findUnique({
					where:   { id: clientId, },
					include: {
						portfolios: {
							include: {
								transactions: true,
							},
						},
					},
				},),
				this.cBondsCurrencyService.getAllCurrencies(),
			],)
			if (!client) {
				throw new HttpException('Client is not found', HttpStatus.NOT_FOUND,)
			}
			let clientTotals = 0
			await Promise.all(
				client.portfolios.map(async(portfolio,) => {
					const portfolioWithTotals = await this.getPortfolioTotals(portfolio.id, portfolio.transactions, currencyList,)

					clientTotals = clientTotals + portfolioWithTotals.totalAssets

					await this.prismaService.portfolio.update({
						where: { id: portfolio.id, },
						data:  { totals: portfolioWithTotals.totalAssets, },
					},)
				},),
			)
			await this.prismaService.client.update({
				where: { id: clientId, },
				data:  { totals: parseFloat(clientTotals.toFixed(2,),), },
			},)
		} catch (error) {
			this.logger.error('[ComputingService-updateClientTotals]: ', error,)
		}
	}

	// New version
	public async updateAllClientsTotals(): Promise<void> {
		const [
			clients,
			currencyList,
		] = await Promise.all([
			this.prismaService.client.findMany({
				include: {
					portfolios: {
						include: {
							transactions: true,
						},
					},
				},
			},),
			this.cBondsCurrencyService.getAllCurrencies(),
		],)
		await Promise.all(clients.map(async(client,) => {
			let clientTotals = 0
			await Promise.all(
				client.portfolios.map(async(portfolio,) => {
					const portfolioWithTotals = await this.getPortfolioTotals(portfolio.id, portfolio.transactions, currencyList,)
					clientTotals = clientTotals + portfolioWithTotals.totalAssets
					await this.prismaService.portfolio.update({
						where: { id: portfolio.id, },
						data:  { totals: parseFloat(portfolioWithTotals.totalAssets.toFixed(2,),), },
					},)
				},),
			)
			await this.prismaService.client.update({
				where: { id: client.id, },
				data:  { totals: parseFloat(clientTotals.toFixed(2,),), },
			},)
		},),
		)
	}

	/**
 		* CR-135
 		* Calculates the total USD-equivalent value of all assets in the given portfolio.
 		* @param portfolio - The portfolio with related data (transactions, assets, etc.).
 		* @param lists - Supporting lists for exchange rates and bond/crypto data.
 		* @returns The portfolio object with an added `totalAssets` field in USD.
 		*
 		* This method processes all asset types in the portfolio (cash, bonds, crypto, metals, etc.),
 		* converts their values to USD using current or historical rates,
 		* and sums them up to compute the total portfolio value in USD.
 		*
 		* Assets with invalid state (e.g., expired deposits, zero units) are excluded.
 	*/
	// New version after refactor
	public async getPortfolioTotals(portfolioId: string, transactions: Array<ITransactionSelected>, currencyList: Array<CurrencyData>,): Promise<{totalAssets: number}> {
		const now = new Date()
		const bondAssetsPromise = this.prismaService.assetBondGroup.findMany({
			where: {
				portfolioId,
				totalUnits:  {
					gt: 0,
				},
				marketPrice: {
					not: 0,
				},
				OR: [
					{ maturityDate: null, },
					{ maturityDate: { gt: now, }, },
				],
				transferDate: null,
			},
		},)
		const cryptoAssetsPromise = this.prismaService.assetCryptoGroup.findMany({
			where: {
				portfolioId,
				totalUnits:  {
					gt: 0,
				},
				transferDate: null,
			},
		},)
		const equityAssetsPromise = this.prismaService.assetEquityGroup.findMany({
			where: {
				portfolioId,
				totalUnits:  {
					gt: 0,
				},
				currentStockPrice: {
					not: 0,
				},
				transferDate: null,
			},
		},)
		const metalAssetsPromise = this.prismaService.assetMetalGroup.findMany({
			where: {
				portfolioId,
				totalUnits:  {
					gt: 0,
				},
				transferDate: null,
			},
		},)
		const depositAssetsPromise = this.prismaService.assetDeposit.findMany({
			where: {
				portfolioId,
				usdValue:    {
					not: 0,
				},
				OR: [
					{ maturityDate: null, },
					{ maturityDate: { gt: now, }, },
				],
				transferDate: null,
			},
		},)
		const loanAssetsPromise = this.prismaService.assetLoan.findMany({
			where: {
				portfolioId,
				usdValue:    {
					not: 0,
				},
				OR: [
					{ maturityDate: { gt: now, }, },
				],
				transferDate: null,
			},
		},)
		const optionAssetsPromise = this.prismaService.assetOption.findMany({
			where: {
				portfolioId,
				marketValueUSD: {
					not: 0,
				},
				maturityDate: { gt: now, },
				transferDate: null,
			},
		},)
		const otherAssetsPromise = this.prismaService.assetOtherInvestment.findMany({
			where: {
				portfolioId,
				usdValue:    {
					not: 0,
				},
				transferDate: null,
			},
		},)
		const peAssetsPromise = this.prismaService.assetPrivateEquity.findMany({
			where: {
				portfolioId,
				marketValueUSD: {
					not: 0,
				},
				transferDate: null,
			},
		},)
		const reAssetsPromise = this.prismaService.assetRealEstate.findMany({
			where: {
				portfolioId,
				usdValue:    {
					not: 0,
				},
				transferDate: null,
			},
		},)
		const [
			bondAssets,
			cryptoAssets,
			equityAssets,
			metalAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
		] = await Promise.all([
			bondAssetsPromise,
			cryptoAssetsPromise,
			equityAssetsPromise,
			metalAssetsPromise,
			depositAssetsPromise,
			loanAssetsPromise,
			optionAssetsPromise,
			otherAssetsPromise,
			peAssetsPromise,
			reAssetsPromise,
		],)
		const transactionUsdValue = transactions.reduce((acc, transaction,) => {
			return acc +  this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
				currency:      transaction.currency as CurrencyDataList,
				currencyValue: Number(transaction.amount,),
				currencyList,
			},)
		}, 0,)
		const bondsBankData = bondAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)
		const depositsBankData = depositAssets
			.map((asset,) => {
				return {
					usdValue:    asset.usdValue,
				}
			},)
		const cryptoData = cryptoAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)
		const equityBankData = equityAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)
		const loanBankData = loanAssets
			.map((asset,) => {
				return {
					usdValue:    asset.usdValue,
				}
			},)
		const metalData = metalAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)
		const optionsBankData = optionAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)
		const otherBankData = otherAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)

		const privateEquityBankData = peAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)
		const realEstateBankData = reAssets
			.map((asset,) => {
				return {
					usdValue:    asset.marketValueUSD,
				}
			},)
		const sumByAccountId = [
			...metalData,
			...bondsBankData,
			...depositsBankData,
			...cryptoData,
			...equityBankData,
			...loanBankData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<number>((acc, { usdValue, },) => {
			return acc + usdValue
		}, 0,)
		return {
			totalAssets: sumByAccountId + transactionUsdValue,
		}
	}

	private roundNumber = (v: number,): number => {
		return Math.round(v * 10_000,) / 10_000
	}
}