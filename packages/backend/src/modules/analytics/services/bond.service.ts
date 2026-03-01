/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import {
	PrismaService,
} from 'nestjs-prisma'
import {  Injectable, Logger, } from '@nestjs/common'
import { CurrencyDataList,} from '@prisma/client'
import type { CurrencyHistoryData, Prisma, } from '@prisma/client'
import { v4 as uuid4, } from 'uuid'
import {
	assetParser,
} from '../../../shared/utils'
import {
	CBondsCurrencyService,
} from '../../../modules/apis/cbonds-api/services'
import type {
	IAnalyticBond,
	IAnalyticBondWithInnerAssets,
	IBondsByFilters,
	TBankAnalytics,
	TBondsCurrencyAnalytics,
} from '../analytics.types'
import type {
	IBondsAsset,
	TAssetExtended,
} from '../../asset/asset.types'
import {
	AssetNamesType,
} from '../../asset/asset.types'
import {
	TBondTableSortVariants,
} from '../analytics.types'
import type {
	AnalyticsBondFilterDto,
	BondIsinsSecuritiesBySourceIdsDto,
	BondsCurrencyFilterDto,
	NewAnalyticsBondFilterDto,
} from '../dto'
import { AssetOperationType, } from '../../../shared/types'
import { endOfDay, } from 'date-fns'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TBondInitials,} from '../../../modules/common/cache-sync/cache-sync.types'

@Injectable()
export class BondAssetService {
	private readonly logger = new Logger(BondAssetService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly cacheService: RedisCacheService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) {}

	private getTimestampLogger = (): ((functionName: string, label: string) => void) => {
		const start = performance.now()
		return (functionName: string, label: string,): void => {
			const now = performance.now()
			this.logger.warn(`[Bond-${functionName}]: [${label}] ${Math.round(now - start,)} ms`,)
		}
	}

	/**
		* 3.5.4
		* Calculates the annual income from bond transactions based on the provided filter criteria.
		* @remarks
		* This method queries the database for bond-related transactions that match the specified filter parameters,
		* including portfolios, entities, banks, accounts, and client associations. It filters transactions that occurred
		* from the beginning of the current year up to the provided date (or the current date if not specified),
		* and calculates the total income by multiplying each transaction's amount by its rate (if defined).
		* If the selected year is the previous year, the method returns 0.
		*
		* @param filter - The filter criteria used to narrow down bond transactions (e.g., portfolios, entities, banks, etc.).
		* @param clientId - Optional client ID to override the default client filtering behavior.
		* @returns A promise that resolves to a number representing the total bond income for the current year.
 	*/
	public async getBondAnnual(filter: NewAnalyticsBondFilterDto, clientId?: string,): Promise<number> {
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
					annualAssets: { has: AssetNamesType.BONDS, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)
		const bondAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)
		return bondAnnual
	}

	/**
 * 3.5.3
 * Retrieves the ISINs of bond assets associated with the specified bank IDs.
 *
 * @remarks
 * - Filters assets based on the provided bank IDs and the asset name `BONDS`.
 * - Parses each matching asset to extract its `isin` value.
 * - Returns an array of ISINs.
 * - If an error occurs during processing, an empty array is returned.
 *
 * @param ids - Optional array of bank IDs to filter the bond assets.
 * @returns A Promise resolving to an array of bond ISINs.
 */
	public async getBondIsinsBySourceIds(data: BondIsinsSecuritiesBySourceIdsDto, clientId?: string,): Promise<Array<string>> {
		const {clientIds, portfolioIds,entityIds,accountIds,bankListIds, bankIds,} = data
		const assets = await this.prismaService.assetBondGroup.findMany({
			where: {
				clientId:    {in: clientIds,},
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
				totalUnits: {
					not: 0,
				},
				marketPrice: {
					not: 0,
				},
				transferDate: null,
			},
		},)
		try {
			const options = assets.map((asset,) => {
				return asset.isin
			},)
			const uniqueIsins = Array.from(new Set(options,),)
			return uniqueIsins
		} catch (error) {
			return []
		}
	}

	/**
 * 3.5.3
 * Retrieves the security codes of bond assets associated with the specified bank IDs.
 *
 * @remarks
 * - Filters assets based on the provided bank IDs and the asset name `BONDS`.
 * - Parses each matching asset to extract its `security` value.
 * - Returns an array of security codes.
 * - If an error occurs during processing, an empty array is returned.
 *
 * @param ids - Optional array of bank IDs to filter the bond assets.
 * @returns A Promise resolving to an array of bond security codes.
 */
	public async getBondSecuritiesByBanksIds(data: BondIsinsSecuritiesBySourceIdsDto, clientId?: string,): Promise<Array<string>> {
		const {clientIds, portfolioIds,entityIds,accountIds,bankListIds, bankIds,} = data
		const assets = await this.prismaService.assetBondGroup.findMany({
			where: {
				clientId:    {in: clientIds,},
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
				totalUnits: {
					not: 0,
				},
				marketPrice: {
					not: 0,
				},
				transferDate: null,
			},
		},)
		try {
			const options = assets.map((asset,) => {
				return asset.security
			},)
			const uniqueIsins = Array.from(new Set(options,),)
			return uniqueIsins
		} catch (error) {
			return []
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
	// New version
	public async getAllByFilters(filters: NewAnalyticsBondFilterDto, clientId?: string,): Promise<IBondsByFilters> {
		const targetDate = filters.date ?
			new Date(filters.date,) :
			new Date()
		if (filters.date) {
			let totalUsdValue = 0
			const [bondAssets, bonds, currencyList, historyCurrencyData,] = await Promise.all([
				this.prismaService.assetBondGroup.findMany({
					where: {
						clientId:    {in: filters.clientIds,},
						portfolioId:  { in: filters.portfolioIds, },
						entityId:    { in: filters.entitiesIds, },
						accountId:   { in: filters.accountIds,},
						bankId:      {in: filters.bankIds,},
						...(clientId ?
							{
								client: {
									id: clientId,
								},
							} :
							{}),
						bank: {
							is: {
								bankListId: {in: filters.bankListIds,},
							},
						},
						portfolio: {
							isActivated: true,
						},
						totalUnits: {
							gt: 0,
						},
						marketPrice: {
							not: 0,
						},
						OR: [
							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
							{ transferDate: null, },
						],
					},
					orderBy: {
						[filters.sortBy]: filters.sortOrder,
					},
					include: {
						bonds:     {
							where: {
								operation:         filters.tradeOperation,
								OR:        [
									{
										assetBondVersions: {
											none: {},
										},
										units:       { gt: 0, },
										marketPrice: { not: 0, },
										isin:        { in: filters.isins, },
										security:    { in: filters.securities, },
										currency:    { in: filters.currencies, },
										AND:         [
											{
												valueDate: {
													lte: endOfDay(targetDate,),
												},
											},
											{
												OR: [
													{ maturityDate: null, },
													{ maturityDate: { gte: endOfDay(targetDate,), }, },
												],
											},
										],
									},
									{
										assetBondVersions: {
											some: {
												units:       { gt: 0, },
												marketPrice: { not: 0, },
												isin:        { in: filters.isins, },
												security:    { in: filters.securities, },
												currency:    { in: filters.currencies, },
												AND:         [
													{
														valueDate: {
															lte: endOfDay(targetDate,),
														},
													},
													{
														OR: [
															{ maturityDate: null, },
															{ maturityDate: { gte: endOfDay(targetDate,), }, },
														],
													},
												],
											},
										},
									},
								],
							},
							include: {
								assetBondVersions: {
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
				this.cBondsCurrencyService.getAllBondsWithHistory(filters.date,),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			const mappedBonds = bondAssets
				.map((group,) => {
					return {
						...group,
						bonds: group.bonds.map((b,) => {
							if (b.assetBondVersions.length > 0) {
								return {
									...b.assetBondVersions[0],
									mainAssetId: b.id,
								}
							}
							return {
								...b,
								mainAssetId: undefined,
							}
						},),
					}
				},)
				.filter((group,) => {
					const filteredUnits = group.bonds.reduce((sum, b,) => {
						if (b.operation === AssetOperationType.SELL) {
							return sum - Number(b.units,)
						}
						return sum + Number(b.units,)
					}, 0,)
					return group.bonds.length && Boolean(filteredUnits,)
				},)
				.map((bond,) => {
					const filteredUnits = bond.bonds.reduce((sum, b,) => {
						if (b.operation === AssetOperationType.SELL) {
							return sum - Number(b.units,)
						}
						return sum + Number(b.units,)
					}, 0,)
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === bond.currency
					},)
					const bondData = bonds.find((item,) => {
						return item.isin === bond.isin
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const dirtyPriceCurrency = bondData && bondData.bondHistory[0] ?
						bondData.bondHistory[0].dirtyPriceCurrency ?
							bondData.bondHistory[0].dirtyPriceCurrency :
							null :
						bondData?.dirtyPriceCurrency ?
							bondData.dirtyPriceCurrency :
							null

					const nominalPrice = bondData && bondData.bondHistory[0] ?
						bondData.bondHistory[0].nominalPrice ?
							bondData.bondHistory[0].nominalPrice :
							null :
						bondData?.nominalPrice ?
							bondData.nominalPrice :
							null

					const rawMarketPrice = bondData && bondData.bondHistory[0] ?
						bondData.bondHistory[0].marketPrice :
						bondData?.marketPrice ?? bond.marketPrice
					const marketPrice = parseFloat(rawMarketPrice.toFixed(2,),)

					const accountAssets = bond.bonds
					const accruedTotal = accountAssets.reduce((sum, a,) => {
						return sum + a.accrued
					}, 0,)
					let rateSum = 0
					let rateCount = 0
					const totalUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + a.units
					}, 0,)
					for (const a of accountAssets) {
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
						rateSum = rateSum + ((costCurrencyDataRate ?
							costCurrencyDataRate :
							rate) * a.units)
						rateCount = rateCount + 1
					}

					const totalValue = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + (a.unitPrice * a.units)
					}, 0,)

					const avgRate = totalUnits > 0 ?
						parseFloat((rateSum / totalUnits).toFixed(4,),) :
						0

					const costPrice = totalUnits > 0 ?
						parseFloat((totalValue / totalUnits).toFixed(2,),) :
						1

					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.units
						}
						return sum + a.units
					}, 0,)
					const costValueFC = (costPrice * totalBuySellUnits * 10) + accruedTotal
					const costValueUsd = costValueFC * avgRate
					const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin:  bond.isin,
						units: totalBuySellUnits,
						dirtyPriceCurrency,
						nominalPrice,
						rate:  1,
						marketPrice,
					},)
					const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin:  bond.isin,
						units: totalBuySellUnits,
						dirtyPriceCurrency,
						nominalPrice,
						rate,
						marketPrice,
					},)
					const profitUsd = marketValueUsd - costValueUsd
					const profitPercentage = costPrice > 0 ?
						((marketPrice - costPrice) / costPrice) * 100 :
						0
					const assetYield = Number(bond.yield,) * 100
					const currentAccrued = Number(bond.accrued,) / Number(nominalPrice,) * Number(filteredUnits,) * 1000 * rate

					return {
						id:               bond.bonds[0].id,
						portfolioName:    this.cryptoService.decryptString(bond.portfolio.name,),
						entityName:      this.cryptoService.decryptString(bond.entity.name,),
						accountName:      this.cryptoService.decryptString(bond.account.accountName,),
						bankName:         bond.bank.bankName,
						currency:         bond.currency,
						isin:             bond.isin,
						security:         bond.security,
						yield:            assetYield ?
							Number(assetYield,) :
							Number(bond.yield,),
						profitUsd,
						profitPercentage,
						costPrice,
						costValueUsd,
						marketValueFC,
						marketValueUsd,
						costValueFC,
						units:            filteredUnits,
						issuer:           bond.issuer ?? '- -',
						nextCouponDate:   bond.nextCouponDate ?
							bond.nextCouponDate.toISOString() :
							null,
						maturity:   bond.maturityDate ?
							bond.maturityDate.toISOString() :
							null,
						sector:           bond.sector ?? '- -',
						coupon:           bond.coupon ?? '- -',
						country:          bond.country ?? '- -',
						marketPrice,
						unitPrice:      bond.bonds[0].unitPrice,
						operation:	       AssetOperationType.BUY,
						valueDate:      	bond.bonds.length === 1 ?
							bond.bonds[0]?.valueDate?.toISOString() :
							bond.valueDate.toISOString(),
						currentAccrued,
						groupId:       bond.id,
						isTransferred: Boolean(bond.transferDate,),
						...(bond.bonds.length === 1 ?
							{mainAssetId: bond.bonds[0].mainAssetId,} :
							{}),
						...(bond.bonds.length > 1 ?
							{assets:
					bond.bonds.map((item,) => {
						const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  item.isin,
							units:              Number(item.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate,
							marketPrice,
						},)
						const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  item.isin,
							units:              Number(item.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate:               1,
							marketPrice,
						},)
						totalUsdValue = totalUsdValue + 	marketValueUsd

						const profitUsd = Number(marketValueUsd,) - Number(item.costValueUSD,)
						const profitPercentage = (Number(marketPrice,) - Number(item.costPrice,)) / Number(item.costPrice,) * 100
						const assetYield = Number(bond.yield,) * 100
						const currentAccrued = Number(item.accrued,) / Number(nominalPrice,) * Number(item.units,) * 1000 * rate
						return {
							id:               item.id,
							portfolioName:    this.cryptoService.decryptString(bond.portfolio.name,),
							entityName:       this.cryptoService.decryptString(bond.entity.name,),
							accountName:      this.cryptoService.decryptString(bond.account.accountName,),
							bankName:         bond.bank.bankName,
							isin:             item.isin,
							security:         item.security,
							currency:         item.currency,
							yield:            Number(assetYield,),
							profitUsd,
							profitPercentage,
							costPrice:        item.costPrice,
							costValueUsd:     item.costValueUSD,
							marketValueUsd,
							marketValueFC,
							costValueFC:      item.costValueFC,
							units:            item.units,
							nextCouponDate:   bond.nextCouponDate ?
								bond.nextCouponDate.toISOString() :
								null,
							maturity:   bond.maturityDate ?
								bond.maturityDate.toISOString() :
								null,
							issuer:           item.issuer ?? '- -',
							sector:           item.sector ?? '- -',
							coupon:           item.coupon ?? '- -',
							country:          item.country ?? '- -',
							marketPrice,
							operation:	       item.operation as AssetOperationType,
							currentAccrued,
							unitPrice:      item.unitPrice,
							valueDate:      item.valueDate.toISOString(),
							groupId:       bond.id,
							isTransferred: Boolean(bond.transferDate,),
							...(item.mainAssetId ?
								{mainAssetId: item.mainAssetId,} :
								{}),
						}
					},),} :
							{}),
					}
				},)
			return {
				list:      mappedBonds,
			}
		}
		const [bondAssets,] = await Promise.all([
			this.prismaService.assetBondGroup.findMany({
				where: {
					clientId:    {in: filters.clientIds,},
					portfolioId:  { in: filters.portfolioIds, },
					entityId:    { in: filters.entitiesIds, },
					accountId:   { in: filters.accountIds,},
					bankId:      {in: filters.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filters.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					marketPrice: {
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
					OR: [
						{ maturityDate: null, },
						{ maturityDate: { gte: targetDate, }, },
					],
					transferDate: null,
				},
				orderBy: {
					[filters.sortBy]: filters.sortOrder,
				},
				include: {
					bonds:     {
						where: {
							operation: filters.tradeOperation,
							...(filters.date && {
								valueDate: {
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
		],)

		const mappedBonds = bondAssets
			.filter((group,) => {
				return group.bonds.length
			},)
			.map((bond,) => {
				return {
					id:               bond.bonds[0].id,
					portfolioName:    this.cryptoService.decryptString(bond.portfolio.name,),
					entityName:      this.cryptoService.decryptString(bond.entity.name,),
					accountName:      this.cryptoService.decryptString(bond.account.accountName,),
					bankName:         bond.bank.bankName,
					currency:         bond.currency,
					isin:             bond.isin,
					security:         bond.security,
					yield:            bond.yield ?
						Number(bond.yield,) :
						0,
					profitUsd:        bond.profitUSD,
					profitPercentage: bond.profitPercentage,
					costPrice:        bond.costPrice,
					costValueUsd:     bond.costValueUSD,
					marketValueUsd:   bond.marketValueUSD,
					marketValueFC:    bond.marketValueFC,
					costValueFC:      bond.costValueFC,
					units:            bond.totalUnits,
					issuer:           bond.issuer ?? '- -',
					nextCouponDate:   bond.nextCouponDate ?
						bond.nextCouponDate.toISOString() :
						null,
					maturity:   bond.maturityDate ?
						bond.maturityDate.toISOString() :
						null,
					sector:           bond.sector ?? '- -',
					coupon:           bond.coupon ?? '- -',
					country:          bond.country ?? '- -',
					marketPrice:      bond.marketPrice,
					unitPrice:      bond.bonds[0].unitPrice,
					operation:	       AssetOperationType.BUY,
					valueDate:      bond.valueDate.toISOString(),
					currentAccrued:   bond.accrued,
					groupId:        bond.id,
					...(bond.bonds.length > 1 ?
						{assets:
					bond.bonds.map((item,) => {
						return {
							id:               item.id,
							portfolioName:    this.cryptoService.decryptString(bond.portfolio.name,),
							entityName:       this.cryptoService.decryptString(bond.entity.name,),
							accountName:      this.cryptoService.decryptString(bond.account.accountName,),
							bankName:         bond.bank.bankName,
							isin:             item.isin,
							security:         item.security,
							currency:         item.currency,
							yield:            Number(item.yield,),
							profitUsd:        item.profitUSD,
							profitPercentage: item.profitPercentage,
							costPrice:        item.costPrice,
							costValueUsd:     item.costValueUSD,
							marketValueUsd:   item.marketValueUSD,
							marketValueFC:    item.marketValueFC,
							costValueFC:      item.costValueFC,
							units:            item.units,
							nextCouponDate:   bond.nextCouponDate ?
								bond.nextCouponDate.toISOString() :
								null,
							maturity:   bond.maturityDate ?
								bond.maturityDate.toISOString() :
								null,
							issuer:           item.issuer ?? '- -',
							sector:           item.sector ?? '- -',
							coupon:           item.coupon ?? '- -',
							country:          item.country ?? '- -',
							marketPrice:      item.marketPrice,
							operation:	       item.operation as AssetOperationType,
							currentAccrued:   bond.accrued,
							unitPrice:      item.unitPrice,
							valueDate:      item.valueDate.toISOString(),
							groupId:        bond.id,
						}
					},),} :
						{}),
				}
			},)
		return {
			list:      mappedBonds,
		}
	}

	// public async getAllByFilters(filters: AnalyticsBondFilterDto, clientId?: string,): Promise<IBondsByFilters> {
	// 	const log = this.getTimestampLogger()
	// 	const assetsPromise = this.getFilteredAssets(filters, filters.assetIds, clientId,)
	// 	const bondsPromise = this.cBondsCurrencyService.getAllBondsWithHistory(filters.date,)
	// 	const currencyListService = this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,)
	// 	log('getAllByFilters','Start',)
	// 	const [assets, bonds, currencyList,] = await Promise.all([
	// 		assetsPromise,
	// 		bondsPromise,
	// 		currencyListService,
	// 	],)
	// 	log('getAllByFilters','After DB query',)
	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const assetPayload = assetParser<IBondsAsset>(asset,)
	// 			if (assetPayload) {
	// 				const {currency, isin, units, security, unitPrice, operation, valueDate,} = assetPayload
	// 				if (filters.currencies && !filters.currencies.includes(currency,)) {
	// 					return null
	// 				}
	// 				if (filters.tradeOperation && filters.tradeOperation !== operation) {
	// 					return null
	// 				}
	// 				if (filters.isins?.length && !filters.isins.includes(isin,)) {
	// 					return null
	// 				}
	// 				if (filters.securities?.length && !filters.securities.includes(security,)) {
	// 					return null
	// 				}
	// 				if (assetPayload.valueDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(assetPayload.valueDate,)) {
	// 					return null
	// 				}
	// 				const bond = bonds.find((bond,) => {
	// 					return bond.isin === assetPayload.isin
	// 				},)
	// 				const accountAssets = assets.filter((accountAsset,) => {
	// 					const accountAssetPayload = assetParser<IBondsAsset>(accountAsset,)
	// 					return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
	// 				},)
	// 				const totalValue = accountAssets.reduce((sum, a,) => {
	// 					const assetPayload = assetParser<IBondsAsset>(a,)
	// 					if (assetPayload?.operation === AssetOperationType.SELL) {
	// 						return sum
	// 					}
	// 					return assetPayload ?
	// 						sum + (assetPayload.unitPrice * assetPayload.units) :
	// 						sum
	// 				}, 0,)
	// 				const totalUnits = accountAssets.reduce((sum, a,) => {
	// 					const assetPayload = assetParser<IBondsAsset>(a,)
	// 					if (assetPayload?.operation === AssetOperationType.SELL) {
	// 						return sum
	// 					}
	// 					return assetPayload ?
	// 						sum + assetPayload.units :
	// 						sum
	// 				}, 0,)
	// 				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 					const assetPayload = assetParser<IBondsAsset>(a,)
	// 					if (assetPayload?.operation === AssetOperationType.SELL) {
	// 						return sum - assetPayload.units
	// 					}
	// 					return assetPayload ?
	// 						sum + assetPayload.units :
	// 						sum
	// 				}, 0,)
	// 				const costPrice = totalUnits > 0 ?
	// 					(totalValue / totalUnits).toFixed(2,) :
	// 					1
	// 				if ((!filters.tradeOperation && totalBuySellUnits <= 0) || !bond) {
	// 					return null
	// 				}
	// 				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
	// 					return null
	// 				}
	// 				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 					return item.currency === currency
	// 				},)

	// 				const rate = currencyData ?
	// 					filters.date ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						currencyData.rate :
	// 					asset.rate ?? 1
	// 				const dirtyPriceCurrency = filters.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].dirtyPriceCurrency ?
	// 						bond.bondHistory[0].dirtyPriceCurrency :
	// 						null :
	// 					bond.dirtyPriceCurrency ?
	// 						bond.dirtyPriceCurrency :
	// 						null

	// 				const nominalPrice = filters.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].nominalPrice ?
	// 						bond.bondHistory[0].nominalPrice :
	// 						null :
	// 					bond.nominalPrice ?
	// 						bond.nominalPrice :
	// 						null

	// 				const marketPrice = filters.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].marketPrice :
	// 					bond.marketPrice

	// 				const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 					isin,
	// 					units:              Number(units,),
	// 					dirtyPriceCurrency,
	// 					nominalPrice,
	// 					rate,
	// 					marketPrice,
	// 				},)
	// 				const costValueUsd = Number(units,) * Number(unitPrice,) * 10 * rate
	// 				const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 					isin,
	// 					units:              Number(units,),
	// 					dirtyPriceCurrency,
	// 					nominalPrice,
	// 					rate:               1,
	// 					marketPrice,
	// 				},)
	// 				const costValueFC = Number(units,) * Number(unitPrice,) * 10

	// 				const profitUsd = Number(marketValueUsd,) - Number(costValueUsd,)
	// 				const profitPercentage = (Number(bond.marketPrice,) - Number(costPrice,)) / Number(costPrice,) * 100
	// 				const assetYield = Number(bond.yield,) * 100
	// 				const currentAccrued = Number(bond.accrued,) / Number(bond.nominalPrice,) * Number(units,) * 1000 * rate

	// 				return {
	// 					id:             asset.id,
	// 					portfolioName:  asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entityName:     asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
	// 					accountName:    asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
	// 					bankName:       asset.bank?.bankName,
	// 					isin,
	// 					security,
	// 					currency,
	// 					units,
	// 					costPrice:      Number(costPrice,),
	// 					profitUsd,
	// 					profitPercentage,
	// 					costValueUsd,
	// 					marketPrice,
	// 					marketValueUsd,
	// 					marketValueFC,
	// 					costValueFC,
	// 					currentAccrued,
	// 					operation,
	// 					yield:          assetYield,
	// 					nextCouponDate: bond.nextCouponDate ?
	// 						String(bond.nextCouponDate,) :
	// 						null,
	// 					issuer:         bond.issuer,
	// 					maturity:       bond.maturityDate ?
	// 						String(bond.maturityDate,) :
	// 						null,
	// 					sector:         bond.sector,
	// 					coupon:         bond.coupon,
	// 					country:        bond.country,
	// 					unitPrice,
	// 					valueDate,
	// 				} as IAnalyticBond
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is IAnalyticBond => {
	// 			return item !== null
	// 		},)
	// 	const groupedAssets = Object.values(
	// 		analyticsData.reduce<Record<string, IAnalyticBondWithInnerAssets>>((acc, asset,) => {
	// 			const {
	// 				portfolioName,
	// 				entityName,
	// 				bankName,
	// 				accountName,
	// 				isin,
	// 				security,
	// 				profitUsd,
	// 				costValueUsd,
	// 				marketValueUsd,
	// 				nextCouponDate,
	// 				issuer,
	// 				maturity,
	// 				sector,
	// 				coupon,
	// 				country,
	// 				units,
	// 				costPrice,
	// 				operation,
	// 				profitPercentage,
	// 				marketPrice,
	// 				currentAccrued,
	// 				currency,
	// 				marketValueFC,
	// 				costValueFC,
	// 			} = asset
	// 			const key = `${portfolioName}-${entityName}-${bankName}-${accountName}-${isin}-${currency}`
	// 			if (!(key in acc)) {
	// 				acc[key] = {
	// 					id:               uuid4(),
	// 					portfolioName,
	// 					entityName,
	// 					bankName,
	// 					accountName,
	// 					isin,
	// 					security,
	// 					bondYeild:        asset.yield,
	// 					profitUsd:        0,
	// 					profitPercentage,
	// 					costValueUsd:     0,
	// 					marketValueUsd:   0,
	// 					units:            0,
	// 					currentAccrued: 0,
	// 					assets:           [],
	// 					nextCouponDate,
	// 					issuer,
	// 					maturity,
	// 					sector,
	// 					coupon,
	// 					country,
	// 					costPrice,
	// 					operation,
	// 					marketPrice,
	// 					marketValueFC:  0,
	// 					costValueFC:    0,
	// 				}
	// 			}
	// 			acc[key].profitUsd = acc[key].profitUsd + profitUsd
	// 			acc[key].costValueUsd = filters.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].costValueUsd + costValueUsd :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].costValueUsd + costValueUsd :
	// 					acc[key].costValueUsd - costValueUsd
	// 			acc[key].marketValueUsd = filters.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].marketValueUsd + marketValueUsd :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].marketValueUsd + marketValueUsd :
	// 					acc[key].marketValueUsd - marketValueUsd
	// 			acc[key].costValueFC = filters.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].costValueFC + costValueFC :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].costValueFC + costValueFC :
	// 					acc[key].costValueFC - costValueFC
	// 			acc[key].marketValueFC = filters.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].marketValueFC + marketValueFC :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].marketValueFC + marketValueFC :
	// 					acc[key].marketValueFC - marketValueFC
	// 			acc[key].currentAccrued = acc[key].currentAccrued + currentAccrued
	// 			acc[key].units = filters.tradeOperation === AssetOperationType.SELL ?
	// 				acc[key].units + units :
	// 				operation === AssetOperationType.BUY ?
	// 					acc[key].units + units :
	// 					acc[key].units - units
	// 			acc[key].assets.push(asset,)
	// 			return acc
	// 		}, {} ,),
	// 	)
	// 	groupedAssets.sort((a, b,) => {
	// 		const sortField = filters.sortBy as TBondTableSortVariants

	// 		if (!Object.values(TBondTableSortVariants,).includes(sortField,)) {
	// 			return 0
	// 		}

	// 		const order = filters.sortOrder === 'asc' ?
	// 			1 :
	// 			-1

	// 		const aValue = a[sortField]
	// 		const bValue = b[sortField]

	// 		if (typeof aValue === 'string' && typeof bValue === 'string') {
	// 			return aValue.localeCompare(bValue,) * order
	// 		}

	// 		if (typeof aValue === 'number' && typeof bValue === 'number') {
	// 			return (aValue - bValue) * order
	// 		}

	// 		return 0
	// 	},)
	// 	const finalAssets: Array<IAnalyticBond | IAnalyticBondWithInnerAssets> = groupedAssets.map((group,) => {
	// 		if (group.assets.length === 1) {
	// 			return {
	// 				...group.assets[0],
	// 				costPrice: group.assets[0].unitPrice,
	// 			} as IAnalyticBond
	// 		}
	// 		const totalAccrued = group.assets.reduce((sum, asset,) => {
	// 			return sum + asset.currentAccrued
	// 		}, 0,)
	// 		const normalizedAssets = group.assets.map((asset,) => {
	// 			const profitPercentage = (Number(asset.marketPrice,) - Number(asset.unitPrice,)) / Number(asset.unitPrice,) * 100

	// 			return {
	// 				...asset,
	// 				costPrice: asset.unitPrice,
	// 				profitPercentage,
	// 			}
	// 		},)
	// 		return {
	// 			id:               group.id,
	// 			portfolioName:    group.portfolioName,
	// 			entityName:       group.entityName,
	// 			bankName:         group.bankName,
	// 			accountName: 		   group.accountName,
	// 			isin:             group.isin,
	// 			security:         group.security,
	// 			profitUsd:        group.profitUsd,
	// 			profitPercentage: group.profitPercentage,
	// 			costValueUsd:     group.costValueUsd,
	// 			marketValueUsd:   group.marketValueUsd,
	// 			costValueFC:      group.costValueFC,
	// 			marketValueFC:    group.marketValueFC,
	// 			yield:            group.bondYeild,
	// 			assets:           normalizedAssets,
	// 			nextCouponDate:   group.nextCouponDate,
	// 			issuer:           group.issuer,
	// 			maturity:         group.maturity,
	// 			sector:           group.sector,
	// 			coupon:           group.coupon,
	// 			country:          group.country,
	// 			units:            group.units,
	// 			costPrice:        group.costPrice,
	// 			operation:        AssetOperationType.BUY,
	// 			marketPrice:      group.marketPrice,
	// 			currentAccrued:   totalAccrued,
	// 		} as unknown as IAnalyticBondWithInnerAssets
	// 	},)
	// 	finalAssets.sort((a, b,) => {
	// 		const sortField = filters.sortBy as TBondTableSortVariants

	// 		if (!Object.values(TBondTableSortVariants,).includes(sortField,)) {
	// 			return 0
	// 		}

	// 		const order = filters.sortOrder === 'asc' ?
	// 			1 :
	// 			-1

	// 		const aValue = a[sortField]
	// 		const bValue = b[sortField]

	// 		if (typeof aValue === 'string' && typeof bValue === 'string') {
	// 			return aValue.localeCompare(bValue,) * order
	// 		}

	// 		if (typeof aValue === 'number' && typeof bValue === 'number') {
	// 			return (aValue - bValue) * order
	// 		}

	// 		return 0
	// 	},)
	// 	return {
	// 		list:      finalAssets,
	// 	}
	// }

	/**
 * 3.5.5
 * Retrieves bond bank analytics based on the provided filter criteria.
 *
 * @remarks
 * - Filters bond assets based on `currencies` and `assetIds`.
 * - Parses the `payload` field of each asset to extract relevant bond details.
 * - Matches assets with bond data from the database.
 * - Calculates the market value of bonds in USD based on `isin` and `units`.
 * - Groups data by banks, associating each asset with its respective bank.
 * - Filters out assets that do not match the provided currency filter.
 *
 * @param {LoanCurrencyFilterDto} filter - The filter criteria for bond bank analytics.
 * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bond bank analytics data.
 */
	// New version after refactor
	public async getBondsBankAnalytics(filters: BondsCurrencyFilterDto, clientId?: string,): Promise<Array<TBankAnalytics>> {
		const targetDate = filters.date ?
			new Date(filters.date,) :
			new Date()
		if (filters.date) {
			const [bondAssets, bonds, currencyList,] = await Promise.all([
				this.prismaService.assetBondGroup.findMany({
					where: {
						clientId:    {in: filters.clientIds,},
						portfolioId:  { in: filters.portfolioIds, },
						entityId:    { in: filters.entitiesIds, },
						accountId:   { in: filters.accountIds,},
						bankId:      {in: filters.bankIds,},
						...(clientId ?
							{
								client: {
									id: clientId,
								},
							} :
							{}),
						bank: {
							is: {
								bankListId: {in: filters.bankListIds,},
							},
						},
						portfolio: {
							isActivated: true,
						},
						totalUnits: {
							gt: 0,
						},
						marketPrice: {
							not: 0,
						},
						OR: [
							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
							{ transferDate: null, },
						],
					},
					include: {
						bonds:     {
							where: {
								operation:         filters.tradeOperation,
								OR:        [
									{
										assetBondVersions: {
											none: {},
										},
										...(filters.assetIds?.length ?
											{ id: { in: filters.assetIds, }, } :
											{}),
										units:       { gt: 0, },
										marketPrice: { not: 0, },
										isin:        { in: filters.isins, },
										security:    { in: filters.securities, },
										currency:    { in: filters.currencies, },
										AND:         [
											{
												valueDate: {
													lte: endOfDay(targetDate,),
												},
											},
											{
												OR: [
													{ maturityDate: null, },
													{ maturityDate: { gte: endOfDay(targetDate,), }, },
												],
											},
										],
									},
									{
										assetBondVersions: {
											some: {
												...(filters.assetIds?.length ?
													{ id: { in: filters.assetIds, }, } :
													{}),
												units:       { gt: 0, },
												marketPrice: { not: 0, },
												isin:        { in: filters.isins, },
												security:    { in: filters.securities, },
												currency:    { in: filters.currencies, },
												AND:         [
													{
														valueDate: {
															lte: endOfDay(targetDate,),
														},
													},
													{
														OR: [
															{ maturityDate: null, },
															{ maturityDate: { gte: endOfDay(targetDate,), }, },
														],
													},
												],
											},

										},
									},
								],
							},
							include: {
								assetBondVersions: {
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
										account:   { select: { accountName: true, }, },
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
				this.cBondsCurrencyService.getAllBondsWithHistory(filters.date,),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
			],)
			const analyticsData = bondAssets
				.map((group,) => {
					return {
						...group,
						bonds: group.bonds.map((b,) => {
							if (b.assetBondVersions.length > 0) {
								return {
									...b.assetBondVersions[0],
									mainAssetId: b.id,
								}
							}
							return {
								...b,
								mainAssetId: undefined,
							}
						},),
					}
				},)
				.filter((group,) => {
					return group.bonds.length
				},)
				.map((bond,) => {
					const filteredUnits = bond.bonds.reduce((sum, b,) => {
						if (b.operation === AssetOperationType.SELL) {
							return sum - Number(b.units,)
						}
						return sum + Number(b.units,)
					}, 0,)
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === bond.currency
					},)
					const bondData = bonds.find((item,) => {
						return item.isin === bond.isin
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const dirtyPriceCurrency = bondData && bondData.bondHistory[0] ?
						bondData.bondHistory[0].dirtyPriceCurrency ?
							bondData.bondHistory[0].dirtyPriceCurrency :
							null :
						bondData?.dirtyPriceCurrency ?
							bondData.dirtyPriceCurrency :
							null

					const nominalPrice = bondData && bondData.bondHistory[0] ?
						bondData.bondHistory[0].nominalPrice ?
							bondData.bondHistory[0].nominalPrice :
							null :
						bondData?.nominalPrice ?
							bondData.nominalPrice :
							null

					const rawMarketPrice = bondData && bondData.bondHistory[0] ?
						bondData.bondHistory[0].marketPrice :
						bondData?.marketPrice ?? bond.marketPrice
					const marketPrice = parseFloat(rawMarketPrice.toFixed(2,),)
					const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin:  bond.isin,
						units:              Number(filteredUnits,),
						dirtyPriceCurrency,
						nominalPrice,
						rate,
						marketPrice,
					},)
					return {
						id:          bond.bank.bankListId ?? bond.bank.bankList?.id ?? '',
						bankName:    bond.bank.bankName,
						usdValue:    marketValueUsd,
					}
				},)
			return analyticsData
		}

		const [bondAssets,] = await Promise.all([
			this.prismaService.assetBondGroup.findMany({
				where: {
					clientId:    {in: filters.clientIds,},
					portfolioId:  { in: filters.portfolioIds, },
					entityId:    { in: filters.entitiesIds, },
					accountId:   { in: filters.accountIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filters.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					marketPrice: {
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
					OR: [
						{ maturityDate: null, },
						{ maturityDate: { gte: targetDate, }, },
					],
					transferDate: null,
				},
				include: {
					bonds:     {
						where: {
							operation: filters.tradeOperation,
							...(filters.date && {
								valueDate: {
									lte: endOfDay(new Date(filters.date,),),
								},
							}),
							...(filters.assetIds?.length ?
								{ id: { in: filters.assetIds, }, } :
								{}),
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

		const analyticsData = bondAssets
			.filter((group,) => {
				return group.bonds.length
			},)
			.map((bond,) => {
				const usdValue = bond.bonds.reduce<number>((acc, item,) => {
					if (item.operation === AssetOperationType.SELL) {
						return acc - item.marketValueUSD
					}
					return acc + item.marketValueUSD
				}, 0,)
				return {
					id:          bond.bank.bankListId ?? bond.bank.bankList?.id ?? '',
					bankName:    bond.bank.bankName,
					usdValue,
				}
			},)

		return analyticsData
	}

	// public async getBondsBankAnalytics(filter: BondsCurrencyFilterDto, clientId?: string,): Promise<Array<TBankAnalytics>> {
	// 	const log = this.getTimestampLogger()
	// 	log('getBondsBankAnalytics','Start',)

	// 	const assetsPromise = this.getFilteredAssets(filter, filter.assetIds, clientId,)
	// 	const bondsPromise = this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,)
	// 	const currencyListService = this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,)

	// 	const [assets, bonds, currencyList,] = await Promise.all([
	// 		assetsPromise,
	// 		bondsPromise,
	// 		currencyListService,
	// 	],)
	// 	log('getBondsBankAnalytics','After DB query',)

	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const parsedPayload = assetParser<IBondsAsset>(asset,)

	// 			if (parsedPayload) {
	// 				const {isin, units, operation, currency, security, valueDate, unitPrice,} = parsedPayload
	// 				const bond = bonds.find((bond,) => {
	// 					return bond.isin === isin
	// 				},)
	// 				if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
	// 					return null
	// 				}
	// 				if (filter.isins?.length && !filter.isins.includes(isin,)) {
	// 					return null
	// 				}
	// 				if (filter.securities?.length && !filter.securities.includes(security,)) {
	// 					return null
	// 				}
	// 				if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 					return null
	// 				}
	// 				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
	// 					return null
	// 				}
	// 				if (unitPrice === 0) {
	// 					return null
	// 				}
	// 				const accountAssets = assets.filter((accountAsset,) => {
	// 					const accountAssetPayload = assetParser<IBondsAsset>(accountAsset,)
	// 					return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
	// 				},)
	// 				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 					const assetPayload = assetParser<IBondsAsset>(a,)
	// 					if (assetPayload?.operation === AssetOperationType.SELL) {
	// 						return sum - assetPayload.units
	// 					}
	// 					return assetPayload ?
	// 						sum + assetPayload.units :
	// 						sum
	// 				}, 0,)
	// 				if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0) || !bond) {
	// 					return null
	// 				}
	// 				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
	// 					return null
	// 				}
	// 				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 					return item.currency === currency
	// 				},)

	// 				const rate = currencyData ?
	// 					filter.date ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						currencyData.rate :
	// 					asset.rate ?? 1
	// 				const dirtyPriceCurrency = filter.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].dirtyPriceCurrency ?
	// 						bond.bondHistory[0].dirtyPriceCurrency :
	// 						null :
	// 					bond.dirtyPriceCurrency ?
	// 						bond.dirtyPriceCurrency :
	// 						null
	// 				const nominalPrice = filter.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].nominalPrice ?
	// 						bond.bondHistory[0].nominalPrice :
	// 						null :
	// 					bond.nominalPrice ?
	// 						bond.nominalPrice :
	// 						null

	// 				const marketPrice = filter.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].marketPrice :
	// 					bond.marketPrice
	// 				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 					isin,
	// 					units:              Number(units,),
	// 					dirtyPriceCurrency,
	// 					nominalPrice,
	// 					rate,
	// 					marketPrice,
	// 				},)
	// 				return {
	// 					id:       asset.bank?.bankListId,
	// 					bankName: asset.bank?.bankList?.name ?? asset.bank?.bankName,
	// 					usdValue: filter.tradeOperation === AssetOperationType.SELL ?
	// 						usdValue :
	// 						operation === AssetOperationType.BUY ?
	// 							usdValue :
	// 							-usdValue,
	// 				}
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.filter((item,) => {
	// 			return item.usdValue !== 0
	// 		},)
	// 	log('getBondsBankAnalytics','After computing (map)',)
	// 	return analyticsData
	// }

	/**
 * 3.5.5
 * Retrieves bond currency analytics based on the provided filter criteria.
 *
 * @remarks
 * - Filters bond assets based on `currencies` and `assetIds`.
 * - Parses the `payload` field of each asset to extract relevant bond details.
 * - Matches assets with bond data from the database.
 * - Calculates the market value of bonds in USD based on `isin` and `units`.
 * - Filters out assets that do not match the provided currency filter.
 *
 * @param {LoanCurrencyFilterDto} filter - The filter criteria for bond currency analytics.
 * @returns {Promise<Array<TBondsCurrencyAnalytics>>} - A Promise resolving to an array of bond currency analytics data.
 */
	// New version after refactor
	public async getBondsCurrencyAnalytics(filters: BondsCurrencyFilterDto, clientId?: string,): Promise<Array<TBondsCurrencyAnalytics>> {
		const targetDate = filters.date ?
			new Date(filters.date,) :
			new Date()
		if (filters.date) {
			const [bondAssets, bonds, currencyList,] = await Promise.all([
				this.prismaService.assetBondGroup.findMany({
					where: {
						clientId:    {in: filters.clientIds,},
						portfolioId:  { in: filters.portfolioIds, },
						entityId:    { in: filters.entitiesIds, },
						accountId:   { in: filters.accountIds,},
						bankId:      {in: filters.bankIds,},
						...(clientId ?
							{
								client: {
									id: clientId,
								},
							} :
							{}),
						bank: {
							is: {
								bankListId: {in: filters.bankListIds,},
							},
						},
						portfolio: {
							isActivated: true,
						},
						totalUnits: {
							gt: 0,
						},
						marketPrice: {
							not: 0,
						},
						OR: [
							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
							{ transferDate: null, },
						],
					},
					include: {
						bonds:     {
							where: {
								operation:         filters.tradeOperation,
								OR:        [
									{
										assetBondVersions: {
											none: {},
										},
										...(filters.assetIds?.length ?
											{ id: { in: filters.assetIds, }, } :
											{}),
										units:       { gt: 0, },
										marketPrice: { not: 0, },
										isin:        { in: filters.isins, },
										security:    { in: filters.securities, },
										currency:    { in: filters.currencies, },
										AND:         [
											{
												valueDate: {
													lte: endOfDay(targetDate,),
												},
											},
											{
												OR: [
													{ maturityDate: null, },
													{ maturityDate: { gte: endOfDay(targetDate,), }, },
												],
											},
										],
									},
									{
										assetBondVersions: {
											some: {
												...(filters.assetIds?.length ?
													{ id: { in: filters.assetIds, }, } :
													{}),
												units:       { gt: 0, },
												marketPrice: { not: 0, },
												isin:        { in: filters.isins, },
												security:    { in: filters.securities, },
												currency:    { in: filters.currencies, },
												AND:         [
													{
														valueDate: {
															lte: endOfDay(targetDate,),
														},
													},
													{
														OR: [
															{ maturityDate: null, },
															{ maturityDate: { gte: endOfDay(targetDate,), }, },
														],
													},
												],
											},

										},
									},
								],
							},
							include: {
								assetBondVersions: {
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
										account:   { select: { accountName: true, }, },
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
				this.cBondsCurrencyService.getAllBondsWithHistory(filters.date,),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
			],)

			const analyticsData = bondAssets
				.map((group,) => {
					return {
						...group,
						bonds: group.bonds.map((b,) => {
							if (b.assetBondVersions.length > 0) {
								return {
									...b.assetBondVersions[0],
									mainAssetId: b.id,
								}
							}
							return {
								...b,
								mainAssetId: undefined,
							}
						},),
					}
				},)
				.filter((group,) => {
					return group.bonds.length
				},)
				.map((bond,) => {
					const filteredUnits = bond.bonds.reduce((sum, b,) => {
						if (b.operation === AssetOperationType.SELL) {
							return sum - Number(b.units,)
						}
						return sum + Number(b.units,)
					}, 0,)
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === bond.currency
					},)
					const bondData = bonds.find((item,) => {
						return item.isin === bond.isin
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const dirtyPriceCurrency = bondData?.bondHistory[0] ?
						bondData.bondHistory[0].dirtyPriceCurrency ?
							bondData.bondHistory[0].dirtyPriceCurrency :
							null :
						bondData?.dirtyPriceCurrency ?
							bondData.dirtyPriceCurrency :
							null

					const nominalPrice = bondData?.bondHistory[0] ?
						bondData.bondHistory[0].nominalPrice ?
							bondData.bondHistory[0].nominalPrice :
							null :
						bondData?.nominalPrice ?
							bondData.nominalPrice :
							null

					const rawMarketPrice = bondData?.bondHistory[0] ?
						bondData.bondHistory[0].marketPrice :
						bondData?.marketPrice ?? bond.marketPrice

					const marketPrice = parseFloat(rawMarketPrice.toFixed(2,),)
					const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin:  bond.isin,
						units:              Number(filteredUnits,),
						dirtyPriceCurrency,
						nominalPrice,
						rate,
						marketPrice,
					},)
					return {
						currency: bond.currency,
						usdValue:    marketValueUsd,
					}
				},)

			return analyticsData
		}
		const [bondAssets,] = await Promise.all([
			this.prismaService.assetBondGroup.findMany({
				where: {
					clientId:    {in: filters.clientIds,},
					portfolioId:  { in: filters.portfolioIds, },
					entityId:    { in: filters.entitiesIds, },
					accountId:   { in: filters.accountIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filters.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					marketPrice: {
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
					OR: [
						{ maturityDate: null, },
						{ maturityDate: { gte: targetDate, }, },
					],
					transferDate: null,
				},
				include: {
					bonds:     {
						where: {
							...(filters.assetIds?.length ?
								{ id: { in: filters.assetIds, }, } :
								{}),
							operation: filters.tradeOperation,
							...(filters.date && {
								valueDate: {
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

		const analyticsData = bondAssets
			.filter((group,) => {
				return group.bonds.length
			},)
			.map((bond,) => {
				const usdValue = bond.bonds.reduce<number>((acc, item,) => {
					if (item.operation === AssetOperationType.SELL) {
						return acc - item.marketValueUSD
					}
					return acc + item.marketValueUSD
				}, 0,)
				return {
					currency: bond.currency,
					usdValue,
				}
			},)

		return analyticsData
	}

	// public async getBondsCurrencyAnalytics(filter: BondsCurrencyFilterDto, clientId?: string,): Promise<Array<TBondsCurrencyAnalytics>> {
	// 	const log = this.getTimestampLogger()
	// 	log('getBondsCurrencyAnalytics','Start',)
	// 	const assetsPromise = this.getFilteredAssets(filter, filter.assetIds, clientId,)
	// 	const bondsPromise = this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,)
	// 	const currencyListService = this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,)

	// 	const [assets, bonds, currencyList,] = await Promise.all([
	// 		assetsPromise,
	// 		bondsPromise,
	// 		currencyListService,
	// 	],)
	// 	log('getBondsCurrencyAnalytics','After DB query',)

	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const parsedPayload = assetParser<IBondsAsset>(asset,)
	// 			if (parsedPayload) {
	// 				const {isin, units, currency, operation, security, valueDate, unitPrice,} = parsedPayload
	// 				if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 					return null
	// 				}
	// 				if (filter.isins?.length && !filter.isins.includes(isin,)) {
	// 					return null
	// 				}
	// 				if (filter.securities?.length && !filter.securities.includes(security,)) {
	// 					return null
	// 				}
	// 				if (filter.tradeOperation && filter.tradeOperation !== operation) {
	// 					return null
	// 				}
	// 				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
	// 					return null
	// 				}
	// 				if (unitPrice === 0) {
	// 					return null
	// 				}
	// 				const bond = bonds.find((bond,) => {
	// 					return bond.isin === isin
	// 				},)
	// 				const accountAssets = assets.filter((accountAsset,) => {
	// 					const accountAssetPayload = assetParser<IBondsAsset>(accountAsset,)
	// 					return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
	// 				},)
	// 				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 					const assetPayload = assetParser<IBondsAsset>(a,)
	// 					if (assetPayload?.operation === AssetOperationType.SELL) {
	// 						return sum - assetPayload.units
	// 					}
	// 					return assetPayload ?
	// 						sum + assetPayload.units :
	// 						sum
	// 				}, 0,)
	// 				if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0) || !bond) {
	// 					return null
	// 				}
	// 				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
	// 					return null
	// 				}
	// 				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 					return item.currency === currency
	// 				},)

	// 				const rate = currencyData ?
	// 					filter.date ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						currencyData.rate :
	// 					asset.rate ?? 1

	// 				const dirtyPriceCurrency = filter.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0]?.dirtyPriceCurrency ?
	// 						bond.bondHistory[0].dirtyPriceCurrency :
	// 						null :
	// 					bond.dirtyPriceCurrency ?
	// 						bond.dirtyPriceCurrency :
	// 						null

	// 				const nominalPrice = filter.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].nominalPrice ?
	// 						bond.bondHistory[0].nominalPrice :
	// 						null :
	// 					bond.nominalPrice ?
	// 						bond.nominalPrice :
	// 						null

	// 				const marketPrice = filter.date && bond.bondHistory[0] ?
	// 					bond.bondHistory[0].marketPrice :
	// 					bond.marketPrice
	// 				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 					isin,
	// 					units:              Number(units,),
	// 					dirtyPriceCurrency,
	// 					nominalPrice,
	// 					rate,
	// 					marketPrice,
	// 				},)
	// 				return {
	// 					currency,
	// 					usdValue: filter.tradeOperation === AssetOperationType.SELL ?
	// 						usdValue :
	// 						operation === AssetOperationType.BUY ?
	// 							usdValue :
	// 							-usdValue,
	// 				} as TBondsCurrencyAnalytics
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is TBondsCurrencyAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.filter((item,) => {
	// 			return item.usdValue !== 0
	// 		},)
	// 	log('getBondsCurrencyAnalytics','After computing (map)',)

	// 	return analyticsData
	// }

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
	public async getFilteredAssets(filter: BondsCurrencyFilterDto, assetIds?: Array<string>, clientId?: string,): Promise<Array<TAssetExtended>> {
		const where: Prisma.AssetWhereInput = {
			isArchived:  false,
			assetName:   filter.type,
			portfolioId: {in: filter.portfolioIds,},
			entityId:    {in: filter.entitiesIds,},
			bankId:      {	in: filter.bankIds,},
			accountId:   { in: filter.accountIds, },
			bank:        {
				is: {
					bankListId: { in: filter.bankListIds, },
				},
			},
			...(assetIds?.length ?
				{ id: { in: assetIds, }, } :
				{}),
			clientId:    {
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
			include: {
				portfolio: true,
				account:   true,
				entity:    true,
				bank:      {include: { bankList: true, },},
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
	public syncGetAllByFilters(data: TBondInitials, filters: AnalyticsBondFilterDto, clientId?: string,): IBondsByFilters {
		const {assets, bonds, currencyList,costHistoryCurrencyList, } = data

		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const assetPayload = assetParser<IBondsAsset>(asset,)
				if (assetPayload) {
					const {currency, isin, units, security, unitPrice, operation, valueDate,} = assetPayload
					if (filters.currencies && !filters.currencies.includes(currency,)) {
						return null
					}
					if (filters.tradeOperation && filters.tradeOperation !== operation) {
						return null
					}
					if (filters.isins?.length && !filters.isins.includes(isin,)) {
						return null
					}
					if (filters.securities?.length && !filters.securities.includes(security,)) {
						return null
					}
					if (valueDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(valueDate,)) {
						return null
					}
					if (unitPrice === 0) {
						return null
					}
					const bond = bonds.find((bond,) => {
						return bond.isin === isin
					},)
					const accountAssets: Array<TAssetExtended> = assets.filter((accountAsset,) => {
						const accountAssetPayload = assetParser<IBondsAsset>(accountAsset,)
						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
					},)
					const totalValue = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IBondsAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum
						}
						return assetPayload ?
							sum + (assetPayload.unitPrice * assetPayload.units) :
							sum
					}, 0,)
					const totalUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IBondsAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IBondsAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum - assetPayload.units
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					if ((!filters.tradeOperation && totalBuySellUnits <= 0) || !bond) {
						return null
					}
					if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
						return null
					}
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
					const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units:              Number(units,),
						dirtyPriceCurrency: bond.dirtyPriceCurrency,
						nominalPrice:       bond.nominalPrice,
						rate,
						marketPrice:        bond.marketPrice,
					},)
					const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units:              Number(units,),
						dirtyPriceCurrency: bond.dirtyPriceCurrency,
						nominalPrice:       bond.nominalPrice,
						rate:               1,
						marketPrice:        bond.marketPrice,
					},)
					const costRateDate = new Date(valueDate,)
					const costCurrencyData = (costHistoryCurrencyList
						.filter((item,) => {
							return new Date(item.date,).getTime() <= costRateDate.getTime() && currencyData?.id === item.currencyId
						},)
						.sort((a, b,) => {
							return new Date(b.date,).getTime() - new Date(a.date,).getTime()
						},)[0]) as CurrencyHistoryData | undefined
					const costValueFC = (units * unitPrice * 10) + (assetPayload.accrued)
					const costValueUsd = costValueFC * (costCurrencyData?.rate ?? rate)
					const profitUsd = Number(marketValueUsd,) - Number(costValueUsd,)
					const profitPercentage = (Number(bond.marketPrice,) - Number(costPrice,)) / Number(costPrice,) * 100
					const assetYield = Number(bond.yield,) * 100
					const currentAccrued = Number(bond.accrued,) / Number(bond.nominalPrice,) * Number(units,) * 1000 * rate
					return {
						id:             asset.id,
						portfolioName:  asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:     asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
						accountName:    asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
						bankName:       asset.bank?.bankName,
						isin,
						security,
						currency,
						units,
						costPrice:      Number(costPrice,),
						profitUsd,
						profitPercentage,
						costValueUsd,
						marketPrice:    Number(bond.marketPrice,),
						marketValueUsd,
						marketValueFC,
						costValueFC,
						currentAccrued,
						operation,
						yield:          assetYield,
						nextCouponDate: bond.nextCouponDate ?
							String(bond.nextCouponDate,) :
							null,
						issuer:         bond.issuer,
						maturity:       bond.maturityDate ?
							String(bond.maturityDate,) :
							null,
						sector:         bond.sector,
						coupon:         bond.coupon,
						country:        bond.country,
						unitPrice,
						valueDate,
					} as IAnalyticBond
				}
				return null
			},)
			.filter((item,): item is IAnalyticBond => {
				return item !== null
			},)

		const groupedAssets = Object.values(
			analyticsData.reduce<Record<string, IAnalyticBondWithInnerAssets>>((acc, asset,) => {
				const {
					portfolioName,
					entityName,
					bankName,
					accountName,
					isin,
					security,
					profitUsd,
					costValueUsd,
					marketValueUsd,
					nextCouponDate,
					issuer,
					maturity,
					sector,
					coupon,
					country,
					units,
					costPrice,
					operation,
					profitPercentage,
					marketPrice,
					currentAccrued,
					currency,
					marketValueFC,
					costValueFC,
				} = asset
				const key = `${portfolioName}-${entityName}-${bankName}-${accountName}-${isin}-${currency}`
				if (!(key in acc)) {
					acc[key] = {
						id:               uuid4(),
						portfolioName,
						entityName,
						bankName,
						accountName,
						isin,
						security,
						yield:          asset.yield,
						profitUsd:        0,
						profitPercentage,
						costValueUsd:     0,
						marketValueUsd:   0,
						units:            0,
						currentAccrued: 0,
						assets:           [],
						nextCouponDate,
						issuer,
						maturity,
						sector,
						coupon,
						country,
						costPrice,
						operation,
						marketPrice,
						marketValueFC:  0,
						costValueFC:    0,
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
				acc[key].currentAccrued = acc[key].currentAccrued + currentAccrued
				acc[key].units = operation === AssetOperationType.BUY ?
					acc[key].units + units :
					acc[key].units - units
				acc[key].assets.push(asset,)
				return acc
			}, {} ,),
		)
		// groupedAssets.sort((a, b,) => {
		// 	const sortField = filters.sortBy as TBondTableSortVariants

		// 	if (!Object.values(TBondTableSortVariants,).includes(sortField,)) {
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
		const finalAssets: Array<IAnalyticBond | IAnalyticBondWithInnerAssets> = groupedAssets.map((group,) => {
			if (group.assets.length === 1) {
				return {
					...group.assets[0],
					costPrice: group.assets[0].unitPrice,
				} as IAnalyticBond
			}
			const totalAccrued = group.assets.reduce((sum, asset,) => {
				return sum + asset.currentAccrued
			}, 0,)
			const normalizedAssets = group.assets.map((asset,) => {
				const profitPercentage = (Number(asset.marketPrice,) - Number(asset.unitPrice,)) / Number(asset.unitPrice,) * 100

				return {
					...asset,
					costPrice:    asset.unitPrice,
					profitPercentage,
				}
			},)
			return {
				id:               group.id,
				portfolioName:    group.portfolioName,
				entityName:       group.entityName,
				bankName:         group.bankName,
				accountName: 		   group.accountName,
				isin:             group.isin,
				security:         group.security,
				profitUsd:        group.profitUsd,
				profitPercentage: group.profitPercentage,
				costValueUsd:     group.costValueUsd,
				marketValueUsd:   group.marketValueUsd,
				costValueFC:      group.costValueFC,
				marketValueFC:    group.marketValueFC,
				yield:            group.yield,
				assets:           normalizedAssets,
				nextCouponDate:   group.nextCouponDate,
				issuer:           group.issuer,
				maturity:         group.maturity,
				sector:           group.sector,
				coupon:           group.coupon,
				country:          group.country,
				units:            group.units,
				costPrice:        group.costPrice,
				operation:        AssetOperationType.BUY,
				marketPrice:      group.marketPrice,
				currentAccrued:   totalAccrued,
			} as unknown as IAnalyticBondWithInnerAssets
		},)
		// finalAssets.sort((a, b,) => {
		// 	const sortField = filters.sortBy as TBondTableSortVariants
		// 	if (!Object.values(TBondTableSortVariants,).includes(sortField,)) {
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
	public syncGetBondsBankAnalytics(data: TBondInitials,filter: BondsCurrencyFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets, bonds, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IBondsAsset>(asset,)
				if (parsedPayload) {
					const {isin, units, operation, currency, security, valueDate, unitPrice,} = parsedPayload
					const bond = bonds.find((bond,) => {
						return bond.isin === isin
					},)
					if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
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
					if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
						return null
					}
					if (unitPrice === 0) {
						return null
					}
					const accountAssets = assets.filter((accountAsset,) => {
						const accountAssetPayload = assetParser<IBondsAsset>(accountAsset,)
						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
					},)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IBondsAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum - assetPayload.units
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0) || !bond) {
						return null
					}
					if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
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
					const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units:              Number(units,),
						dirtyPriceCurrency: bond.dirtyPriceCurrency,
						nominalPrice:       bond.nominalPrice,
						rate,
						marketPrice:        bond.marketPrice,
					},)
					return {
						id:       asset.bank?.bankListId,
						bankName: asset.bank?.bankList?.name ?? asset.bank?.bankName,
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
	public syncGetBondsCurrencyAnalytics(data: TBondInitials,filter: BondsCurrencyFilterDto, clientId?: string,): Array<TBondsCurrencyAnalytics> {
		const {assets, bonds, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IBondsAsset>(asset,)
				if (parsedPayload) {
					const {isin, units, currency, operation, security, valueDate, unitPrice,} = parsedPayload
					const bond = bonds.find((bond,) => {
						return bond.isin === isin
					},)
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
					if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
						return null
					}
					if (unitPrice === 0) {
						return null
					}
					const accountAssets = assets.filter((accountAsset,) => {
						const accountAssetPayload = assetParser<IBondsAsset>(accountAsset,)
						return accountAsset.accountId === asset.accountId && accountAssetPayload?.isin === isin && accountAssetPayload.currency === currency
					},)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const assetPayload = assetParser<IBondsAsset>(a,)
						if (assetPayload?.operation === AssetOperationType.SELL) {
							return sum - assetPayload.units
						}
						return assetPayload ?
							sum + assetPayload.units :
							sum
					}, 0,)
					if ((!filter.tradeOperation && !filter.assetIds && totalBuySellUnits <= 0) || !bond) {
						return null
					}
					if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
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
					const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units:              Number(units,),
						dirtyPriceCurrency: bond.dirtyPriceCurrency,
						nominalPrice:       bond.nominalPrice,
						rate,
						marketPrice:        bond.marketPrice,
					},)
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