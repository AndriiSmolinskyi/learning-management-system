/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-unused-vars */
/* eslint-disable max-depth */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable max-lines */
import {CustomPrismaService, PrismaService,} from 'nestjs-prisma'
import {HttpException, HttpStatus,  Inject,  Injectable, Logger,} from '@nestjs/common'
import {ERROR_MESSAGES, THIRD_PARTY_PRISMA_SERVICE,} from '../../shared/constants'
import {CBondsCurrencyService,} from '../../modules/apis/cbonds-api/services'
import {AssetOperationType, CryptoType, MetalType,} from '../../shared/types'
import type {
	Asset,
	AssetBond,
	AssetBondGroup,
	AssetCash,
	AssetCrypto,
	AssetCryptoGroup,
	AssetDeposit,
	AssetEquity,
	AssetEquityGroup,
	AssetLoan,
	AssetMetal,
	AssetMetalGroup,
	AssetOption,
	AssetOtherInvestment,
	AssetPrivateEquity,
	AssetRealEstate,
} from '@prisma/client'
import type { Prisma,} from '@prisma/client'
import { CurrencyDataList, EquityType, LogActionType, LogInstanceType, MetalDataList,} from '@prisma/client'
import type {
	IBondsAsset,
	ICollateralAsset,
	ICryptoAsset,
	IDepositAsset,
	IEquityAsset,
	IGetTotalByAssetListsCBondsParted,
	ILoanAsset,
	IMetalsAsset,
	IOptionAsset,
	IOtherAsset,
	IPrivateAsset,
	IRealEstateAsset,
	TAssetExtended,
} from '../../modules/asset/asset.types'
import {AssetNamesType,} from '../../modules/asset/asset.types'
import type {CreateAssetDto,} from '../../modules/asset/dto'
import {RedisCacheService,} from '../../modules/redis-cache/redis-cache.service'
import {PortfolioRoutes,} from '../../modules/portfolio/portfolio.constants'
import type {TCurrencyDataWithHistory,} from '../../modules/apis/cbonds-api/cbonds-api.types'
import { CryptoService, } from '../../modules/crypto/crypto.service'
import type { PrismaClient as ThirdPartyPrismaClient,} from '@third-party-prisma/client'
import type { TUsdTotals, } from '../../modules/analytics/analytics.types'
import { BudgetRoutes, } from '../../modules/budget/budget.constants'
import { formatDateDDMMYYYY, } from '../../shared/utils/date-formatter.util'
import { HttpStatusCode, } from 'axios'
import { cacheKeysToDeleteAsset, } from '../../modules/asset/asset.constants'
import { isSameDay, } from 'date-fns'
import type { UpdateAssetDto, } from '../../modules/asset/dto'

@Injectable()
export class AssetRepository {
	public readonly logger = new Logger(AssetRepository.name,)

	constructor(
		@Inject(THIRD_PARTY_PRISMA_SERVICE,)
		private readonly thirdPartyPrismaService: CustomPrismaService<ThirdPartyPrismaClient>,
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
		 * Creates a new asset entry in the database.
		 * @param data - The data required to create a new asset. This includes fields like `name`, `portfolioId`, and `value`.
		 * @returns A Promise that resolves to the newly created asset.
		 */
	public async createAsset(data: CreateAssetDto,): Promise<Asset> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, } = data
		const parsedPayload = JSON.parse(payload,)
		const { isin, operation, units, metalType, } = parsedPayload
		try {
			return this.prismaService.$transaction(async(prisma,) => {
				let date: string | null = null

				if (data.assetName === AssetNamesType.BONDS) {
					date = parsedPayload.valueDate
				}
				if (data.assetName === AssetNamesType.CRYPTO) {
					if (parsedPayload.productType === CryptoType.ETF) {
						date = parsedPayload.transactionDate
					} else {
						date = parsedPayload.purchaseDate
					}
				}
				if (data.assetName === AssetNamesType.CASH_DEPOSIT || data.assetName === AssetNamesType.LOAN || data.assetName === AssetNamesType.OPTIONS || data.assetName === AssetNamesType.COLLATERAL) {
					date = parsedPayload.startDate
				}
				if (data.assetName === AssetNamesType.EQUITY_ASSET || data.assetName === AssetNamesType.METALS) {
					date = parsedPayload.transactionDate
				}
				if (data.assetName === AssetNamesType.OTHER || data.assetName === AssetNamesType.REAL_ESTATE) {
					date = parsedPayload.investmentDate
				}
				if (data.assetName === AssetNamesType.PRIVATE_EQUITY) {
					date = parsedPayload.entryDate
				}
				if (data.assetName === AssetNamesType.CASH) {
					date = new Date().toISOString()
				}
				if (!date) {
					throw new HttpException(ERROR_MESSAGES.ASSET_DATE_MISSING, HttpStatus.BAD_REQUEST,)
				}
				const isFutureDated = new Date(date,) > new Date()
				let rate: number | undefined
				if (data.assetName === AssetNamesType.METALS) {
					const metalWithHistory = await this.prismaService.metalData.findFirst({
						where: {
							currency: { equals: parsedPayload.metalType, },
						},
						include: {
							currencyHistory: {
								where: {
									date: { gte: date, },
								},
								orderBy: {
									date: 'asc',
								},
								take: 1,
							},
						},
					},)
					rate =
					metalWithHistory?.currencyHistory?.[0]?.rate ??
					metalWithHistory?.rate
				}
				if (data.assetName !== AssetNamesType.METALS) {
					const currencyWithHistory = await this.prismaService.currencyData.findFirst({
						where: {
							currency: { equals: parsedPayload.currency, },
						},
						include: {
							currencyHistory: {
								where: {
									date: { gte: date, },
								},
								orderBy: {
									date: 'asc',
								},
								take: 1,
							},
						},
					},)
					rate =
					currencyWithHistory?.currencyHistory?.[0]?.rate ??
					currencyWithHistory?.rate
				}
				if (data.assetName === AssetNamesType.CASH) {
					rate = 1
				}
				if (!rate) {
					throw new HttpException(ERROR_MESSAGES.ASSET_RATE_MISSING, HttpStatus.BAD_REQUEST,)
				}

				// if (data.assetName === AssetNamesType.CRYPTO || data.assetName === AssetNamesType.METALS) {
				// 	const existingAssets = await prisma.asset.findMany({
				// 		where: { clientId, portfolioId, entityId, bankId, accountId, },
				// 	},)

				// 	const relevantAssets = existingAssets.filter((asset,) => {
				// 		const assetPayload = JSON.parse(asset.payload as string,)
				// 		return assetPayload.isin === isin || assetPayload.metalType === metalType
				// 	},)

				// 	let totalUnits = relevantAssets.reduce((sum, asset,) => {
				// 		const assetPayload = JSON.parse(asset.payload as string,)
				// 		return sum + (assetPayload.operation === AssetOperationType.BUY ?
				// 			assetPayload.units :
				// 			-assetPayload.units)
				// 	}, 0,)
				// 	totalUnits = totalUnits + (operation === AssetOperationType.BUY ?
				// 		units :
				// 		-units)
				// 	if (totalUnits === 0) {
				// 		await prisma.asset.updateMany({
				// 			where: {
				// 				id: {
				// 					in: relevantAssets.map((asset,) => {
				// 						return asset.id
				// 					},),
				// 				},
				// 			},
				// 			data: {
				// 				isArchived: true,
				// 			},
				// 		},)
				// 		const createdAsset = await prisma.asset.create({ data: { ...data, isArchived: true, rate, }, },)
				// 		await this.cacheService.deleteByUrl([
				// 			`/${ClientRoutes.MODULE}/${createdAsset.clientId}`,
				// 			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${createdAsset.portfolioId}`,
				// 		],)
				// 		const keyPayload = {
				// 			method: 'get',
				// 			url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
				// 			query:  { clients: [createdAsset.clientId,], },
				// 		}
				// 		await this.cacheService.deleteByCacheParams(keyPayload,)
				// 		return createdAsset
				// 	}
				// }

				const bank = await this.prismaService.bank.findUnique({
					where: {
						id: data.bankId,
					},
					include: {
						bankList: true,
					},
				},)
				const createdAsset = await prisma.asset.create({ data:    { ...data, rate, isFutureDated, isArchived: false,},
					include: {
						portfolio: {
							select: { name: true, },
						},
						entity: {
							select: { name: true, },
						},
						bank: {
							select: { bankName: true, },
						},
						account: {
							select: { accountName: true, },
						},
						client: {
							include: {
								budgetPlan: true,
							},
						},
					},},)
				await this.cacheService.deleteByUrl([
					`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${createdAsset.portfolioId}`,
				],)
				const keyPayload = {
					method: 'get',
					url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
					query:  { clients: [createdAsset.clientId,], },
				}
				await this.cacheService.deleteByCacheParams(keyPayload,)

				if (data.assetName === AssetNamesType.BONDS) {
					const isinData = await this.prismaService.bond.findFirst({
						where: {
							isin,
						},
					},)
					const isins = await this.prismaService.isins.findMany()
					if (!isinData) {
						const thirdPartyIsinData = await this.thirdPartyPrismaService.client.bond.findFirst({
							where: {
								isin,
							},
							include: {
								bondHistory: true,
							},
						},)
						if (thirdPartyIsinData) {
							const neededIsin = isins?.find((item,) => {
								return item.isin === isin
							},)
							const createdBond = neededIsin && await this.prismaService.bond.create({
								data: {
									isinId:             neededIsin.id,
									isin,
									dirtyPriceCurrency: thirdPartyIsinData.dirtyPriceCurrency,
									nominalPrice:       thirdPartyIsinData.nominalPrice,
									tradeDate:          thirdPartyIsinData.tradeDate,
									marketPrice:        thirdPartyIsinData.marketPrice,
									yield:              thirdPartyIsinData.yield,
									accrued:            thirdPartyIsinData.accrued,
									sellingQuote:       thirdPartyIsinData.sellingQuote,
									ytcOffer:           thirdPartyIsinData.ytcOffer,
									gSpread:            thirdPartyIsinData.gSpread,
									createdAt:          thirdPartyIsinData.createdAt,
									security:           thirdPartyIsinData.security,
									issuer:             thirdPartyIsinData.issuer,
									maturityDate:       thirdPartyIsinData.maturityDate,
									country:            thirdPartyIsinData.country,
									sector:             thirdPartyIsinData.sector,
									coupon:             thirdPartyIsinData.coupon,
									nextCouponDate:     thirdPartyIsinData.nextCouponDate,
									offertDateCall:     thirdPartyIsinData.offertDateCall,
								},
							},)
							if (createdBond && thirdPartyIsinData.bondHistory?.length) {
								const historyData = thirdPartyIsinData.bondHistory.map((h,) => {
									return {
										bondId:             createdBond.id,
										isin,
										dirtyPriceCurrency: h.dirtyPriceCurrency,
										nominalPrice:       h.nominalPrice,
										tradeDate:          h.tradeDate,
										marketPrice:        h.marketPrice,
										yield:              h.yield,
										accrued:            h.accrued,
										sellingQuote:       h.sellingQuote,
										ytcOffer:           h.ytcOffer,
										gSpread:            h.gSpread,
										createdAt:          h.createdAt,
										security:           h.security,
										issuer:             h.issuer,
										maturityDate:       h.maturityDate,
										country:            h.country,
										sector:             h.sector,
										coupon:             h.coupon,
										nextCouponDate:     h.nextCouponDate,
										offertDateCall:     h.offertDateCall,
									}
								},)
								await this.prismaService.bondHistory.createMany({
									data: historyData,
								},)
							}
						}
					}
				}
				if (data.assetName === AssetNamesType.EQUITY_ASSET || ((data.assetName === AssetNamesType.CRYPTO || data.assetName === AssetNamesType.METALS) && isin)) {
					const isinForTypeId = await this.prismaService.isins.findFirst({
						where: {
							isin,
						},
					},)
					if (isinForTypeId?.typeId === '2') {
						const isinData = await this.prismaService.equity.findFirst({
							where: {
								isin,
							},
						},)
						const isins = await this.prismaService.isins.findMany()
						if (!isinData) {
							const thirdPartyIsinData = await this.thirdPartyPrismaService.client.equity.findFirst({
								where: {
									isin,
								},
								include: {
									equityHistory: true,
								},
							},)
							if (thirdPartyIsinData) {
								const neededIsin = isins?.find((item,) => {
									return item.isin === isin
								},)
								const createdEquity = neededIsin && await this.prismaService.equity.create({
									data: {
										isinId:            neededIsin.id,
										isin:              thirdPartyIsinData.isin,
										ticker:            thirdPartyIsinData.ticker,
										tradingGroundId:   thirdPartyIsinData.tradingGroundId,
										lastPrice:         thirdPartyIsinData.lastPrice,
										emitentName:       thirdPartyIsinData.emitentName,
										emitentBranchId:   thirdPartyIsinData.emitentBranchId,
										tradingGroundName: thirdPartyIsinData.tradingGroundName,
										equityCurrencyId:  thirdPartyIsinData.equityCurrencyId,
										currencyName:      thirdPartyIsinData.currencyName,
										stockEmitentId:    thirdPartyIsinData.stockEmitentId,
										stockEmitentName:  thirdPartyIsinData.stockEmitentName,
										stockCountryName:  thirdPartyIsinData.stockCountryName,
										branchName:        thirdPartyIsinData.branchName,
										currencyId:        thirdPartyIsinData.currencyId,
									},
								},)
								if (createdEquity && thirdPartyIsinData.equityHistory?.length) {
									const historyData = thirdPartyIsinData.equityHistory.map((h,) => {
										return {
											equityId:          createdEquity.id,
											isin:              h.isin,
											ticker:            h.ticker,
											tradingGroundId:   h.tradingGroundId,
											lastPrice:         h.lastPrice,
											emitentName:       h.emitentName,
											emitentBranchId:   h.emitentBranchId,
											tradingGroundName: h.tradingGroundName,
											equityCurrencyId:  h.equityCurrencyId,
											currencyName:      h.currencyName,
											stockEmitentId:    h.stockEmitentId,
											stockEmitentName:  h.stockEmitentName,
											stockCountryName:  h.stockCountryName,
											branchName:        h.branchName,
											createdAt:         h.createdAt,
										}
									},)
									await this.prismaService.equityHistory.createMany({
										data: historyData,
									},)
								}
							}
						}
					}
					if (isinForTypeId?.typeId === '3') {
						const isinData = await this.prismaService.etf.findFirst({
							where: {
								isin,
							},
						},)
						const isins = await this.prismaService.isins.findMany()
						if (!isinData) {
							const thirdPartyIsinData = await this.thirdPartyPrismaService.client.etf.findFirst({
								where: {
									isin,
								},
								include: {
									etfHistory: true,
								},
							},)
							if (thirdPartyIsinData) {
								const neededIsin = isins?.find((item,) => {
									return item.isin === isin
								},)
								const createdEtf = neededIsin &&  await this.prismaService.etf.create({
									data: {
										isinId:                  neededIsin.id,
										isin:                    thirdPartyIsinData.isin,
										ticker:                  thirdPartyIsinData.ticker,
										close:                   thirdPartyIsinData.close,
										distributionAmount:      thirdPartyIsinData.distributionAmount,
										currencyName:            thirdPartyIsinData.currencyName,
										fundsName:               thirdPartyIsinData.fundsName,
										tradingGroundName:       thirdPartyIsinData.tradingGroundName,
										geographyInvestmentName: thirdPartyIsinData.geographyInvestmentName,
										sectorName:              thirdPartyIsinData.sectorName,
										tradingGroundId:         thirdPartyIsinData.tradingGroundId,
										etfCurrencyId:           thirdPartyIsinData.etfCurrencyId,
										currencyId:              thirdPartyIsinData.currencyId,
									},
								},)
								if (createdEtf && thirdPartyIsinData.etfHistory?.length) {
									const historyData = thirdPartyIsinData.etfHistory.map((h,) => {
										return {
											etfId:                   createdEtf.id,
											isin:                    h.isin,
											ticker:                  h.ticker,
											close:                   h.close,
											distributionAmount:      h.distributionAmount,
											currencyName:            h.currencyName,
											fundsName:               h.fundsName,
											tradingGroundName:       h.tradingGroundName,
											geographyInvestmentName: h.geographyInvestmentName,
											sectorName:              h.sectorName,
											tradingGroundId:         h.tradingGroundId,
											etfCurrencyId:           h.etfCurrencyId,
											createdAt:               h.createdAt,
										}
									},)
									await this.prismaService.etfHistory.createMany({
										data: historyData,
									},)
								}
							}
						}
					}
				}
				if (createdAsset.client?.budgetPlan) {
					await this.cacheService.deleteByUrl([
						`/${BudgetRoutes.MODULE}/${createdAsset.client.budgetPlan.id}`,
					],)
				}
				await this.cacheService.deleteByUrl([
					`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
				],)
				// if (data.assetName === AssetNamesType.CASH_DEPOSIT && parsedPayload.maturityDate && new Date(parsedPayload.maturityDate,) <= new Date()) {
				// 	const formattedStartDate = formatDateDDMMYYYY(parsedPayload.startDate,)
				// 	const formattedMaturityDate = formatDateDDMMYYYY(parsedPayload.maturityDate,)
				// 	const formattedCurrencyValue = new Intl.NumberFormat('en-US', {
				// 		minimumFractionDigits: 2,
				// 		maximumFractionDigits: 2,
				// 	},).format(parsedPayload.currencyValue,)
				// 	const transactionType = await this.prismaService.transactionType.findFirst({
				// 		where: {
				// 			versions: {
				// 				some: {
				// 					name:      'Deposit maturity',
				// 					isCurrent: true,
				// 				},
				// 			},
				// 		},
				// 		include: {
				// 			versions: {
				// 				where: { isCurrent: true, },
				// 			},
				// 		},
				// 	},)
				// 	const currencyData = await this.prismaService.currencyData.findMany()

				// 	const rateData = currencyData.find((item,) => {
				// 		return item.currency === parsedPayload.currency
				// 	},)
				// 	if (transactionType && createdAsset.portfolioId) {
				// 		await this.prismaService.transaction.create({
				// 			data: {
				// 				clientId:                 createdAsset.clientId,
				// 				portfolioId:              createdAsset.portfolioId,
				// 				entityId:                 createdAsset.entityId,
				// 				bankId:                   createdAsset.bankId,
				// 				accountId:                createdAsset.accountId,
				// 				amount:                   parsedPayload.currencyValue,
				// 				currency:                 parsedPayload.currency,
				// 				transactionDate:          parsedPayload.maturityDate,
				// 				rate:                     rateData?.rate ?? 1,
				// 				serviceProvider:          'N/A',
				// 				transactionTypeId:        transactionType.id,
				// 				transactionTypeVersionId: transactionType.versions[0].id,
				// 				comment:                  this.cryptoService.encryptString(`${formattedCurrencyValue} ${parsedPayload.currency} ${parsedPayload.interest}% ${formattedStartDate}-${formattedMaturityDate}`,),
				// 			},
				// 		},)
				// 	}
				// }
				if (data.assetName === AssetNamesType.BONDS) {
					const asset = await this.createAssetBond(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						comment:       asset.comment,
						currency:      asset.currency,
						security:	 	  asset.security,
						operation:      asset.operation,
						valueDate:        asset.valueDate,
						isin:         asset.isin,
						units:        asset.units,
						unitPrice:  asset.unitPrice,
						bankFee:   asset.bankFee,
						accrued:   asset.accrued,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       false,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.bond,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.EQUITY_ASSET) {
					const asset = await this.createAssetEquity(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						comment:          asset.comment,
						currency:         asset.currency,
						transactionDate:	 	  asset.transactionDate,
						isin:             asset.isin,
						operation:        asset.operation,
						security:            asset.security,
						units:            asset.units,
						transactionPrice:       asset.transactionPrice,
						equityType:          asset.equityType,
						bankFee:          asset.bankFee,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       false,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.equity,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.CASH_DEPOSIT) {
					const asset = await this.createAssetDeposit(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						currency:      asset.currency,
						currencyValue: asset.currencyValue,
						interest:      asset.interest,
						policy:        asset.policy,
						toBeMatured:   asset.toBeMatured,
						startDate:     asset.startDate,
						comment:       asset.comment,
						maturityDate:  asset.maturityDate ?
							asset.maturityDate :
							undefined,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       asset.isArchived,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.deposit,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.CRYPTO) {
					const asset = await this.createAssetCrypto(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = asset.productType === CryptoType.ETF  ?
						JSON.stringify({
							comment:          asset.comment,
							productType:      asset.productType,
							currency:         asset.currency,
							transactionDate:	 	  asset.transactionDate,
							isin:             asset.isin,
							operation:        asset.operation,
							security:            asset.security,
							units:            asset.units,
							transactionPrice:       asset.transactionPrice,
							equityType:          CryptoType.ETF,
							bankFee:          asset.bankFee,
						},) :
						JSON.stringify({
							comment:            asset.comment,
							productType:         CryptoType.DIRECT_HOLD,
							cryptoCurrencyType:	 	  asset.cryptoCurrencyType,
							cryptoAmount:               asset.cryptoAmount,
							exchangeWallet:          asset.exchangeWallet,
							purchaseDate:            asset.purchaseDate,
							purchasePrice:              asset.purchasePrice,
						},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       false,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.crypto,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.METALS) {
					const asset = await this.createAssetMetal(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = asset.productType === MetalType.ETF  ?
						JSON.stringify({
							comment:          asset.comment,
							productType:      asset.productType,
							currency:         asset.currency,
							transactionDate:	 	  asset.transactionDate,
							isin:             asset.isin,
							operation:        asset.operation,
							security:            asset.security,
							units:            asset.units,
							transactionPrice:       asset.transactionPrice,
							equityType:          MetalType.ETF,
							bankFee:          asset.bankFee,
						},) :
						JSON.stringify({
							comment:         asset.comment,
							productType:         asset.productType,
							metalType:	 	    asset.metalType,
							transactionDate:               asset.transactionDate,
							purchasePrice:          asset.transactionPrice,
							units:            asset.units,
							operation:              asset.operation,
						},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       false,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.metals,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.LOAN) {
					const asset = await this.createAssetLoan(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						comment:          asset.comment,
						loanName:         asset.name,
						startDate:        asset.startDate,
						maturityDate:      asset.maturityDate,
						currency:         asset.currency,
						currencyValue:    asset.currencyValue,
						usdValue:         asset.usdValue,
						interest:         asset.interest,
						todayInterest:      asset.todayInterest,
						maturityInterest:      asset.maturityInterest,
					},)
					const createdAsset =  {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       asset.isArchived,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.loan,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.OTHER) {
					const asset = await this.createAssetOtherInvestments(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						comment:             asset.comment,
						investmentAssetName:           asset.investmentAssetName,
						currency:              asset.currency,
						investmentDate:            asset.investmentDate,
						currencyValue:           asset.currencyValue,
						usdValue:            asset.usdValue,
						serviceProvider:         asset.serviceProvider,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       asset.isArchived,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.other,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.REAL_ESTATE) {
					const asset = await this.createAssetRealEstate(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						comment:             asset.comment,
						currency:           asset.currency,
						investmentDate:              asset.investmentDate,
						currencyValue:            asset.currencyValue,
						usdValue:           asset.usdValue,
						marketValueFC:            asset.marketValueFC,
						projectTransaction:             asset.projectTransaction,
						country:            asset.country,
						city:               asset.city,
						operation:            asset.operation,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       asset.isArchived,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.real,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.OPTIONS) {
					const asset = await this.createAssetOptions(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						comment:             asset.comment,
						currency:           asset.currency,
						startDate:              asset.startDate,
						maturityDate:            asset.maturityDate,
						pairAssetCurrency:           asset.pairAssetCurrency,
						principalValue:            asset.principalValue,
						strike:             asset.strike,
						premium:            asset.premium,
						marketOpenValue:            asset.marketOpenValue,
						currentMarketValue:            asset.currentMarketValue,
						contracts:             asset.contracts,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       asset.isArchived,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.options,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.PRIVATE_EQUITY) {
					const asset = await this.createAssetPrivateEquity(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						fundType:           asset.fundType,
						status:             asset.status,
						currency:           asset.currency,
						entryDate:          asset.entryDate,
						currencyValue:      asset.currencyValue,
						serviceProvider:         asset.serviceProvider,
						geography:          asset.geography,
						fundName:           asset.fundName,
						fundID:             asset.fundID,
						fundSize:           asset.fundSize,
						aboutFund:          asset.aboutFund,
						investmentPeriod:          asset.investmentPeriod,
						fundTermDate:           asset.fundTermDate,
						capitalCalled:           asset.capitalCalled,
						lastValuationDate:           asset.lastValuationDate,
						moic:               asset.moic,
						irr:                asset.irr,
						liquidity:            asset.liquidity,
						totalCommitment:            asset.totalCommitment,
						tvpi:               asset.tvpi,
						managementExpenses:            asset.managementExpenses,
						otherExpenses:            asset.otherExpenses,
						carriedInterest:            asset.carriedInterest,
						distributions:            asset.distributions,
						holdingEntity:            asset.holdingEntity,
						comment:            asset.comment,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       asset.isArchived,
						isFutureDated:    asset.isFutureDated,
						rate:             asset.rate,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.private,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				if (data.assetName === AssetNamesType.CASH) {
					const asset = await this.createAssetCash(data,)
					const account = await this.prismaService.account.findUnique({
						where: {
							id: asset.accountId,
						},
						include: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
						},
					},)
					const payload = JSON.stringify({
						comment:             asset.comment,
						currency:           asset.currency,
					},)
					const createdAsset = {
						id:               asset.id,
						clientId:         asset.clientId,
						portfolioId:      asset.portfolioId,
						entityId:         asset.entityId,
						bankId:           asset.bankId,
						accountId:        asset.accountId,
						assetName:        asset.assetName,
						createdAt:        asset.createdAt,
						updatedAt:        asset.updatedAt,
						payload,
						isArchived:       asset.isArchived,
						isFutureDated:    false,
						rate:             1,
						portfolioDraftId: null,
					}
					await this.cacheService.deleteByUrl([
						...cacheKeysToDeleteAsset.cash,
						...cacheKeysToDeleteAsset.portfolio,
						...cacheKeysToDeleteAsset.client,
					],)
					return {
						...createdAsset,
						portfolio:       {name: this.cryptoService.decryptString(account?.portfolio?.name ?? '',),},
						entity:       {name: this.cryptoService.decryptString(account?.entity?.name ?? '',),},
						bank:       {bankName: this.cryptoService.decryptString(account?.bank?.bankName ?? '',),},
						account:       {accountName: this.cryptoService.decryptString(account?.accountName ?? '',),},
						bankListId: bank?.bankListId,
					}
				}
				return {
					...createdAsset,
					portfolio:       {name: this.cryptoService.decryptString(createdAsset.portfolio?.name ?? '',),},
					entity:       {name: this.cryptoService.decryptString(createdAsset.entity?.name ?? '',),},
					bank:       {bankName: this.cryptoService.decryptString(createdAsset.bank?.bankName ?? '',),},
					account:       {accountName: this.cryptoService.decryptString(createdAsset.account?.accountName ?? '',),},
					bankListId: bank?.bankListId,
				}
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.ASSET_CREATION_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * Retrieves the total USD value of assets based on the specified filter criteria.
	 * @remarks
	 * This method calculates the total value of assets in USD by fetching their data from the database
	 * and converting their currency values to USD using the CBondsCurrencyService.
	 * @param filter - An object containing key-value pairs to filter the assets (e.g., `portfolioId`, `entityId`).
	 * @param lists - An object containing lists of currencies, crypto assets, metals, and bonds used for conversion and valuation.
	 * @returns A Promise that resolves to an object containing the total USD value of the filtered assets.
	 */
	public async getAssetsTotal(parsedAssets:  Array<TAssetExtended>,lists: IGetTotalByAssetListsCBondsParted,): Promise<number> {
		const {cryptoList, bonds, equities, etfs, currencyList, metalList,} = lists
		const bondsAssets = parsedAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<Record<
			string,
			{ totalUnits: number; assets: Array<IBondsAsset> }>>((acc, asset,) => {
				const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency,} = asset

				if (!entityId || !bankId || !accountId || !isin) {
					return acc
				}
				const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
				if (!acc[key]) {
					acc[key] = { totalUnits: 0, assets: [], }
				}
				if (operation === AssetOperationType.BUY) {
					acc[key].totalUnits = acc[key].totalUnits + units
				} else if (operation === AssetOperationType.SELL) {
					acc[key].totalUnits = acc[key].totalUnits - units
				}
				acc[key].assets.push(asset,)
				return acc
			}, {},)
		const filteredBondsAssets = Object.values(aggregatedBondsAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const bondsBankData = filteredBondsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { isin, units, operation, currency,} = asset
				const bond = bonds.find((bond,) => {
					return bond.isin === isin
				},)
				if (!bond) {
					return null
				}
				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate,
					marketPrice:        bond.marketPrice,
				},)
				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const depositsAssets = parsedAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency, maturityDate,} = asset
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const collateralAssets = parsedAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const {currencyValue, currency,} = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		const cryptoAssets = parsedAssets.filter((asset,): asset is ICryptoAsset => {
			return asset.assetName === AssetNamesType.CRYPTO
		},)
		const cryptoETFAssets = cryptoAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === CryptoType.ETF
			},
		)
		const cryptoDirectAssets = cryptoAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === CryptoType.DIRECT_HOLD
			},
		)
		const aggregatedCryptoETFAssets = cryptoETFAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<ICryptoAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

			if (!entityId || !bankId || !accountId || !isin || !units) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredCryptoEtfAssets = Object.values(aggregatedCryptoETFAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const ctryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, } = asset
				if (!isin || !currency || !units) {
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
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		const cryptoBankData = cryptoDirectAssets
			.map((asset,) => {
				const { cryptoCurrencyType, cryptoAmount,}  = asset
				const usdValue = cryptoCurrencyType && cryptoAmount ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const equityAssets = parsedAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency,} = asset
			if (!entityId || !bankId || !accountId || !isin) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredEquityAssets = Object.values(aggregatedEquityAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const equityBankData = filteredEquityAssets
			.map((asset,) => {
				const { isin, units, operation, currency, } = asset
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const loanAssets = parsedAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, maturityDate, currency,} = asset
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const metalAssets = parsedAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const metalETFAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.ETF
			},
		)
		const aggregatedMetalETFAssets = metalETFAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

			if (!entityId || !bankId || !accountId || !isin || !units) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredMetalEtfAssets = Object.values(aggregatedMetalETFAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const metalETFData = filteredMetalEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, } = asset
				if (!isin || !currency || !units) {
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
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		const metalDirectAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.DIRECT_HOLD
			},
		)
		const aggregatedMetalAssets = metalDirectAssets.reduce<Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

			if (!entityId || !bankId || !accountId || !metalType) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${metalType}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredMetalAssets = Object.values(aggregatedMetalAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const metalsBankData = filteredMetalAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { units,operation,metalType, } = asset
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
				},)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const optionsAssets = parsedAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { maturityDate, currentMarketValue,currency, } = asset
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const otherAssets = parsedAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const privateEquityAssets = parsedAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue,currency,} = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const realEstateAssets = parsedAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency,} = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)

				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		return [
			...metalETFData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoBankData,
			...ctryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<number>((acc, { usdValue, },) => {
			return acc + usdValue
		}, 0,)
	}

	public async createAssetBond(data: CreateAssetDto,): Promise<AssetBond> {
		try {
			const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
			if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
				throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
			}
			return this.prismaService.$transaction(async(tx,) => {
				const parsedPayload = JSON.parse(payload,)
				const {isin, currency, security, operation, units, unitPrice, valueDate, bankFee, accrued, comment,} = parsedPayload
				const isinData = await this.prismaService.bond.findFirst({
					where: {
						isin,
					},

				},)
				const isins = await this.prismaService.isins.findMany()
				if (!isinData) {
					const thirdPartyIsinData = await this.thirdPartyPrismaService.client.bond.findFirst({
						where: {
							isin,
						},
						include: {
							bondHistory: true,
						},
					},)
					if (thirdPartyIsinData) {
						const neededIsin = isins?.find((item,) => {
							return item.isin === isin
						},)
						const createdBond = neededIsin && await this.prismaService.bond.create({
							data: {
								isinId:             neededIsin.id,
								isin,
								dirtyPriceCurrency: thirdPartyIsinData.dirtyPriceCurrency,
								nominalPrice:       thirdPartyIsinData.nominalPrice,
								tradeDate:          thirdPartyIsinData.tradeDate,
								marketPrice:        thirdPartyIsinData.marketPrice,
								yield:              thirdPartyIsinData.yield,
								accrued:            thirdPartyIsinData.accrued,
								sellingQuote:       thirdPartyIsinData.sellingQuote,
								ytcOffer:           thirdPartyIsinData.ytcOffer,
								gSpread:            thirdPartyIsinData.gSpread,
								createdAt:          thirdPartyIsinData.createdAt,
								security:           thirdPartyIsinData.security,
								issuer:             thirdPartyIsinData.issuer,
								maturityDate:       thirdPartyIsinData.maturityDate,
								country:            thirdPartyIsinData.country,
								sector:             thirdPartyIsinData.sector,
								coupon:             thirdPartyIsinData.coupon,
								nextCouponDate:     thirdPartyIsinData.nextCouponDate,
								offertDateCall:     thirdPartyIsinData.offertDateCall,
							},
						},)
						if (createdBond && thirdPartyIsinData.bondHistory?.length) {
							const historyData = thirdPartyIsinData.bondHistory.map((h,) => {
								return {
									bondId:             createdBond.id,
									isin,
									dirtyPriceCurrency: h.dirtyPriceCurrency,
									nominalPrice:       h.nominalPrice,
									tradeDate:          h.tradeDate,
									marketPrice:        h.marketPrice,
									yield:              h.yield,
									accrued:            h.accrued,
									sellingQuote:       h.sellingQuote,
									ytcOffer:           h.ytcOffer,
									gSpread:            h.gSpread,
									createdAt:          h.createdAt,
									security:           h.security,
									issuer:             h.issuer,
									maturityDate:       h.maturityDate,
									country:            h.country,
									sector:             h.sector,
									coupon:             h.coupon,
									nextCouponDate:     h.nextCouponDate,
									offertDateCall:     h.offertDateCall,
								}
							},)
							await this.prismaService.bondHistory.createMany({
								data: historyData,
							},)
						}
					}
				}
				const [bonds, currencyList,historyCurrencyData,] = await Promise.all([
					this.cBondsCurrencyService.getAllBondsWithHistory(),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
					this.prismaService.currencyHistoryData.findMany(),
				],)

				const bond = bonds.find((b,) => {
					return b.isin === isin
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === currency
				},)
				if (!currencyData || !bond) {
					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
				}
				const { rate, } = currencyData
				const marketPrice = bond.marketPrice ?
					parseFloat(bond.marketPrice.toFixed(2,),)  :
					0
				const dirtyPriceCurrency = bond.dirtyPriceCurrency ?? null
				const nominalPrice = bond.nominalPrice ?
					String(bond.nominalPrice,) :
					null
				const bondYield = bond.yield ?? 0

				const unitsChange = operation === 'Buy' ?
					units :
					0 - units

				const costPrice = unitPrice
				const marketValueUSD = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units,
					dirtyPriceCurrency,
					nominalPrice,
					rate,
					marketPrice,
				},)
				const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units,
					dirtyPriceCurrency,
					nominalPrice,
					rate:  1,
					marketPrice,
				},)
				const costRateDate = new Date(valueDate,)
				const costCurrencyDataRate = parsedPayload.currency === CurrencyDataList.USD ?
					1 :
					historyCurrencyData
						.filter((item,) => {
							return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate
				const costValueFC = (units * unitPrice * 10) + accrued
				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = costPrice > 0 ?
					((marketPrice - costPrice) / costPrice) * 100 	:
					0
				const currentYield = bondYield * 100

				const existingGroups = await tx.assetBondGroup.findMany({
					where:   { accountId, currency, isin, transferDate: {not: null,},},
					orderBy: { version: 'desc', },
				},)
				let nextVersion = 1
				if (existingGroups.length > 0) {
					nextVersion = existingGroups[0].version + 1
				}
				let group = await this.prismaService.assetBondGroup.findFirst({
					where: {
						accountId,
						currency,
						isin,
						transferDate: null,
					},
					include: { bonds: true, },
				},)
				const newPayload = {
					...parsedPayload,
					marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
					costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
					marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
					costValueFC:      parseFloat(costValueFC.toFixed(2,),),
					profitUSD:        parseFloat(profitUSD.toFixed(2,),),
					profitPercentage: parseFloat(profitPercentage.toFixed(2,),),
				}
				if (group) {
					const accountAssets = [...group.bonds, newPayload,]
					const accruedTotal = accountAssets.reduce((sum, a,) => {
						return sum + (a.accrued ?? 0)
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
						rateSum = rateSum + ((costCurrencyDataRate ?? rate) * a.units)
						rateCount = rateCount + 1
					}

					const totalValue = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + (a.unitPrice * a.units)
					}, 0,)

					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const next = a.operation === AssetOperationType.SELL ?
							sum - a.units :
							sum + a.units
						return this.roundNumber(next,)
					}, 0,)

					const newCostPrice = totalUnits > 0 ?
						parseFloat((totalValue / totalUnits).toFixed(2,),) :
						0
					const avgRate = totalUnits > 0 ?
						parseFloat((rateSum / totalUnits).toFixed(4,),) :
						0
					const newCostValueFC = (newCostPrice * totalUnits * 10) + accruedTotal
					const newCostValueUSD = newCostValueFC * avgRate
					const newMarketValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueUSD
						}
						return sum + a.marketValueUSD
					}, 0,)
					const newMarketValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueFC
						}
						return sum + a.marketValueFC
					}, 0,)

					const newProfitUSD = newMarketValueUSD - newCostValueUSD
					const newProfitPercentage = newCostPrice > 0 ?
						((marketPrice - newCostPrice) / newCostPrice) * 100 	:
						0
					const { valueDate, } = accountAssets.reduce((latest, current,) => {
						return new Date(current.valueDate,) > new Date(latest.valueDate,) ?
							current :
							latest
					},)

					await tx.assetBondGroup.update({
						where: { id: group.id, },
						data:  {
							totalUnits:       totalBuySellUnits,
							costPrice:        newCostPrice,
							costValueFC:      parseFloat(newCostValueFC.toFixed(2,),) ,
							costValueUSD:     parseFloat(newCostValueUSD.toFixed(2,),) ,
							marketValueFC:    parseFloat(newMarketValueFC.toFixed(2,),),
							marketValueUSD:   parseFloat(newMarketValueUSD.toFixed(2,),) ,
							profitUSD:        parseFloat(newProfitUSD.toFixed(2,),)  ,
							profitPercentage:  parseFloat(newProfitPercentage.toFixed(2,),),
							valueDate,
							accrued:          accruedTotal,
							avgRate,
						},
					},)
				} else {
					const newGroupCostPrice = parseFloat(unitPrice.toFixed(2,),)
					const costValueFC = (units * newGroupCostPrice * 10) + accrued
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = newGroupCostPrice > 0 ?
						((marketPrice - newGroupCostPrice) / newGroupCostPrice) * 100 	:
						0
					group = await tx.assetBondGroup.create({
						data: {
							client:           { connect: { id: clientId, }, },
							account:          { connect: { id: accountId, }, },
							entity:           { connect: { id: entityId, }, },
							bank:             { connect: { id: bankId, }, },
							portfolio: 	      { connect: { id: portfolioId, }, },
							currency,
							isin,
							assetName,
							totalUnits:       unitsChange,
							costPrice:        newGroupCostPrice,
							costValueFC:      parseFloat(costValueFC.toFixed(2,),),
							costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
							marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
							marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
							profitUSD:        parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
							yield:            currentYield,
							security,
							accrued,
							nextCouponDate:   bond.nextCouponDate ?? undefined,
							issuer:           bond.issuer ?? 'N/A',
							maturityDate:     bond.maturityDate ?? undefined,
							sector:           bond.sector ?? 'N/A',
							coupon:           bond.coupon ?? 'N/A',
							country:          bond.country ?? 'N/A',
							marketPrice,
							avgRate:             costCurrencyDataRate ?? rate,
							valueDate:        new Date(valueDate,),
							version:          nextVersion,
						},
						include: { bonds: true, },
					},)
				}
				return tx.assetBond.create({
					data: {
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						assetName:        data.assetName,
						currency,
						security,
						operation,
						valueDate:        new Date(valueDate,),
						isin,
						units,
						unitPrice,
						bankFee,
						accrued,
						yield:            currentYield,
						costPrice:        unitPrice,
						costValueFC:      parseFloat(costValueFC.toFixed(2,),),
						costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
						marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
						marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
						profitUSD:        parseFloat(profitUSD.toFixed(2,),),
						profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
						nextCouponDate:   bond.nextCouponDate ?? undefined,
						issuer:           bond.issuer ?? 'N/A',
						maturityDate:     bond.maturityDate ?? undefined,
						sector:           bond.sector ?? 'N/A',
						coupon:           bond.coupon ?? 'N/A',
						country:          bond.country ?? 'N/A',
						marketPrice,
						rate:             costCurrencyDataRate ?? rate,
						groupId:          group.id,
						comment,
					},
				},)
			}, {timeout: 15000,},)
		} catch (error) {
			throw new HttpException(error.message, HttpStatusCode.BadRequest,)
		}
	}

	public async createAssetBondForTransfer(tx: Prisma.TransactionClient, data: CreateAssetDto,): Promise<AssetBondGroup> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		const {isin, currency, security, operation, units, unitPrice, valueDate, bankFee, accrued, comment,} = parsedPayload
		const [bonds, currencyList,historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllBondsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.currencyHistoryData.findMany(),
		],)

		const bond = bonds.find((b,) => {
			return b.isin === isin
		},)
		const currencyData = currencyList.find((c,) => {
			return c.currency === currency
		},)
		if (!currencyData || !bond) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const { rate, } = currencyData
		const marketPrice = bond.marketPrice ?
			parseFloat(bond.marketPrice.toFixed(2,),)  :
			0
		const dirtyPriceCurrency = bond.dirtyPriceCurrency ?? null
		const nominalPrice = bond.nominalPrice ?
			String(bond.nominalPrice,) :
			null
		const bondYield = bond.yield ?? 0

		const unitsChange = operation === 'Buy' ?
			units :
			0 - units

		const costPrice = unitPrice
		const marketValueUSD = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
			isin,
			units,
			dirtyPriceCurrency,
			nominalPrice,
			rate,
			marketPrice,
		},)
		const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
			isin,
			units,
			dirtyPriceCurrency,
			nominalPrice,
			rate:  1,
			marketPrice,
		},)
		const costRateDate = new Date(valueDate,)
		const costCurrencyDataRate = parsedPayload.currency === CurrencyDataList.USD ?
			1 :
			historyCurrencyData
				.filter((item,) => {
					return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
				},)
				.sort((a, b,) => {
					return new Date(a.date,).getTime() - new Date(b.date,).getTime()
				},)[0]?.rate
		const costValueFC = (units * unitPrice * 10) + accrued
		const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
		const profitUSD = marketValueUSD - costValueUSD
		const profitPercentage = costPrice > 0 ?
			((marketPrice - costPrice) / costPrice) * 100 	:
			0
		const currentYield = bondYield * 100
		const existingGroups = await tx.assetBondGroup.findMany({
			where:   { accountId, currency, isin, transferDate: {not: null,},},
			orderBy: { version: 'desc', },
		},)
		let nextVersion = 1
		if (existingGroups.length > 0) {
			nextVersion = existingGroups[0].version + 1
		}
		let group = await this.prismaService.assetBondGroup.findFirst({
			where: {
				accountId,
				currency,
				isin,
				transferDate: null,
			},
			include: { bonds: true, },
		},)
		const newPayload = {
			...parsedPayload,
			marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
			costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
			marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
			costValueFC:      parseFloat(costValueFC.toFixed(2,),),
			profitUSD:        parseFloat(profitUSD.toFixed(2,),),
			profitPercentage: parseFloat(profitPercentage.toFixed(2,),),
		}
		if (group) {
			const accountAssets = [...group.bonds, newPayload,]
			const accruedTotal = accountAssets.reduce((sum, a,) => {
				return sum + (a.accrued ?? 0)
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
				rateSum = rateSum + ((costCurrencyDataRate ?? rate) * a.units)
				rateCount = rateCount + 1
			}

			const totalValue = accountAssets.reduce((sum, a,) => {
				if (a.operation === AssetOperationType.SELL) {
					return sum
				}
				return sum + (a.unitPrice * a.units)
			}, 0,)

			const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
				const next = a.operation === AssetOperationType.SELL ?
					sum - a.units :
					sum + a.units
				return this.roundNumber(next,)
			}, 0,)

			const newCostPrice = totalUnits > 0 ?
				parseFloat((totalValue / totalUnits).toFixed(2,),) :
				0
			const avgRate = totalUnits > 0 ?
				parseFloat((rateSum / totalUnits).toFixed(4,),) :
				0
			const newCostValueFC = (newCostPrice * totalUnits * 10) + accruedTotal
			const newCostValueUSD = newCostValueFC * avgRate
			const newMarketValueUSD = accountAssets.reduce((sum, a,) => {
				if (a.operation === AssetOperationType.SELL) {
					return sum - a.marketValueUSD
				}
				return sum + a.marketValueUSD
			}, 0,)
			const newMarketValueFC = accountAssets.reduce((sum, a,) => {
				if (a.operation === AssetOperationType.SELL) {
					return sum - a.marketValueFC
				}
				return sum + a.marketValueFC
			}, 0,)

			const newProfitUSD = newMarketValueUSD - newCostValueUSD
			const newProfitPercentage = newCostPrice > 0 ?
				((marketPrice - newCostPrice) / newCostPrice) * 100 	:
				0
			const { valueDate, } = accountAssets.reduce((latest, current,) => {
				return new Date(current.valueDate,) > new Date(latest.valueDate,) ?
					current :
					latest
			},)

			await tx.assetBondGroup.update({
				where: { id: group.id, },
				data:  {
					totalUnits:       totalBuySellUnits,
					costPrice:        newCostPrice,
					costValueFC:      parseFloat(newCostValueFC.toFixed(2,),) ,
					costValueUSD:     parseFloat(newCostValueUSD.toFixed(2,),) ,
					marketValueFC:    parseFloat(newMarketValueFC.toFixed(2,),),
					marketValueUSD:   parseFloat(newMarketValueUSD.toFixed(2,),) ,
					profitUSD:        parseFloat(newProfitUSD.toFixed(2,),)  ,
					profitPercentage:  parseFloat(newProfitPercentage.toFixed(2,),),
					valueDate,
					accrued:          accruedTotal,
					avgRate,
				},
			},)
		} else {
			const newGroupCostPrice = parseFloat(unitPrice.toFixed(2,),)
			const costValueFC = (units * newGroupCostPrice * 10) + accrued
			const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
			const profitUSD = marketValueUSD - costValueUSD
			const profitPercentage = newGroupCostPrice > 0 ?
				((marketPrice - newGroupCostPrice) / newGroupCostPrice) * 100 	:
				0
			group = await tx.assetBondGroup.create({
				data: {
					client:           { connect: { id: clientId, }, },
					account:          { connect: { id: accountId, }, },
					entity:           { connect: { id: entityId, }, },
					bank:             { connect: { id: bankId, }, },
					portfolio: 	      { connect: { id: portfolioId, }, },
					currency,
					isin,
					assetName,
					totalUnits:       unitsChange,
					costPrice:        newGroupCostPrice,
					costValueFC:      parseFloat(costValueFC.toFixed(2,),),
					costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
					marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
					marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
					profitUSD:        parseFloat(profitUSD.toFixed(2,),),
					profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
					yield:            currentYield,
					security,
					accrued,
					nextCouponDate:   bond.nextCouponDate ?? undefined,
					issuer:           bond.issuer ?? 'N/A',
					maturityDate:     bond.maturityDate ?? undefined,
					sector:           bond.sector ?? 'N/A',
					coupon:           bond.coupon ?? 'N/A',
					country:          bond.country ?? 'N/A',
					marketPrice,
					avgRate:             costCurrencyDataRate ?? rate,
					valueDate:        new Date(valueDate,),
					version:          nextVersion,
				},
				include: { bonds: true, },
			},)
		}
		await tx.assetBond.create({
			data: {
				clientId,
				portfolioId,
				entityId,
				bankId,
				accountId,
				assetName:        data.assetName,
				currency,
				security,
				operation,
				valueDate:        new Date(valueDate,),
				isin,
				units,
				unitPrice,
				bankFee,
				accrued,
				yield:            currentYield,
				costPrice:        unitPrice,
				costValueFC:      parseFloat(costValueFC.toFixed(2,),),
				costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
				marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
				marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
				profitUSD:        parseFloat(profitUSD.toFixed(2,),),
				profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
				nextCouponDate:   bond.nextCouponDate ?? undefined,
				issuer:           bond.issuer ?? 'N/A',
				maturityDate:     bond.maturityDate ?? undefined,
				sector:           bond.sector ?? 'N/A',
				coupon:           bond.coupon ?? 'N/A',
				country:          bond.country ?? 'N/A',
				marketPrice,
				rate:             costCurrencyDataRate ?? rate,
				groupId:          group.id,
				comment,
			},
		},)
		return	group
	}

	public async createAssetEquity(data: CreateAssetDto,): Promise<AssetEquity> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
				if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
				}
				const parsedPayload = JSON.parse(payload,)
				const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee, equityType, comment,} = parsedPayload
				const isinForTypeId = await this.prismaService.isins.findFirst({
					where: {
						isin,
					},
				},)
				if (isinForTypeId?.typeId === '2') {
					const isinData = await this.prismaService.equity.findFirst({
						where: {
							isin,
						},
					},)
					const isins = await this.prismaService.isins.findMany()
					if (!isinData) {
						const thirdPartyIsinData = await this.thirdPartyPrismaService.client.equity.findFirst({
							where: {
								isin,
							},
							include: {
								equityHistory: true,
							},
						},)
						if (thirdPartyIsinData) {
							const neededIsin = isins?.find((item,) => {
								return item.isin === isin
							},)
							const createdEquity = neededIsin && await this.prismaService.equity.create({
								data: {
									isinId:            neededIsin.id,
									isin:              thirdPartyIsinData.isin,
									ticker:            thirdPartyIsinData.ticker,
									tradingGroundId:   thirdPartyIsinData.tradingGroundId,
									lastPrice:         thirdPartyIsinData.lastPrice,
									emitentName:       thirdPartyIsinData.emitentName,
									emitentBranchId:   thirdPartyIsinData.emitentBranchId,
									tradingGroundName: thirdPartyIsinData.tradingGroundName,
									equityCurrencyId:  thirdPartyIsinData.equityCurrencyId,
									currencyName:      thirdPartyIsinData.currencyName,
									stockEmitentId:    thirdPartyIsinData.stockEmitentId,
									stockEmitentName:  thirdPartyIsinData.stockEmitentName,
									stockCountryName:  thirdPartyIsinData.stockCountryName,
									branchName:        thirdPartyIsinData.branchName,
									currencyId:        thirdPartyIsinData.currencyId,
								},
							},)
							if (createdEquity && thirdPartyIsinData.equityHistory?.length) {
								const historyData = thirdPartyIsinData.equityHistory.map((h,) => {
									return {
										equityId:          createdEquity.id,
										isin:              h.isin,
										ticker:            h.ticker,
										tradingGroundId:   h.tradingGroundId,
										lastPrice:         h.lastPrice,
										emitentName:       h.emitentName,
										emitentBranchId:   h.emitentBranchId,
										tradingGroundName: h.tradingGroundName,
										equityCurrencyId:  h.equityCurrencyId,
										currencyName:      h.currencyName,
										stockEmitentId:    h.stockEmitentId,
										stockEmitentName:  h.stockEmitentName,
										stockCountryName:  h.stockCountryName,
										branchName:        h.branchName,
										createdAt:         h.createdAt,
									}
								},)
								await this.prismaService.equityHistory.createMany({
									data: historyData,
								},)
							}
						}
					}
				}
				if (isinForTypeId?.typeId === '3') {
					const isinData = await this.prismaService.etf.findFirst({
						where: {
							isin,
						},
					},)
					const isins = await this.prismaService.isins.findMany()
					if (!isinData) {
						const thirdPartyIsinData = await this.thirdPartyPrismaService.client.etf.findFirst({
							where: {
								isin,
							},
							include: {
								etfHistory: true,
							},
						},)
						if (thirdPartyIsinData) {
							const neededIsin = isins?.find((item,) => {
								return item.isin === isin
							},)
							const createdEtf = neededIsin &&  await this.prismaService.etf.create({
								data: {
									isinId:                  neededIsin.id,
									isin:                    thirdPartyIsinData.isin,
									ticker:                  thirdPartyIsinData.ticker,
									close:                   thirdPartyIsinData.close,
									distributionAmount:      thirdPartyIsinData.distributionAmount,
									currencyName:            thirdPartyIsinData.currencyName,
									fundsName:               thirdPartyIsinData.fundsName,
									tradingGroundName:       thirdPartyIsinData.tradingGroundName,
									geographyInvestmentName: thirdPartyIsinData.geographyInvestmentName,
									sectorName:              thirdPartyIsinData.sectorName,
									tradingGroundId:         thirdPartyIsinData.tradingGroundId,
									etfCurrencyId:           thirdPartyIsinData.etfCurrencyId,
									currencyId:              thirdPartyIsinData.currencyId,
								},
							},)
							if (createdEtf && thirdPartyIsinData.etfHistory?.length) {
								const historyData = thirdPartyIsinData.etfHistory.map((h,) => {
									return {
										etfId:                   createdEtf.id,
										isin:                    h.isin,
										ticker:                  h.ticker,
										close:                   h.close,
										distributionAmount:      h.distributionAmount,
										currencyName:            h.currencyName,
										fundsName:               h.fundsName,
										tradingGroundName:       h.tradingGroundName,
										geographyInvestmentName: h.geographyInvestmentName,
										sectorName:              h.sectorName,
										tradingGroundId:         h.tradingGroundId,
										etfCurrencyId:           h.etfCurrencyId,
										createdAt:               h.createdAt,
									}
								},)
								await this.prismaService.etfHistory.createMany({
									data: historyData,
								},)
							}
						}
					}
				}
				const [equities, etfs, currencyList, equityIsins, historyCurrencyData,] = await Promise.all([
					this.cBondsCurrencyService.getAllEquitiesWithHistory(),
					this.cBondsCurrencyService.getAllEtfsWithHistory(),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
					this.prismaService.isins.findMany({
						where: {
							typeId: { in: ['2', '3',], },
						},
					},),
					this.prismaService.currencyHistoryData.findMany(),
				],)
				const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
					return [isin, typeId,]
				},),)
				const equity = equities.find((e,) => {
					return e.isin === isin
				},)
				const etf = etfs.find((e,) => {
					return e.isin === isin
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === currency
				},)
				if (!currencyData || (!equity && !etf)) {
					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
				const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

				const unitsChange = operation === AssetOperationType.BUY ?
					units :
					0 - units

				const costRateDate = new Date(transactionDate,)
				const costCurrencyDataRate = currency === CurrencyDataList.USD ?
					1 :
					historyCurrencyData
						.filter((item,) => {
							return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate
				const costPrice = transactionPrice
				const costValueFC = Number(units,) * Number(costPrice,)
				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
				const marketValueFC = Number(units,) * Number(lastPrice,)
				const marketValueUSD = marketValueFC * rate

				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = costPrice > 0 ?
					((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
					0
				const existingGroups = await tx.assetEquityGroup.findMany({
					where:   { accountId, currency, isin, transferDate: {not: null,},},
					orderBy: { version: 'desc', },
				},)
				let nextVersion = 1
				if (existingGroups.length > 0) {
					nextVersion = existingGroups[0].version + 1
				}
				let group = await tx.assetEquityGroup.findFirst({
					where: {
						accountId,
						currency,
						isin,
						transferDate: null,
					},
					include: { equities: true, },
				},)

				const newPayload = {
					...parsedPayload,
					marketValueUSD,
					costValueUSD,
					marketValueFC,
					costValueFC,
					profitUSD,
					profitPercentage,
				}
				const typeId = isinTypeMap.get(isin,)
				const type = typeId === '2' ?
					EquityType.Equity :
					EquityType.ETF
				if (group) {
					const accountAssets = [...group.equities, newPayload,]
					let rateSum = 0
					let rateCount = 0
					let totalUnits = 0
					let totalValue = 0
					for (const a of accountAssets) {
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

					const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
						(latest, current,) => {
							return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
								current :
								latest)
						},
					)
					await tx.assetEquityGroup.update({
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
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionDate:   latestTransactionDate,
							avgRate,
						},
					},)
				} else {
					const costPrice = parseFloat(transactionPrice.toFixed(2,),)
					const costValueFC = Number(units,) * Number(costPrice,)
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					group = await tx.assetEquityGroup.create({
						data: {
							client:            { connect: { id: clientId, }, },
							account:           { connect: { id: accountId, }, },
							entity:            { connect: { id: entityId, }, },
							bank:              { connect: { id: bankId, }, },
							portfolio:         { connect: { id: portfolioId, }, },
							currency,
							isin,
							assetName,
							totalUnits:        unitsChange,
							costPrice,
							costValueFC:         parseFloat(costValueFC.toFixed(2,),),
							costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							security,
							transactionDate:   new Date(transactionDate,),
							type,
							avgRate:           costCurrencyDataRate ?? rate,
							version:           nextVersion,
						},
						include: { equities: true, },
					},)
				}

				return tx.assetEquity.create({
					data: {
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						assetName:         data.assetName,
						currency,
						security,
						operation,
						transactionDate:   new Date(transactionDate,),
						transactionPrice,
						bankFee,
						equityType,
						isin,
						units,
						costPrice,
						costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
						costValueFC:         parseFloat(costValueFC.toFixed(2,),),
						marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
						marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
						profitUSD:         parseFloat(profitUSD.toFixed(2,),),
						profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						groupId:           group.id,
						comment,
						type,
						rate:              costCurrencyDataRate ?? rate,
					},
				},)
			}, { timeout: 15000,},)
		} catch (error) {
			throw new HttpException(error.message, HttpStatusCode.BadRequest,)
		}
	}

	public async createAssetEquityForTransfer(tx: Prisma.TransactionClient, data: CreateAssetDto,): Promise<AssetEquityGroup> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee, equityType, comment,} = parsedPayload
		const [equities, etfs, currencyList, equityIsins, historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
			return [isin, typeId,]
		},),)
		const equity = equities.find((e,) => {
			return e.isin === isin
		},)
		const etf = etfs.find((e,) => {
			return e.isin === isin
		},)
		const currencyData = currencyList.find((c,) => {
			return c.currency === currency
		},)
		if (!currencyData) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
		const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

		const unitsChange = operation === AssetOperationType.BUY ?
			units :
			0 - units

		const costRateDate = new Date(transactionDate,)
		const costCurrencyDataRate = currency === CurrencyDataList.USD ?
			1 :
			historyCurrencyData
				.filter((item,) => {
					return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
				},)
				.sort((a, b,) => {
					return new Date(a.date,).getTime() - new Date(b.date,).getTime()
				},)[0]?.rate
		const costPrice = transactionPrice
		const costValueFC = Number(units,) * Number(costPrice,)
		const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
		const marketValueFC = Number(units,) * Number(lastPrice,)
		const marketValueUSD = marketValueFC * rate

		const profitUSD = marketValueUSD - costValueUSD
		const profitPercentage = costPrice > 0 ?
			((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
			0
		const existingGroups = await tx.assetEquityGroup.findMany({
			where:   { accountId, currency, isin, transferDate: {not: null,},},
			orderBy: { version: 'desc', },
		},)
		let nextVersion = 1
		if (existingGroups.length > 0) {
			nextVersion = existingGroups[0].version + 1
		}
		let group = await tx.assetEquityGroup.findFirst({
			where: {
				accountId,
				currency,
				isin,
				transferDate: null,
			},
			include: { equities: true, },
		},)

		const newPayload = {
			...parsedPayload,
			marketValueUSD,
			costValueUSD,
			marketValueFC,
			costValueFC,
			profitUSD,
			profitPercentage,
		}
		const typeId = isinTypeMap.get(isin,)
		const type = typeId === '2' ?
			EquityType.Equity :
			EquityType.ETF
		if (group) {
			const accountAssets = [...group.equities, newPayload,]
			let rateSum = 0
			let rateCount = 0
			let totalUnits = 0
			let totalValue = 0
			for (const a of accountAssets) {
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

			const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
				(latest, current,) => {
					return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
						current :
						latest)
				},
			)
			await tx.assetEquityGroup.update({
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
					issuer:            emitentName,
					sector:            branchName,
					country:           stockCountryName,
					currentStockPrice: lastPrice,
					transactionDate:   latestTransactionDate,
					avgRate,
				},
			},)
		} else {
			const costPrice = parseFloat(transactionPrice.toFixed(2,),)
			const costValueFC = Number(units,) * Number(costPrice,)
			const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
			group = await tx.assetEquityGroup.create({
				data: {
					client:            { connect: { id: clientId, }, },
					account:           { connect: { id: accountId, }, },
					entity:            { connect: { id: entityId, }, },
					bank:              { connect: { id: bankId, }, },
					portfolio:         { connect: { id: portfolioId, }, },
					currency,
					isin,
					assetName,
					totalUnits:        unitsChange,
					costPrice,
					costValueFC:         parseFloat(costValueFC.toFixed(2,),),
					costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
					marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
					marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
					profitUSD:         parseFloat(profitUSD.toFixed(2,),),
					profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
					issuer:            emitentName,
					sector:            branchName,
					country:           stockCountryName,
					currentStockPrice: lastPrice,
					security,
					transactionDate:   new Date(transactionDate,),
					type,
					avgRate:           costCurrencyDataRate ?? rate,
					version:           nextVersion,
				},
				include: { equities: true, },
			},)
		}

		await tx.assetEquity.create({
			data: {
				clientId,
				portfolioId,
				entityId,
				bankId,
				accountId,
				assetName:         data.assetName,
				currency,
				security,
				operation,
				transactionDate:   new Date(transactionDate,),
				transactionPrice,
				bankFee,
				equityType,
				isin,
				units,
				costPrice,
				costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
				costValueFC:         parseFloat(costValueFC.toFixed(2,),),
				marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
				marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
				profitUSD:         parseFloat(profitUSD.toFixed(2,),),
				profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
				issuer:            emitentName,
				sector:            branchName,
				country:           stockCountryName,
				currentStockPrice: lastPrice,
				groupId:           group.id,
				comment,
				type,
				rate:              costCurrencyDataRate ?? rate,
			},
		},)
		return group
	}

	public async createAssetCrypto(data: CreateAssetDto,): Promise<AssetCrypto> {
		try {
			const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
			const parsedPayload = JSON.parse(payload,)
			if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
				throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
			}
			return this.prismaService.$transaction(async(tx,) => {
				if (parsedPayload.productType === CryptoType.ETF) {
					const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee,comment, } = parsedPayload
					const isinForTypeId = await this.prismaService.isins.findFirst({
						where: {
							isin,
						},
					},)
					if (isinForTypeId?.typeId === '2') {
						const isinData = await this.prismaService.equity.findFirst({
							where: {
								isin,
							},
						},)
						const isins = await this.prismaService.isins.findMany()
						if (!isinData) {
							const thirdPartyIsinData = await this.thirdPartyPrismaService.client.equity.findFirst({
								where: {
									isin,
								},
								include: {
									equityHistory: true,
								},
							},)
							if (thirdPartyIsinData) {
								const neededIsin = isins?.find((item,) => {
									return item.isin === isin
								},)
								const createdEquity = neededIsin && await this.prismaService.equity.create({
									data: {
										isinId:            neededIsin.id,
										isin:              thirdPartyIsinData.isin,
										ticker:            thirdPartyIsinData.ticker,
										tradingGroundId:   thirdPartyIsinData.tradingGroundId,
										lastPrice:         thirdPartyIsinData.lastPrice,
										emitentName:       thirdPartyIsinData.emitentName,
										emitentBranchId:   thirdPartyIsinData.emitentBranchId,
										tradingGroundName: thirdPartyIsinData.tradingGroundName,
										equityCurrencyId:  thirdPartyIsinData.equityCurrencyId,
										currencyName:      thirdPartyIsinData.currencyName,
										stockEmitentId:    thirdPartyIsinData.stockEmitentId,
										stockEmitentName:  thirdPartyIsinData.stockEmitentName,
										stockCountryName:  thirdPartyIsinData.stockCountryName,
										branchName:        thirdPartyIsinData.branchName,
										currencyId:        thirdPartyIsinData.currencyId,
									},
								},)
								if (createdEquity && thirdPartyIsinData.equityHistory?.length) {
									const historyData = thirdPartyIsinData.equityHistory.map((h,) => {
										return {
											equityId:          createdEquity.id,
											isin:              h.isin,
											ticker:            h.ticker,
											tradingGroundId:   h.tradingGroundId,
											lastPrice:         h.lastPrice,
											emitentName:       h.emitentName,
											emitentBranchId:   h.emitentBranchId,
											tradingGroundName: h.tradingGroundName,
											equityCurrencyId:  h.equityCurrencyId,
											currencyName:      h.currencyName,
											stockEmitentId:    h.stockEmitentId,
											stockEmitentName:  h.stockEmitentName,
											stockCountryName:  h.stockCountryName,
											branchName:        h.branchName,
											createdAt:         h.createdAt,
										}
									},)
									await this.prismaService.equityHistory.createMany({
										data: historyData,
									},)
								}
							}
						}
					}
					if (isinForTypeId?.typeId === '3') {
						const isinData = await this.prismaService.etf.findFirst({
							where: {
								isin,
							},
						},)
						const isins = await this.prismaService.isins.findMany()
						if (!isinData) {
							const thirdPartyIsinData = await this.thirdPartyPrismaService.client.etf.findFirst({
								where: {
									isin,
								},
								include: {
									etfHistory: true,
								},
							},)
							if (thirdPartyIsinData) {
								const neededIsin = isins?.find((item,) => {
									return item.isin === isin
								},)
								const createdEtf = neededIsin &&  await this.prismaService.etf.create({
									data: {
										isinId:                  neededIsin.id,
										isin:                    thirdPartyIsinData.isin,
										ticker:                  thirdPartyIsinData.ticker,
										close:                   thirdPartyIsinData.close,
										distributionAmount:      thirdPartyIsinData.distributionAmount,
										currencyName:            thirdPartyIsinData.currencyName,
										fundsName:               thirdPartyIsinData.fundsName,
										tradingGroundName:       thirdPartyIsinData.tradingGroundName,
										geographyInvestmentName: thirdPartyIsinData.geographyInvestmentName,
										sectorName:              thirdPartyIsinData.sectorName,
										tradingGroundId:         thirdPartyIsinData.tradingGroundId,
										etfCurrencyId:           thirdPartyIsinData.etfCurrencyId,
										currencyId:              thirdPartyIsinData.currencyId,
									},
								},)
								if (createdEtf && thirdPartyIsinData.etfHistory?.length) {
									const historyData = thirdPartyIsinData.etfHistory.map((h,) => {
										return {
											etfId:                   createdEtf.id,
											isin:                    h.isin,
											ticker:                  h.ticker,
											close:                   h.close,
											distributionAmount:      h.distributionAmount,
											currencyName:            h.currencyName,
											fundsName:               h.fundsName,
											tradingGroundName:       h.tradingGroundName,
											geographyInvestmentName: h.geographyInvestmentName,
											sectorName:              h.sectorName,
											tradingGroundId:         h.tradingGroundId,
											etfCurrencyId:           h.etfCurrencyId,
											createdAt:               h.createdAt,
										}
									},)
									await this.prismaService.etfHistory.createMany({
										data: historyData,
									},)
								}
							}
						}
					}
					const [equities, etfs, currencyList, equityIsins,historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllEquitiesWithHistory(),
						this.cBondsCurrencyService.getAllEtfsWithHistory(),
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.isins.findMany({
							where: {
								typeId: { in: ['2', '3',], },
							},
						},),
						this.prismaService.currencyHistoryData.findMany(),
					],)
					const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
						return [isin, typeId,]
					},),)
					const equity = equities.find((e,) => {
						return e.isin === isin
					},)
					const etf = etfs.find((e,) => {
						return e.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || (!equity && !etf)) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
					const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

					const unitsChange = operation === AssetOperationType.BUY ?
						units :
						0 - units
					const costRateDate = new Date(transactionDate,)
					const costCurrencyDataRate = currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costPrice = transactionPrice
					const costValueFC = Number(units,) * Number(costPrice,)
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate

					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					const existingGroups = await tx.assetCryptoGroup.findMany({
						where:   { accountId, currency, isin, transferDate: {not: null,},},
						orderBy: { version: 'desc', },
					},)
					let nextVersion = 1
					if (existingGroups.length > 0) {
						nextVersion = existingGroups[0].version + 1
					}
					let group = await tx.assetCryptoGroup.findFirst({
						where: {
							accountId,
							currency,
							isin,
							transferDate: null,
						},
						include: { cryptos: true, },
					},)

					const newPayload = {
						...parsedPayload,
						marketValueUSD,
						costValueUSD,
						marketValueFC,
						costValueFC,
						profitUSD,
						profitPercentage,
					}
					const typeId = isinTypeMap.get(isin,)
					const type = typeId === '2' ?
						EquityType.Equity :
						EquityType.ETF
					if (group) {
						const accountAssets = [...group.cryptos, newPayload,]
						let rateSum = 0
						let rateCount = 0
						let totalUnits = 0
						let totalValue = 0
						for (const a of accountAssets) {
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

						const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
							(latest, current,) => {
								return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
									current :
									latest)
							},
						)
						await tx.assetCryptoGroup.update({
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
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								transactionDate:   latestTransactionDate,
								avgRate,
							},
						},)
					} else {
						const costPrice = parseFloat(transactionPrice.toFixed(2,),)
						const costValueFC = Number(units,) * Number(costPrice,)
						const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
						group = await tx.assetCryptoGroup.create({
							data: {
								client:            { connect: { id: clientId, }, },
								account:           { connect: { id: accountId, }, },
								entity:            { connect: { id: entityId, }, },
								bank:              { connect: { id: bankId, }, },
								portfolio:         { connect: { id: portfolioId, }, },
								productType:       CryptoType.ETF,
								currency,
								isin,
								assetName,
								totalUnits:        unitsChange,
								costPrice,
								costValueFC:         parseFloat(costValueFC.toFixed(2,),),
								costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
								marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
								marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
								profitUSD:         parseFloat(profitUSD.toFixed(2,),),
								profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								security,
								transactionDate:   new Date(transactionDate,),
								type,
								avgRate:           costCurrencyDataRate ?? rate,
								version:           nextVersion,
							},
							include: { cryptos: true, },
						},)
					}

					return tx.assetCrypto.create({
						data: {
							productType:       CryptoType.ETF,
							clientId,
							portfolioId,
							entityId,
							bankId,
							accountId,
							assetName:         data.assetName,
							currency,
							security,
							operation,
							transactionDate:   new Date(transactionDate,),
							transactionPrice,
							bankFee,
							isin,
							units,
							costPrice,
							costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:         parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							groupId:           group.id,
							comment,
							type,
							rate:              costCurrencyDataRate ?? rate,
						},
					},)
				}
				if (parsedPayload.productType === CryptoType.DIRECT_HOLD) {
					const {cryptoCurrencyType, purchasePrice, cryptoAmount, exchangeWallet, purchaseDate, comment,} = parsedPayload
					const [cryptoData,] = await Promise.all([
						this.prismaService.cryptoData.findMany(),
					],)
					const cryptoCurrencyData = cryptoData.find((c,) => {
						return c.token === cryptoCurrencyType
					},)
					if (!cryptoCurrencyData || !data.portfolioId) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const { rate, } = cryptoCurrencyData
					const costValueUsd = purchasePrice * cryptoAmount
					const marketValueUsd = parseFloat((cryptoAmount * rate).toFixed(2,),)
					const profitUsd = marketValueUsd - costValueUsd
					const profitPercentage = profitUsd / costValueUsd * 100
					const group = await tx.assetCryptoGroup.create({
						data: {
							client:             { connect: { id: data.clientId, }, },
							account:            { connect: { id: data.accountId, }, },
							entity:             { connect: { id: data.entityId, }, },
							bank:               { connect: { id: data.bankId, }, },
							portfolio:          { connect: { id: data.portfolioId, }, },
							productType:        CryptoType.DIRECT_HOLD,
							assetName:          data.assetName,
							isArchived:         false,
							exchangeWallet,
							cryptoCurrencyType,
							cryptoAmount,
							purchaseDate:       new Date(purchaseDate,),
							purchasePrice,
							costValueUSD:       costValueUsd,
							costValueFC:        costValueUsd,
							marketValueUSD:     marketValueUsd,
							marketValueFC:      marketValueUsd,
							profitUSD:          profitUsd,
							profitPercentage,
							totalUnits:         cryptoAmount,
							currentStockPrice: rate,
						},
					},)
					const isFutureDated = new Date(purchaseDate,) > new Date()
					return tx.assetCrypto.create({
						data: {
							assetName:          data.assetName,
							clientId:           data.clientId,
							portfolioId:        data.portfolioId,
							entityId:           data.entityId,
							bankId:             data.bankId,
							accountId:          data.accountId,
							productType:        CryptoType.DIRECT_HOLD,
							exchangeWallet,
							cryptoCurrencyType,
							cryptoAmount,
							purchaseDate:       new Date(purchaseDate,),
							purchasePrice,
							costValueUSD:       costValueUsd,
							costValueFC:        costValueUsd,
							marketValueUSD:     marketValueUsd,
							marketValueFC:      marketValueUsd,
							profitUSD:          profitUsd,
							currentStockPrice: rate,
							profitPercentage,
							rate,
							isFutureDated,
							groupId:            group.id,
							comment,
						},
					},)
				}
				throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
			}, {timeout: 15000,},)
		} catch (error) {
			throw new HttpException(error.message, HttpStatusCode.BadRequest,)
		}
	}

	public async createAssetCryptoForTransfer(tx: Prisma.TransactionClient, data: CreateAssetDto,): Promise<AssetCryptoGroup> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		const parsedPayload = JSON.parse(payload,)
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		if (parsedPayload.isin) {
			const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee,comment, } = parsedPayload
			const [equities, etfs, currencyList, equityIsins,historyCurrencyData,] = await Promise.all([
				this.cBondsCurrencyService.getAllEquitiesWithHistory(),
				this.cBondsCurrencyService.getAllEtfsWithHistory(),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
				this.prismaService.isins.findMany({
					where: {
						typeId: { in: ['2', '3',], },
					},
				},),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
				return [isin, typeId,]
			},),)
			const equity = equities.find((e,) => {
				return e.isin === isin
			},)
			const etf = etfs.find((e,) => {
				return e.isin === isin
			},)
			const currencyData = currencyList.find((c,) => {
				return c.currency === currency
			},)
			if (!currencyData) {
				throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
			const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

			const unitsChange = operation === AssetOperationType.BUY ?
				units :
				0 - units
			const costRateDate = new Date(transactionDate,)
			const costCurrencyDataRate = currency === CurrencyDataList.USD ?
				1 :
				historyCurrencyData
					.filter((item,) => {
						return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
					},)
					.sort((a, b,) => {
						return new Date(a.date,).getTime() - new Date(b.date,).getTime()
					},)[0]?.rate
			const costPrice = transactionPrice
			const costValueFC = Number(units,) * Number(costPrice,)
			const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
			const marketValueFC = Number(units,) * Number(lastPrice,)
			const marketValueUSD = marketValueFC * rate

			const profitUSD = marketValueUSD - costValueUSD
			const profitPercentage = costPrice > 0 ?
				((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
				0
			const existingGroups = await tx.assetCryptoGroup.findMany({
				where:   { accountId, currency, isin, transferDate: {not: null,},},
				orderBy: { version: 'desc', },
			},)
			let nextVersion = 1
			if (existingGroups.length > 0) {
				nextVersion = existingGroups[0].version + 1
			}
			let group = await this.prismaService.assetCryptoGroup.findFirst({
				where: {
					accountId,
					currency,
					isin,
					transferDate: null,
				},
				include: { cryptos: true, },
			},)

			const newPayload = {
				...parsedPayload,
				marketValueUSD,
				costValueUSD,
				marketValueFC,
				costValueFC,
				profitUSD,
				profitPercentage,
			}
			const typeId = isinTypeMap.get(isin,)
			const type = typeId === '2' ?
				EquityType.Equity :
				EquityType.ETF
			if (group) {
				const accountAssets = [...group.cryptos, newPayload,]
				let rateSum = 0
				let rateCount = 0
				let totalUnits = 0
				let totalValue = 0
				for (const a of accountAssets) {
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

				const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
					(latest, current,) => {
						return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
							current :
							latest)
					},
				)
				await tx.assetCryptoGroup.update({
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
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						transactionDate:   latestTransactionDate,
						avgRate,
					},
				},)
			} else {
				const costPrice = parseFloat(transactionPrice.toFixed(2,),)
				const costValueFC = Number(units,) * Number(costPrice,)
				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
				group = await tx.assetCryptoGroup.create({
					data: {
						client:            { connect: { id: clientId, }, },
						account:           { connect: { id: accountId, }, },
						entity:            { connect: { id: entityId, }, },
						bank:              { connect: { id: bankId, }, },
						portfolio:         { connect: { id: portfolioId, }, },
						productType:       CryptoType.ETF,
						currency,
						isin,
						assetName,
						totalUnits:        unitsChange,
						costPrice,
						costValueFC:         parseFloat(costValueFC.toFixed(2,),),
						costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
						marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
						marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
						profitUSD:         parseFloat(profitUSD.toFixed(2,),),
						profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						security,
						transactionDate:   new Date(transactionDate,),
						type,
						avgRate:           costCurrencyDataRate ?? rate,
						version:           nextVersion,
					},
					include: { cryptos: true, },
				},)
			}

			await tx.assetCrypto.create({
				data: {
					productType:       CryptoType.ETF,
					clientId,
					portfolioId,
					entityId,
					bankId,
					accountId,
					assetName:         data.assetName,
					currency,
					security,
					operation,
					transactionDate:   new Date(transactionDate,),
					transactionPrice,
					bankFee,
					isin,
					units,
					costPrice,
					costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
					costValueFC:         parseFloat(costValueFC.toFixed(2,),),
					marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
					marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
					profitUSD:         parseFloat(profitUSD.toFixed(2,),),
					profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
					issuer:            emitentName,
					sector:            branchName,
					country:           stockCountryName,
					currentStockPrice: lastPrice,
					groupId:           group.id,
					comment,
					type,
					rate:              costCurrencyDataRate ?? rate,
				},
			},)
			return group
		}
		const {cryptoCurrencyType, purchasePrice, cryptoAmount, exchangeWallet, purchaseDate, comment,} = parsedPayload
		const [cryptoData,] = await Promise.all([
			this.prismaService.cryptoData.findMany(),
		],)
		const cryptoCurrencyData = cryptoData.find((c,) => {
			return c.token === cryptoCurrencyType
		},)
		if (!cryptoCurrencyData || !data.portfolioId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const { rate, } = cryptoCurrencyData
		const costValueUsd = purchasePrice * cryptoAmount
		const marketValueUsd = parseFloat((cryptoAmount * rate).toFixed(2,),)
		const profitUsd = marketValueUsd - costValueUsd
		const profitPercentage = profitUsd / costValueUsd * 100
		const group = await tx.assetCryptoGroup.create({
			data: {
				client:             { connect: { id: data.clientId, }, },
				account:            { connect: { id: data.accountId, }, },
				entity:             { connect: { id: data.entityId, }, },
				bank:               { connect: { id: data.bankId, }, },
				portfolio:          { connect: { id: data.portfolioId, }, },
				productType:        CryptoType.DIRECT_HOLD,
				assetName:          data.assetName,
				isArchived:         false,
				exchangeWallet,
				cryptoCurrencyType,
				cryptoAmount,
				purchaseDate:       new Date(purchaseDate,),
				purchasePrice,
				costValueUSD:       costValueUsd,
				costValueFC:        costValueUsd,
				marketValueUSD:     marketValueUsd,
				marketValueFC:      marketValueUsd,
				profitUSD:          profitUsd,
				profitPercentage,
				totalUnits:         cryptoAmount,
				currentStockPrice: rate,
			},
		},)
		const isFutureDated = new Date(purchaseDate,) > new Date()
		await tx.assetCrypto.create({
			data: {
				assetName:          data.assetName,
				clientId:           data.clientId,
				portfolioId:        data.portfolioId,
				entityId:           data.entityId,
				bankId:             data.bankId,
				accountId:          data.accountId,
				productType:        CryptoType.DIRECT_HOLD,
				exchangeWallet,
				cryptoCurrencyType,
				cryptoAmount,
				purchaseDate:       new Date(purchaseDate,),
				purchasePrice,
				costValueUSD:       costValueUsd,
				costValueFC:        costValueUsd,
				marketValueUSD:     marketValueUsd,
				marketValueFC:      marketValueUsd,
				profitUSD:          profitUsd,
				currentStockPrice: rate,
				profitPercentage,
				rate,
				isFutureDated,
				groupId:            group.id,
				comment,
			},
		},)
		return group
	}

	public async createAssetDeposit(data: CreateAssetDto,): Promise<AssetDeposit> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		const { startDate, maturityDate, policy, interest, currencyValue, currency, toBeMatured, comment,} = parsedPayload
		const isFutureDated = new Date(startDate,) > new Date()
		// const currencyWithHistory = await this.prismaService.currencyData.findFirst({
		// 	where: {
		// 		currency: { equals: parsedPayload.currency, },
		// 	},
		// 	include: {
		// 		currencyHistory: {
		// 			where: {
		// 				date: { gte: startDate, },
		// 			},
		// 			orderBy: {
		// 				date: 'asc',
		// 			},
		// 			take: 1,
		// 		},
		// 	},
		// },)

		// const rate =
		// 			currencyWithHistory?.currencyHistory?.[0]?.rate ??
		// 			currencyWithHistory?.rate
		const [currencyList,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
		],)
		const currencyData = currencyList.find((c,) => {
			return c.currency === currency
		},)
		if (!currencyData) {
			throw new HttpException('Currency data is missing', HttpStatusCode.BadRequest,)
		}
		const { rate, } = currencyData

		const usdValue = parseFloat((currencyValue * (rate ?? 1)).toFixed(2,),)
		const createdAsset = await this.prismaService.assetDeposit.create({ data:    {
			assetName,
			clientId,
			portfolioId,
			entityId,
			bankId,
			accountId,
			maturityDate,
			policy,
			interest,
			startDate,
			currencyValue,
			currency,
			toBeMatured: toBeMatured ?
				toBeMatured :
				false,
			usdValue,
			rate:        rate ?? 1,
			isFutureDated,
			isArchived:  false,
			comment,
		},
		include: {
			portfolio: {
				select: { name: true, },
			},
			entity: {
				select: { name: true, },
			},
			bank: {
				select: { bankName: true, },
			},
			account: {
				select: { accountName: true, },
			},
			client: {
				include: {
					budgetPlan: true,
				},
			},
		},},)
		if (data.assetName === AssetNamesType.CASH_DEPOSIT && parsedPayload.maturityDate && new Date(parsedPayload.maturityDate,) <= new Date()) {
			const formattedStartDate = formatDateDDMMYYYY(parsedPayload.startDate,)
			const formattedMaturityDate = formatDateDDMMYYYY(parsedPayload.maturityDate,)
			const formattedCurrencyValue = new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			},).format(parsedPayload.currencyValue,)
			const transactionType = await this.prismaService.transactionType.findFirst({
				where: {
					versions: {
						some: {
							name:      'Deposit maturity',
							isCurrent: true,
						},
					},
				},
				include: {
					versions: {
						where: { isCurrent: true, },
					},
				},
			},)
			const currencyData = await this.prismaService.currencyData.findMany()

			const rateData = currencyData.find((item,) => {
				return item.currency === parsedPayload.currency
			},)

			if (transactionType && createdAsset.portfolioId) {
				await this.prismaService.transaction.create({
					data: {
						clientId:                 createdAsset.clientId,
						portfolioId:              createdAsset.portfolioId,
						entityId:                 createdAsset.entityId,
						bankId:                   createdAsset.bankId,
						accountId:                createdAsset.accountId,
						amount:                   parsedPayload.currencyValue,
						currency:                 parsedPayload.currency,
						transactionDate:          parsedPayload.maturityDate,
						rate:                     rateData?.rate ?? 1,
						serviceProvider:          'N/A',
						transactionTypeId:        transactionType.id,
						transactionTypeVersionId: transactionType.versions[0].id,
						comment:                  this.cryptoService.encryptString(`${formattedCurrencyValue} ${parsedPayload.currency} ${parsedPayload.interest}% ${formattedStartDate}-${formattedMaturityDate}`,),
					},
				},)
			}
		}
		return createdAsset
	}

	public async createAssetMetal(data: CreateAssetDto,): Promise<AssetMetal> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
				const parsedPayload = JSON.parse(payload,)
				if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
				}
				const [equities, etfs, currencyList, metalData, equityIsins, historyCurrencyData, historyMetalData,] = await Promise.all([
					this.cBondsCurrencyService.getAllEquitiesWithHistory(),
					this.cBondsCurrencyService.getAllEtfsWithHistory(),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
					this.prismaService.metalData.findMany(),
					this.prismaService.isins.findMany({
						where: {
							typeId: { in: ['2', '3',], },
						},
					},),
					this.prismaService.currencyHistoryData.findMany(),
					this.prismaService.metalHistoryData.findMany(),
				],)
				const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
					return [isin, typeId,]
				},),)
				if (parsedPayload.productType === MetalType.ETF) {
					const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee, comment,} = parsedPayload
					const isinForTypeId = await this.prismaService.isins.findFirst({
						where: {
							isin,
						},
					},)
					if (isinForTypeId?.typeId === '2') {
						const isinData = await this.prismaService.equity.findFirst({
							where: {
								isin,
							},
						},)
						const isins = await this.prismaService.isins.findMany()
						if (!isinData) {
							const thirdPartyIsinData = await this.thirdPartyPrismaService.client.equity.findFirst({
								where: {
									isin,
								},
								include: {
									equityHistory: true,
								},
							},)
							if (thirdPartyIsinData) {
								const neededIsin = isins?.find((item,) => {
									return item.isin === isin
								},)
								const createdEquity = neededIsin && await this.prismaService.equity.create({
									data: {
										isinId:            neededIsin.id,
										isin:              thirdPartyIsinData.isin,
										ticker:            thirdPartyIsinData.ticker,
										tradingGroundId:   thirdPartyIsinData.tradingGroundId,
										lastPrice:         thirdPartyIsinData.lastPrice,
										emitentName:       thirdPartyIsinData.emitentName,
										emitentBranchId:   thirdPartyIsinData.emitentBranchId,
										tradingGroundName: thirdPartyIsinData.tradingGroundName,
										equityCurrencyId:  thirdPartyIsinData.equityCurrencyId,
										currencyName:      thirdPartyIsinData.currencyName,
										stockEmitentId:    thirdPartyIsinData.stockEmitentId,
										stockEmitentName:  thirdPartyIsinData.stockEmitentName,
										stockCountryName:  thirdPartyIsinData.stockCountryName,
										branchName:        thirdPartyIsinData.branchName,
										currencyId:        thirdPartyIsinData.currencyId,
									},
								},)
								if (createdEquity && thirdPartyIsinData.equityHistory?.length) {
									const historyData = thirdPartyIsinData.equityHistory.map((h,) => {
										return {
											equityId:          createdEquity.id,
											isin:              h.isin,
											ticker:            h.ticker,
											tradingGroundId:   h.tradingGroundId,
											lastPrice:         h.lastPrice,
											emitentName:       h.emitentName,
											emitentBranchId:   h.emitentBranchId,
											tradingGroundName: h.tradingGroundName,
											equityCurrencyId:  h.equityCurrencyId,
											currencyName:      h.currencyName,
											stockEmitentId:    h.stockEmitentId,
											stockEmitentName:  h.stockEmitentName,
											stockCountryName:  h.stockCountryName,
											branchName:        h.branchName,
											createdAt:         h.createdAt,
										}
									},)
									await this.prismaService.equityHistory.createMany({
										data: historyData,
									},)
								}
							}
						}
					}
					if (isinForTypeId?.typeId === '3') {
						const isinData = await this.prismaService.etf.findFirst({
							where: {
								isin,
							},
						},)
						const isins = await this.prismaService.isins.findMany()
						if (!isinData) {
							const thirdPartyIsinData = await this.thirdPartyPrismaService.client.etf.findFirst({
								where: {
									isin,
								},
								include: {
									etfHistory: true,
								},
							},)
							if (thirdPartyIsinData) {
								const neededIsin = isins?.find((item,) => {
									return item.isin === isin
								},)
								const createdEtf = neededIsin &&  await this.prismaService.etf.create({
									data: {
										isinId:                  neededIsin.id,
										isin:                    thirdPartyIsinData.isin,
										ticker:                  thirdPartyIsinData.ticker,
										close:                   thirdPartyIsinData.close,
										distributionAmount:      thirdPartyIsinData.distributionAmount,
										currencyName:            thirdPartyIsinData.currencyName,
										fundsName:               thirdPartyIsinData.fundsName,
										tradingGroundName:       thirdPartyIsinData.tradingGroundName,
										geographyInvestmentName: thirdPartyIsinData.geographyInvestmentName,
										sectorName:              thirdPartyIsinData.sectorName,
										tradingGroundId:         thirdPartyIsinData.tradingGroundId,
										etfCurrencyId:           thirdPartyIsinData.etfCurrencyId,
										currencyId:              thirdPartyIsinData.currencyId,
									},
								},)
								if (createdEtf && thirdPartyIsinData.etfHistory?.length) {
									const historyData = thirdPartyIsinData.etfHistory.map((h,) => {
										return {
											etfId:                   createdEtf.id,
											isin:                    h.isin,
											ticker:                  h.ticker,
											close:                   h.close,
											distributionAmount:      h.distributionAmount,
											currencyName:            h.currencyName,
											fundsName:               h.fundsName,
											tradingGroundName:       h.tradingGroundName,
											geographyInvestmentName: h.geographyInvestmentName,
											sectorName:              h.sectorName,
											tradingGroundId:         h.tradingGroundId,
											etfCurrencyId:           h.etfCurrencyId,
											createdAt:               h.createdAt,
										}
									},)
									await this.prismaService.etfHistory.createMany({
										data: historyData,
									},)
								}
							}
						}
					}
					const equity = equities.find((e,) => {
						return e.isin === isin
					},)
					const etf = etfs.find((e,) => {
						return e.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || (!equity && !etf)) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
					const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

					const unitsChange = operation === AssetOperationType.BUY ?
						units :
						0 - units
					const costRateDate = new Date(transactionDate,)
					const costCurrencyDataRate = currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costPrice = transactionPrice
					const costValueFC = Number(units,) * Number(costPrice,)
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					const existingGroups = await tx.assetMetalGroup.findMany({
						where:   { accountId, currency, isin, transferDate: {not: null,},},
						orderBy: { version: 'desc', },
					},)
					let nextVersion = 1
					if (existingGroups.length > 0) {
						nextVersion = existingGroups[0].version + 1
					}
					let group = await tx.assetMetalGroup.findFirst({
						where: {
							accountId,
							currency,
							isin,
							transferDate: null,
						},
						include: { metals: true, },
					},)

					const newPayload = {
						...parsedPayload,
						marketValueUSD,
						costValueUSD,
						marketValueFC,
						costValueFC,
						profitUSD,
						profitPercentage,
					}
					const typeId = isinTypeMap.get(isin,)
					const type = typeId === '2' ?
						EquityType.Equity :
						EquityType.ETF
					if (group) {
						const accountAssets = [...group.metals, newPayload,]

						let rateSum = 0
						let rateCount = 0
						let totalUnits = 0
						let totalValue = 0
						for (const a of accountAssets) {
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

						const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
							(latest, current,) => {
								return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
									current :
									latest)
							},
						)
						await tx.assetMetalGroup.update({
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
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								transactionDate:   latestTransactionDate,
								avgRate,
							},
						},)
					} else {
						const costPrice = parseFloat(transactionPrice.toFixed(2,),)
						const costValueFC = Number(units,) * Number(costPrice,)
						const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
						group = await tx.assetMetalGroup.create({
							data: {
								client:            { connect: { id: clientId, }, },
								account:           { connect: { id: accountId, }, },
								entity:            { connect: { id: entityId, }, },
								bank:              { connect: { id: bankId, }, },
								portfolio:         { connect: { id: portfolioId, }, },
								productType:       MetalType.ETF,
								currency,
								isin,
								assetName,
								totalUnits:        unitsChange,
								costPrice,
								costValueFC:         parseFloat(costValueFC.toFixed(2,),),
								costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
								marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
								marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
								profitUSD:         parseFloat(profitUSD.toFixed(2,),),
								profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								transactionPrice:  parsedPayload.transactionPrice,
								security,
								transactionDate:   new Date(transactionDate,),
								type,
								avgRate:           costCurrencyDataRate ?? rate,
								version:           nextVersion,
							},
							include: { metals: true, },
						},)
					}

					return tx.assetMetal.create({
						data: {
							productType:       MetalType.ETF,
							clientId,
							portfolioId,
							entityId,
							bankId,
							accountId,
							assetName:         data.assetName,
							currency,
							security,
							operation,
							transactionDate:   new Date(transactionDate,),
							transactionPrice,
							bankFee,
							isin,
							units,
							costPrice,
							costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:         parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							rate:              costCurrencyDataRate ?? rate,
							groupId:           group.id,
							comment,
							type,
						},
					},)
				}
				if (parsedPayload.productType === MetalType.DIRECT_HOLD) {
					const {
						currency,
						transactionDate,
						metalType,
						operation,
						purchasePrice,
						units,
						comment,
					} = parsedPayload

					if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const currencies = await this.cBondsCurrencyService.getAllCurrenciesWithHistory()
					const currencyData = currencies.find((c,) => {
						return c.currency === currency
					},)
					const metalCurrencyData = metalData.find((c,) => {
						return c.currency === (metalType)
					},)
					if (!metalCurrencyData || !currencyData) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const getMetalFullName = (metalName: MetalDataList,): string => {
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
					const { rate, currency: metalCurrency, id: metalCurrencyId,} = metalCurrencyData
					const {rate: currencyRate,} = currencyData
					const costRateDate = new Date(transactionDate,)
					const costCurrencyHistoryRate = currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costCurrencyDataRate = historyMetalData
						.filter((item,) => {
							return (new Date(item.date,).getTime() >= costRateDate.getTime() && metalCurrencyId === item.currencyId)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate

					const metalName = getMetalFullName(metalCurrency,)
					const metalMarketPrice =  parseFloat((rate / currencyRate).toFixed(2,),)
					const costPrice = purchasePrice
					const costValueFC = costPrice * units
					const costValueUSD = costValueFC * ((costCurrencyHistoryRate ?? currencyRate))
					const marketValueFC = units * metalMarketPrice
					const marketValueUSD = units * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costValueUSD > 0 ?
						(profitUSD / costValueUSD) * 100	:
						0

					const unitsChange = operation === AssetOperationType.BUY ?
						units :
						-units
					const existingGroups = await tx.assetMetalGroup.findMany({
						where:   {
							accountId,
							currency,
							productType:  MetalType.DIRECT_HOLD,
							metalType,
							transferDate: {not: null,},
						},
						orderBy: { version: 'desc', },
					},)
					let nextVersion = 1
					if (existingGroups.length > 0) {
						nextVersion = existingGroups[0].version + 1
					}
					let group = await tx.assetMetalGroup.findFirst({
						where: {
							accountId,
							currency,
							productType:  MetalType.DIRECT_HOLD,
							metalType,
							transferDate: null,
						},
						include: { metals: true, },
					},)

					const newPayload = {
						...parsedPayload,
						costValueUSD,
						costValueFC,
						marketValueUSD,
						marketValueFC,
						profitUSD,
						profitPercentage,
						transactionPrice: parsedPayload.purchasePrice,
					}

					if (group) {
						const accountAssets = [...group.metals, newPayload,]
						let rateSum = 0
						let rateCount = 0
						let totalUnits = 0
						let totalValue = 0
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
							// todo: Remove after qa tested
							// const costCurrencyDataRate = historyMetalData
							// 	.filter((item,) => {
							// 		return (new Date(item.date,).getTime() >= costRateDate.getTime() && metalCurrencyId === item.currencyId)
							// 	},)
							// 	.sort((a, b,) => {
							// 		return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							// 	},)[0]?.rate
							// rateSum = rateSum + (((costCurrencyDataRate ?? rate) / (costCurrencyHistoryRate ?? currencyRate)) * a.units)
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
						const marketValueFCGroup = totalBuySellUnits *  metalMarketPrice
						const marketValueUSDGroup = totalBuySellUnits * rate
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

						await tx.assetMetalGroup.update({
							where: { id: group.id, },
							data:  {
								totalUnits:       totalBuySellUnits,
								costPrice:        costPriceGroup,
								costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),),
								costValueUSD:      parseFloat(costValueUSDGroup.toFixed(2,),),
								marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),),
								marketValueUSD:    parseFloat(marketValueUSDGroup.toFixed(2,),),
								profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),),
								profitPercentage:  parseFloat(profitPercentageGroup.toFixed(2,),),
								transactionDate:  latestTransactionDate,
								avgRate,
							},
						},)
					} else {
						const costPrice = parseFloat(purchasePrice.toFixed(2,),)
						const costValueFC = costPrice * units
						const costValueUSD = costValueFC * ((costCurrencyHistoryRate ?? currencyRate))
						group = await tx.assetMetalGroup.create({
							data: {
								client:            { connect: { id: clientId, }, },
								account:           { connect: { id: accountId, }, },
								entity:            { connect: { id: entityId, }, },
								bank:              { connect: { id: bankId, }, },
								portfolio:         { connect: { id: portfolioId, }, },
								productType:       MetalType.DIRECT_HOLD,
								currency,
								assetName,
								totalUnits:        unitsChange,
								costPrice,
								costValueUSD:       parseFloat(costValueUSD.toFixed(2,),),
								costValueFC:       parseFloat(costValueFC.toFixed(2,),),
								marketValueUSD:       parseFloat(marketValueUSD.toFixed(2,),),
								marketValueFC:       parseFloat(marketValueFC.toFixed(2,),),
								profitUSD:         parseFloat(profitUSD.toFixed(2,),),
								profitPercentage:       parseFloat(profitPercentage.toFixed(2,),),
								metalType,
								metalName,
								transactionPrice:  costPrice,
								currentStockPrice: metalMarketPrice,
								transactionDate:   new Date(transactionDate,),
								avgRate:           costCurrencyDataRate ?? rate,
								version:           nextVersion,
							},
							include: { metals: true, },
						},)
					}

					return  tx.assetMetal.create({
						data: {
							productType:       MetalType.DIRECT_HOLD,
							clientId,
							portfolioId,
							entityId,
							bankId,
							accountId,
							assetName,
							currency,
							metalType,
							operation,
							transactionDate:   new Date(transactionDate,),
							transactionPrice:  purchasePrice,
							units,
							costPrice,
							costValueUSD:       parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:       parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:       parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:       parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:       parseFloat(profitPercentage.toFixed(2,),),
							rate:              costCurrencyDataRate ?? rate,
							metalName,
							currentStockPrice: metalMarketPrice,
							groupId:           group.id,
							comment,
						},
					},)
				}
				throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
			}, {timeout: 15000,},)
		} catch (error) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
	}

	public async createAssetMetalForTransfer(tx: Prisma.TransactionClient, data: CreateAssetDto,): Promise<AssetMetalGroup> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		const parsedPayload = JSON.parse(payload,)
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const [equities, etfs, currencyList, metalData, equityIsins, historyCurrencyData, historyMetalData,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.metalData.findMany(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
			this.prismaService.currencyHistoryData.findMany(),
			this.prismaService.metalHistoryData.findMany(),
		],)
		const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
			return [isin, typeId,]
		},),)
		if (parsedPayload.isin) {
			const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee, comment,} = parsedPayload
			const equity = equities.find((e,) => {
				return e.isin === isin
			},)
			const etf = etfs.find((e,) => {
				return e.isin === isin
			},)
			const currencyData = currencyList.find((c,) => {
				return c.currency === currency
			},)
			if (!currencyData) {
				throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
			const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

			const unitsChange = operation === AssetOperationType.BUY ?
				units :
				0 - units

			const costRateDate = new Date(transactionDate,)
			const costCurrencyDataRate = currency === CurrencyDataList.USD ?
				1 :
				historyCurrencyData
					.filter((item,) => {
						return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
					},)
					.sort((a, b,) => {
						return new Date(a.date,).getTime() - new Date(b.date,).getTime()
					},)[0]?.rate
			const costPrice = transactionPrice
			const costValueFC = Number(units,) * Number(costPrice,)
			const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
			const marketValueFC = Number(units,) * Number(lastPrice,)
			const marketValueUSD = marketValueFC * rate

			const profitUSD = marketValueUSD - costValueUSD
			const profitPercentage = costPrice > 0 ?
				((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
				0
			const existingGroups = await tx.assetMetalGroup.findMany({
				where:   { accountId, currency, isin, transferDate: {not: null,},},
				orderBy: { version: 'desc', },
			},)
			let nextVersion = 1
			if (existingGroups.length > 0) {
				nextVersion = existingGroups[0].version + 1
			}
			let group = await tx.assetMetalGroup.findFirst({
				where: {
					accountId,
					currency,
					isin,
					transferDate: null,
				},
				include: { metals: true, },
			},)

			const newPayload = {
				...parsedPayload,
				marketValueUSD,
				costValueUSD,
				marketValueFC,
				costValueFC,
				profitUSD,
				profitPercentage,
			}
			const typeId = isinTypeMap.get(isin,)
			const type = typeId === '2' ?
				EquityType.Equity :
				EquityType.ETF
			if (group) {
				const accountAssets = [...group.metals, newPayload,]

				let rateSum = 0
				let rateCount = 0
				let totalUnits = 0
				let totalValue = 0
				for (const a of accountAssets) {
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

				const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
					(latest, current,) => {
						return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
							current :
							latest)
					},
				)
				await tx.assetMetalGroup.update({
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
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						transactionDate:   latestTransactionDate,
						avgRate,
					},
				},)
			} else {
				const costPrice = parseFloat(transactionPrice.toFixed(2,),)
				const costValueFC = Number(units,) * Number(costPrice,)
				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
				group = await tx.assetMetalGroup.create({
					data: {
						client:            { connect: { id: clientId, }, },
						account:           { connect: { id: accountId, }, },
						entity:            { connect: { id: entityId, }, },
						bank:              { connect: { id: bankId, }, },
						portfolio:         { connect: { id: portfolioId, }, },
						productType:       MetalType.ETF,
						currency,
						isin,
						assetName,
						totalUnits:        unitsChange,
						costPrice,
						costValueFC:         parseFloat(costValueFC.toFixed(2,),),
						costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
						marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
						marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
						profitUSD:         parseFloat(profitUSD.toFixed(2,),),
						profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						transactionPrice:  parsedPayload.transactionPrice,
						security,
						transactionDate:   new Date(transactionDate,),
						type,
						avgRate:           costCurrencyDataRate ?? rate,
						version:           nextVersion,
					},
					include: { metals: true, },
				},)
			}

			await tx.assetMetal.create({
				data: {
					productType:       MetalType.ETF,
					clientId,
					portfolioId,
					entityId,
					bankId,
					accountId,
					assetName:         data.assetName,
					currency,
					security,
					operation,
					transactionDate:   new Date(transactionDate,),
					transactionPrice,
					bankFee,
					isin,
					units,
					costPrice,
					costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
					costValueFC:         parseFloat(costValueFC.toFixed(2,),),
					marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
					marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
					profitUSD:         parseFloat(profitUSD.toFixed(2,),),
					profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
					issuer:            emitentName,
					sector:            branchName,
					country:           stockCountryName,
					currentStockPrice: lastPrice,
					rate:              costCurrencyDataRate ?? rate,
					groupId:           group.id,
					comment,
					type,
				},
			},)
			return group
		}
		const {
			currency,
			transactionDate,
			metalType,
			operation,
			purchasePrice,
			units,
			comment,
		} = parsedPayload

		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const currencies = await this.cBondsCurrencyService.getAllCurrenciesWithHistory()
		const currencyData = currencies.find((c,) => {
			return c.currency === currency
		},)
		const metalCurrencyData = metalData.find((c,) => {
			return c.currency === (metalType)
		},)
		if (!metalCurrencyData || !currencyData) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const getMetalFullName = (metalName: MetalDataList,): string => {
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
		const { rate, currency: metalCurrency, id: metalCurrencyId,} = metalCurrencyData
		const {rate: currencyRate,} = currencyData
		const costRateDate = new Date(transactionDate,)
		const costCurrencyHistoryRate = currency === CurrencyDataList.USD ?
			1 :
			historyCurrencyData
				.filter((item,) => {
					return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
				},)
				.sort((a, b,) => {
					return new Date(a.date,).getTime() - new Date(b.date,).getTime()
				},)[0]?.rate
		const costCurrencyDataRate = historyMetalData
			.filter((item,) => {
				return (new Date(item.date,).getTime() >= costRateDate.getTime() && metalCurrencyId === item.currencyId)
			},)
			.sort((a, b,) => {
				return new Date(a.date,).getTime() - new Date(b.date,).getTime()
			},)[0]?.rate

		const metalName = getMetalFullName(metalCurrency,)
		const metalMarketPrice =  parseFloat((rate / currencyRate).toFixed(2,),)
		const costPrice = purchasePrice
		const costValueFC = costPrice * units
		const costValueUSD = costValueFC * ((costCurrencyHistoryRate ?? currencyRate))
		const marketValueFC = units * metalMarketPrice
		const marketValueUSD = units * rate
		const profitUSD = marketValueUSD - costValueUSD
		const profitPercentage = costValueUSD > 0 ?
			(profitUSD / costValueUSD) * 100	:
			0

		const unitsChange = operation === AssetOperationType.BUY ?
			units :
			-units
		const existingGroups = await tx.assetMetalGroup.findMany({
			where:   {
				accountId,
				currency,
				productType:  MetalType.DIRECT_HOLD,
				metalType,
				transferDate: {not: null,},
			},
			orderBy: { version: 'desc', },
		},)
		let nextVersion = 1
		if (existingGroups.length > 0) {
			nextVersion = existingGroups[0].version + 1
		}
		let group = await tx.assetMetalGroup.findFirst({
			where: {
				accountId,
				currency,
				productType:  MetalType.DIRECT_HOLD,
				metalType,
				transferDate: null,
			},
			include: { metals: true, },
		},)

		const newPayload = {
			...parsedPayload,
			costValueUSD,
			costValueFC,
			marketValueUSD,
			marketValueFC,
			profitUSD,
			profitPercentage,
			transactionPrice: parsedPayload.purchasePrice,
		}

		if (group) {
			const accountAssets = [...group.metals, newPayload,]
			let rateSum = 0
			let rateCount = 0
			let totalUnits = 0
			let totalValue = 0
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
				// todo: Remove after qa tested
				// const costCurrencyDataRate = historyMetalData
				// 	.filter((item,) => {
				// 		return (new Date(item.date,).getTime() >= costRateDate.getTime() && metalCurrencyId === item.currencyId)
				// 	},)
				// 	.sort((a, b,) => {
				// 		return new Date(a.date,).getTime() - new Date(b.date,).getTime()
				// 	},)[0]?.rate
				// rateSum = rateSum + (((costCurrencyDataRate ?? rate) / (costCurrencyHistoryRate ?? currencyRate)) * a.units)
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
			const marketValueFCGroup = totalBuySellUnits *  metalMarketPrice
			const marketValueUSDGroup = totalBuySellUnits * rate
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

			await tx.assetMetalGroup.update({
				where: { id: group.id, },
				data:  {
					totalUnits:       totalBuySellUnits,
					costPrice:        costPriceGroup,
					costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),),
					costValueUSD:      parseFloat(costValueUSDGroup.toFixed(2,),),
					marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),),
					marketValueUSD:    parseFloat(marketValueUSDGroup.toFixed(2,),),
					profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),),
					profitPercentage:  parseFloat(profitPercentageGroup.toFixed(2,),),
					transactionDate:  latestTransactionDate,
					avgRate,
				},
			},)
		} else {
			const costPrice = parseFloat(purchasePrice.toFixed(2,),)
			const costValueFC = costPrice * units
			const costValueUSD = costValueFC * ((costCurrencyHistoryRate ?? currencyRate))
			group = await tx.assetMetalGroup.create({
				data: {
					client:            { connect: { id: clientId, }, },
					account:           { connect: { id: accountId, }, },
					entity:            { connect: { id: entityId, }, },
					bank:              { connect: { id: bankId, }, },
					portfolio:         { connect: { id: portfolioId, }, },
					productType:       MetalType.DIRECT_HOLD,
					currency,
					assetName,
					totalUnits:        unitsChange,
					costPrice,
					costValueUSD:       parseFloat(costValueUSD.toFixed(2,),),
					costValueFC:       parseFloat(costValueFC.toFixed(2,),),
					marketValueUSD:       parseFloat(marketValueUSD.toFixed(2,),),
					marketValueFC:       parseFloat(marketValueFC.toFixed(2,),),
					profitUSD:         parseFloat(profitUSD.toFixed(2,),),
					profitPercentage:       parseFloat(profitPercentage.toFixed(2,),),
					metalType,
					metalName,
					transactionPrice:  costPrice,
					currentStockPrice: metalMarketPrice,
					transactionDate:   new Date(transactionDate,),
					avgRate:           costCurrencyDataRate ?? rate,
					version:           nextVersion,
				},
				include: { metals: true, },
			},)
		}

		await tx.assetMetal.create({
			data: {
				productType:       MetalType.DIRECT_HOLD,
				clientId,
				portfolioId,
				entityId,
				bankId,
				accountId,
				assetName,
				currency,
				metalType,
				operation,
				transactionDate:   new Date(transactionDate,),
				transactionPrice:  purchasePrice,
				units,
				costPrice,
				costValueUSD:       parseFloat(costValueUSD.toFixed(2,),),
				costValueFC:       parseFloat(costValueFC.toFixed(2,),),
				marketValueUSD:       parseFloat(marketValueUSD.toFixed(2,),),
				marketValueFC:       parseFloat(marketValueFC.toFixed(2,),),
				profitUSD:         parseFloat(profitUSD.toFixed(2,),),
				profitPercentage:       parseFloat(profitPercentage.toFixed(2,),),
				rate:              costCurrencyDataRate ?? rate,
				metalName,
				currentStockPrice: metalMarketPrice,
				groupId:           group.id,
				comment,
			},
		},)
		return group
	}

	public async createAssetLoan(data: CreateAssetDto,): Promise<AssetLoan> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		const { startDate, maturityDate, loanName, currencyValue, currency, interest, todayInterest, maturityInterest, comment, usdValue,} = parsedPayload
		const isFutureDated = new Date(startDate,) > new Date()
		const currencyWithHistory = await this.prismaService.currencyData.findFirst({
			where: {
				currency: { equals: parsedPayload.currency, },
			},
			include: {
				currencyHistory: {
					where: {
						date: { gte: startDate, },
					},
					orderBy: {
						date: 'asc',
					},
					take: 1,
				},
			},
		},)
		const rate = currencyWithHistory?.rate
		const marketValueUSD = parseFloat((currencyValue * (rate ?? 1)).toFixed(2,),)
		return this.prismaService.assetLoan.create({ data:    {
			assetName,
			clientId,
			portfolioId,
			entityId,
			bankId,
			accountId,
			maturityDate,
			name:        loanName,
			interest,
			startDate,
			currencyValue,
			currency,
			todayInterest,
			usdValue,
			marketValueUSD,
			maturityInterest,
			comment,
			rate:        rate ?? 1,
			isFutureDated,
			isArchived:  false,
		},
		},)
	}

	public async createAssetOptions(data: CreateAssetDto,): Promise<AssetOption> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		const { startDate, maturityDate, currentMarketValue, currency, strike, premium, contracts, marketOpenValue, pairAssetCurrency, comment, principalValue,} = parsedPayload
		const isFutureDated = new Date(startDate,) > new Date()
		const currencyWithHistory = await this.prismaService.currencyData.findFirst({
			where: {
				currency: { equals: parsedPayload.currency, },
			},
			include: {
				currencyHistory: {
					where: {
						date: { gte: startDate, },
					},
					orderBy: {
						date: 'asc',
					},
					take: 1,
				},
			},
		},)

		const rate = currencyWithHistory?.rate
		const marketValueUSD = parseFloat((currentMarketValue * (rate ?? 1)).toFixed(2,),)
		return this.prismaService.assetOption.create({
			data: {
				client:             { connect: { id: clientId, }, },
				portfolio:          { connect: { id: portfolioId, }, },
				entity:             { connect: { id: entityId, }, },
				bank:               { connect: { id: bankId, }, },
				account:            { connect: { id: accountId, }, },
				assetName,
				marketValueUSD,
				currency,
				strike,
				premium,
				maturityDate,
				startDate,
				contracts,
				pairAssetCurrency,
				marketOpenValue,
				currentMarketValue,
				principalValue,
				comment,
				rate:               currencyWithHistory?.currencyHistory?.[0]?.rate ?? 1,
				isFutureDated,
			},
		},)
	}

	public async createAssetRealEstate(data: CreateAssetDto,): Promise<AssetRealEstate> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		const { startDate, } = parsedPayload
		const isFutureDated = new Date(startDate,) > new Date()
		// const currencyWithHistory = await this.prismaService.currencyData.findFirst({
		// 	where: {
		// 		currency: { equals: parsedPayload.currency, },
		// 	},
		// 	include: {
		// 		currencyHistory: {
		// 			where: {
		// 				date: { gte: startDate, },
		// 			},
		// 			orderBy: {
		// 				date: 'asc',
		// 			},
		// 			take: 1,
		// 		},
		// 	},
		// },)
		// const rate = currencyWithHistory?.rate ?? 1
		const [currencyList,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
		],)
		const currencyData = currencyList.find((c,) => {
			return c.currency === parsedPayload.currency
		},)
		if (!currencyData) {
			throw new HttpException('Currency data is missing', HttpStatusCode.BadRequest,)
		}
		const { rate, } = currencyData
		const marketValueUSD = parseFloat((parsedPayload.marketValueFC * rate).toFixed(2,),)
		const profitUSD = parseFloat((Math.round((marketValueUSD - parsedPayload.usdValue) * 100,) / 100).toFixed(2,),)
		const profitPercentage =  parsedPayload.usdValue ?
			parseFloat((profitUSD / parsedPayload.usdValue * 100).toFixed(2,),) :
			0
		return this.prismaService.assetRealEstate.create({
			data: {
				client:             { connect: { id: clientId, }, },
				portfolio:          { connect: { id: portfolioId, }, },
				entity:             { connect: { id: entityId, }, },
				bank:               { connect: { id: bankId, }, },
				account:            { connect: { id: accountId, }, },
				assetName,
				marketValueUSD,
				currency:           parsedPayload.currency,
				currencyValue:           parsedPayload.currencyValue,
				profitUSD,
				profitPercentage,
				investmentDate:       parsedPayload.investmentDate,
				usdValue:           parsedPayload.usdValue,
				marketValueFC:          parsedPayload.marketValueFC,
				projectTransaction:  parsedPayload.projectTransaction,
				country:            parsedPayload.country,
				city:               parsedPayload.city,
				comment:            parsedPayload.comment,
				rate,
				operation:          parsedPayload.operation,
				isFutureDated,
			},
		},)
	}

	public async createAssetOtherInvestments(data: CreateAssetDto,): Promise<AssetOtherInvestment> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		const { startDate,} = parsedPayload
		const isFutureDated = new Date(startDate,) > new Date()
		const [currencyWithHistory, historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		const currencyData = currencyWithHistory.find((item,) => {
			return item.currency === parsedPayload.currency
		},)
		if (!currencyData) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const costRateDate = new Date(parsedPayload.investmentDate,)
		const costCurrencyDataRate = parsedPayload.currency === CurrencyDataList.USD ?
			1 :
			historyCurrencyData
				.filter((item,) => {
					return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
				},)
				.sort((a, b,) => {
					return new Date(a.date,).getTime() - new Date(b.date,).getTime()
				},)[0]?.rate

		const { rate, } = currencyData
		const costValueUSD = Number(parsedPayload.currencyValue,) * (costCurrencyDataRate ?? currencyData?.rate ?? 1)
		const marketValueUSD = parsedPayload.currencyValue * rate
		const profitUSD = marketValueUSD - costValueUSD
		const profitPercentage =  costValueUSD ?
			profitUSD / costValueUSD * 100 :
			0
		return this.prismaService.assetOtherInvestment.create({
			data: {
				client:              { connect: { id: clientId, }, },
				portfolio:           { connect: { id: portfolioId, }, },
				entity:              { connect: { id: entityId, }, },
				bank:                { connect: { id: bankId, }, },
				account:             { connect: { id: accountId, }, },
				assetName,
				marketValueUSD:      parseFloat(marketValueUSD.toFixed(2,),),
				costValueUSD:        parseFloat(costValueUSD.toFixed(2,),),
				currency:            parsedPayload.currency,
				currencyValue:           parsedPayload.currencyValue,
				profitUSD:           parseFloat(profitUSD.toFixed(2,),),
				profitPercentage:    parseFloat(profitPercentage.toFixed(2,),),
				investmentDate:       parsedPayload.investmentDate,
				usdValue:            parsedPayload.usdValue,
				investmentAssetName:          parsedPayload.investmentAssetName,
				serviceProvider:     parsedPayload.serviceProvider,
				customFields:             parsedPayload.customFields,
				comment:             parsedPayload.comment,
				rate:                currencyData.rate,
				isFutureDated,
			},
		},)
	}

	public async createAssetPrivateEquity(data: CreateAssetDto,): Promise<AssetPrivateEquity> {
		const { clientId, portfolioId, entityId, bankId, accountId, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const payload = JSON.parse(data.payload,)
		const { startDate,} = payload
		const isFutureDated = new Date(startDate,) > new Date()
		const currencyWithHistory = await this.prismaService.currencyData.findFirst({
			where: {
				currency: { equals: payload.currency, },
			},
			include: {
				currencyHistory: {
					where: {
						date: { gte: startDate, },
					},
					orderBy: {
						date: 'asc',
					},
					take: 1,
				},
			},
		},)

		// const rate =
		// 			currencyWithHistory?.currencyHistory?.[0]?.rate ??
		// 			currencyWithHistory?.rate
		const rate = currencyWithHistory?.rate ?? 1
		const marketValueUSD = parseFloat((payload.currencyValue * rate).toFixed(2,),)
		const capitalCalled = Number(payload.capitalCalled,)
		const pl = parseFloat(((payload.currencyValue - capitalCalled - (payload.managementExpenses ?? 0) - (payload.otherExpenses ?? 0)) / capitalCalled * 100).toFixed(2,),)
		return this.prismaService.assetPrivateEquity.create({
			data: {
				client:              { connect: { id: clientId, }, },
				portfolio:           { connect: { id: portfolioId, }, },
				entity:              { connect: { id: entityId, }, },
				bank:                { connect: { id: bankId, }, },
				account:             { connect: { id: accountId, }, },
				assetName,
				marketValueUSD,
				currency:            payload.currency,
				currencyValue:           payload.currencyValue,
				pl,
				fundType:           payload.fundType,
				status:             payload.status,
				entryDate:          payload.entryDate,
				fundTermDate:       payload.fundTermDate,
				lastValuationDate:  payload.lastValuationDate,
				serviceProvider:    payload.serviceProvider,
				geography:          payload.geography,
				fundName:           payload.fundName,
				fundID:             payload.fundID,
				fundSize:           payload.fundSize,
				aboutFund:          payload.aboutFund,
				investmentPeriod:   payload.investmentPeriod,
				capitalCalled,
				moic:               Number(payload.moic,),
				irr:                Number(payload.irr,),
				liquidity:          Number(payload.liquidity,),
				totalCommitment:    Number(payload.totalCommitment,),
				tvpi:               Number(payload.tvpi,),
				managementExpenses: Number(payload.managementExpenses,),
				otherExpenses:      Number(payload.otherExpenses,),
				carriedInterest:    Number(payload.carriedInterest,),
				distributions:      Number(payload.distributions,),
				holdingEntity:      payload.holdingEntity,
				comment:             payload.comment,
				rate:                currencyWithHistory?.currencyHistory?.[0]?.rate ?? 1,
				isFutureDated,
			},
		},)
	}

	public async createAssetCash(data: CreateAssetDto,): Promise<AssetCash> {
		const { clientId, portfolioId, entityId, bankId, accountId, payload, assetName, } = data
		if (!clientId || !portfolioId || !entityId || !bankId || !accountId) {
			throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
		}
		const parsedPayload = JSON.parse(payload,)
		return this.prismaService.assetCash.create({
			data: {
				client:              { connect: { id: clientId, }, },
				portfolio:           { connect: { id: portfolioId, }, },
				entity:              { connect: { id: entityId, }, },
				bank:                { connect: { id: bankId, }, },
				account:             { connect: { id: accountId, }, },
				assetName,
				currency:            parsedPayload.currency,
				comment:             parsedPayload.comment,
			},
		},)
	}

	public async updateBond(assetId: string, body: UpdateAssetDto,): Promise<Asset> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				await this.cacheService.deleteByUrl([
					...cacheKeysToDeleteAsset.bond,
					...cacheKeysToDeleteAsset.portfolio,
					...cacheKeysToDeleteAsset.client,
				],)
				const parsedPayload = JSON.parse(body.payload,)
				const {isin, currency, security, operation, units, unitPrice, valueDate, bankFee, accrued, comment,} = parsedPayload
				if (body.isVersion) {
					const [bonds, currencyList,historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllBondsWithHistory(),
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.currencyHistoryData.findMany(),
					],)
					const bond = bonds.find((b,) => {
						return b.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || !bond) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const { rate, } = currencyData
					const marketPrice = bond.marketPrice ?
						parseFloat(bond.marketPrice.toFixed(2,),)  :
						0
					const dirtyPriceCurrency = bond.dirtyPriceCurrency ?? null
					const nominalPrice = bond.nominalPrice ?
						String(bond.nominalPrice,) :
						null
					const bondYield = bond.yield ?? 0
					const costPrice = unitPrice
					const marketValueUSD = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units,
						dirtyPriceCurrency,
						nominalPrice,
						rate,
						marketPrice,
					},)
					const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units,
						dirtyPriceCurrency,
						nominalPrice,
						rate:  1,
						marketPrice,
					},)
					const costRateDate = new Date(valueDate,)
					const costCurrencyDataRate = parsedPayload.currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costValueFC = (units * unitPrice * 10) + accrued
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((marketPrice - costPrice) / costPrice) * 100 	:
						0
					const currentYield = bondYield * 100
					const beforeVersion = await tx.assetBondVersion.findUnique({
						where: {
							id: assetId,
						},
					},)
					if (!beforeVersion) {
						throw new HttpException('Asset version not found', HttpStatus.NOT_FOUND,)
					}
					const updatedVersion = await tx.assetBondVersion.update({
						where: {
							id: assetId,
						},
						data: {
							currency,
							security,
							operation,
							valueDate:        new Date(valueDate,),
							isin,
							units,
							unitPrice,
							bankFee,
							accrued,
							yield:            currentYield,
							costPrice:        unitPrice,
							costValueFC:      parseFloat(costValueFC.toFixed(2,),),
							costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
							marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
							marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
							profitUSD:        parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
							nextCouponDate:   bond.nextCouponDate ?? undefined,
							issuer:           bond.issuer ?? 'N/A',
							maturityDate:     bond.maturityDate ?? undefined,
							sector:           bond.sector ?? 'N/A',
							coupon:           bond.coupon ?? 'N/A',
							country:          bond.country ?? 'N/A',
							marketPrice,
							rate:             costCurrencyDataRate ?? rate,
							comment,
						},
					},)
					const payload = JSON.stringify({
						comment:     updatedVersion.comment,
						currency:    updatedVersion.currency,
						security:	   updatedVersion.security,
						operation:   updatedVersion.operation,
						valueDate:   updatedVersion.valueDate,
						isin:        updatedVersion.isin,
						units:       updatedVersion.units,
						unitPrice:   updatedVersion.unitPrice,
						bankFee:     updatedVersion.bankFee,
						accrued:     updatedVersion.accrued,
					},)
					const prevPayload = {
						comment:     beforeVersion.comment,
						currency:    beforeVersion.currency,
						security:	   beforeVersion.security,
						operation:   beforeVersion.operation,
						valueDate:   beforeVersion.valueDate,
						isin:        beforeVersion.isin,
						units:       beforeVersion.units,
						unitPrice:   beforeVersion.unitPrice,
						bankFee:     beforeVersion.bankFee,
						accrued:     beforeVersion.accrued,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedVersion.clientId,
							portfolioId:  updatedVersion.portfolioId,
							entityId:     updatedVersion.clientId,
							bankId:       updatedVersion.clientId,
							accountId:    updatedVersion.accountId,
							instanceId:   updatedVersion.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.AssetVersion,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.BONDS,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:     updatedVersion.comment,
								currency:    updatedVersion.currency,
								security:	   updatedVersion.security,
								operation:   updatedVersion.operation,
								valueDate:   updatedVersion.valueDate,
								isin:        updatedVersion.isin,
								units:       updatedVersion.units,
								unitPrice:   updatedVersion.unitPrice,
								bankFee:     updatedVersion.bankFee,
								accrued:     updatedVersion.accrued,
							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedVersion.id,
						clientId:         updatedVersion.clientId,
						portfolioId:      updatedVersion.portfolioId,
						entityId:         updatedVersion.entityId,
						bankId:           updatedVersion.bankId,
						accountId:        updatedVersion.accountId,
						assetName:        updatedVersion.assetName,
						createdAt:        updatedVersion.createdAt,
						updatedAt:        updatedVersion.updatedAt,
						payload,
						isFutureDated:    updatedVersion.isFutureDated,
						isArchived:       false,
						rate:             updatedVersion.rate,
						portfolioDraftId: null,
					}
				}
				const bondAsset = await tx.assetBond.findUnique({
					where: {
						id: assetId,
					},
					include: {
						assetBondVersions: true,
					},
				},)
				if (!bondAsset) {
					throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
				}
				const now = new Date()
				const isCreatedToday = isSameDay(bondAsset.createdAt, now,)
				const {groupId, id, assetBondVersions, ...data} = bondAsset

				if (isCreatedToday) {
					const [bonds, currencyList,historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllBondsWithHistory(),
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.currencyHistoryData.findMany(),
					],)
					const bond = bonds.find((b,) => {
						return b.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || !bond) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const { rate, } = currencyData
					const marketPrice = bond.marketPrice ?
						parseFloat(bond.marketPrice.toFixed(2,),)  :
						0
					const dirtyPriceCurrency = bond.dirtyPriceCurrency ?? null
					const nominalPrice = bond.nominalPrice ?
						String(bond.nominalPrice,) :
						null
					const bondYield = bond.yield ?? 0
					const costPrice = unitPrice
					const marketValueUSD = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units,
						dirtyPriceCurrency,
						nominalPrice,
						rate,
						marketPrice,
					},)
					const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
						isin,
						units,
						dirtyPriceCurrency,
						nominalPrice,
						rate:  1,
						marketPrice,
					},)
					const costRateDate = new Date(valueDate,)
					const costCurrencyDataRate = parsedPayload.currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costValueFC = (units * unitPrice * 10) + accrued
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((marketPrice - costPrice) / costPrice) * 100 	:
						0
					const currentYield = bondYield * 100
					const group = await tx.assetBondGroup.findFirst({
						where: {
							id: groupId,
						},
						include: { bonds: true, },
					},)
					if (!group) {
						throw new HttpException('Bond group is missing', HttpStatusCode.NotFound,)
					}
					const updatedGroup = await tx.assetBond.update({
						where: {
							id: bondAsset.id,
						},
						data: {
							assetName:        data.assetName,
							currency,
							security,
							operation,
							valueDate:        new Date(valueDate,),
							isin,
							units,
							unitPrice,
							bankFee,
							accrued,
							yield:            currentYield,
							costPrice:        unitPrice,
							costValueFC:      parseFloat(costValueFC.toFixed(2,),),
							costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
							marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
							marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
							profitUSD:        parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
							nextCouponDate:   bond.nextCouponDate ?? undefined,
							issuer:           bond.issuer ?? 'N/A',
							maturityDate:     bond.maturityDate ?? undefined,
							sector:           bond.sector ?? 'N/A',
							coupon:           bond.coupon ?? 'N/A',
							country:          bond.country ?? 'N/A',
							marketPrice,
							rate:             costCurrencyDataRate ?? rate,
							groupId:          group.id,
							comment,
						},
						include: {
							group: {
								select: {
									bonds: true,
								},
							},
						},
					},)
					const accountAssets = updatedGroup.group.bonds
					const accruedTotal = accountAssets.reduce((sum, a,) => {
						return sum + (a.accrued ?? 0)
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
						rateSum = rateSum + ((costCurrencyDataRate ?? rate) * a.units)
						rateCount = rateCount + 1
					}

					const totalValue = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + (a.unitPrice * a.units)
					}, 0,)

					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						const next = a.operation === AssetOperationType.SELL ?
							sum - a.units :
							sum + a.units
						return this.roundNumber(next,)
					}, 0,)

					const newCostPrice = totalUnits > 0 ?
						parseFloat((totalValue / totalUnits).toFixed(2,),) :
						0
					const avgRate = totalUnits > 0 ?
						parseFloat((rateSum / totalUnits).toFixed(4,),) :
						0
					const newCostValueFC = (newCostPrice * totalUnits * 10) + accruedTotal
					const newCostValueUSD = newCostValueFC * avgRate
					const newMarketValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueUSD
						}
						return sum + a.marketValueUSD
					}, 0,)
					const newMarketValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueFC
						}
						return sum + a.marketValueFC
					}, 0,)

					const newProfitUSD = newMarketValueUSD - newCostValueUSD
					const newProfitPercentage = newCostPrice > 0 ?
						((marketPrice - newCostPrice) / newCostPrice) * 100 	:
						0
					const { valueDate: groupValueDate, } = accountAssets.reduce((latest, current,) => {
						return new Date(current.valueDate,) > new Date(latest.valueDate,) ?
							current :
							latest
					},)

					await tx.assetBondGroup.update({
						where: { id: group.id, },
						data:  {
							totalUnits:       totalBuySellUnits,
							costPrice:        newCostPrice,
							costValueFC:      parseFloat(newCostValueFC.toFixed(2,),) ,
							costValueUSD:     parseFloat(newCostValueUSD.toFixed(2,),) ,
							marketValueFC:    parseFloat(newMarketValueFC.toFixed(2,),),
							marketValueUSD:   parseFloat(newMarketValueUSD.toFixed(2,),) ,
							profitUSD:        parseFloat(newProfitUSD.toFixed(2,),)  ,
							profitPercentage:  parseFloat(newProfitPercentage.toFixed(2,),),
							valueDate:        groupValueDate,
							accrued:          accruedTotal,
							avgRate,
						},
					},)
					const payload = JSON.stringify({
						comment:     updatedGroup.comment,
						currency:    updatedGroup.currency,
						security:	   updatedGroup.security,
						operation:   updatedGroup.operation,
						valueDate:   updatedGroup.valueDate,
						isin:        updatedGroup.isin,
						units:       updatedGroup.units,
						unitPrice:   updatedGroup.unitPrice,
						bankFee:     updatedGroup.bankFee,
						accrued:     updatedGroup.accrued,
					},)
					const prevPayload = {
						comment:     parsedPayload.comment,
						currency:    parsedPayload.currency,
						security:	   parsedPayload.security,
						operation:   parsedPayload.operation,
						valueDate:   parsedPayload.valueDate,
						isin:        parsedPayload.isin,
						units:       parsedPayload.units,
						unitPrice:   parsedPayload.unitPrice,
						bankFee:     parsedPayload.bankFee,
						accrued:     parsedPayload.accrued,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedGroup.clientId,
							portfolioId:  updatedGroup.portfolioId,
							entityId:     updatedGroup.clientId,
							bankId:       updatedGroup.clientId,
							accountId:    updatedGroup.accountId,
							instanceId:   updatedGroup.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.Asset,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.BONDS,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:     updatedGroup.comment,
								currency:    updatedGroup.currency,
								security:	   updatedGroup.security,
								operation:   updatedGroup.operation,
								valueDate:   updatedGroup.valueDate,
								isin:        updatedGroup.isin,
								units:       updatedGroup.units,
								unitPrice:   updatedGroup.unitPrice,
								bankFee:     updatedGroup.bankFee,
								accrued:     updatedGroup.accrued,
							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedGroup.id,
						clientId:         updatedGroup.clientId,
						portfolioId:      updatedGroup.portfolioId,
						entityId:         updatedGroup.entityId,
						bankId:           updatedGroup.bankId,
						accountId:        updatedGroup.accountId,
						assetName:        updatedGroup.assetName,
						createdAt:        updatedGroup.createdAt,
						updatedAt:        updatedGroup.updatedAt,
						payload,
						isFutureDated:    updatedGroup.isFutureDated,
						isArchived:       false,
						rate:             updatedGroup.rate,
						portfolioDraftId: null,
					}
				}
				await this.prismaService.assetBondVersion.create({
					data: {
						...data,
						bondId:    bondAsset.id,
						createdAt: Boolean(bondAsset.assetBondVersions?.length,) ?
							new Date() :
							new Date(valueDate,),
						updatedAt: Boolean(bondAsset.assetBondVersions?.length,) ?
							new Date() :
							new Date(valueDate,),
					},
				},)
				const [bonds, currencyList,historyCurrencyData,] = await Promise.all([
					this.cBondsCurrencyService.getAllBondsWithHistory(),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
					this.prismaService.currencyHistoryData.findMany(),
				],)
				const bond = bonds.find((b,) => {
					return b.isin === isin
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === currency
				},)
				if (!currencyData || !bond) {
					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
				}
				const { rate, } = currencyData
				const marketPrice = bond.marketPrice ?
					parseFloat(bond.marketPrice.toFixed(2,),)  :
					0
				const dirtyPriceCurrency = bond.dirtyPriceCurrency ?? null
				const nominalPrice = bond.nominalPrice ?
					String(bond.nominalPrice,) :
					null
				const bondYield = bond.yield ?? 0
				const costPrice = unitPrice
				const marketValueUSD = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units,
					dirtyPriceCurrency,
					nominalPrice,
					rate,
					marketPrice,
				},)
				const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units,
					dirtyPriceCurrency,
					nominalPrice,
					rate:  1,
					marketPrice,
				},)
				const costRateDate = new Date(valueDate,)
				const costCurrencyDataRate = parsedPayload.currency === CurrencyDataList.USD ?
					1 :
					historyCurrencyData
						.filter((item,) => {
							return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate
				const costValueFC = (units * unitPrice * 10) + accrued
				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = costPrice > 0 ?
					((marketPrice - costPrice) / costPrice) * 100 	:
					0
				const currentYield = bondYield * 100
				const group = await this.prismaService.assetBondGroup.findFirst({
					where: {
						id: groupId,
					},
					include: { bonds: true, },
				},)
				if (!group) {
					throw new HttpException('Bond group is missing', HttpStatusCode.NotFound,)
				}
				const updatedGroup = await tx.assetBond.update({
					where: {
						id: bondAsset.id,
					},
					data: {
						assetName:        data.assetName,
						currency,
						security,
						operation,
						valueDate:        new Date(valueDate,),
						isin,
						units,
						unitPrice,
						bankFee,
						accrued,
						yield:            currentYield,
						costPrice:        unitPrice,
						costValueFC:      parseFloat(costValueFC.toFixed(2,),),
						costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
						marketValueFC:    parseFloat(marketValueFC.toFixed(2,),),
						marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
						profitUSD:        parseFloat(profitUSD.toFixed(2,),),
						profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
						nextCouponDate:   bond.nextCouponDate ?? undefined,
						issuer:           bond.issuer ?? 'N/A',
						maturityDate:     bond.maturityDate ?? undefined,
						sector:           bond.sector ?? 'N/A',
						coupon:           bond.coupon ?? 'N/A',
						country:          bond.country ?? 'N/A',
						marketPrice,
						rate:             costCurrencyDataRate ?? rate,
						groupId:          group.id,
						comment,
					},
					include: {
						group: {
							select: {
								bonds: true,
							},
						},
					},
				},)
				const accountAssets = updatedGroup.group.bonds
				const accruedTotal = accountAssets.reduce((sum, a,) => {
					return sum + (a.accrued ?? 0)
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
					rateSum = rateSum + ((costCurrencyDataRate ?? rate) * a.units)
					rateCount = rateCount + 1
				}

				const totalValue = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum
					}
					return sum + (a.unitPrice * a.units)
				}, 0,)

				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
					const next = a.operation === AssetOperationType.SELL ?
						sum - a.units :
						sum + a.units
					return this.roundNumber(next,)
				}, 0,)

				const newCostPrice = totalUnits > 0 ?
					parseFloat((totalValue / totalUnits).toFixed(2,),) :
					0
				const avgRate = totalUnits > 0 ?
					parseFloat((rateSum / totalUnits).toFixed(4,),) :
					0
				const newCostValueFC = (newCostPrice * totalUnits * 10) + accruedTotal
				const newCostValueUSD = newCostValueFC * avgRate
				const newMarketValueUSD = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.marketValueUSD
					}
					return sum + a.marketValueUSD
				}, 0,)
				const newMarketValueFC = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.marketValueFC
					}
					return sum + a.marketValueFC
				}, 0,)

				const newProfitUSD = newMarketValueUSD - newCostValueUSD
				const newProfitPercentage = newCostPrice > 0 ?
					((marketPrice - newCostPrice) / newCostPrice) * 100 	:
					0
				const { valueDate: groupValueDate, } = accountAssets.reduce((latest, current,) => {
					return new Date(current.valueDate,) > new Date(latest.valueDate,) ?
						current :
						latest
				},)

				await tx.assetBondGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:       totalBuySellUnits,
						costPrice:        newCostPrice,
						costValueFC:      parseFloat(newCostValueFC.toFixed(2,),) ,
						costValueUSD:     parseFloat(newCostValueUSD.toFixed(2,),) ,
						marketValueFC:    parseFloat(newMarketValueFC.toFixed(2,),),
						marketValueUSD:   parseFloat(newMarketValueUSD.toFixed(2,),) ,
						profitUSD:        parseFloat(newProfitUSD.toFixed(2,),)  ,
						profitPercentage:  parseFloat(newProfitPercentage.toFixed(2,),),
						valueDate:        groupValueDate,
						accrued:          accruedTotal,
						avgRate,
					},
				},)
				const payload = JSON.stringify({
					comment:     updatedGroup.comment,
					currency:    updatedGroup.currency,
					security:	   updatedGroup.security,
					operation:   updatedGroup.operation,
					valueDate:   updatedGroup.valueDate,
					isin:        updatedGroup.isin,
					units:       updatedGroup.units,
					unitPrice:   updatedGroup.unitPrice,
					bankFee:     updatedGroup.bankFee,
					accrued:     updatedGroup.accrued,
				},)
				const prevPayload = {
					comment:     parsedPayload.comment,
					currency:    parsedPayload.currency,
					security:	   parsedPayload.security,
					operation:   parsedPayload.operation,
					valueDate:   parsedPayload.valueDate,
					isin:        parsedPayload.isin,
					units:       parsedPayload.units,
					unitPrice:   parsedPayload.unitPrice,
					bankFee:     parsedPayload.bankFee,
					accrued:     parsedPayload.accrued,
				}
				await tx.editLog.create({
					data: {
						clientId:     updatedGroup.clientId,
						portfolioId:  updatedGroup.portfolioId,
						entityId:     updatedGroup.clientId,
						bankId:       updatedGroup.clientId,
						accountId:    updatedGroup.accountId,
						instanceId:   updatedGroup.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Edit,
						assetName:    AssetNamesType.BONDS,
						reason:       body.userInfo.reason,
						userName:     body.userInfo.name,
						userEmail:    body.userInfo.email,
						metaAfter:    {
							comment:     updatedGroup.comment,
							currency:    updatedGroup.currency,
							security:	   updatedGroup.security,
							operation:   updatedGroup.operation,
							valueDate:   updatedGroup.valueDate,
							isin:        updatedGroup.isin,
							units:       updatedGroup.units,
							unitPrice:   updatedGroup.unitPrice,
							bankFee:     updatedGroup.bankFee,
							accrued:     updatedGroup.accrued,
						},
						metaBefore: prevPayload,
					},
				},)
				return {
					id:               updatedGroup.id,
					clientId:         updatedGroup.clientId,
					portfolioId:      updatedGroup.portfolioId,
					entityId:         updatedGroup.entityId,
					bankId:           updatedGroup.bankId,
					accountId:        updatedGroup.accountId,
					assetName:        updatedGroup.assetName,
					createdAt:        updatedGroup.createdAt,
					updatedAt:        updatedGroup.updatedAt,
					payload,
					isFutureDated:    updatedGroup.isFutureDated,
					isArchived:       false,
					rate:             updatedGroup.rate,
					portfolioDraftId: null,
				}
			},)
		} catch (error) {
			this.logger.error(error,)
			throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
		}
	}

	public async updateDeposit(id: string, body: UpdateAssetDto,): Promise<Asset> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				await this.cacheService.deleteByUrl([
					...cacheKeysToDeleteAsset.deposit,
					...cacheKeysToDeleteAsset.portfolio,
					...cacheKeysToDeleteAsset.client,
				],)
				const parsedPayload = JSON.parse(body.payload,)
				const [currencyList,] = await Promise.all([
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
				],)
				const currencyData = currencyList.find((c,) => {
					return c.currency === parsedPayload.currency
				},)
				if (!currencyData) {
					throw new HttpException('Currency data is missing', HttpStatus.BAD_REQUEST,)
				}
				const { rate, } = currencyData
				const { startDate, maturityDate, policy, interest, currencyValue, currency, toBeMatured, comment,} = parsedPayload
				if (body.isVersion) {
					const isFutureDated = new Date(startDate,) > new Date()
					const usdValue = parseFloat((currencyValue * (rate ?? 1)).toFixed(2,),)
					const assetVersion = await tx.assetDepositVersion.findUnique({
						where: {
							id,
						},
					},)
					if (!assetVersion) {
						throw new HttpException('Asset version not found', HttpStatus.NOT_FOUND,)
					}
					const updatedAsset = await tx.assetDepositVersion.update({
						where: {
							id,
						},
						data:    {
							assetName:        body.assetName,
							maturityDate,
							policy,
							interest,
							startDate,
							currencyValue,
							currency,
							toBeMatured: toBeMatured ?
								toBeMatured :
								false,
							usdValue,
							rate:        rate ?? 1,
							isFutureDated,
							isArchived:  false,
							comment,
						},},)
					const payload = JSON.stringify({
						currency:      updatedAsset.currency,
						currencyValue: updatedAsset.currencyValue,
						interest:      updatedAsset.interest,
						policy:        updatedAsset.policy,
						toBeMatured:   updatedAsset.toBeMatured,
						startDate:     updatedAsset.startDate,
						comment:       updatedAsset.comment,
						maturityDate:  updatedAsset.maturityDate ?
							updatedAsset.maturityDate :
							undefined,
					},)
					const prevPayload = {
						currency:      assetVersion.currency,
						currencyValue: assetVersion.currencyValue,
						interest:      assetVersion.interest,
						policy:        assetVersion.policy,
						toBeMatured:   assetVersion.toBeMatured,
						startDate:     assetVersion.startDate,
						comment:       assetVersion.comment,
						maturityDate:  assetVersion.maturityDate ?
							assetVersion.maturityDate :
							undefined,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedAsset.clientId,
							portfolioId:  updatedAsset.portfolioId,
							entityId:     updatedAsset.clientId,
							bankId:       updatedAsset.clientId,
							accountId:    updatedAsset.accountId,
							instanceId:   updatedAsset.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.AssetVersion,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.CASH_DEPOSIT,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								currency:      updatedAsset.currency,
								currencyValue: updatedAsset.currencyValue,
								interest:      updatedAsset.interest,
								policy:        updatedAsset.policy,
								toBeMatured:   updatedAsset.toBeMatured,
								startDate:     updatedAsset.startDate,
								comment:       updatedAsset.comment,
								maturityDate:  updatedAsset.maturityDate ?
									updatedAsset.maturityDate :
									undefined,

							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedAsset.id,
						clientId:         updatedAsset.clientId,
						portfolioId:      updatedAsset.portfolioId,
						entityId:         updatedAsset.entityId,
						bankId:           updatedAsset.bankId,
						accountId:        updatedAsset.accountId,
						assetName:        updatedAsset.assetName,
						createdAt:        updatedAsset.createdAt,
						updatedAt:        updatedAsset.updatedAt,
						payload,
						isArchived:       updatedAsset.isArchived,
						isFutureDated:    updatedAsset.isFutureDated,
						rate:             updatedAsset.rate,
						portfolioDraftId: null,
					}
				}
				const depositAsset = await tx.assetDeposit.findUnique({
					where: {
						id,
					},
					include: {
						assetDepositVersions: true,
					},
				},)
				if (!depositAsset) {
					throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
				}

				const now = new Date()
				const isCreatedToday = isSameDay(depositAsset.createdAt, now,)
				const {id: assetId, assetDepositVersions, transferDate, transferAssetId, ...data} = depositAsset

				if (isCreatedToday) {
					const isFutureDated = new Date(startDate,) > new Date()
					const usdValue = parseFloat((currencyValue * (rate ?? 1)).toFixed(2,),)
					const updatedAsset = await tx.assetDeposit.update({
						where: {
							id: depositAsset.id,
						},
						data:    {
							assetName:        data.assetName,
							maturityDate,
							policy,
							interest,
							startDate,
							currencyValue,
							currency,
							toBeMatured: toBeMatured ?
								toBeMatured :
								false,
							usdValue,
							rate:        rate ?? 1,
							isFutureDated,
							isArchived:  false,
							comment,
						},},)

					const payload = JSON.stringify({
						currency:      updatedAsset.currency,
						currencyValue: updatedAsset.currencyValue,
						interest:      updatedAsset.interest,
						policy:        updatedAsset.policy,
						toBeMatured:   updatedAsset.toBeMatured,
						startDate:     updatedAsset.startDate,
						comment:       updatedAsset.comment,
						maturityDate:  updatedAsset.maturityDate ?
							updatedAsset.maturityDate :
							undefined,
					},)
					const prevPayload = {
						currency:      depositAsset.currency,
						currencyValue: depositAsset.currencyValue,
						interest:      depositAsset.interest,
						policy:        depositAsset.policy,
						toBeMatured:   depositAsset.toBeMatured,
						startDate:     depositAsset.startDate,
						comment:       depositAsset.comment,
						maturityDate:  depositAsset.maturityDate ?
							depositAsset.maturityDate :
							undefined,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedAsset.clientId,
							portfolioId:  updatedAsset.portfolioId,
							entityId:     updatedAsset.clientId,
							bankId:       updatedAsset.clientId,
							accountId:    updatedAsset.accountId,
							instanceId:   updatedAsset.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.Asset,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.CASH_DEPOSIT,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								currency:      updatedAsset.currency,
								currencyValue: updatedAsset.currencyValue,
								interest:      updatedAsset.interest,
								policy:        updatedAsset.policy,
								toBeMatured:   updatedAsset.toBeMatured,
								startDate:     updatedAsset.startDate,
								comment:       updatedAsset.comment,
								maturityDate:  updatedAsset.maturityDate ?
									updatedAsset.maturityDate :
									undefined,

							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedAsset.id,
						clientId:         updatedAsset.clientId,
						portfolioId:      updatedAsset.portfolioId,
						entityId:         updatedAsset.entityId,
						bankId:           updatedAsset.bankId,
						accountId:        updatedAsset.accountId,
						assetName:        updatedAsset.assetName,
						createdAt:        updatedAsset.createdAt,
						updatedAt:        updatedAsset.updatedAt,
						payload,
						isArchived:       updatedAsset.isArchived,
						isFutureDated:    updatedAsset.isFutureDated,
						rate:             updatedAsset.rate,
						portfolioDraftId: null,
					}
				}

				await tx.assetDepositVersion.create({
					data: {
						...data,
						depositId:    depositAsset.id,
						createdAt: Boolean(depositAsset.assetDepositVersions?.length,) ?
							new Date() :
							new Date(startDate,),
						updatedAt: Boolean(depositAsset.assetDepositVersions?.length,) ?
							new Date() :
							new Date(startDate,),
					},
				},)
				const isFutureDated = new Date(startDate,) > new Date()
				const usdValue = parseFloat((currencyValue * (rate ?? 1)).toFixed(2,),)
				const updatedAsset = await tx.assetDeposit.update({
					where: {
						id: depositAsset.id,
					},
					data:    {
						assetName:        data.assetName,
						maturityDate,
						policy,
						interest,
						startDate,
						currencyValue,
						currency,
						toBeMatured: toBeMatured ?
							toBeMatured :
							false,
						usdValue,
						rate:        rate ?? 1,
						isFutureDated,
						isArchived:  false,
						comment,
					},},)
				const payload = JSON.stringify({
					currency:      updatedAsset.currency,
					currencyValue: updatedAsset.currencyValue,
					interest:      updatedAsset.interest,
					policy:        updatedAsset.policy,
					toBeMatured:   updatedAsset.toBeMatured,
					startDate:     updatedAsset.startDate,
					comment:       updatedAsset.comment,
					maturityDate:  updatedAsset.maturityDate ?
						updatedAsset.maturityDate :
						undefined,
				},)
				const prevPayload = {
					currency:      depositAsset.currency,
					currencyValue: depositAsset.currencyValue,
					interest:      depositAsset.interest,
					policy:        depositAsset.policy,
					toBeMatured:   depositAsset.toBeMatured,
					startDate:     depositAsset.startDate,
					comment:       depositAsset.comment,
					maturityDate:  depositAsset.maturityDate ?
						depositAsset.maturityDate :
						undefined,
				}
				await tx.editLog.create({
					data: {
						clientId:     updatedAsset.clientId,
						portfolioId:  updatedAsset.portfolioId,
						entityId:     updatedAsset.clientId,
						bankId:       updatedAsset.clientId,
						accountId:    updatedAsset.accountId,
						instanceId:   updatedAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Edit,
						assetName:    AssetNamesType.CASH_DEPOSIT,
						reason:       body.userInfo.reason,
						userName:     body.userInfo.name,
						userEmail:    body.userInfo.email,
						metaAfter:    {
							currency:      updatedAsset.currency,
							currencyValue: updatedAsset.currencyValue,
							interest:      updatedAsset.interest,
							policy:        updatedAsset.policy,
							toBeMatured:   updatedAsset.toBeMatured,
							startDate:     updatedAsset.startDate,
							comment:       updatedAsset.comment,
							maturityDate:  updatedAsset.maturityDate ?
								updatedAsset.maturityDate :
								undefined,

						},
						metaBefore: prevPayload,
					},
				},)
				return {
					id:               updatedAsset.id,
					clientId:         updatedAsset.clientId,
					portfolioId:      updatedAsset.portfolioId,
					entityId:         updatedAsset.entityId,
					bankId:           updatedAsset.bankId,
					accountId:        updatedAsset.accountId,
					assetName:        updatedAsset.assetName,
					createdAt:        updatedAsset.createdAt,
					updatedAt:        updatedAsset.updatedAt,
					payload,
					isArchived:       updatedAsset.isArchived,
					isFutureDated:    updatedAsset.isFutureDated,
					rate:             updatedAsset.rate,
					portfolioDraftId: null,
				}
			},)
		} catch (error) {
			this.logger.error(error,)
			throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
		}
	}

	public async updateLoan(id: string, dto: UpdateAssetDto,): Promise<Asset> {
		if (!dto.payload) {
			throw new HttpException('Data is missing', HttpStatus.BAD_REQUEST,)
		}

		const parsedPayload = JSON.parse(dto.payload,) as {
		startDate: string
		maturityDate: string
		loanName: string
		currencyValue: number
		currency: CurrencyDataList
		interest: number
		todayInterest: number
		maturityInterest: number
		comment?: string
		usdValue?: number
	}

		await this.cacheService.deleteByUrl([
			...cacheKeysToDeleteAsset.loan,
			...cacheKeysToDeleteAsset.portfolio,
			...cacheKeysToDeleteAsset.client,
		],)

		/* ────────────────────────────────────────────
	   CASE 1: UPDATE VERSION ONLY
	────────────────────────────────────────────── */
		if (dto.isVersion) {
			const existingVersion = await this.prismaService.assetLoanVersion.findUnique({
				where:   { id, },
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			if (!existingVersion) {
				throw new HttpException('Version not found', HttpStatus.BAD_REQUEST,)
			}

			const isFutureDated = new Date(parsedPayload.startDate,) > new Date()

			let rate = existingVersion.rate
			if (parsedPayload.currency !== existingVersion.currency) {
				const currencyData = await this.prismaService.currencyData.findFirst({
					where: { currency: parsedPayload.currency, },
				},)
				if (!currencyData) {
					throw new HttpException('Rate missing', HttpStatus.BAD_REQUEST,)
				}
				rate = currencyData.rate
			}

			const marketValueUSD = parseFloat((parsedPayload.currencyValue * rate).toFixed(2,),)

			const updatedVersion = await this.prismaService.assetLoanVersion.update({
				where: { id, },
				data:  {
					assetName:        existingVersion.assetName,
					currency:         parsedPayload.currency,
					currencyValue:    parsedPayload.currencyValue,
					usdValue:         parsedPayload.usdValue ?? existingVersion.usdValue,
					marketValueUSD,
					name:             parsedPayload.loanName,
					startDate:        parsedPayload.startDate,
					maturityDate:     parsedPayload.maturityDate,
					interest:         parsedPayload.interest,
					todayInterest:    parsedPayload.todayInterest,
					maturityInterest: parsedPayload.maturityInterest,
					comment:          parsedPayload.comment,
					rate,
					isFutureDated,
				},
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			const payload = JSON.stringify({
				comment:          updatedVersion.comment,
				loanName:         updatedVersion.name,
				startDate:        updatedVersion.startDate,
				maturityDate:     updatedVersion.maturityDate,
				currency:         updatedVersion.currency,
				currencyValue:    updatedVersion.currencyValue,
				usdValue:         updatedVersion.usdValue,
				interest:         updatedVersion.interest,
				todayInterest:    updatedVersion.todayInterest,
				maturityInterest: updatedVersion.maturityInterest,
			},)

			const prevPayload = {
				name:             existingVersion.name,
				startDate:        existingVersion.startDate,
				maturityDate:     existingVersion.maturityDate,
				currency:         existingVersion.currency,
				currencyValue:    existingVersion.currencyValue,
				usdValue:         existingVersion.usdValue,
				interest:         existingVersion.interest,
				todayInterest:    existingVersion.todayInterest,
				maturityInterest: existingVersion.maturityInterest,
				marketValueUSD:   existingVersion.marketValueUSD,
				comment:          existingVersion.comment,
			}

			await this.prismaService.editLog.create({
				data: {
					clientId:     updatedVersion.clientId,
					portfolioId:  updatedVersion.portfolioId,
					entityId:     updatedVersion.entityId,
					bankId:       updatedVersion.bankId,
					accountId:    updatedVersion.accountId,
					instanceId:   updatedVersion.id,
					editedAt:     new Date(),
					instanceType: LogInstanceType.AssetVersion,
					actionType:   LogActionType.Edit,
					assetName:    updatedVersion.assetName,
					reason:       dto.userInfo.reason,
					userName:     dto.userInfo.name,
					userEmail:    dto.userInfo.email,
					metaAfter:    {
						name:             updatedVersion.name,
						startDate:        updatedVersion.startDate,
						maturityDate:     updatedVersion.maturityDate,
						currency:         updatedVersion.currency,
						currencyValue:    updatedVersion.currencyValue,
						usdValue:         updatedVersion.usdValue,
						interest:         updatedVersion.interest,
						todayInterest:    updatedVersion.todayInterest,
						maturityInterest: updatedVersion.maturityInterest,
						marketValueUSD:   updatedVersion.marketValueUSD,
						comment:          updatedVersion.comment,
					},
					metaBefore: prevPayload,
				},
			},)

			return {
				id:             updatedVersion.id,
				clientId:       updatedVersion.clientId,
				portfolioId:    updatedVersion.portfolioId,
				entityId:       updatedVersion.entityId,
				bankId:         updatedVersion.bankId,
				accountId:      updatedVersion.accountId,
				assetName:      updatedVersion.assetName,
				isFutureDated:  updatedVersion.isFutureDated,
				isArchived:     updatedVersion.isArchived,
				payload,
				createdAt:      updatedVersion.createdAt,
				updatedAt:      updatedVersion.updatedAt,
			} as unknown as Asset
		}

		/* ────────────────────────────────────────────
	   CASE 2: NORMAL UPDATE = snapshot + update asset
	────────────────────────────────────────────── */

		const existingLoan = await this.prismaService.assetLoan.findUnique({
			where:   { id, },
			include: {
				versions:  true,
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
			},
		},)

		if (!existingLoan) {
			throw new HttpException('Loan not found', HttpStatus.BAD_REQUEST,)
		}

		const versionDate = existingLoan.versions.length === 0 ?
			existingLoan.startDate :
			new Date()

		const isSameDay = (d1: Date, d2: Date,): boolean => {
			return d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
		}

		const createdToday = isSameDay(existingLoan.createdAt, new Date(),)

		if (!createdToday) {
			await this.prismaService.assetLoanVersion.create({
				data: {
					assetLoanId:      existingLoan.id,
					clientId:         existingLoan.clientId,
					portfolioId:      existingLoan.portfolioId,
					entityId:         existingLoan.entityId,
					bankId:           existingLoan.bankId,
					accountId:        existingLoan.accountId,
					assetName:        existingLoan.assetName,
					currency:         existingLoan.currency,
					currencyValue:    existingLoan.currencyValue,
					usdValue:         existingLoan.usdValue,
					marketValueUSD:   existingLoan.marketValueUSD,
					name:             existingLoan.name,
					startDate:        existingLoan.startDate,
					maturityDate:     existingLoan.maturityDate,
					interest:         existingLoan.interest,
					todayInterest:    existingLoan.todayInterest,
					maturityInterest: existingLoan.maturityInterest,
					comment:          existingLoan.comment,
					rate:             existingLoan.rate,
					isFutureDated:    existingLoan.isFutureDated,
					isArchived:       existingLoan.isArchived,
					createdAt:        versionDate,
					updatedAt:        versionDate,
					transactionId:    existingLoan.transactionId ?? undefined,
				},
			},)
		}

		const isFutureDated = new Date(parsedPayload.startDate,) > new Date()

		let rate = existingLoan.rate
		if (parsedPayload.currency !== existingLoan.currency) {
			const currencyData = await this.prismaService.currencyData.findFirst({
				where: { currency: parsedPayload.currency, },
			},)
			if (!currencyData) {
				throw new HttpException('Rate missing', HttpStatus.BAD_REQUEST,)
			}
			rate = currencyData.rate
		}

		const marketValueUSD = parseFloat((parsedPayload.currencyValue * rate).toFixed(2,),)

		const updatedLoan = await this.prismaService.assetLoan.update({
			where: { id, },
			data:  {
				assetName:        existingLoan.assetName,
				currency:         parsedPayload.currency,
				currencyValue:    parsedPayload.currencyValue,
				usdValue:         parsedPayload.usdValue ?? existingLoan.usdValue,
				marketValueUSD,
				name:             parsedPayload.loanName,
				startDate:        parsedPayload.startDate,
				maturityDate:     parsedPayload.maturityDate,
				interest:         parsedPayload.interest,
				todayInterest:    parsedPayload.todayInterest,
				maturityInterest: parsedPayload.maturityInterest,
				comment:          parsedPayload.comment,
				rate,
				isFutureDated,
			},
			include: {
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
			},
		},)

		const payload = JSON.stringify({
			comment:          updatedLoan.comment,
			loanName:         updatedLoan.name,
			startDate:        updatedLoan.startDate,
			maturityDate:     updatedLoan.maturityDate,
			currency:         updatedLoan.currency,
			currencyValue:    updatedLoan.currencyValue,
			usdValue:         updatedLoan.usdValue,
			interest:         updatedLoan.interest,
			todayInterest:    updatedLoan.todayInterest,
			maturityInterest: updatedLoan.maturityInterest,
		},)

		const prevPayload = {
			name:             existingLoan.name,
			startDate:        existingLoan.startDate,
			maturityDate:     existingLoan.maturityDate,
			currency:         existingLoan.currency,
			currencyValue:    existingLoan.currencyValue,
			usdValue:         existingLoan.usdValue,
			interest:         existingLoan.interest,
			todayInterest:    existingLoan.todayInterest,
			maturityInterest: existingLoan.maturityInterest,
			marketValueUSD:   existingLoan.marketValueUSD,
			comment:          existingLoan.comment,
		}

		await this.prismaService.editLog.create({
			data: {
				clientId:     updatedLoan.clientId,
				portfolioId:  updatedLoan.portfolioId,
				entityId:     updatedLoan.entityId,
				bankId:       updatedLoan.bankId,
				accountId:    updatedLoan.accountId,
				instanceId:   updatedLoan.id,
				editedAt:     new Date(),
				instanceType: LogInstanceType.Asset,
				actionType:   LogActionType.Edit,
				assetName:    updatedLoan.assetName,
				reason:       dto.userInfo.reason,
				userName:     dto.userInfo.name,
				userEmail:    dto.userInfo.email,
				metaAfter:    {
					name:             updatedLoan.name,
					startDate:        updatedLoan.startDate,
					maturityDate:     updatedLoan.maturityDate,
					currency:         updatedLoan.currency,
					currencyValue:    updatedLoan.currencyValue,
					usdValue:         updatedLoan.usdValue,
					interest:         updatedLoan.interest,
					todayInterest:    updatedLoan.todayInterest,
					maturityInterest: updatedLoan.maturityInterest,
					marketValueUSD:   updatedLoan.marketValueUSD,
					comment:          updatedLoan.comment,
				},
				metaBefore: prevPayload,
			},
		},)

		return {
			id:             updatedLoan.id,
			clientId:       updatedLoan.clientId,
			portfolioId:    updatedLoan.portfolioId,
			entityId:       updatedLoan.entityId,
			bankId:         updatedLoan.bankId,
			accountId:      updatedLoan.accountId,
			assetName:      updatedLoan.assetName,
			isFutureDated:  updatedLoan.isFutureDated,
			isArchived:     updatedLoan.isArchived,
			payload,
			createdAt:      updatedLoan.createdAt,
			updatedAt:      updatedLoan.updatedAt,
		} as unknown as Asset
	}

	public async updateOption(id: string, dto: UpdateAssetDto,): Promise<Asset> {
		if (!dto.payload) {
			throw new HttpException('Data is missing', HttpStatus.BAD_REQUEST,)
		}

		const parsedPayload = JSON.parse(dto.payload,) as {
		startDate: string
		maturityDate: string
		pairAssetCurrency: string
		currency: CurrencyDataList
		principalValue: number
		marketValueUSD?: number
		strike: number
		premium: number
		contracts: number
		marketOpenValue: number
		currentMarketValue: number
		comment?: string
	}

		await this.cacheService.deleteByUrl([
			...cacheKeysToDeleteAsset.options,
			...cacheKeysToDeleteAsset.portfolio,
			...cacheKeysToDeleteAsset.client,
		],)

		/* ────────────────────────────────────────────
	   CASE 1: UPDATE VERSION ONLY
	────────────────────────────────────────────── */
		if (dto.isVersion) {
			const existingVersion = await this.prismaService.assetOptionVersion.findUnique({
				where:   { id, },
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			if (!existingVersion) {
				throw new HttpException('Version not found', HttpStatus.BAD_REQUEST,)
			}

			const isFutureDated = new Date(parsedPayload.startDate,) > new Date()

			let rate = existingVersion.rate
			if (parsedPayload.currency !== existingVersion.currency) {
				const currencyData = await this.prismaService.currencyData.findFirst({
					where: { currency: parsedPayload.currency, },
				},)
				if (!currencyData) {
					throw new HttpException('Rate missing', HttpStatus.BAD_REQUEST,)
				}
				rate = currencyData.rate
			}

			const marketValueUSD =
			parsedPayload.marketValueUSD ??
			parseFloat((parsedPayload.currentMarketValue * rate).toFixed(2,),)

			const updatedVersion = await this.prismaService.assetOptionVersion.update({
				where: { id, },
				data:  {
					assetName:          existingVersion.assetName,
					currency:           parsedPayload.currency,
					principalValue:     parsedPayload.principalValue,
					marketValueUSD,
					startDate:          parsedPayload.startDate,
					maturityDate:       parsedPayload.maturityDate,
					strike:             parsedPayload.strike,
					premium:            parsedPayload.premium,
					contracts:          parsedPayload.contracts,
					marketOpenValue:    parsedPayload.marketOpenValue,
					currentMarketValue: parsedPayload.currentMarketValue,
					comment:            parsedPayload.comment,
					rate,
					isFutureDated,
					pairAssetCurrency:  parsedPayload.pairAssetCurrency,
				},
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			const payload = JSON.stringify({
				comment:            updatedVersion.comment,
				currency:           updatedVersion.currency,
				startDate:          updatedVersion.startDate,
				maturityDate:       updatedVersion.maturityDate,
				pairAssetCurrency:  updatedVersion.pairAssetCurrency,
				principalValue:     updatedVersion.principalValue,
				strike:             updatedVersion.strike,
				premium:            updatedVersion.premium,
				marketOpenValue:    updatedVersion.marketOpenValue,
				currentMarketValue: updatedVersion.currentMarketValue,
				contracts:          updatedVersion.contracts,
			},)

			const prevPayload = {
				currency:           existingVersion.currency,
				pairAssetCurrency:  existingVersion.pairAssetCurrency,
				principalValue:     existingVersion.principalValue,
				marketValueUSD:     existingVersion.marketValueUSD,
				startDate:          existingVersion.startDate,
				maturityDate:       existingVersion.maturityDate,
				strike:             existingVersion.strike,
				premium:            existingVersion.premium,
				contracts:          existingVersion.contracts,
				marketOpenValue:    existingVersion.marketOpenValue,
				currentMarketValue: existingVersion.currentMarketValue,
				comment:            existingVersion.comment,
			}

			await this.prismaService.editLog.create({
				data: {
					clientId:     updatedVersion.clientId,
					portfolioId:  updatedVersion.portfolioId,
					entityId:     updatedVersion.entityId,
					bankId:       updatedVersion.bankId,
					accountId:    updatedVersion.accountId,
					instanceId:   updatedVersion.id,
					editedAt:     new Date(),
					instanceType: LogInstanceType.AssetVersion,
					actionType:   LogActionType.Edit,
					assetName:    updatedVersion.assetName,
					reason:       dto.userInfo.reason,
					userName:     dto.userInfo.name,
					userEmail:    dto.userInfo.email,
					metaAfter:    {
						currency:           updatedVersion.currency,
						pairAssetCurrency:  updatedVersion.pairAssetCurrency,
						principalValue:     updatedVersion.principalValue,
						marketValueUSD:     updatedVersion.marketValueUSD,
						startDate:          updatedVersion.startDate,
						maturityDate:       updatedVersion.maturityDate,
						strike:             updatedVersion.strike,
						premium:            updatedVersion.premium,
						contracts:          updatedVersion.contracts,
						marketOpenValue:    updatedVersion.marketOpenValue,
						currentMarketValue: updatedVersion.currentMarketValue,
						comment:            updatedVersion.comment,
					},
					metaBefore: prevPayload,
				},
			},)

			return {
				id:            updatedVersion.id,
				clientId:      updatedVersion.clientId,
				portfolioId:   updatedVersion.portfolioId,
				entityId:      updatedVersion.entityId,
				bankId:        updatedVersion.bankId,
				accountId:     updatedVersion.accountId,
				assetName:     updatedVersion.assetName,
				isFutureDated: updatedVersion.isFutureDated,
				isArchived:    updatedVersion.isArchived,
				payload,
				createdAt:     updatedVersion.createdAt,
				updatedAt:     updatedVersion.updatedAt,
			} as unknown as Asset
		}

		/* ────────────────────────────────────────────
	   CASE 2: NORMAL UPDATE = snapshot + update asset
	────────────────────────────────────────────── */

		const existingOption = await this.prismaService.assetOption.findUnique({
			where:   { id, },
			include: {
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
				versions:  true,
			},
		},)

		if (!existingOption) {
			throw new HttpException('Option not found', HttpStatus.BAD_REQUEST,)
		}

		const isSameDay = (d1: Date, d2: Date,): boolean => {
			return d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
		}

		const createdToday = isSameDay(existingOption.createdAt, new Date(),)
		const versionDate = existingOption.startDate
		const {
			id: optionId,
			versions,
			...data
		} = existingOption

		if (!createdToday) {
			await this.prismaService.assetOptionVersion.create({
				data: {
					clientId:           existingOption.clientId,
					portfolioId:        existingOption.portfolioId,
					entityId:           existingOption.entityId,
					bankId:             existingOption.bankId,
					accountId:          existingOption.accountId,
					assetName:          existingOption.assetName,
					currency:           existingOption.currency,
					principalValue:     existingOption.principalValue,
					marketValueUSD:     existingOption.marketValueUSD,
					startDate:          existingOption.startDate,
					maturityDate:       existingOption.maturityDate,
					strike:             existingOption.strike,
					premium:            existingOption.premium,
					contracts:          existingOption.contracts,
					marketOpenValue:    existingOption.marketOpenValue,
					currentMarketValue: existingOption.currentMarketValue,
					comment:            existingOption.comment,
					rate:               existingOption.rate,
					isFutureDated:      existingOption.isFutureDated,
					isArchived:         existingOption.isArchived,
					// createdAt:          versionDate,
					// updatedAt:          versionDate,
					createdAt:          Boolean(versions?.length,) ?
						new Date() :
						new Date(parsedPayload.startDate,),
					updatedAt: Boolean(versions?.length,) ?
						new Date() :
						new Date(parsedPayload.startDate,),
					transactionId:      existingOption.transactionId ?? undefined,
					pairAssetCurrency:  existingOption.pairAssetCurrency,
					assetOptionId:      existingOption.id,
				},
			},)
		}

		const isFutureDated = new Date(parsedPayload.startDate,) > new Date()

		let rate = existingOption.rate
		if (parsedPayload.currency !== existingOption.currency) {
			const currencyData = await this.prismaService.currencyData.findFirst({
				where: { currency: parsedPayload.currency, },
			},)
			if (!currencyData) {
				throw new HttpException('Rate missing', HttpStatus.BAD_REQUEST,)
			}
			rate = currencyData.rate
		}

		const marketValueUSD =
		parsedPayload.marketValueUSD ??
		parseFloat((parsedPayload.currentMarketValue * rate).toFixed(2,),)

		const updatedOption = await this.prismaService.assetOption.update({
			where: { id, },
			data:  {
				assetName:          existingOption.assetName,
				currency:           parsedPayload.currency,
				principalValue:     parsedPayload.principalValue,
				marketValueUSD,
				startDate:          parsedPayload.startDate,
				maturityDate:       parsedPayload.maturityDate,
				strike:             parsedPayload.strike,
				premium:            parsedPayload.premium,
				contracts:          parsedPayload.contracts,
				marketOpenValue:    parsedPayload.marketOpenValue,
				currentMarketValue: parsedPayload.currentMarketValue,
				comment:            parsedPayload.comment,
				rate,
				isFutureDated,
				pairAssetCurrency:  parsedPayload.pairAssetCurrency,
			},
			include: {
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
			},
		},)

		const payload = JSON.stringify({
			comment:            updatedOption.comment,
			currency:           updatedOption.currency,
			startDate:          updatedOption.startDate,
			maturityDate:       updatedOption.maturityDate,
			pairAssetCurrency:  updatedOption.pairAssetCurrency,
			principalValue:     updatedOption.principalValue,
			strike:             updatedOption.strike,
			premium:            updatedOption.premium,
			marketOpenValue:    updatedOption.marketOpenValue,
			currentMarketValue: updatedOption.currentMarketValue,
			contracts:          updatedOption.contracts,
		},)

		const prevPayload = {
			currency:           existingOption.currency,
			pairAssetCurrency:  existingOption.pairAssetCurrency,
			principalValue:     existingOption.principalValue,
			marketValueUSD:     existingOption.marketValueUSD,
			startDate:          existingOption.startDate,
			maturityDate:       existingOption.maturityDate,
			strike:             existingOption.strike,
			premium:            existingOption.premium,
			contracts:          existingOption.contracts,
			marketOpenValue:    existingOption.marketOpenValue,
			currentMarketValue: existingOption.currentMarketValue,
			comment:            existingOption.comment,
		}

		await this.prismaService.editLog.create({
			data: {
				clientId:     updatedOption.clientId,
				portfolioId:  updatedOption.portfolioId,
				entityId:     updatedOption.entityId,
				bankId:       updatedOption.bankId,
				accountId:    updatedOption.accountId,
				instanceId:   updatedOption.id,
				editedAt:     new Date(),
				instanceType: LogInstanceType.Asset,
				actionType:   LogActionType.Edit,
				assetName:    updatedOption.assetName,
				reason:       dto.userInfo.reason,
				userName:     dto.userInfo.name,
				userEmail:    dto.userInfo.email,
				metaAfter:    {
					currency:           updatedOption.currency,
					pairAssetCurrency:  updatedOption.pairAssetCurrency,
					principalValue:     updatedOption.principalValue,
					marketValueUSD:     updatedOption.marketValueUSD,
					startDate:          updatedOption.startDate,
					maturityDate:       updatedOption.maturityDate,
					strike:             updatedOption.strike,
					premium:            updatedOption.premium,
					contracts:          updatedOption.contracts,
					marketOpenValue:    updatedOption.marketOpenValue,
					currentMarketValue: updatedOption.currentMarketValue,
					comment:            updatedOption.comment,
				},
				metaBefore: prevPayload,
			},
		},)

		return {
			id:            updatedOption.id,
			clientId:      updatedOption.clientId,
			portfolioId:   updatedOption.portfolioId,
			entityId:      updatedOption.entityId,
			bankId:        updatedOption.bankId,
			accountId:     updatedOption.accountId,
			assetName:     updatedOption.assetName,
			isFutureDated: updatedOption.isFutureDated,
			isArchived:    updatedOption.isArchived,
			payload,
			createdAt:     updatedOption.createdAt,
			updatedAt:     updatedOption.updatedAt,
		} as unknown as Asset
	}

	// todo: clear if new ver good
	// public async updateOtherInvestment(
	// 	id: string,
	// 	body: UpdateAssetDto,
	// ): Promise<Asset> {
	// 	try {
	// 		return this.prismaService.$transaction(async(tx,) => {
	// 			await this.cacheService.deleteByUrl([
	// 				...cacheKeysToDeleteAsset.other,
	// 				...cacheKeysToDeleteAsset.portfolio,
	// 				...cacheKeysToDeleteAsset.client,
	// 			],)

	// 			const parsedPayload = JSON.parse(body.payload,)
	// 			const {
	// 				investmentDate,
	// 				currency,
	// 				currencyValue,
	// 				investmentAssetName,
	// 				serviceProvider,
	// 				comment,
	// 				usdValue,
	// 			} = parsedPayload
	// 			const isFutureDated = new Date(investmentDate,) > new Date()

	// 			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	// 			const calcFx = async() => {
	// 				const [currencyWithHistory, historyCurrencyData,] = await Promise.all([
	// 					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
	// 					this.prismaService.currencyHistoryData.findMany(),
	// 				],)

	// 				const currencyData = currencyWithHistory.find((item,) => {
	// 					return item.currency === currency
	// 				},)
	// 				if (!currencyData) {
	// 					throw new HttpException('Data is missing', 400,)
	// 				}

	// 				const costRateDate = new Date(investmentDate,)
	// 				const costCurrencyDataRate =
	// 				currency === CurrencyDataList.USD ?
	// 					1 :
	// 					historyCurrencyData
	// 						.filter((item,) => {
	// 							return (
	// 								new Date(item.date,).getTime() >= costRateDate.getTime() &&
	// 									currencyData.id === item.currencyId
	// 							)
	// 						},)
	// 						.sort((a, b,) => {
	// 							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
	// 						},)[0]?.rate

	// 				const costValueUSD =
	// 				Number(currencyValue,) *
	// 				(costCurrencyDataRate ?? currencyData.rate ?? 1)

	// 				const marketValueUSD = currencyValue * currencyData.rate
	// 				const profitUSD = marketValueUSD - costValueUSD
	// 				const profitPercentage = costValueUSD ?
	// 					(profitUSD / costValueUSD) * 100 :
	// 					0

	// 				return {
	// 					rate:             currencyData.rate,
	// 					costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
	// 					marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
	// 					profitUSD:        parseFloat(profitUSD.toFixed(2,),),
	// 					profitPercentage: parseFloat(profitPercentage.toFixed(2,),),
	// 				}
	// 			}

	// 			if (body.isVersion) {
	// 				const version = await tx.assetOtherInvestmentVersion.findUnique({ where: { id, }, },)
	// 				if (!version) {
	// 					throw new HttpException('Version not found', 400,)
	// 				}

	// 				const fx = await calcFx()

	// 				const updated = await tx.assetOtherInvestmentVersion.update({
	// 					where: { id, },
	// 					data:  {
	// 						assetName:        body.assetName,
	// 						investmentDate,
	// 						investmentAssetName,
	// 						currency,
	// 						currencyValue,
	// 						usdValue,
	// 						serviceProvider,
	// 						comment,
	// 						marketValueUSD:   fx.marketValueUSD,
	// 						costValueUSD:     fx.costValueUSD,
	// 						profitUSD:        fx.profitUSD,
	// 						profitPercentage: fx.profitPercentage,
	// 						rate:             fx.rate,
	// 						isFutureDated,
	// 						isArchived:       false,
	// 					},
	// 				},)

	// 				const payload = JSON.stringify({
	// 					comment:             updated.comment,
	// 					investmentAssetName: updated.investmentAssetName,
	// 					currency:            updated.currency,
	// 					investmentDate:      updated.investmentDate,
	// 					currencyValue:       updated.currencyValue,
	// 					usdValue:            updated.usdValue,
	// 					serviceProvider:     updated.serviceProvider,
	// 				},)

	// 				return {
	// 					id:               updated.id,
	// 					clientId:         updated.clientId,
	// 					portfolioId:      updated.portfolioId,
	// 					entityId:         updated.entityId,
	// 					bankId:           updated.bankId,
	// 					accountId:        updated.accountId,
	// 					assetName:        updated.assetName,
	// 					createdAt:        updated.createdAt,
	// 					updatedAt:        updated.updatedAt,
	// 					payload,
	// 					isArchived:       updated.isArchived,
	// 					isFutureDated:    updated.isFutureDated,
	// 					rate:             updated.rate,
	// 					portfolioDraftId: null,
	// 				}
	// 			}

	// 			const existing = await tx.assetOtherInvestment.findUnique({
	// 				where:   { id, },
	// 				include: { versions: true, },
	// 			},)
	// 			if (!existing) {
	// 				throw new HttpException('Asset not found', 404,)
	// 			}

	// 			const createdToday =
	// 			existing.createdAt.toDateString() === new Date().toDateString()

	// 			const fx = await calcFx()

	// 			if (!createdToday) {
	// 				await tx.assetOtherInvestmentVersion.create({
	// 					data: {
	// 						clientId:               existing.clientId,
	// 						portfolioId:            existing.portfolioId,
	// 						entityId:               existing.entityId,
	// 						bankId:                 existing.bankId,
	// 						accountId:              existing.accountId,
	// 						assetName:              existing.assetName,
	// 						currency:               existing.currency,
	// 						currencyValue:          existing.currencyValue,
	// 						usdValue:               existing.usdValue,
	// 						marketValueUSD:         existing.marketValueUSD,
	// 						costValueUSD:           existing.costValueUSD,
	// 						profitUSD:              existing.profitUSD,
	// 						profitPercentage:       existing.profitPercentage,
	// 						investmentAssetName:    existing.investmentAssetName,
	// 						investmentDate:         existing.investmentDate,
	// 						serviceProvider:        existing.serviceProvider,
	// 						comment:                existing.comment,
	// 						rate:                   existing.rate,
	// 						isFutureDated:          existing.isFutureDated,
	// 						isArchived:             existing.isArchived,
	// 						assetOtherInvestmentId: existing.id,
	// 						createdAt:              existing.versions.length ?
	// 							new Date() :
	// 							new Date(investmentDate,),
	// 						updatedAt:              existing.versions.length ?
	// 							new Date() :
	// 							new Date(investmentDate,),
	// 					},
	// 				},)
	// 			}

	// 			const updated = await tx.assetOtherInvestment.update({
	// 				where: { id, },
	// 				data:  {
	// 					assetName:        existing.assetName,
	// 					investmentDate,
	// 					investmentAssetName,
	// 					currency,
	// 					currencyValue,
	// 					usdValue,
	// 					serviceProvider,
	// 					comment,
	// 					marketValueUSD:   fx.marketValueUSD,
	// 					costValueUSD:     fx.costValueUSD,
	// 					profitUSD:        fx.profitUSD,
	// 					profitPercentage: fx.profitPercentage,
	// 					rate:             fx.rate,
	// 					isFutureDated,
	// 					isArchived:       false,
	// 				},
	// 			},)

	// 			const payload = JSON.stringify({
	// 				comment:             updated.comment,
	// 				investmentAssetName: updated.investmentAssetName,
	// 				currency:            updated.currency,
	// 				investmentDate:      updated.investmentDate,
	// 				currencyValue:       updated.currencyValue,
	// 				usdValue:            updated.usdValue,
	// 				serviceProvider:     updated.serviceProvider,
	// 			},)

	// 			return {
	// 				id:               updated.id,
	// 				clientId:         updated.clientId,
	// 				portfolioId:      updated.portfolioId,
	// 				entityId:         updated.entityId,
	// 				bankId:           updated.bankId,
	// 				accountId:        updated.accountId,
	// 				assetName:        updated.assetName,
	// 				createdAt:        updated.createdAt,
	// 				updatedAt:        updated.updatedAt,
	// 				payload,
	// 				isArchived:       updated.isArchived,
	// 				isFutureDated:    updated.isFutureDated,
	// 				rate:             updated.rate,
	// 				portfolioDraftId: null,
	// 			}
	// 		},)
	// 	} catch (e) {
	// 		throw new HttpException('Asset not found', 404,)
	// 	}
	// }
	public async updateOtherInvestment(
		id: string,
		body: UpdateAssetDto,
	): Promise<Asset> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				await this.cacheService.deleteByUrl([
					...cacheKeysToDeleteAsset.other,
					...cacheKeysToDeleteAsset.portfolio,
					...cacheKeysToDeleteAsset.client,
				],)

				const parsedPayload = JSON.parse(body.payload,)
				const {
					investmentDate,
					currency,
					currencyValue,
					investmentAssetName,
					serviceProvider,
					comment,
					usdValue,
				} = parsedPayload
				const isFutureDated = new Date(investmentDate,) > new Date()

				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				const calcFx = async() => {
					const [currencyWithHistory, historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.currencyHistoryData.findMany(),
					],)

					const currencyData = currencyWithHistory.find((item,) => {
						return item.currency === currency
					},)
					if (!currencyData) {
						throw new HttpException('Data is missing', 400,)
					}

					const costRateDate = new Date(investmentDate,)
					const costCurrencyDataRate =
				currency === CurrencyDataList.USD ?
					1 :
					historyCurrencyData
						.filter((item,) => {
							return (
								new Date(item.date,).getTime() >= costRateDate.getTime() &&
								currencyData.id === item.currencyId
							)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate

					const costValueUSD =
				Number(currencyValue,) *
				(costCurrencyDataRate ?? currencyData.rate ?? 1)

					const marketValueUSD = currencyValue * currencyData.rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costValueUSD ?
						(profitUSD / costValueUSD) * 100 :
						0

					return {
						rate:             currencyData.rate,
						costValueUSD:     parseFloat(costValueUSD.toFixed(2,),),
						marketValueUSD:   parseFloat(marketValueUSD.toFixed(2,),),
						profitUSD:        parseFloat(profitUSD.toFixed(2,),),
						profitPercentage: parseFloat(profitPercentage.toFixed(2,),),
					}
				}

				if (body.isVersion) {
					const existingVersion = await tx.assetOtherInvestmentVersion.findUnique({
						where: { id, },
					},)

					if (!existingVersion) {
						throw new HttpException('Version not found', 400,)
					}

					const prevPayload = {
						currency:            existingVersion.currency,
						currencyValue:       existingVersion.currencyValue,
						usdValue:            existingVersion.usdValue,
						marketValueUSD:      existingVersion.marketValueUSD,
						costValueUSD:        existingVersion.costValueUSD,
						profitUSD:           existingVersion.profitUSD,
						profitPercentage:    existingVersion.profitPercentage,
						investmentAssetName: existingVersion.investmentAssetName,
						investmentDate:      existingVersion.investmentDate,
						serviceProvider:     existingVersion.serviceProvider,
						comment:             existingVersion.comment,
					}

					const fx = await calcFx()

					const updated = await tx.assetOtherInvestmentVersion.update({
						where: { id, },
						data:  {
							assetName:        body.assetName,
							investmentDate,
							investmentAssetName,
							currency,
							currencyValue,
							usdValue,
							serviceProvider,
							comment,
							marketValueUSD:   fx.marketValueUSD,
							costValueUSD:     fx.costValueUSD,
							profitUSD:        fx.profitUSD,
							profitPercentage: fx.profitPercentage,
							rate:             fx.rate,
							isFutureDated,
							isArchived:       false,
						},
					},)

					const payload = JSON.stringify({
						comment:             updated.comment,
						investmentAssetName: updated.investmentAssetName,
						currency:            updated.currency,
						investmentDate:      updated.investmentDate,
						currencyValue:       updated.currencyValue,
						usdValue:            updated.usdValue,
						serviceProvider:     updated.serviceProvider,
					},)

					await tx.editLog.create({
						data: {
							clientId:     updated.clientId,
							portfolioId:  updated.portfolioId,
							entityId:     updated.entityId,
							bankId:       updated.bankId,
							accountId:    updated.accountId,
							instanceId:   updated.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.AssetVersion,
							actionType:   LogActionType.Edit,
							assetName:    updated.assetName,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								currency:            updated.currency,
								currencyValue:       updated.currencyValue,
								usdValue:            updated.usdValue,
								marketValueUSD:      updated.marketValueUSD,
								costValueUSD:        updated.costValueUSD,
								profitUSD:           updated.profitUSD,
								profitPercentage:    updated.profitPercentage,
								investmentAssetName: updated.investmentAssetName,
								investmentDate:      updated.investmentDate,
								serviceProvider:     updated.serviceProvider,
								comment:             updated.comment,
							},
							metaBefore: prevPayload,
						},
					},)

					return {
						id:               updated.id,
						clientId:         updated.clientId,
						portfolioId:      updated.portfolioId,
						entityId:         updated.entityId,
						bankId:           updated.bankId,
						accountId:        updated.accountId,
						assetName:        updated.assetName,
						createdAt:        updated.createdAt,
						updatedAt:        updated.updatedAt,
						payload,
						isArchived:       updated.isArchived,
						isFutureDated:    updated.isFutureDated,
						rate:             updated.rate,
						portfolioDraftId: null,
					}
				}

				const existing = await tx.assetOtherInvestment.findUnique({
					where:   { id, },
					include: { versions: true, },
				},)
				if (!existing) {
					throw new HttpException('Asset not found', 404,)
				}

				const createdToday =
			existing.createdAt.toDateString() === new Date().toDateString()

				const prevPayload = {
					currency:            existing.currency,
					currencyValue:       existing.currencyValue,
					usdValue:            existing.usdValue,
					marketValueUSD:      existing.marketValueUSD,
					costValueUSD:        existing.costValueUSD,
					profitUSD:           existing.profitUSD,
					profitPercentage:    existing.profitPercentage,
					investmentAssetName: existing.investmentAssetName,
					investmentDate:      existing.investmentDate,
					serviceProvider:     existing.serviceProvider,
					comment:             existing.comment,
				}

				const fx = await calcFx()

				if (!createdToday) {
					await tx.assetOtherInvestmentVersion.create({
						data: {
							clientId:               existing.clientId,
							portfolioId:            existing.portfolioId,
							entityId:               existing.entityId,
							bankId:                 existing.bankId,
							accountId:              existing.accountId,
							assetName:              existing.assetName,
							currency:               existing.currency,
							currencyValue:          existing.currencyValue,
							usdValue:               existing.usdValue,
							marketValueUSD:         existing.marketValueUSD,
							costValueUSD:           existing.costValueUSD,
							profitUSD:              existing.profitUSD,
							profitPercentage:       existing.profitPercentage,
							investmentAssetName:    existing.investmentAssetName,
							investmentDate:         existing.investmentDate,
							serviceProvider:        existing.serviceProvider,
							comment:                existing.comment,
							rate:                   existing.rate,
							isFutureDated:          existing.isFutureDated,
							isArchived:             existing.isArchived,
							assetOtherInvestmentId: existing.id,
							createdAt:              existing.versions.length ?
								new Date() :
								new Date(investmentDate,),
							updatedAt:              existing.versions.length ?
								new Date() :
								new Date(investmentDate,),
						},
					},)
				}

				const updated = await tx.assetOtherInvestment.update({
					where: { id, },
					data:  {
						assetName:        existing.assetName,
						investmentDate,
						investmentAssetName,
						currency,
						currencyValue,
						usdValue,
						serviceProvider,
						comment,
						marketValueUSD:   fx.marketValueUSD,
						costValueUSD:     fx.costValueUSD,
						profitUSD:        fx.profitUSD,
						profitPercentage: fx.profitPercentage,
						rate:             fx.rate,
						isFutureDated,
						isArchived:       false,
					},
				},)

				const payload = JSON.stringify({
					comment:             updated.comment,
					investmentAssetName: updated.investmentAssetName,
					currency:            updated.currency,
					investmentDate:      updated.investmentDate,
					currencyValue:       updated.currencyValue,
					usdValue:            updated.usdValue,
					serviceProvider:     updated.serviceProvider,
				},)

				await tx.editLog.create({
					data: {
						clientId:     updated.clientId,
						portfolioId:  updated.portfolioId,
						entityId:     updated.entityId,
						bankId:       updated.bankId,
						accountId:    updated.accountId,
						instanceId:   updated.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Edit,
						assetName:    updated.assetName,
						reason:       body.userInfo.reason,
						userName:     body.userInfo.name,
						userEmail:    body.userInfo.email,
						metaAfter:    {
							currency:            updated.currency,
							currencyValue:       updated.currencyValue,
							usdValue:            updated.usdValue,
							marketValueUSD:      updated.marketValueUSD,
							costValueUSD:        updated.costValueUSD,
							profitUSD:           updated.profitUSD,
							profitPercentage:    updated.profitPercentage,
							investmentAssetName: updated.investmentAssetName,
							investmentDate:      updated.investmentDate,
							serviceProvider:     updated.serviceProvider,
							comment:             updated.comment,
						},
						metaBefore: prevPayload,
					},
				},)

				return {
					id:               updated.id,
					clientId:         updated.clientId,
					portfolioId:      updated.portfolioId,
					entityId:         updated.entityId,
					bankId:           updated.bankId,
					accountId:        updated.accountId,
					assetName:        updated.assetName,
					createdAt:        updated.createdAt,
					updatedAt:        updated.updatedAt,
					payload,
					isArchived:       updated.isArchived,
					isFutureDated:    updated.isFutureDated,
					rate:             updated.rate,
					portfolioDraftId: null,
				}
			},)
		} catch (e) {
			throw new HttpException('Asset not found', 404,)
		}
	}

	public async updatePrivateEquity(id: string, dto: UpdateAssetDto,): Promise<Asset> {
		if (!dto.payload) {
			throw new HttpException('Data is missing', HttpStatus.BAD_REQUEST,)
		}

		const parsedPayload = JSON.parse(dto.payload,) as {
			fundType: string
			status: string
			currency: CurrencyDataList
			entryDate: string
			currencyValue: number
			marketValueUSD?: number
			serviceProvider: string
			geography?: string
			fundName: string
			fundID: string
			fundSize?: string
			aboutFund: string
			investmentPeriod?: string
			fundTermDate: string
			capitalCalled: number
			lastValuationDate: string
			moic: number
			irr?: number
			liquidity?: number
			totalCommitment: number
			tvpi: number
			managementExpenses?: number
			otherExpenses?: number
			carriedInterest?: number
			distributions?: number
			holdingEntity?: string
			comment?: string
		}

		await this.cacheService.deleteByUrl([
			...cacheKeysToDeleteAsset.private,
			...cacheKeysToDeleteAsset.portfolio,
			...cacheKeysToDeleteAsset.client,
		],)

		if (dto.isVersion) {
			const existingVersion = await this.prismaService.assetPrivateEquityVersion.findUnique({
				where:   { id, },
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			if (!existingVersion) {
				throw new HttpException('Version not found', HttpStatus.BAD_REQUEST,)
			}

			const isFutureDated = new Date(parsedPayload.entryDate,) > new Date()

			const currencyWithHistory = await this.prismaService.currencyData.findFirst({
				where: {
					currency: { equals: parsedPayload.currency, },
				},
				include: {
					currencyHistory: {
						where: {
							date: { gte: parsedPayload.entryDate as unknown as Date, },
						},
						orderBy: {
							date: 'asc',
						},
						take: 1,
					},
				},
			},)

			const rate =
			currencyWithHistory?.currencyHistory?.[0]?.rate ??
			currencyWithHistory?.rate ??
			existingVersion.rate

			const marketValueUSD =
			parsedPayload.marketValueUSD ??
			parseFloat((parsedPayload.currencyValue * (rate ?? 1)).toFixed(2,),)

			const updatedVersion = await this.prismaService.assetPrivateEquityVersion.update({
				where: { id, },
				data:  {
					assetName:          existingVersion.assetName,
					currency:           parsedPayload.currency,
					currencyValue:      parsedPayload.currencyValue,
					marketValueUSD,
					fundType:           parsedPayload.fundType,
					status:             parsedPayload.status,
					entryDate:          parsedPayload.entryDate,
					fundTermDate:       parsedPayload.fundTermDate,
					lastValuationDate:  parsedPayload.lastValuationDate,
					serviceProvider:    parsedPayload.serviceProvider,
					geography:          parsedPayload.geography,
					fundName:           parsedPayload.fundName,
					fundID:             parsedPayload.fundID,
					fundSize:           parsedPayload.fundSize,
					aboutFund:          parsedPayload.aboutFund,
					investmentPeriod:   parsedPayload.investmentPeriod,
					capitalCalled:      parsedPayload.capitalCalled,
					moic:               parsedPayload.moic,
					irr:                parsedPayload.irr,
					liquidity:          parsedPayload.liquidity,
					totalCommitment:    parsedPayload.totalCommitment,
					tvpi:               parsedPayload.tvpi,
					managementExpenses: parsedPayload.managementExpenses,
					otherExpenses:      parsedPayload.otherExpenses,
					carriedInterest:    parsedPayload.carriedInterest,
					distributions:      parsedPayload.distributions,
					holdingEntity:      parsedPayload.holdingEntity,
					comment:            parsedPayload.comment,
					rate,
					isFutureDated,
				},
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			const payload = JSON.stringify({
				fundType:           updatedVersion.fundType,
				status:             updatedVersion.status,
				currency:           updatedVersion.currency,
				entryDate:          updatedVersion.entryDate,
				currencyValue:      updatedVersion.currencyValue,
				serviceProvider:    updatedVersion.serviceProvider,
				geography:          updatedVersion.geography,
				fundName:           updatedVersion.fundName,
				fundID:             updatedVersion.fundID,
				fundSize:           updatedVersion.fundSize,
				aboutFund:          updatedVersion.aboutFund,
				investmentPeriod:   updatedVersion.investmentPeriod,
				fundTermDate:       updatedVersion.fundTermDate,
				capitalCalled:      updatedVersion.capitalCalled,
				lastValuationDate:  updatedVersion.lastValuationDate,
				moic:               updatedVersion.moic,
				irr:                updatedVersion.irr,
				liquidity:          updatedVersion.liquidity,
				totalCommitment:    updatedVersion.totalCommitment,
				tvpi:               updatedVersion.tvpi,
				managementExpenses: updatedVersion.managementExpenses,
				otherExpenses:      updatedVersion.otherExpenses,
				carriedInterest:    updatedVersion.carriedInterest,
				distributions:      updatedVersion.distributions,
				holdingEntity:      updatedVersion.holdingEntity,
				comment:            updatedVersion.comment,
			},)

			const prevPayload = {
				currency:           existingVersion.currency,
				currencyValue:      existingVersion.currencyValue,
				marketValueUSD:     existingVersion.marketValueUSD,
				fundType:           existingVersion.fundType,
				status:             existingVersion.status,
				entryDate:          existingVersion.entryDate,
				fundTermDate:       existingVersion.fundTermDate,
				lastValuationDate:  existingVersion.lastValuationDate,
				serviceProvider:    existingVersion.serviceProvider,
				geography:          existingVersion.geography,
				fundName:           existingVersion.fundName,
				fundID:             existingVersion.fundID,
				fundSize:           existingVersion.fundSize,
				aboutFund:          existingVersion.aboutFund,
				investmentPeriod:   existingVersion.investmentPeriod,
				capitalCalled:      existingVersion.capitalCalled,
				moic:               existingVersion.moic,
				irr:                existingVersion.irr,
				liquidity:          existingVersion.liquidity,
				totalCommitment:    existingVersion.totalCommitment,
				tvpi:               existingVersion.tvpi,
				managementExpenses: existingVersion.managementExpenses,
				otherExpenses:      existingVersion.otherExpenses,
				carriedInterest:    existingVersion.carriedInterest,
				distributions:      existingVersion.distributions,
				holdingEntity:      existingVersion.holdingEntity,
				comment:            existingVersion.comment,
			}

			await this.prismaService.editLog.create({
				data: {
					clientId:     updatedVersion.clientId,
					portfolioId:  updatedVersion.portfolioId,
					entityId:     updatedVersion.entityId,
					bankId:       updatedVersion.bankId,
					accountId:    updatedVersion.accountId,
					instanceId:   updatedVersion.id,
					editedAt:     new Date(),
					instanceType: LogInstanceType.AssetVersion,
					actionType:   LogActionType.Edit,
					assetName:    updatedVersion.assetName,
					reason:       dto.userInfo.reason,
					userName:     dto.userInfo.name,
					userEmail:    dto.userInfo.email,
					metaAfter:    {
						currency:           updatedVersion.currency,
						currencyValue:      updatedVersion.currencyValue,
						marketValueUSD:     updatedVersion.marketValueUSD,
						fundType:           updatedVersion.fundType,
						status:             updatedVersion.status,
						entryDate:          updatedVersion.entryDate,
						fundTermDate:       updatedVersion.fundTermDate,
						lastValuationDate:  updatedVersion.lastValuationDate,
						serviceProvider:    updatedVersion.serviceProvider,
						geography:          updatedVersion.geography,
						fundName:           updatedVersion.fundName,
						fundID:             updatedVersion.fundID,
						fundSize:           updatedVersion.fundSize,
						aboutFund:          updatedVersion.aboutFund,
						investmentPeriod:   updatedVersion.investmentPeriod,
						capitalCalled:      updatedVersion.capitalCalled,
						moic:               updatedVersion.moic,
						irr:                updatedVersion.irr,
						liquidity:          updatedVersion.liquidity,
						totalCommitment:    updatedVersion.totalCommitment,
						tvpi:               updatedVersion.tvpi,
						managementExpenses: updatedVersion.managementExpenses,
						otherExpenses:      updatedVersion.otherExpenses,
						carriedInterest:    updatedVersion.carriedInterest,
						distributions:      updatedVersion.distributions,
						holdingEntity:      updatedVersion.holdingEntity,
						comment:            updatedVersion.comment,
					},
					metaBefore: prevPayload,
				},
			},)

			return {
				id:            updatedVersion.id,
				clientId:      updatedVersion.clientId,
				portfolioId:   updatedVersion.portfolioId,
				entityId:      updatedVersion.entityId,
				bankId:        updatedVersion.bankId,
				accountId:     updatedVersion.accountId,
				assetName:     updatedVersion.assetName,
				isFutureDated: updatedVersion.isFutureDated,
				isArchived:    updatedVersion.isArchived,
				payload,
				createdAt:     updatedVersion.createdAt,
				updatedAt:     updatedVersion.updatedAt,
			} as unknown as Asset
		}

		const existingPrivateEquity = await this.prismaService.assetPrivateEquity.findUnique({
			where:   { id, },
			include: {
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
				versions:  true,
			},
		},)

		if (!existingPrivateEquity) {
			throw new HttpException('Private equity not found', HttpStatus.BAD_REQUEST,)
		}

		const isSameDay = (d1: Date, d2: Date,): boolean => {
			return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		}

		const createdToday = isSameDay(existingPrivateEquity.createdAt, new Date(),)
		const { versions, } = existingPrivateEquity

		if (!createdToday) {
			await this.prismaService.assetPrivateEquityVersion.create({
				data: {
					clientId:           existingPrivateEquity.clientId,
					portfolioId:        existingPrivateEquity.portfolioId,
					entityId:           existingPrivateEquity.entityId,
					bankId:             existingPrivateEquity.bankId,
					accountId:          existingPrivateEquity.accountId,
					assetName:          existingPrivateEquity.assetName,
					currency:           existingPrivateEquity.currency,
					currencyValue:      existingPrivateEquity.currencyValue,
					marketValueUSD:     existingPrivateEquity.marketValueUSD,
					pl:                 existingPrivateEquity.pl,
					fundType:           existingPrivateEquity.fundType,
					status:             existingPrivateEquity.status,
					entryDate:          existingPrivateEquity.entryDate,
					fundTermDate:       existingPrivateEquity.fundTermDate,
					lastValuationDate:  existingPrivateEquity.lastValuationDate,
					serviceProvider:    existingPrivateEquity.serviceProvider,
					geography:          existingPrivateEquity.geography,
					fundName:           existingPrivateEquity.fundName,
					fundID:             existingPrivateEquity.fundID,
					fundSize:           existingPrivateEquity.fundSize,
					aboutFund:          existingPrivateEquity.aboutFund,
					investmentPeriod:   existingPrivateEquity.investmentPeriod,
					capitalCalled:      existingPrivateEquity.capitalCalled,
					moic:               existingPrivateEquity.moic,
					irr:                existingPrivateEquity.irr,
					liquidity:          existingPrivateEquity.liquidity,
					totalCommitment:    existingPrivateEquity.totalCommitment,
					tvpi:               existingPrivateEquity.tvpi,
					managementExpenses: existingPrivateEquity.managementExpenses,
					otherExpenses:      existingPrivateEquity.otherExpenses,
					carriedInterest:    existingPrivateEquity.carriedInterest,
					distributions:      existingPrivateEquity.distributions,
					holdingEntity:      existingPrivateEquity.holdingEntity,
					comment:            existingPrivateEquity.comment,
					rate:               existingPrivateEquity.rate,
					isFutureDated:      existingPrivateEquity.isFutureDated,
					isArchived:         existingPrivateEquity.isArchived,
					createdAt:          Boolean(versions?.length,) ?
						new Date() :
						new Date(parsedPayload.entryDate,),
					updatedAt:          Boolean(versions?.length,) ?
						new Date() :
						new Date(parsedPayload.entryDate,),
					transactionId:        existingPrivateEquity.transactionId ?? undefined,
					assetPrivateEquityId: existingPrivateEquity.id,
				},
			},)
		}

		const isFutureDated = new Date(parsedPayload.entryDate,) > new Date()

		const currencyWithHistory = await this.prismaService.currencyData.findFirst({
			where: {
				currency: { equals: parsedPayload.currency, },
			},
			include: {
				currencyHistory: {
					where: {
						date: { gte: parsedPayload.entryDate as unknown as Date, },
					},
					orderBy: {
						date: 'asc',
					},
					take: 1,
				},
			},
		},)

		const rate =
		currencyWithHistory?.currencyHistory?.[0]?.rate ??
		currencyWithHistory?.rate ??
		existingPrivateEquity.rate

		const marketValueUSD =
		parsedPayload.marketValueUSD ??
		parseFloat((parsedPayload.currencyValue * (rate ?? 1)).toFixed(2,),)

		const updatedPrivateEquity = await this.prismaService.assetPrivateEquity.update({
			where: { id, },
			data:  {
				assetName:          existingPrivateEquity.assetName,
				currency:           parsedPayload.currency,
				currencyValue:      parsedPayload.currencyValue,
				marketValueUSD,
				fundType:           parsedPayload.fundType,
				status:             parsedPayload.status,
				entryDate:          parsedPayload.entryDate,
				fundTermDate:       parsedPayload.fundTermDate,
				lastValuationDate:  parsedPayload.lastValuationDate,
				serviceProvider:    parsedPayload.serviceProvider,
				geography:          parsedPayload.geography,
				fundName:           parsedPayload.fundName,
				fundID:             parsedPayload.fundID,
				fundSize:           parsedPayload.fundSize,
				aboutFund:          parsedPayload.aboutFund,
				investmentPeriod:   parsedPayload.investmentPeriod,
				capitalCalled:      parsedPayload.capitalCalled,
				moic:               parsedPayload.moic,
				irr:                parsedPayload.irr,
				liquidity:          parsedPayload.liquidity,
				totalCommitment:    parsedPayload.totalCommitment,
				tvpi:               parsedPayload.tvpi,
				managementExpenses: parsedPayload.managementExpenses,
				otherExpenses:      parsedPayload.otherExpenses,
				carriedInterest:    parsedPayload.carriedInterest,
				distributions:      parsedPayload.distributions,
				holdingEntity:      parsedPayload.holdingEntity,
				comment:            parsedPayload.comment,
				rate,
				isFutureDated,
			},
			include: {
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
			},
		},)

		const payload = JSON.stringify({
			fundType:           updatedPrivateEquity.fundType,
			status:             updatedPrivateEquity.status,
			currency:           updatedPrivateEquity.currency,
			entryDate:          updatedPrivateEquity.entryDate,
			currencyValue:      updatedPrivateEquity.currencyValue,
			serviceProvider:    updatedPrivateEquity.serviceProvider,
			geography:          updatedPrivateEquity.geography,
			fundName:           updatedPrivateEquity.fundName,
			fundID:             updatedPrivateEquity.fundID,
			fundSize:           updatedPrivateEquity.fundSize,
			aboutFund:          updatedPrivateEquity.aboutFund,
			investmentPeriod:   updatedPrivateEquity.investmentPeriod,
			fundTermDate:       updatedPrivateEquity.fundTermDate,
			capitalCalled:      updatedPrivateEquity.capitalCalled,
			lastValuationDate:  updatedPrivateEquity.lastValuationDate,
			moic:               updatedPrivateEquity.moic,
			irr:                updatedPrivateEquity.irr,
			liquidity:          updatedPrivateEquity.liquidity,
			totalCommitment:    updatedPrivateEquity.totalCommitment,
			tvpi:               updatedPrivateEquity.tvpi,
			managementExpenses: updatedPrivateEquity.managementExpenses,
			otherExpenses:      updatedPrivateEquity.otherExpenses,
			carriedInterest:    updatedPrivateEquity.carriedInterest,
			distributions:      updatedPrivateEquity.distributions,
			holdingEntity:      updatedPrivateEquity.holdingEntity,
			comment:            updatedPrivateEquity.comment,
		},)

		const prevPayload = {
			currency:           existingPrivateEquity.currency,
			currencyValue:      existingPrivateEquity.currencyValue,
			marketValueUSD:     existingPrivateEquity.marketValueUSD,
			fundType:           existingPrivateEquity.fundType,
			status:             existingPrivateEquity.status,
			entryDate:          existingPrivateEquity.entryDate,
			fundTermDate:       existingPrivateEquity.fundTermDate,
			lastValuationDate:  existingPrivateEquity.lastValuationDate,
			serviceProvider:    existingPrivateEquity.serviceProvider,
			geography:          existingPrivateEquity.geography,
			fundName:           existingPrivateEquity.fundName,
			fundID:             existingPrivateEquity.fundID,
			fundSize:           existingPrivateEquity.fundSize,
			aboutFund:          existingPrivateEquity.aboutFund,
			investmentPeriod:   existingPrivateEquity.investmentPeriod,
			capitalCalled:      existingPrivateEquity.capitalCalled,
			moic:               existingPrivateEquity.moic,
			irr:                existingPrivateEquity.irr,
			liquidity:          existingPrivateEquity.liquidity,
			totalCommitment:    existingPrivateEquity.totalCommitment,
			tvpi:               existingPrivateEquity.tvpi,
			managementExpenses: existingPrivateEquity.managementExpenses,
			otherExpenses:      existingPrivateEquity.otherExpenses,
			carriedInterest:    existingPrivateEquity.carriedInterest,
			distributions:      existingPrivateEquity.distributions,
			holdingEntity:      existingPrivateEquity.holdingEntity,
			comment:            existingPrivateEquity.comment,
		}

		await this.prismaService.editLog.create({
			data: {
				clientId:     updatedPrivateEquity.clientId,
				portfolioId:  updatedPrivateEquity.portfolioId,
				entityId:     updatedPrivateEquity.entityId,
				bankId:       updatedPrivateEquity.bankId,
				accountId:    updatedPrivateEquity.accountId,
				instanceId:   updatedPrivateEquity.id,
				editedAt:     new Date(),
				instanceType: LogInstanceType.Asset,
				actionType:   LogActionType.Edit,
				assetName:    updatedPrivateEquity.assetName,
				reason:       dto.userInfo.reason,
				userName:     dto.userInfo.name,
				userEmail:    dto.userInfo.email,
				metaAfter:    {
					currency:           updatedPrivateEquity.currency,
					currencyValue:      updatedPrivateEquity.currencyValue,
					marketValueUSD:     updatedPrivateEquity.marketValueUSD,
					fundType:           updatedPrivateEquity.fundType,
					status:             updatedPrivateEquity.status,
					entryDate:          updatedPrivateEquity.entryDate,
					fundTermDate:       updatedPrivateEquity.fundTermDate,
					lastValuationDate:  updatedPrivateEquity.lastValuationDate,
					serviceProvider:    updatedPrivateEquity.serviceProvider,
					geography:          updatedPrivateEquity.geography,
					fundName:           updatedPrivateEquity.fundName,
					fundID:             updatedPrivateEquity.fundID,
					fundSize:           updatedPrivateEquity.fundSize,
					aboutFund:          updatedPrivateEquity.aboutFund,
					investmentPeriod:   updatedPrivateEquity.investmentPeriod,
					capitalCalled:      updatedPrivateEquity.capitalCalled,
					moic:               updatedPrivateEquity.moic,
					irr:                updatedPrivateEquity.irr,
					liquidity:          updatedPrivateEquity.liquidity,
					totalCommitment:    updatedPrivateEquity.totalCommitment,
					tvpi:               updatedPrivateEquity.tvpi,
					managementExpenses: updatedPrivateEquity.managementExpenses,
					otherExpenses:      updatedPrivateEquity.otherExpenses,
					carriedInterest:    updatedPrivateEquity.carriedInterest,
					distributions:      updatedPrivateEquity.distributions,
					holdingEntity:      updatedPrivateEquity.holdingEntity,
					comment:            updatedPrivateEquity.comment,
				},
				metaBefore: prevPayload,
			},
		},)

		return {
			id:            updatedPrivateEquity.id,
			clientId:      updatedPrivateEquity.clientId,
			portfolioId:   updatedPrivateEquity.portfolioId,
			entityId:      updatedPrivateEquity.entityId,
			bankId:        updatedPrivateEquity.bankId,
			accountId:     updatedPrivateEquity.accountId,
			assetName:     updatedPrivateEquity.assetName,
			isFutureDated: updatedPrivateEquity.isFutureDated,
			isArchived:    updatedPrivateEquity.isArchived,
			payload,
			createdAt:     updatedPrivateEquity.createdAt,
			updatedAt:     updatedPrivateEquity.updatedAt,
		} as unknown as Asset
	}

	public async updateRealEstate(id: string, dto: UpdateAssetDto,): Promise<Asset> {
		if (!dto.payload) {
			throw new HttpException('Data is missing', HttpStatus.BAD_REQUEST,)
		}

		const parsedPayload = JSON.parse(dto.payload,) as {
			investmentDate: string
			currency: CurrencyDataList
			currencyValue: number
			usdValue?: number
			marketValueFC: number
			projectTransaction: string
			country: string
			city: string
			operation?: string
			comment?: string
		}

		await this.cacheService.deleteByUrl([
			...cacheKeysToDeleteAsset.real,
			...cacheKeysToDeleteAsset.portfolio,
			...cacheKeysToDeleteAsset.client,
		],)

		const [currencyList,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
		],)
		const currencyData = currencyList.find((c,) => {
			return c.currency === parsedPayload.currency
		},)
		if (!currencyData) {
			throw new HttpException('Currency data is missing', HttpStatus.BAD_REQUEST,)
		}
		const { rate, } = currencyData
		if (dto.isVersion) {
			const existingVersion = await this.prismaService.assetRealEstateVersion.findUnique({
				where:   { id, },
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			if (!existingVersion) {
				throw new HttpException('Version not found', HttpStatus.BAD_REQUEST,)
			}

			const isFutureDated = new Date(parsedPayload.investmentDate,) > new Date()

			// let rate = existingVersion.rate
			// if (parsedPayload.currency !== existingVersion.currency) {
			// 	const currencyData = await this.prismaService.currencyData.findFirst({
			// 		where: { currency: parsedPayload.currency, },
			// 	},)
			// 	if (!currencyData) {
			// 		throw new HttpException('Rate missing', HttpStatus.BAD_REQUEST,)
			// 	}
			// 	rate = currencyData.rate
			// }

			const usdValue = parsedPayload.usdValue ?? parseFloat((parsedPayload.currencyValue * rate).toFixed(2,),)
			const marketValueUSD = parseFloat((parsedPayload.marketValueFC * rate).toFixed(2,),)
			const profitUSD = parseFloat((marketValueUSD - usdValue).toFixed(2,),)
			const profitPercentage = usdValue === 0 ?
				0 :
				parseFloat(((profitUSD / usdValue) * 100).toFixed(2,),)

			const updatedVersion = await this.prismaService.assetRealEstateVersion.update({
				where: { id, },
				data:  {
					assetName:          existingVersion.assetName,
					currency:           parsedPayload.currency,
					currencyValue:      parsedPayload.currencyValue,
					investmentDate:     parsedPayload.investmentDate,
					usdValue,
					marketValueFC:      parsedPayload.marketValueFC,
					marketValueUSD,
					projectTransaction: parsedPayload.projectTransaction,
					country:            parsedPayload.country,
					city:               parsedPayload.city,
					operation:          parsedPayload.operation,
					profitUSD,
					profitPercentage,
					comment:            parsedPayload.comment,
					rate,
					isFutureDated,
				},
				include: {
					portfolio: { select: { name: true, }, },
					entity:    { select: { name: true, }, },
					bank:      { select: { bankName: true, bankListId: true, }, },
					account:   { select: { accountName: true, }, },
				},
			},)

			const payload = JSON.stringify({
				comment:            updatedVersion.comment,
				currency:           updatedVersion.currency,
				investmentDate:     updatedVersion.investmentDate,
				currencyValue:      updatedVersion.currencyValue,
				usdValue:           updatedVersion.usdValue,
				marketValueFC:      updatedVersion.marketValueFC,
				projectTransaction: updatedVersion.projectTransaction,
				country:            updatedVersion.country,
				city:               updatedVersion.city,
				operation:          updatedVersion.operation,
			},)

			const prevPayload = {
				currency:           existingVersion.currency,
				investmentDate:     existingVersion.investmentDate,
				currencyValue:      existingVersion.currencyValue,
				usdValue:           existingVersion.usdValue,
				marketValueFC:      existingVersion.marketValueFC,
				marketValueUSD:     existingVersion.marketValueUSD,
				projectTransaction: existingVersion.projectTransaction,
				country:            existingVersion.country,
				city:               existingVersion.city,
				operation:          existingVersion.operation,
				profitUSD:          existingVersion.profitUSD,
				profitPercentage:   existingVersion.profitPercentage,
				comment:            existingVersion.comment,
			}

			await this.prismaService.editLog.create({
				data: {
					clientId:     updatedVersion.clientId,
					portfolioId:  updatedVersion.portfolioId,
					entityId:     updatedVersion.entityId,
					bankId:       updatedVersion.bankId,
					accountId:    updatedVersion.accountId,
					instanceId:   updatedVersion.id,
					editedAt:     new Date(),
					instanceType: LogInstanceType.AssetVersion,
					actionType:   LogActionType.Edit,
					assetName:    updatedVersion.assetName,
					reason:       dto.userInfo.reason,
					userName:     dto.userInfo.name,
					userEmail:    dto.userInfo.email,
					metaAfter:    {
						currency:           updatedVersion.currency,
						investmentDate:     updatedVersion.investmentDate,
						currencyValue:      updatedVersion.currencyValue,
						usdValue:           updatedVersion.usdValue,
						marketValueFC:      updatedVersion.marketValueFC,
						marketValueUSD:     updatedVersion.marketValueUSD,
						projectTransaction: updatedVersion.projectTransaction,
						country:            updatedVersion.country,
						city:               updatedVersion.city,
						operation:          updatedVersion.operation,
						profitUSD:          updatedVersion.profitUSD,
						profitPercentage:   updatedVersion.profitPercentage,
						comment:            updatedVersion.comment,
					},
					metaBefore: prevPayload,
				},
			},)

			return {
				id:            updatedVersion.id,
				clientId:      updatedVersion.clientId,
				portfolioId:   updatedVersion.portfolioId,
				entityId:      updatedVersion.entityId,
				bankId:        updatedVersion.bankId,
				accountId:     updatedVersion.accountId,
				assetName:     updatedVersion.assetName,
				isFutureDated: updatedVersion.isFutureDated,
				isArchived:    updatedVersion.isArchived,
				payload,
				createdAt:     updatedVersion.createdAt,
				updatedAt:     updatedVersion.updatedAt,
			} as unknown as Asset
		}

		const existingRealEstate = await this.prismaService.assetRealEstate.findUnique({
			where:   { id, },
			include: {
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
				versions:  true,
			},
		},)

		if (!existingRealEstate) {
			throw new HttpException('Real estate not found', HttpStatus.BAD_REQUEST,)
		}

		const isSameDay = (d1: Date, d2: Date,): boolean => {
			return d1.getFullYear() === d2.getFullYear() &&
				d1.getMonth() === d2.getMonth() &&
				d1.getDate() === d2.getDate()
		}

		const createdToday = isSameDay(existingRealEstate.createdAt, new Date(),)
		const {
			id: realEstateId,
			versions,
			...data
		} = existingRealEstate

		if (!createdToday) {
			await this.prismaService.assetRealEstateVersion.create({
				data: {
					clientId:           existingRealEstate.clientId,
					portfolioId:        existingRealEstate.portfolioId,
					entityId:           existingRealEstate.entityId,
					bankId:             existingRealEstate.bankId,
					accountId:          existingRealEstate.accountId,
					assetName:          existingRealEstate.assetName,
					currency:           existingRealEstate.currency,
					currencyValue:      existingRealEstate.currencyValue,
					investmentDate:     existingRealEstate.investmentDate,
					usdValue:           existingRealEstate.usdValue,
					marketValueFC:      existingRealEstate.marketValueFC,
					marketValueUSD:     existingRealEstate.marketValueUSD,
					projectTransaction: existingRealEstate.projectTransaction,
					country:            existingRealEstate.country,
					city:               existingRealEstate.city,
					operation:          existingRealEstate.operation,
					profitUSD:          existingRealEstate.profitUSD,
					profitPercentage:   existingRealEstate.profitPercentage,
					comment:            existingRealEstate.comment,
					rate:               existingRealEstate.rate,
					isFutureDated:      existingRealEstate.isFutureDated,
					isArchived:         existingRealEstate.isArchived,
					createdAt:          Boolean(versions?.length,) ?
						new Date() :
						new Date(parsedPayload.investmentDate,),
					updatedAt:        Boolean(versions?.length,) ?
						new Date() :
						new Date(parsedPayload.investmentDate,),
					transactionId:     existingRealEstate.transactionId ?? undefined,
					assetRealEstateId: existingRealEstate.id,
				},
			},)
		}

		const isFutureDated = new Date(parsedPayload.investmentDate,) > new Date()

		// let rate = existingRealEstate.rate
		// if (parsedPayload.currency !== existingRealEstate.currency) {
		// 	const currencyData = await this.prismaService.currencyData.findFirst({
		// 		where: { currency: parsedPayload.currency, },
		// 	},)
		// 	if (!currencyData) {
		// 		throw new HttpException('Rate missing', HttpStatus.BAD_REQUEST,)
		// 	}
		// 	rate = currencyData.rate
		// }

		const usdValue = parsedPayload.usdValue ?? parseFloat((parsedPayload.currencyValue * rate).toFixed(2,),)
		const marketValueUSD = parseFloat((parsedPayload.marketValueFC * rate).toFixed(2,),)
		const profitUSD = parseFloat((marketValueUSD - usdValue).toFixed(2,),)
		const profitPercentage = usdValue === 0 ?
			0 :
			parseFloat(((profitUSD / usdValue) * 100).toFixed(2,),)

		const updatedRealEstate = await this.prismaService.assetRealEstate.update({
			where: { id, },
			data:  {
				assetName:          existingRealEstate.assetName,
				currency:           parsedPayload.currency,
				currencyValue:      parsedPayload.currencyValue,
				investmentDate:     parsedPayload.investmentDate,
				usdValue,
				marketValueFC:      parsedPayload.marketValueFC,
				marketValueUSD,
				projectTransaction: parsedPayload.projectTransaction,
				country:            parsedPayload.country,
				city:               parsedPayload.city,
				operation:          parsedPayload.operation,
				profitUSD,
				profitPercentage,
				comment:            parsedPayload.comment,
				rate,
				isFutureDated,
			},
			include: {
				portfolio: { select: { name: true, }, },
				entity:    { select: { name: true, }, },
				bank:      { select: { bankName: true, bankListId: true, }, },
				account:   { select: { accountName: true, }, },
			},
		},)

		const payload = JSON.stringify({
			comment:            updatedRealEstate.comment,
			currency:           updatedRealEstate.currency,
			investmentDate:     updatedRealEstate.investmentDate,
			currencyValue:      updatedRealEstate.currencyValue,
			usdValue:           updatedRealEstate.usdValue,
			marketValueFC:      updatedRealEstate.marketValueFC,
			projectTransaction: updatedRealEstate.projectTransaction,
			country:            updatedRealEstate.country,
			city:               updatedRealEstate.city,
			operation:          updatedRealEstate.operation,
		},)

		const prevPayload = {
			currency:           existingRealEstate.currency,
			investmentDate:     existingRealEstate.investmentDate,
			currencyValue:      existingRealEstate.currencyValue,
			usdValue:           existingRealEstate.usdValue,
			marketValueFC:      existingRealEstate.marketValueFC,
			marketValueUSD:     existingRealEstate.marketValueUSD,
			projectTransaction: existingRealEstate.projectTransaction,
			country:            existingRealEstate.country,
			city:               existingRealEstate.city,
			operation:          existingRealEstate.operation,
			profitUSD:          existingRealEstate.profitUSD,
			profitPercentage:   existingRealEstate.profitPercentage,
			comment:            existingRealEstate.comment,
		}

		await this.prismaService.editLog.create({
			data: {
				clientId:     updatedRealEstate.clientId,
				portfolioId:  updatedRealEstate.portfolioId,
				entityId:     updatedRealEstate.entityId,
				bankId:       updatedRealEstate.bankId,
				accountId:    updatedRealEstate.accountId,
				instanceId:   updatedRealEstate.id,
				editedAt:     new Date(),
				instanceType: LogInstanceType.Asset,
				actionType:   LogActionType.Edit,
				assetName:    updatedRealEstate.assetName,
				reason:       dto.userInfo.reason,
				userName:     dto.userInfo.name,
				userEmail:    dto.userInfo.email,
				metaAfter:    {
					currency:           updatedRealEstate.currency,
					investmentDate:     updatedRealEstate.investmentDate,
					currencyValue:      updatedRealEstate.currencyValue,
					usdValue:           updatedRealEstate.usdValue,
					marketValueFC:      updatedRealEstate.marketValueFC,
					marketValueUSD:     updatedRealEstate.marketValueUSD,
					projectTransaction: updatedRealEstate.projectTransaction,
					country:            updatedRealEstate.country,
					city:               updatedRealEstate.city,
					operation:          updatedRealEstate.operation,
					profitUSD:          updatedRealEstate.profitUSD,
					profitPercentage:   updatedRealEstate.profitPercentage,
					comment:            updatedRealEstate.comment,
				},
				metaBefore: prevPayload,
			},
		},)

		return {
			id:            updatedRealEstate.id,
			clientId:      updatedRealEstate.clientId,
			portfolioId:   updatedRealEstate.portfolioId,
			entityId:      updatedRealEstate.entityId,
			bankId:        updatedRealEstate.bankId,
			accountId:     updatedRealEstate.accountId,
			assetName:     updatedRealEstate.assetName,
			isFutureDated: updatedRealEstate.isFutureDated,
			isArchived:    updatedRealEstate.isArchived,
			payload,
			createdAt:     updatedRealEstate.createdAt,
			updatedAt:     updatedRealEstate.updatedAt,
		} as unknown as Asset
	}

	public async updateCrypto(assetId: string, body: UpdateAssetDto,): Promise<Asset> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				await this.cacheService.deleteByUrl([
					...cacheKeysToDeleteAsset.crypto,
					...cacheKeysToDeleteAsset.portfolio,
					...cacheKeysToDeleteAsset.client,
				],)
				const parsedPayload = JSON.parse(body.payload,)
				if (body.isVersion) {
					if (parsedPayload.productType === CryptoType.ETF) {
						const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee,comment, } = parsedPayload
						const [equities, etfs, currencyList, historyCurrencyData,] = await Promise.all([
							this.cBondsCurrencyService.getAllEquitiesWithHistory(),
							this.cBondsCurrencyService.getAllEtfsWithHistory(),
							this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
							this.prismaService.currencyHistoryData.findMany(),
						],)
						const equity = equities.find((e,) => {
							return e.isin === isin
						},)
						const etf = etfs.find((e,) => {
							return e.isin === isin
						},)
						const currencyData = currencyList.find((c,) => {
							return c.currency === currency
						},)
						if (!currencyData || (!equity && !etf)) {
							throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
						const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
						const costRateDate = new Date(transactionDate,)
						const costCurrencyDataRate = currency === CurrencyDataList.USD ?
							1 :
							historyCurrencyData
								.filter((item,) => {
									return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
								},)
								.sort((a, b,) => {
									return new Date(a.date,).getTime() - new Date(b.date,).getTime()
								},)[0]?.rate
						const costPrice = transactionPrice
						const costValueFC = Number(units,) * Number(costPrice,)
						const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
						const marketValueFC = Number(units,) * Number(lastPrice,)
						const marketValueUSD = marketValueFC * rate
						const profitUSD = marketValueUSD - costValueUSD
						const profitPercentage = costPrice > 0 ?
							((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
							0
						const beforeVersion = await tx.assetCryptoVersion.findUnique({
							where: {
								id: assetId,
							},
						},)
						if (!beforeVersion) {
							throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
						}
						const updatedVersion = await tx.assetCryptoVersion.update({
							where: {
								id: assetId,
							},
							data: {
								productType:       CryptoType.ETF,
								assetName:         AssetNamesType.CRYPTO,
								currency,
								security,
								operation,
								transactionDate:   new Date(transactionDate,),
								transactionPrice,
								bankFee,
								isin,
								units,
								costPrice,
								costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
								costValueFC:         parseFloat(costValueFC.toFixed(2,),),
								marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
								marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
								profitUSD:         parseFloat(profitUSD.toFixed(2,),),
								profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								comment,
								rate:              costCurrencyDataRate ?? rate,
							},
						},)
						const payload = JSON.stringify({
							comment:          updatedVersion.comment,
							productType:      updatedVersion.productType,
							currency:         updatedVersion.currency,
							transactionDate:	 	  updatedVersion.transactionDate,
							isin:             updatedVersion.isin,
							operation:        updatedVersion.operation,
							security:            updatedVersion.security,
							units:            updatedVersion.units,
							transactionPrice:       updatedVersion.transactionPrice,
							equityType:          CryptoType.ETF,
							bankFee:          updatedVersion.bankFee,
						},)
						const prevPayload = {
							comment:          beforeVersion.comment,
							productType:      beforeVersion.productType,
							currency:         beforeVersion.currency,
							transactionDate:	 	  beforeVersion.transactionDate,
							isin:             beforeVersion.isin,
							operation:        beforeVersion.operation,
							security:            beforeVersion.security,
							units:            beforeVersion.units,
							transactionPrice:       beforeVersion.transactionPrice,
							equityType:          CryptoType.ETF,
							bankFee:          beforeVersion.bankFee,
						}
						await tx.editLog.create({
							data: {
								clientId:     updatedVersion.clientId,
								portfolioId:  updatedVersion.portfolioId,
								entityId:     updatedVersion.clientId,
								bankId:       updatedVersion.clientId,
								accountId:    updatedVersion.accountId,
								instanceId:   updatedVersion.id,
								editedAt:     new Date(),
								instanceType: LogInstanceType.AssetVersion,
								actionType:   LogActionType.Edit,
								assetName:    AssetNamesType.CRYPTO,
								reason:       body.userInfo.reason,
								userName:     body.userInfo.name,
								userEmail:    body.userInfo.email,
								metaAfter:    {
									comment:          updatedVersion.comment,
									productType:      updatedVersion.productType,
									currency:         updatedVersion.currency,
									transactionDate:	 	  updatedVersion.transactionDate,
									isin:             updatedVersion.isin,
									operation:        updatedVersion.operation,
									security:            updatedVersion.security,
									units:            updatedVersion.units,
									transactionPrice:       updatedVersion.transactionPrice,
									equityType:          CryptoType.ETF,
									bankFee:          updatedVersion.bankFee,
								},
								metaBefore: prevPayload,
							},
						},)
						return {
							id:               updatedVersion.id,
							clientId:         updatedVersion.clientId,
							portfolioId:      updatedVersion.portfolioId,
							entityId:         updatedVersion.entityId,
							bankId:           updatedVersion.bankId,
							accountId:        updatedVersion.accountId,
							assetName:        updatedVersion.assetName,
							createdAt:        updatedVersion.createdAt,
							updatedAt:        updatedVersion.updatedAt,
							payload,
							isFutureDated:    updatedVersion.isFutureDated,
							isArchived:       false,
							rate:             updatedVersion.rate,
							portfolioDraftId: null,
						}
					}
					const {cryptoCurrencyType, purchasePrice, cryptoAmount, exchangeWallet, purchaseDate, comment,} = parsedPayload
					const [cryptoData,] = await Promise.all([
						this.prismaService.cryptoData.findMany(),
					],)
					const cryptoCurrencyData = cryptoData.find((c,) => {
						return c.token === cryptoCurrencyType
					},)
					if (!cryptoCurrencyData) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const { rate, } = cryptoCurrencyData
					const costValueUsd = purchasePrice * cryptoAmount
					const marketValueUsd = parseFloat((cryptoAmount * rate).toFixed(2,),)
					const profitUsd = marketValueUsd - costValueUsd
					const profitPercentage = profitUsd / costValueUsd * 100
					const beforeVersion = await tx.assetCryptoVersion.findUnique({
						where: {
							id: assetId,
						},
					},)
					if (!beforeVersion) {
						throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
					}
					const updatedVersion = await tx.assetCryptoVersion.update({
						where: {
							id: assetId,
						},
						data: {
							assetName:          AssetNamesType.CRYPTO,
							productType:        CryptoType.DIRECT_HOLD,
							exchangeWallet,
							cryptoCurrencyType,
							cryptoAmount,
							purchaseDate:       new Date(purchaseDate,),
							purchasePrice,
							costValueUSD:         parseFloat(costValueUsd.toFixed(2,),),
							costValueFC:         parseFloat(costValueUsd.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUsd.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueUsd.toFixed(2,),),
							profitUSD:         parseFloat(profitUsd.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							currentStockPrice: rate,
							rate,
							comment,
						},
					},)
					const payload = JSON.stringify({
						comment:            updatedVersion.comment,
						productType:         updatedVersion.productType,
						cryptoCurrencyType:	 	  updatedVersion.cryptoCurrencyType,
						cryptoAmount:               updatedVersion.cryptoAmount,
						exchangeWallet:          updatedVersion.exchangeWallet,
						purchaseDate:            updatedVersion.purchaseDate,
						purchasePrice:              updatedVersion.purchasePrice,
					},)
					const prevPayload = {
						comment:            beforeVersion.comment,
						productType:         beforeVersion.productType,
						cryptoCurrencyType:	 	  beforeVersion.cryptoCurrencyType,
						cryptoAmount:               beforeVersion.cryptoAmount,
						exchangeWallet:          beforeVersion.exchangeWallet,
						purchaseDate:            beforeVersion.purchaseDate,
						purchasePrice:              beforeVersion.purchasePrice,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedVersion.clientId,
							portfolioId:  updatedVersion.portfolioId,
							entityId:     updatedVersion.clientId,
							bankId:       updatedVersion.clientId,
							accountId:    updatedVersion.accountId,
							instanceId:   updatedVersion.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.AssetVersion,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.CRYPTO,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:            updatedVersion.comment,
								productType:         updatedVersion.productType,
								cryptoCurrencyType:	 	  updatedVersion.cryptoCurrencyType,
								cryptoAmount:               updatedVersion.cryptoAmount,
								exchangeWallet:          updatedVersion.exchangeWallet,
								purchaseDate:            updatedVersion.purchaseDate,
								purchasePrice:              updatedVersion.purchasePrice,
							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedVersion.id,
						clientId:         updatedVersion.clientId,
						portfolioId:      updatedVersion.portfolioId,
						entityId:         updatedVersion.entityId,
						bankId:           updatedVersion.bankId,
						accountId:        updatedVersion.accountId,
						assetName:        updatedVersion.assetName,
						createdAt:        updatedVersion.createdAt,
						updatedAt:        updatedVersion.updatedAt,
						payload,
						isFutureDated:    updatedVersion.isFutureDated,
						isArchived:       false,
						rate:             updatedVersion.rate,
						portfolioDraftId: null,
					}
				}
				const cryptoAsset = await tx.assetCrypto.findUnique({
					where: {
						id: assetId,
					},
					include: {
						assetCryptoVersions: true,
					},
				},)
				if (!cryptoAsset) {
					throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
				}
				const now = new Date()
				const isCreatedToday = isSameDay(cryptoAsset.createdAt, now,)
				const {groupId, id, assetCryptoVersions, ...data} = cryptoAsset

				if (isCreatedToday) {
					if (parsedPayload.productType === CryptoType.ETF) {
						const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee,comment,} = parsedPayload
						const [equities, etfs, currencyList, historyCurrencyData,] = await Promise.all([
							this.cBondsCurrencyService.getAllEquitiesWithHistory(),
							this.cBondsCurrencyService.getAllEtfsWithHistory(),
							this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
							this.prismaService.currencyHistoryData.findMany(),
						],)
						const equity = equities.find((e,) => {
							return e.isin === isin
						},)
						const etf = etfs.find((e,) => {
							return e.isin === isin
						},)
						const currencyData = currencyList.find((c,) => {
							return c.currency === currency
						},)
						if (!currencyData || (!equity && !etf)) {
							throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
						const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
						const costRateDate = new Date(transactionDate,)
						const costCurrencyDataRate = currency === CurrencyDataList.USD ?
							1 :
							historyCurrencyData
								.filter((item,) => {
									return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
								},)
								.sort((a, b,) => {
									return new Date(a.date,).getTime() - new Date(b.date,).getTime()
								},)[0]?.rate
						const costPrice = transactionPrice
						const costValueFC = Number(units,) * Number(costPrice,)
						const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
						const marketValueFC = Number(units,) * Number(lastPrice,)
						const marketValueUSD = marketValueFC * rate
						const profitUSD = marketValueUSD - costValueUSD
						const profitPercentage = costPrice > 0 ?
							((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
							0
						const updatedCrypto = await tx.assetCrypto.update({
							where: {
								id: assetId,
							},
							data: {
								productType:       CryptoType.ETF,
								assetName:         AssetNamesType.CRYPTO,
								currency,
								security,
								operation,
								transactionDate:   new Date(transactionDate,),
								transactionPrice,
								bankFee,
								isin,
								units,
								costPrice,
								costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
								costValueFC:         parseFloat(costValueFC.toFixed(2,),),
								marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
								marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
								profitUSD:         parseFloat(profitUSD.toFixed(2,),),
								profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								comment,
								rate:              costCurrencyDataRate ?? rate,
							},
						},)
						const group = await tx.assetCryptoGroup.findFirst({
							where: {
								id: cryptoAsset.groupId,
							},
							include: { cryptos: true, },
						},)
						if (!group) {
							throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
						}
						const accountAssets = group.cryptos
						let rateSum = 0
						let rateCount = 0
						let totalUnits = 0
						let totalValue = 0
						for (const a of accountAssets) {
							if (a.operation === AssetOperationType.SELL) {
								continue
							}
							const costRateDate = a.transactionDate ?
								new Date(a.transactionDate,) :
								new Date()
							const units = a.units ?? 0
							const transactionPrice = a.transactionPrice ?? 0
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

						const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
							(latest, current,) => {
								const latestDate = latest.transactionDate ?
									new Date(latest.transactionDate,) :
									new Date()
								const currentDate = current.transactionDate ?
									new Date(current.transactionDate,) :
									new Date()

								return currentDate > latestDate ?
									current :
									latest
							},
						)
						await tx.assetCryptoGroup.update({
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
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								transactionDate:   latestTransactionDate,
								avgRate,
							},
						},)

						const payload = JSON.stringify({
							comment:          updatedCrypto.comment,
							productType:      updatedCrypto.productType,
							currency:         updatedCrypto.currency,
							transactionDate:	 	  updatedCrypto.transactionDate,
							isin:             updatedCrypto.isin,
							operation:        updatedCrypto.operation,
							security:            updatedCrypto.security,
							units:            updatedCrypto.units,
							transactionPrice:       updatedCrypto.transactionPrice,
							equityType:          CryptoType.ETF,
							bankFee:          updatedCrypto.bankFee,
						},)
						const prevPayload = {
							comment:          parsedPayload.comment,
							productType:      parsedPayload.productType,
							currency:         parsedPayload.currency,
							transactionDate:	 	  parsedPayload.transactionDate,
							isin:             parsedPayload.isin,
							operation:        parsedPayload.operation,
							security:            parsedPayload.security,
							units:            parsedPayload.units,
							transactionPrice:       parsedPayload.transactionPrice,
							equityType:          CryptoType.ETF,
							bankFee:          parsedPayload.bankFee,
						}
						await tx.editLog.create({
							data: {
								clientId:     updatedCrypto.clientId,
								portfolioId:  updatedCrypto.portfolioId,
								entityId:     updatedCrypto.clientId,
								bankId:       updatedCrypto.clientId,
								accountId:    updatedCrypto.accountId,
								instanceId:   updatedCrypto.id,
								editedAt:     new Date(),
								instanceType: LogInstanceType.Asset,
								actionType:   LogActionType.Edit,
								assetName:    AssetNamesType.CRYPTO,
								reason:       body.userInfo.reason,
								userName:     body.userInfo.name,
								userEmail:    body.userInfo.email,
								metaAfter:    {
									comment:          updatedCrypto.comment,
									productType:      updatedCrypto.productType,
									currency:         updatedCrypto.currency,
									transactionDate:	 	  updatedCrypto.transactionDate,
									isin:             updatedCrypto.isin,
									operation:        updatedCrypto.operation,
									security:            updatedCrypto.security,
									units:            updatedCrypto.units,
									transactionPrice:       updatedCrypto.transactionPrice,
									equityType:          CryptoType.ETF,
									bankFee:          updatedCrypto.bankFee,
								},
								metaBefore: prevPayload,
							},
						},)
						return {
							id:               updatedCrypto.id,
							clientId:         updatedCrypto.clientId,
							portfolioId:      updatedCrypto.portfolioId,
							entityId:         updatedCrypto.entityId,
							bankId:           updatedCrypto.bankId,
							accountId:        updatedCrypto.accountId,
							assetName:        updatedCrypto.assetName,
							createdAt:        updatedCrypto.createdAt,
							updatedAt:        updatedCrypto.updatedAt,
							payload,
							isFutureDated:    updatedCrypto.isFutureDated,
							isArchived:       false,
							rate:             updatedCrypto.rate,
							portfolioDraftId: null,
						}
					}
					const {cryptoCurrencyType, purchasePrice, cryptoAmount, exchangeWallet, purchaseDate, comment,} = parsedPayload
					const [cryptoData,] = await Promise.all([
						this.prismaService.cryptoData.findMany(),
					],)
					const cryptoCurrencyData = cryptoData.find((c,) => {
						return c.token === cryptoCurrencyType
					},)
					if (!cryptoCurrencyData) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const { rate, } = cryptoCurrencyData
					const costValueUsd = purchasePrice * cryptoAmount
					const marketValueUsd = parseFloat((cryptoAmount * rate).toFixed(2,),)
					const profitUsd = marketValueUsd - costValueUsd
					const profitPercentage = profitUsd / costValueUsd * 100
					const group = await tx.assetCryptoGroup.findFirst({
						where: {
							id: cryptoAsset.groupId,
						},
						include: { cryptos: true, },
					},)
					if (!group) {
						throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
					}
					await tx.assetCryptoGroup.update({
						where: { id: group.id, },
						data:  {
							productType:        CryptoType.DIRECT_HOLD,
							assetName:          AssetNamesType.CRYPTO,
							isArchived:         false,
							exchangeWallet,
							cryptoCurrencyType,
							cryptoAmount,
							purchaseDate:       new Date(purchaseDate,),
							purchasePrice,
							costValueUSD:         parseFloat(costValueUsd.toFixed(2,),),
							costValueFC:         parseFloat(costValueUsd.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUsd.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueUsd.toFixed(2,),),
							profitUSD:         parseFloat(profitUsd.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							totalUnits:         cryptoAmount,
							currentStockPrice: rate,
						},
					},)
					const updatedCrypto = await tx.assetCrypto.update({
						where: {
							id: assetId,
						},
						data: {
							assetName:          AssetNamesType.CRYPTO,
							productType:        CryptoType.DIRECT_HOLD,
							exchangeWallet,
							cryptoCurrencyType,
							cryptoAmount,
							purchaseDate:       new Date(purchaseDate,),
							purchasePrice,
							costValueUSD:         parseFloat(costValueUsd.toFixed(2,),),
							costValueFC:         parseFloat(costValueUsd.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUsd.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueUsd.toFixed(2,),),
							profitUSD:         parseFloat(profitUsd.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							currentStockPrice: rate,
							rate,
							comment,
						},
					},)
					const payload = JSON.stringify({
						comment:            updatedCrypto.comment,
						productType:         updatedCrypto.productType,
						cryptoCurrencyType:	 	  updatedCrypto.cryptoCurrencyType,
						cryptoAmount:               updatedCrypto.cryptoAmount,
						exchangeWallet:          updatedCrypto.exchangeWallet,
						purchaseDate:            updatedCrypto.purchaseDate,
						purchasePrice:              updatedCrypto.purchasePrice,
					},)
					const prevPayload = {
						comment:            parsedPayload.comment,
						productType:         parsedPayload.productType,
						cryptoCurrencyType:	 	  parsedPayload.cryptoCurrencyType,
						cryptoAmount:               parsedPayload.cryptoAmount,
						exchangeWallet:          parsedPayload.exchangeWallet,
						purchaseDate:            parsedPayload.purchaseDate,
						purchasePrice:              parsedPayload.purchasePrice,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedCrypto.clientId,
							portfolioId:  updatedCrypto.portfolioId,
							entityId:     updatedCrypto.clientId,
							bankId:       updatedCrypto.clientId,
							accountId:    updatedCrypto.accountId,
							instanceId:   updatedCrypto.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.Asset,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.CRYPTO,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:            updatedCrypto.comment,
								productType:         updatedCrypto.productType,
								cryptoCurrencyType:	 	  updatedCrypto.cryptoCurrencyType,
								cryptoAmount:               updatedCrypto.cryptoAmount,
								exchangeWallet:          updatedCrypto.exchangeWallet,
								purchaseDate:            updatedCrypto.purchaseDate,
								purchasePrice:              updatedCrypto.purchasePrice,
							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedCrypto.id,
						clientId:         updatedCrypto.clientId,
						portfolioId:      updatedCrypto.portfolioId,
						entityId:         updatedCrypto.entityId,
						bankId:           updatedCrypto.bankId,
						accountId:        updatedCrypto.accountId,
						assetName:        updatedCrypto.assetName,
						createdAt:        updatedCrypto.createdAt,
						updatedAt:        updatedCrypto.updatedAt,
						payload,
						isFutureDated:    updatedCrypto.isFutureDated,
						isArchived:       false,
						rate:             updatedCrypto.rate,
						portfolioDraftId: null,
					}
				}
				const createdVersion = await tx.assetCryptoVersion.create({
					data: {
						...data,
						cryptoId:    cryptoAsset.id,
						createdAt: Boolean(cryptoAsset.assetCryptoVersions?.length,) ?
							new Date() :
							new Date(parsedPayload.transactionDate ?? parsedPayload.purchaseDate,),
						updatedAt: Boolean(cryptoAsset.assetCryptoVersions?.length,) ?
							new Date() :
							new Date(parsedPayload.transactionDate ?? parsedPayload.purchaseDate,),
					},
				},)
				if (parsedPayload.productType === CryptoType.ETF) {
					const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee,comment,} = parsedPayload
					const [equities, etfs, currencyList, historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllEquitiesWithHistory(),
						this.cBondsCurrencyService.getAllEtfsWithHistory(),
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.currencyHistoryData.findMany(),
					],)
					const equity = equities.find((e,) => {
						return e.isin === isin
					},)
					const etf = etfs.find((e,) => {
						return e.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || (!equity && !etf)) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
					const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
					const costRateDate = new Date(transactionDate,)
					const costCurrencyDataRate = currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costPrice = transactionPrice
					const costValueFC = Number(units,) * Number(costPrice,)
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					const updatedAsset = await tx.assetCrypto.update({
						where: {
							id: assetId,
						},
						data: {
							productType:       CryptoType.ETF,
							assetName:         AssetNamesType.CRYPTO,
							currency,
							security,
							operation,
							transactionDate:   new Date(transactionDate,),
							transactionPrice,
							bankFee,
							isin,
							units,
							costPrice,
							costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:         parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							comment,
							rate:              costCurrencyDataRate ?? rate,
						},
					},)
					const group = await tx.assetCryptoGroup.findFirst({
						where: {
							id: cryptoAsset.groupId,
						},
						include: { cryptos: true, },
					},)

					if (!group) {
						throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
					}

					const accountAssets = group.cryptos
					let rateSum = 0
					let rateCount = 0
					let totalUnits = 0
					let totalValue = 0
					for (const a of accountAssets) {
						if (a.operation === AssetOperationType.SELL) {
							continue
						}
						const costRateDate = a.transactionDate ?
							new Date(a.transactionDate,) :
							new Date()
						const units = a.units ?? 0
						const transactionPrice = a.transactionPrice ?? 0
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

					const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
						(latest, current,) => {
							const latestDate = latest.transactionDate ?
								new Date(latest.transactionDate,) :
								new Date()
							const currentDate = current.transactionDate ?
								new Date(current.transactionDate,) :
								new Date()

							return currentDate > latestDate ?
								current :
								latest
						},
					)
					await tx.assetCryptoGroup.update({
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
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionDate:   latestTransactionDate,
							avgRate,
						},
					},)

					const payload = JSON.stringify({
						comment:          updatedAsset.comment,
						productType:      updatedAsset.productType,
						currency:         updatedAsset.currency,
						transactionDate:	 	  updatedAsset.transactionDate,
						isin:             updatedAsset.isin,
						operation:        updatedAsset.operation,
						security:            updatedAsset.security,
						units:            updatedAsset.units,
						transactionPrice:       updatedAsset.transactionPrice,
						equityType:          CryptoType.ETF,
						bankFee:          updatedAsset.bankFee,
					},)
					const prevPayload = {
						comment:          createdVersion.comment,
						productType:      createdVersion.productType,
						currency:         createdVersion.currency,
						transactionDate:	 	  createdVersion.transactionDate,
						isin:             createdVersion.isin,
						operation:        createdVersion.operation,
						security:            createdVersion.security,
						units:            createdVersion.units,
						transactionPrice:       createdVersion.transactionPrice,
						equityType:          CryptoType.ETF,
						bankFee:          createdVersion.bankFee,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedAsset.clientId,
							portfolioId:  updatedAsset.portfolioId,
							entityId:     updatedAsset.clientId,
							bankId:       updatedAsset.clientId,
							accountId:    updatedAsset.accountId,
							instanceId:   updatedAsset.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.Asset,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.CRYPTO,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:          updatedAsset.comment,
								productType:      updatedAsset.productType,
								currency:         updatedAsset.currency,
								transactionDate:	 	  updatedAsset.transactionDate,
								isin:             updatedAsset.isin,
								operation:        updatedAsset.operation,
								security:            updatedAsset.security,
								units:            updatedAsset.units,
								transactionPrice:       updatedAsset.transactionPrice,
								equityType:          CryptoType.ETF,
								bankFee:          updatedAsset.bankFee,

							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedAsset.id,
						clientId:         updatedAsset.clientId,
						portfolioId:      updatedAsset.portfolioId,
						entityId:         updatedAsset.entityId,
						bankId:           updatedAsset.bankId,
						accountId:        updatedAsset.accountId,
						assetName:        updatedAsset.assetName,
						createdAt:        updatedAsset.createdAt,
						updatedAt:        updatedAsset.updatedAt,
						payload,
						isFutureDated:    updatedAsset.isFutureDated,
						isArchived:       false,
						rate:             updatedAsset.rate,
						portfolioDraftId: null,
					}
				}
				const {cryptoCurrencyType, purchasePrice, cryptoAmount, exchangeWallet, purchaseDate, comment,} = parsedPayload
				const [cryptoData,] = await Promise.all([
					this.prismaService.cryptoData.findMany(),
				],)
				const cryptoCurrencyData = cryptoData.find((c,) => {
					return c.token === cryptoCurrencyType
				},)
				if (!cryptoCurrencyData) {
					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
				}
				const { rate, } = cryptoCurrencyData
				const costValueUsd = purchasePrice * cryptoAmount
				const marketValueUsd = parseFloat((cryptoAmount * rate).toFixed(2,),)
				const profitUsd = marketValueUsd - costValueUsd
				const profitPercentage = profitUsd / costValueUsd * 100
				const group = await tx.assetCryptoGroup.findFirst({
					where: {
						id: cryptoAsset.groupId,
					},
					include: { cryptos: true, },
				},)
				if (!group) {
					throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
				}
				await tx.assetCryptoGroup.update({
					where: { id: group.id, },
					data:  {
						productType:        CryptoType.DIRECT_HOLD,
						assetName:          AssetNamesType.CRYPTO,
						isArchived:         false,
						exchangeWallet,
						cryptoCurrencyType,
						cryptoAmount,
						purchaseDate:       new Date(purchaseDate,),
						purchasePrice,
						costValueUSD:         parseFloat(costValueUsd.toFixed(2,),),
						costValueFC:         parseFloat(costValueUsd.toFixed(2,),),
						marketValueUSD:         parseFloat(marketValueUsd.toFixed(2,),),
						marketValueFC:         parseFloat(marketValueUsd.toFixed(2,),),
						profitUSD:         parseFloat(profitUsd.toFixed(2,),),
						profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
						totalUnits:         cryptoAmount,
						currentStockPrice: rate,
					},
				},)
				const updatedAsset = await tx.assetCrypto.update({
					where: {
						id: assetId,
					},
					data: {
						assetName:          AssetNamesType.CRYPTO,
						productType:        CryptoType.DIRECT_HOLD,
						exchangeWallet,
						cryptoCurrencyType,
						cryptoAmount,
						purchaseDate:       new Date(purchaseDate,),
						purchasePrice,
						costValueUSD:         parseFloat(costValueUsd.toFixed(2,),),
						costValueFC:         parseFloat(costValueUsd.toFixed(2,),),
						marketValueUSD:         parseFloat(marketValueUsd.toFixed(2,),),
						marketValueFC:         parseFloat(marketValueUsd.toFixed(2,),),
						profitUSD:         parseFloat(profitUsd.toFixed(2,),),
						profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
						currentStockPrice: rate,
						rate,
						comment,
					},
				},)
				const payload = JSON.stringify({
					comment:            updatedAsset.comment,
					productType:         updatedAsset.productType,
					cryptoCurrencyType:	 	  updatedAsset.cryptoCurrencyType,
					cryptoAmount:               updatedAsset.cryptoAmount,
					exchangeWallet:          updatedAsset.exchangeWallet,
					purchaseDate:            updatedAsset.purchaseDate,
					purchasePrice:              updatedAsset.purchasePrice,
				},)
				const prevPayload = {
					comment:            createdVersion.comment,
					productType:         createdVersion.productType,
					cryptoCurrencyType:	 	  createdVersion.cryptoCurrencyType,
					cryptoAmount:               createdVersion.cryptoAmount,
					exchangeWallet:          createdVersion.exchangeWallet,
					purchaseDate:            createdVersion.purchaseDate,
					purchasePrice:              createdVersion.purchasePrice,
				}
				await tx.editLog.create({
					data: {
						clientId:     updatedAsset.clientId,
						portfolioId:  updatedAsset.portfolioId,
						entityId:     updatedAsset.clientId,
						bankId:       updatedAsset.clientId,
						accountId:    updatedAsset.accountId,
						instanceId:   updatedAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Edit,
						assetName:    AssetNamesType.CRYPTO,
						reason:       body.userInfo.reason,
						userName:     body.userInfo.name,
						userEmail:    body.userInfo.email,
						metaAfter:    {
							comment:            updatedAsset.comment,
							productType:         updatedAsset.productType,
							cryptoCurrencyType:	 	  updatedAsset.cryptoCurrencyType,
							cryptoAmount:               updatedAsset.cryptoAmount,
							exchangeWallet:          updatedAsset.exchangeWallet,
							purchaseDate:            updatedAsset.purchaseDate,
							purchasePrice:              updatedAsset.purchasePrice,
						},
						metaBefore: prevPayload,
					},
				},)
				return {
					id:               updatedAsset.id,
					clientId:         updatedAsset.clientId,
					portfolioId:      updatedAsset.portfolioId,
					entityId:         updatedAsset.entityId,
					bankId:           updatedAsset.bankId,
					accountId:        updatedAsset.accountId,
					assetName:        updatedAsset.assetName,
					createdAt:        updatedAsset.createdAt,
					updatedAt:        updatedAsset.updatedAt,
					payload,
					isFutureDated:    updatedAsset.isFutureDated,
					isArchived:       false,
					rate:             updatedAsset.rate,
					portfolioDraftId: null,
				}
			},)
		} catch (error) {
			this.logger.error(error,)
			throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
		}
	}

	// public async updateEquity(assetId: string, body: UpdateAssetDto,): Promise<Asset> {
	// 	try {
	// 		return this.prismaService.$transaction(async(tx,) => {
	// 			await this.cacheService.deleteByUrl([
	// 				...cacheKeysToDeleteAsset.equity,
	// 				...cacheKeysToDeleteAsset.portfolio,
	// 				...cacheKeysToDeleteAsset.client,
	// 			],)

	// 			const parsedPayload = JSON.parse(body.payload,)
	// 			const {
	// 				isin,
	// 				currency,
	// 				security,
	// 				operation,
	// 				units,
	// 				transactionPrice,
	// 				transactionDate,
	// 				bankFee,
	// 				equityType,
	// 				comment,
	// 			} = parsedPayload

	// 			// -------------------- VERSION UPDATE --------------------
	// 			if (body.isVersion) {
	// 				const [equities, etfs, currencyList, equityIsins, historyCurrencyData,] = await Promise.all([
	// 					this.cBondsCurrencyService.getAllEquitiesWithHistory(),
	// 					this.cBondsCurrencyService.getAllEtfsWithHistory(),
	// 					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
	// 					this.prismaService.isins.findMany({
	// 						where: {
	// 							typeId: { in: ['2', '3',], },
	// 						},
	// 					},),
	// 					this.prismaService.currencyHistoryData.findMany(),
	// 				],)

	// 				const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
	// 					return [isin, typeId,]
	// 				},),)

	// 				const equity = equities.find((e,) => {
	// 					return e.isin === isin
	// 				},)
	// 				const etf = etfs.find((e,) => {
	// 					return e.isin === isin
	// 				},)
	// 				const currencyData = currencyList.find((c,) => {
	// 					return c.currency === currency
	// 				},)

	// 				if (!currencyData || (!equity && !etf)) {
	// 					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
	// 				}

	// 				const { rate, } = currencyData

	// 				const rawLastPrice = equity ?
	// 					equity.currencyName === 'GBX' ?
	// 						equity.lastPrice / 100 :
	// 						equity.lastPrice :
	// 					etf ?
	// 						etf.currencyName === 'GBX' ?
	// 							etf.close / 100 :
	// 							etf.close :
	// 						0
	// const lastPrice = parseFloat(rawLastPrice.toFixed(2,),)

	// 				const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
	// 				const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
	// 				const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

	// 				const costRateDate = new Date(transactionDate,)
	// 				const costCurrencyDataRate = currency === CurrencyDataList.USD ?
	// 					1 :
	// 					historyCurrencyData
	// 						.filter((item,) => {
	// 							return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
	// 						},)
	// 						.sort((a, b,) => {
	// 							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
	// 						},)[0]?.rate

	// 				const costPrice = transactionPrice
	// 				const costValueFC = Number(units,) * Number(costPrice,)
	// 				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
	// 				const marketValueFC = Number(units,) * Number(lastPrice,)
	// 				const marketValueUSD = marketValueFC * rate
	// 				const profitUSD = marketValueUSD - costValueUSD
	// 				const profitPercentage = costPrice > 0 ?
	// 					((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
	// 					0

	// 				const typeId = isinTypeMap.get(isin,)
	// 				const type = typeId === '2' ?
	// 					EquityType.Equity :
	// 					EquityType.ETF

	// 				const updatedVersion = await this.prismaService.assetEquityVersion.update({
	// 					where: {
	// 						id: assetId,
	// 					},
	// 					data: {
	// 						currency,
	// 						transactionDate:   new Date(transactionDate,),
	// 						transactionPrice,
	// 						security,
	// 						operation,
	// 						isin,
	// 						units,
	// 						bankFee,
	// 						equityType,
	// 						costPrice,
	// 						costValueFC:       parseFloat(costValueFC.toFixed(2,),),
	// 						costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
	// 						marketValueFC:     parseFloat(marketValueFC.toFixed(2,),),
	// 						marketValueUSD:    parseFloat(marketValueUSD.toFixed(2,),),
	// 						profitUSD:         parseFloat(profitUSD.toFixed(2,),),
	// 						profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
	// 						issuer:            emitentName,
	// 						sector:            branchName,
	// 						country:           stockCountryName,
	// 						currentStockPrice: lastPrice,
	// 						type,
	// 						rate:              costCurrencyDataRate ?? rate,
	// 						comment,
	// 					},
	// 				},)

	// 				const payload = JSON.stringify({
	// 					comment:          updatedVersion.comment,
	// 					currency:         updatedVersion.currency,
	// 					transactionDate:  updatedVersion.transactionDate,
	// 					isin:             updatedVersion.isin,
	// 					operation:        updatedVersion.operation,
	// 					security:         updatedVersion.security,
	// 					units:            updatedVersion.units,
	// 					transactionPrice: updatedVersion.transactionPrice,
	// 					equityType:       updatedVersion.equityType,
	// 					bankFee:          updatedVersion.bankFee,
	// 				},)

	// 				return {
	// 					id:               updatedVersion.id,
	// 					clientId:         updatedVersion.clientId,
	// 					portfolioId:      updatedVersion.portfolioId,
	// 					entityId:         updatedVersion.entityId,
	// 					bankId:           updatedVersion.bankId,
	// 					accountId:        updatedVersion.accountId,
	// 					assetName:        updatedVersion.assetName,
	// 					createdAt:        updatedVersion.createdAt,
	// 					updatedAt:        updatedVersion.updatedAt,
	// 					payload,
	// 					isFutureDated:    updatedVersion.isFutureDated,
	// 					isArchived:       false,
	// 					rate:             updatedVersion.rate,
	// 					portfolioDraftId: null,
	// 				}
	// 			}
	// 			// -------------------- MAIN ASSET UPDATE --------------------
	// 			const equityAsset = await this.prismaService.assetEquity.findUnique({
	// 				where: {
	// 					id: assetId,
	// 				},
	// 				include: {
	// 					assetEquityVersions: true,
	// 				},
	// 			},)

	// 			if (!equityAsset) {
	// 				throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
	// 			}

	// 			const now = new Date()
	// 			const isCreatedToday = isSameDay(equityAsset.createdAt, now,)
	// 			const { groupId, id, assetEquityVersions, ...data } = equityAsset

	// 			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	// 			const recalcAndUpdateEquity = async() => {
	// 				const [equities, etfs, currencyList, equityIsins, historyCurrencyData,] = await Promise.all([
	// 					this.cBondsCurrencyService.getAllEquitiesWithHistory(),
	// 					this.cBondsCurrencyService.getAllEtfsWithHistory(),
	// 					this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
	// 					this.prismaService.isins.findMany({
	// 						where: {
	// 							typeId: { in: ['2', '3',], },
	// 						},
	// 					},),
	// 					this.prismaService.currencyHistoryData.findMany(),
	// 				],)

	// 				const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
	// 					return [isin, typeId,]
	// 				},),)

	// 				const equity = equities.find((e,) => {
	// 					return e.isin === isin
	// 				},)
	// 				const etf = etfs.find((e,) => {
	// 					return e.isin === isin
	// 				},)
	// 				const currencyData = currencyList.find((c,) => {
	// 					return c.currency === currency
	// 				},)

	// 				if (!currencyData || (!equity && !etf)) {
	// 					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
	// 				}

	// 				const { rate, } = currencyData

	// 				const rawLastPrice = equity ?
	// 					equity.currencyName === 'GBX' ?
	// 						equity.lastPrice / 100 :
	// 						equity.lastPrice :
	// 					etf ?
	// 						etf.currencyName === 'GBX' ?
	// 							etf.close / 100 :
	// 							etf.close :
	// 						0

	// const lastPrice = parseFloat(rawLastPrice.toFixed(2,),)
	// 				const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
	// 				const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
	// 				const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

	// 				const costRateDate = new Date(transactionDate,)
	// 				const costCurrencyDataRate = currency === CurrencyDataList.USD ?
	// 					1 :
	// 					historyCurrencyData
	// 						.filter((item,) => {
	// 							return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
	// 						},)
	// 						.sort((a, b,) => {
	// 							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
	// 						},)[0]?.rate

	// 				const costPrice = transactionPrice
	// 				const costValueFC = Number(units,) * Number(costPrice,)
	// 				const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
	// 				const marketValueFC = Number(units,) * Number(lastPrice,)
	// 				const marketValueUSD = marketValueFC * rate
	// 				const profitUSD = marketValueUSD - costValueUSD
	// 				const profitPercentage = costPrice > 0 ?
	// 					((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
	// 					0

	// 				const typeId = isinTypeMap.get(isin,)
	// 				const type = typeId === '2' ?
	// 					EquityType.Equity :
	// 					EquityType.ETF

	// 				const group = await this.prismaService.assetEquityGroup.findFirst({
	// 					where: {
	// 						id: groupId,
	// 					},
	// 					include: {
	// 						equities: true,
	// 					},
	// 				},)

	// 				if (!group) {
	// 					throw new HttpException('Equity group is missing', HttpStatusCode.NotFound,)
	// 				}

	// 				const updatedEquity = await this.prismaService.assetEquity.update({
	// 					where: {
	// 						id: equityAsset.id,
	// 					},
	// 					data: {
	// 						assetName:         data.assetName,
	// 						currency,
	// 						security,
	// 						operation,
	// 						transactionDate:   new Date(transactionDate,),
	// 						transactionPrice,
	// 						bankFee,
	// 						equityType,
	// 						isin,
	// 						units,
	// 						costPrice,
	// 						costValueFC:       parseFloat(costValueFC.toFixed(2,),),
	// 						costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
	// 						marketValueFC:     parseFloat(marketValueFC.toFixed(2,),),
	// 						marketValueUSD:    parseFloat(marketValueUSD.toFixed(2,),),
	// 						profitUSD:         parseFloat(profitUSD.toFixed(2,),),
	// 						profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
	// 						issuer:            emitentName,
	// 						sector:            branchName,
	// 						country:           stockCountryName,
	// 						currentStockPrice: lastPrice,
	// 						type,
	// 						rate:              costCurrencyDataRate ?? rate,
	// 						groupId:           group.id,
	// 						comment,
	// 					},
	// 					include: {
	// 						group: {
	// 							select: {
	// 								equities: true,
	// 							},
	// 						},
	// 					},
	// 				},)

	// 				const accountAssets = [...updatedEquity.group.equities,]

	// 				let rateSum = 0
	// 				let totalUnits = 0
	// 				let totalValue = 0

	// 				for (const a of accountAssets) {
	// 					if (a.operation === AssetOperationType.SELL) {
	// 						continue
	// 					}
	// 					const costRateDateItem = new Date(a.transactionDate,)
	// 					const costCurrencyDataRateItem = a.currency === CurrencyDataList.USD ?
	// 						1 :
	// 						historyCurrencyData
	// 							.filter((item,) => {
	// 								return (new Date(item.date,).getTime() >= costRateDateItem.getTime() && currencyData?.id === item.currencyId)
	// 							},)
	// 							.sort((a, b,) => {
	// 								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
	// 							},)[0]?.rate

	// 					rateSum = rateSum + ((costCurrencyDataRateItem ?? rate) * a.units)
	// 					totalUnits = totalUnits + a.units
	// 					totalValue = totalValue + (a.transactionPrice * a.units)
	// 				}

	// 				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
	// 					return a.operation === AssetOperationType.SELL ?
	// 						sum - a.units :
	// 						sum + a.units
	// 				}, 0,)

	// 				const avgRate = totalUnits > 0 ?
	// 					parseFloat((rateSum / totalUnits).toFixed(4,),) :
	// 					0
	// 				const costPriceGroup = totalUnits > 0 ?
	// 					parseFloat((totalValue / totalUnits).toFixed(2,),) :
	// 					0

	// 				const costValueFCGroup = totalBuySellUnits * costPriceGroup
	// 				const costValueUSDGroup = costValueFCGroup * avgRate
	// 				const marketValueFCGroup = totalBuySellUnits * lastPrice
	// 				const marketValueUSDGroup = marketValueFCGroup * rate
	// 				const profitUSDGroup = marketValueUSDGroup - costValueUSDGroup
	// 				const profitPercentageGroup = costPriceGroup > 0 ?
	// 					((Number(lastPrice,) - Number(costPriceGroup,)) / Number(costPriceGroup,)) * 100 :
	// 					0

	// 				const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
	// 					(latest, current,) => {
	// 						return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
	// 							current :
	// 							latest)
	// 					},
	// 				)

	// 				await this.prismaService.assetEquityGroup.update({
	// 					where: { id: group.id, },
	// 					data:  {
	// 						totalUnits:        totalBuySellUnits,
	// 						costPrice:         costPriceGroup,
	// 						costValueFC:       parseFloat(costValueFCGroup.toFixed(2,),),
	// 						costValueUSD:      parseFloat(costValueUSDGroup.toFixed(2,),),
	// 						marketValueFC:     parseFloat(marketValueFCGroup.toFixed(2,),),
	// 						marketValueUSD:    parseFloat(marketValueUSDGroup.toFixed(2,),),
	// 						profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),),
	// 						profitPercentage:  parseFloat(profitPercentageGroup.toFixed(2,),),
	// 						issuer:            emitentName,
	// 						sector:            branchName,
	// 						country:           stockCountryName,
	// 						currentStockPrice: lastPrice,
	// 						transactionDate:   latestTransactionDate,
	// 						avgRate,
	// 					},
	// 				},)

	// 				const payload = JSON.stringify({
	// 					comment:          updatedEquity.comment,
	// 					currency:         updatedEquity.currency,
	// 					transactionDate:  updatedEquity.transactionDate,
	// 					isin:             updatedEquity.isin,
	// 					operation:        updatedEquity.operation,
	// 					security:         updatedEquity.security,
	// 					units:            updatedEquity.units,
	// 					transactionPrice: updatedEquity.transactionPrice,
	// 					equityType:       updatedEquity.equityType,
	// 					bankFee:          updatedEquity.bankFee,
	// 				},)

	// 				return {
	// 					id:               updatedEquity.id,
	// 					clientId:         updatedEquity.clientId,
	// 					portfolioId:      updatedEquity.portfolioId,
	// 					entityId:         updatedEquity.entityId,
	// 					bankId:           updatedEquity.bankId,
	// 					accountId:        updatedEquity.accountId,
	// 					assetName:        updatedEquity.assetName,
	// 					createdAt:        updatedEquity.createdAt,
	// 					updatedAt:        updatedEquity.updatedAt,
	// 					payload,
	// 					isFutureDated:    updatedEquity.isFutureDated,
	// 					isArchived:       false,
	// 					rate:             updatedEquity.rate,
	// 					portfolioDraftId: null,
	// 				}
	// 			}

	// 			// якщо створено сьогодні – просто апдейтимо без створення версії
	// 			if (isCreatedToday) {
	// 				return recalcAndUpdateEquity()
	// 			}

	// 			// якщо запис не сьогоднішній – спочатку створюємо версію, потім апдейтимо основний
	// 			await this.prismaService.assetEquityVersion.create({
	// 				data: {
	// 					...data,
	// 					assetEquityId: equityAsset.id,
	// 					createdAt:     Boolean(equityAsset.assetEquityVersions?.length,) ?
	// 						new Date() :
	// 						new Date(transactionDate,),
	// 					updatedAt:     Boolean(equityAsset.assetEquityVersions?.length,) ?
	// 						new Date() :
	// 						new Date(transactionDate,),
	// 				},
	// 			},)

	// 			return recalcAndUpdateEquity()
	// 		},)
	// 	} catch (error) {
	// 		this.logger.error(error,)
	// 		throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
	// 	}
	// }
	public async updateEquity(assetId: string, body: UpdateAssetDto,): Promise<Asset> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				await this.cacheService.deleteByUrl([
					...cacheKeysToDeleteAsset.equity,
					...cacheKeysToDeleteAsset.portfolio,
					...cacheKeysToDeleteAsset.client,
				],)

				const parsedPayload = JSON.parse(body.payload,)
				const {
					isin,
					currency,
					security,
					operation,
					units,
					transactionPrice,
					transactionDate,
					bankFee,
					equityType,
					comment,
				} = parsedPayload

				if (body.isVersion) {
					const [equities, etfs, currencyList, equityIsins, historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllEquitiesWithHistory(),
						this.cBondsCurrencyService.getAllEtfsWithHistory(),
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.isins.findMany({
							where: { typeId: { in: ['2', '3',], }, },
						},),
						this.prismaService.currencyHistoryData.findMany(),
					],)

					const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
						return [isin, typeId,]
					},),)

					const equity = equities.find((e,) => {
						return e.isin === isin
					},)
					const etf = etfs.find((e,) => {
						return e.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || (!equity && !etf)) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
					const stockCountryName =
					equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

					const costRateDate = new Date(transactionDate,)
					const costCurrencyDataRate =
					currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter(
								(item,) => {
									return new Date(item.date,).getTime() >= costRateDate.getTime() &&
								currencyData?.id === item.currencyId
								},
							)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate

					const costPrice = transactionPrice
					const costValueFC = Number(units,) * Number(costPrice,)
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage =
					costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					const typeId = isinTypeMap.get(isin,)
					const type = typeId === '2' ?
						EquityType.Equity :
						EquityType.ETF

					const beforeVersion = await tx.assetEquityVersion.findUnique({
						where: { id: assetId, },
					},)
					if (!beforeVersion) {
						throw new HttpException('Version not found', HttpStatus.BAD_REQUEST,)
					}

					const updatedVersion = await this.prismaService.assetEquityVersion.update({
						where: { id: assetId, },
						data:  {
							currency,
							transactionDate:   new Date(transactionDate,),
							transactionPrice,
							security,
							operation,
							isin,
							units,
							bankFee,
							equityType,
							costPrice,
							costValueFC:       parseFloat(costValueFC.toFixed(2,),),
							costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
							marketValueFC:     parseFloat(marketValueFC.toFixed(2,),),
							marketValueUSD:    parseFloat(marketValueUSD.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							type,
							rate:              costCurrencyDataRate ?? rate,
							comment,
						},
					},)

					const prevPayload = {
						comment:          beforeVersion.comment,
						currency:         beforeVersion.currency,
						transactionDate:  beforeVersion.transactionDate,
						isin:             beforeVersion.isin,
						operation:        beforeVersion.operation,
						security:         beforeVersion.security,
						units:            beforeVersion.units,
						transactionPrice: beforeVersion.transactionPrice,
						equityType:       beforeVersion.equityType,
						bankFee:          beforeVersion.bankFee,
					}
					const payload = JSON.stringify({
						comment:          updatedVersion.comment,
						currency:         updatedVersion.currency,
						transactionDate:  updatedVersion.transactionDate,
						isin:             updatedVersion.isin,
						operation:        updatedVersion.operation,
						security:         updatedVersion.security,
						units:            updatedVersion.units,
						transactionPrice: updatedVersion.transactionPrice,
						equityType:       updatedVersion.equityType,
						bankFee:          updatedVersion.bankFee,
					},)

					await tx.editLog.create({
						data: {
							clientId:     updatedVersion.clientId,
							portfolioId:  updatedVersion.portfolioId,
							entityId:     updatedVersion.clientId,
							bankId:       updatedVersion.clientId,
							accountId:    updatedVersion.accountId,
							instanceId:   updatedVersion.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.AssetVersion,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.EQUITY_ASSET,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    JSON.parse(payload,),
							metaBefore:   prevPayload,
						},
					},)

					return {
						id:               updatedVersion.id,
						clientId:         updatedVersion.clientId,
						portfolioId:      updatedVersion.portfolioId,
						entityId:         updatedVersion.entityId,
						bankId:           updatedVersion.bankId,
						accountId:        updatedVersion.accountId,
						assetName:        updatedVersion.assetName,
						createdAt:        updatedVersion.createdAt,
						updatedAt:        updatedVersion.updatedAt,
						payload,
						isFutureDated:    updatedVersion.isFutureDated,
						isArchived:       false,
						rate:             updatedVersion.rate,
						portfolioDraftId: null,
					}
				}

				const equityAsset = await this.prismaService.assetEquity.findUnique({
					where:   { id: assetId, },
					include: { assetEquityVersions: true, },
				},)

				if (!equityAsset) {
					throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
				}

				const now = new Date()
				const isCreatedToday = isSameDay(equityAsset.createdAt, now,)
				const { groupId, id, assetEquityVersions, ...data } = equityAsset

				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				const recalcAndUpdateEquity = async() => {
					const [equities, etfs, currencyList, equityIsins, historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllEquitiesWithHistory(),
						this.cBondsCurrencyService.getAllEtfsWithHistory(),
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.isins.findMany({
							where: { typeId: { in: ['2', '3',], }, },
						},),
						this.prismaService.currencyHistoryData.findMany(),
					],)

					const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
						return [isin, typeId,]
					},),)

					const equity = equities.find((e,) => {
						return e.isin === isin
					},)
					const etf = etfs.find((e,) => {
						return e.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || (!equity && !etf)) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
					const stockCountryName =
					equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

					const costRateDate = new Date(transactionDate,)
					const costCurrencyDataRate =
					currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter(
								(item,) => {
									return new Date(item.date,).getTime() >= costRateDate.getTime() &&
								currencyData?.id === item.currencyId
								},
							)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate

					const costPrice = transactionPrice
					const costValueFC = Number(units,) * Number(costPrice,)
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage =
					costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					const typeId = isinTypeMap.get(isin,)
					const type = typeId === '2' ?
						EquityType.Equity :
						EquityType.ETF

					const beforeAsset = await tx.assetEquity.findUnique({
						where: { id: equityAsset.id, },
					},)

					const group = await this.prismaService.assetEquityGroup.findFirst({
						where:   { id: groupId, },
						include: { equities: true, },
					},)

					if (!group) {
						throw new HttpException('Equity group is missing', HttpStatus.NOT_FOUND,)
					}

					const updatedEquity = await this.prismaService.assetEquity.update({
						where: { id: equityAsset.id, },
						data:  {
							assetName:         data.assetName,
							currency,
							security,
							operation,
							transactionDate:   new Date(transactionDate,),
							transactionPrice,
							bankFee,
							equityType,
							isin,
							units,
							costPrice,
							costValueFC:       parseFloat(costValueFC.toFixed(2,),),
							costValueUSD:      parseFloat(costValueUSD.toFixed(2,),),
							marketValueFC:     parseFloat(marketValueFC.toFixed(2,),),
							marketValueUSD:    parseFloat(marketValueUSD.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:  parseFloat(profitPercentage.toFixed(2,),),
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							type,
							rate:              costCurrencyDataRate ?? rate,
							groupId:           group.id,
							comment,
						},
						include: {
							group: {
								select: { equities: true, },
							},
						},
					},)

					const accountAssets = [...updatedEquity.group.equities,]

					let rateSum = 0
					let totalUnits = 0
					let totalValue = 0

					for (const a of accountAssets) {
						if (a.operation === AssetOperationType.SELL) {
							continue
						} const costRateDateItem = new Date(a.transactionDate,)
						const costCurrencyDataRateItem =
						a.currency === CurrencyDataList.USD ?
							1 :
							historyCurrencyData
								.filter(
									(item,) => {
										return new Date(item.date,).getTime() >= costRateDateItem.getTime() &&
									currencyData?.id === item.currencyId
									},
								)
								.sort((a, b,) => {
									return new Date(a.date,).getTime() - new Date(b.date,).getTime()
								},)[0]?.rate

						rateSum = rateSum + ((costCurrencyDataRateItem ?? rate) * a.units)
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

					const costValueFCGroup = totalBuySellUnits * costPriceGroup
					const costValueUSDGroup = costValueFCGroup * avgRate
					const marketValueFCGroup = totalBuySellUnits * lastPrice
					const marketValueUSDGroup = marketValueFCGroup * rate
					const profitUSDGroup = marketValueUSDGroup - costValueUSDGroup
					const profitPercentageGroup =
					costPriceGroup > 0 ?
						((Number(lastPrice,) - Number(costPriceGroup,)) / Number(costPriceGroup,)) * 100 :
						0
					const { transactionDate: latestTransactionDate, } = accountAssets.reduce((latest, current,) => {
						return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
							current :
							latest)
					},
					)
					await this.prismaService.assetEquityGroup.update({
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
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionDate:   latestTransactionDate,
							avgRate,
						},
					},)

					const prevPayload = {
						comment:          parsedPayload.comment,
						currency:         parsedPayload.currency,
						transactionDate:  parsedPayload.transactionDate,
						isin:             parsedPayload.isin,
						operation:        parsedPayload.operation,
						security:         parsedPayload.security,
						units:            parsedPayload.units,
						transactionPrice: parsedPayload.transactionPrice,
						equityType:       parsedPayload.equityType,
						bankFee:          parsedPayload.bankFee,
					}
					const payload = JSON.stringify({
						comment:          updatedEquity.comment,
						currency:         updatedEquity.currency,
						transactionDate:  updatedEquity.transactionDate,
						isin:             updatedEquity.isin,
						operation:        updatedEquity.operation,
						security:         updatedEquity.security,
						units:            updatedEquity.units,
						transactionPrice: updatedEquity.transactionPrice,
						equityType:       updatedEquity.equityType,
						bankFee:          updatedEquity.bankFee,
					},)

					await tx.editLog.create({
						data: {
							clientId:     updatedEquity.clientId,
							portfolioId:  updatedEquity.portfolioId,
							entityId:     updatedEquity.clientId,
							bankId:       updatedEquity.clientId,
							accountId:    updatedEquity.accountId,
							instanceId:   updatedEquity.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.Asset,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.EQUITY_ASSET,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    JSON.parse(payload,),
							metaBefore:   prevPayload,
						},
					},)

					return {
						id:               updatedEquity.id,
						clientId:         updatedEquity.clientId,
						portfolioId:      updatedEquity.portfolioId,
						entityId:         updatedEquity.entityId,
						bankId:           updatedEquity.bankId,
						accountId:        updatedEquity.accountId,
						assetName:        updatedEquity.assetName,
						createdAt:        updatedEquity.createdAt,
						updatedAt:        updatedEquity.updatedAt,
						payload,
						isFutureDated:    updatedEquity.isFutureDated,
						isArchived:       false,
						rate:             updatedEquity.rate,
						portfolioDraftId: null,
					}
				}

				if (isCreatedToday) {
					return recalcAndUpdateEquity()
				}

				await this.prismaService.assetEquityVersion.create({
					data: {
						...data,
						assetEquityId: equityAsset.id,
						createdAt:     equityAsset.assetEquityVersions?.length ?
							new Date() :
							new Date(transactionDate,),
						updatedAt:     equityAsset.assetEquityVersions?.length ?
							new Date() :
							new Date(transactionDate,),
					},
				},)

				return recalcAndUpdateEquity()
			},)
		} catch (error) {
			this.logger.error(error,)
			throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
		}
	}

	public async updateMetal(assetId: string, body: UpdateAssetDto,): Promise<Asset> {
		try {
			return this.prismaService.$transaction(async(tx,) => {
				await this.cacheService.deleteByUrl([
					...cacheKeysToDeleteAsset.metals,
					...cacheKeysToDeleteAsset.portfolio,
					...cacheKeysToDeleteAsset.client,
				],)
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
				const parsedPayload = JSON.parse(body.payload,)
				if (body.isVersion) {
					if (parsedPayload.productType === MetalType.ETF) {
						const { isin, currency, security, units, transactionPrice, transactionDate, bankFee, comment,} = parsedPayload
						const equity = equities.find((e,) => {
							return e.isin === isin
						},)
						const etf = etfs.find((e,) => {
							return e.isin === isin
						},)
						const currencyData = currencyList.find((c,) => {
							return c.currency === currency
						},)
						if (!currencyData || (!equity && !etf)) {
							throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
						const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
						const costRateDate = new Date(transactionDate,)
						const costCurrencyDataRate = currency === CurrencyDataList.USD ?
							1 :
							historyCurrencyData
								.filter((item,) => {
									return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
								},)
								.sort((a, b,) => {
									return new Date(a.date,).getTime() - new Date(b.date,).getTime()
								},)[0]?.rate
						const costPrice = transactionPrice
						const costValueFC = Number(units,) * Number(costPrice,)
						const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
						const marketValueFC = Number(units,) * Number(lastPrice,)
						const marketValueUSD = marketValueFC * rate
						const profitUSD = marketValueUSD - costValueUSD
						const profitPercentage = costPrice > 0 ?
							((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
							0
						const beforeVersion = await tx.assetMetalVersion.findUnique({
							where: {
								id: assetId,
							},
						},)
						if (!beforeVersion) {
							throw new HttpException('Asset version not found', HttpStatus.NOT_FOUND,)
						}
						const updatedVersion = await tx.assetMetalVersion.update({
							where: {
								id: assetId,
							},
							data: {
								assetName:         AssetNamesType.METALS,
								currency,
								security,
								transactionDate:   new Date(transactionDate,),
								transactionPrice,
								bankFee,
								isin,
								units,
								costPrice,
								costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
								costValueFC:         parseFloat(costValueFC.toFixed(2,),),
								marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
								marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
								profitUSD:         parseFloat(profitUSD.toFixed(2,),),
								profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								comment,
								rate:              costCurrencyDataRate ?? rate,
							},
						},)
						const payload = JSON.stringify({
							comment:          updatedVersion.comment,
							productType:      updatedVersion.productType,
							currency:         updatedVersion.currency,
							transactionDate:	 	  updatedVersion.transactionDate,
							isin:             updatedVersion.isin,
							operation:        updatedVersion.operation,
							security:            updatedVersion.security,
							units:            updatedVersion.units,
							transactionPrice:       updatedVersion.transactionPrice,
							equityType:          MetalType.ETF,
							bankFee:          updatedVersion.bankFee,
						},)
						const prevPayload = {
							comment:          beforeVersion.comment,
							productType:      beforeVersion.productType,
							currency:         beforeVersion.currency,
							transactionDate:	 	  beforeVersion.transactionDate,
							isin:             beforeVersion.isin,
							operation:        beforeVersion.operation,
							security:            beforeVersion.security,
							units:            beforeVersion.units,
							transactionPrice:       beforeVersion.transactionPrice,
							equityType:          MetalType.ETF,
							bankFee:          beforeVersion.bankFee,
						}
						await tx.editLog.create({
							data: {
								clientId:     updatedVersion.clientId,
								portfolioId:  updatedVersion.portfolioId,
								entityId:     updatedVersion.clientId,
								bankId:       updatedVersion.clientId,
								accountId:    updatedVersion.accountId,
								instanceId:   updatedVersion.id,
								editedAt:     new Date(),
								instanceType: LogInstanceType.AssetVersion,
								actionType:   LogActionType.Edit,
								assetName:    AssetNamesType.METALS,
								reason:       body.userInfo.reason,
								userName:     body.userInfo.name,
								userEmail:    body.userInfo.email,
								metaAfter:    {
									comment:          updatedVersion.comment,
									productType:      updatedVersion.productType,
									currency:         updatedVersion.currency,
									transactionDate:	 	  updatedVersion.transactionDate,
									isin:             updatedVersion.isin,
									operation:        updatedVersion.operation,
									security:            updatedVersion.security,
									units:            updatedVersion.units,
									transactionPrice:       updatedVersion.transactionPrice,
									equityType:          MetalType.ETF,
									bankFee:          updatedVersion.bankFee,
								},
								metaBefore: prevPayload,
							},
						},)
						return {
							id:               updatedVersion.id,
							clientId:         updatedVersion.clientId,
							portfolioId:      updatedVersion.portfolioId,
							entityId:         updatedVersion.entityId,
							bankId:           updatedVersion.bankId,
							accountId:        updatedVersion.accountId,
							assetName:        updatedVersion.assetName,
							createdAt:        updatedVersion.createdAt,
							updatedAt:        updatedVersion.updatedAt,
							payload,
							isFutureDated:    updatedVersion.isFutureDated,
							isArchived:       false,
							rate:             updatedVersion.rate,
							portfolioDraftId: null,
						}
					}
					const {
						currency,
						transactionDate,
						metalType,
						purchasePrice,
						units,
						comment,
					} = parsedPayload
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					const metalCurrencyData = metalData.find((c,) => {
						return c.currency === (metalType)
					},)
					if (!metalCurrencyData || !currencyData) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const getMetalFullName = (metalName: MetalDataList,): string => {
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
					const { rate, currency: metalCurrency, id: metalCurrencyId,} = metalCurrencyData
					const {rate: currencyRate,} = currencyData
					const costRateDate = new Date(transactionDate,)
					const costCurrencyHistoryRate = currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costCurrencyDataRate = historyMetalData
						.filter((item,) => {
							return (new Date(item.date,).getTime() >= costRateDate.getTime() && metalCurrencyId === item.currencyId)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate

					const metalName = getMetalFullName(metalCurrency,)
					const metalMarketPrice =  parseFloat((rate / currencyRate).toFixed(2,),)
					const costPrice = purchasePrice
					const costValueFC = costPrice * units
					const costValueUSD = costValueFC * ((costCurrencyHistoryRate ?? currencyRate))
					const marketValueFC = units * metalMarketPrice
					const marketValueUSD = units * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costValueUSD > 0 ?
						(profitUSD / costValueUSD) * 100	:
						0
					const beforeVersion = await tx.assetMetalVersion.findUnique({
						where: {
							id: assetId,
						},
					},)
					if (!beforeVersion) {
						throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
					}
					const updatedVersion = await tx.assetMetalVersion.update({
						where: {
							id: assetId,
						},
						data: {
							assetName:          AssetNamesType.METALS,
							productType:        MetalType.DIRECT_HOLD,
							transactionDate:   new Date(transactionDate,),
							transactionPrice:  purchasePrice,
							units,
							costPrice,
							costValueUSD:       parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:       parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:       parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:       parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:       parseFloat(profitPercentage.toFixed(2,),),
							rate:              costCurrencyDataRate ?? rate,
							metalName,
							currentStockPrice: metalMarketPrice,
							comment,
						},
					},)
					const payload = JSON.stringify({
						comment:            updatedVersion.comment,
						productType:         updatedVersion.productType,
						metalType:	 	    updatedVersion.metalType,
						transactionDate:               updatedVersion.transactionDate,
						purchasePrice:          updatedVersion.transactionPrice,
						units:            updatedVersion.units,
						operation:              updatedVersion.operation,
					},)
					const prevPayload = {
						comment:            beforeVersion.comment,
						productType:         beforeVersion.productType,
						metalType:	 	    beforeVersion.metalType,
						transactionDate:               beforeVersion.transactionDate,
						purchasePrice:          beforeVersion.transactionPrice,
						units:            beforeVersion.units,
						operation:              beforeVersion.operation,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedVersion.clientId,
							portfolioId:  updatedVersion.portfolioId,
							entityId:     updatedVersion.clientId,
							bankId:       updatedVersion.clientId,
							accountId:    updatedVersion.accountId,
							instanceId:   updatedVersion.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.AssetVersion,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.METALS,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:            updatedVersion.comment,
								productType:         updatedVersion.productType,
								metalType:	 	    updatedVersion.metalType,
								transactionDate:               updatedVersion.transactionDate,
								purchasePrice:          updatedVersion.transactionPrice,
								units:            updatedVersion.units,
								operation:              updatedVersion.operation,
							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedVersion.id,
						clientId:         updatedVersion.clientId,
						portfolioId:      updatedVersion.portfolioId,
						entityId:         updatedVersion.entityId,
						bankId:           updatedVersion.bankId,
						accountId:        updatedVersion.accountId,
						assetName:        updatedVersion.assetName,
						createdAt:        updatedVersion.createdAt,
						updatedAt:        updatedVersion.updatedAt,
						payload,
						isFutureDated:    updatedVersion.isFutureDated,
						isArchived:       false,
						rate:             updatedVersion.rate,
						portfolioDraftId: null,
					}
				}
				const metalAsset = await tx.assetMetal.findUnique({
					where: {
						id: assetId,
					},
					include: {
						assetMetalVersions: true,
					},
				},)
				if (!metalAsset) {
					throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
				}
				const now = new Date()
				const isCreatedToday = isSameDay(metalAsset.createdAt, now,)
				const {groupId, id, assetMetalVersions, ...data} = metalAsset

				if (isCreatedToday) {
					if (parsedPayload.productType === MetalType.ETF) {
						const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee,comment,} = parsedPayload
						const [equities, etfs, currencyList, historyCurrencyData,] = await Promise.all([
							this.cBondsCurrencyService.getAllEquitiesWithHistory(),
							this.cBondsCurrencyService.getAllEtfsWithHistory(),
							this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
							this.prismaService.currencyHistoryData.findMany(),
						],)
						const equity = equities.find((e,) => {
							return e.isin === isin
						},)
						const etf = etfs.find((e,) => {
							return e.isin === isin
						},)
						const currencyData = currencyList.find((c,) => {
							return c.currency === currency
						},)
						if (!currencyData || (!equity && !etf)) {
							throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
						const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
						const costRateDate = new Date(transactionDate,)
						const costCurrencyDataRate = currency === CurrencyDataList.USD ?
							1 :
							historyCurrencyData
								.filter((item,) => {
									return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
								},)
								.sort((a, b,) => {
									return new Date(a.date,).getTime() - new Date(b.date,).getTime()
								},)[0]?.rate
						const costPrice = transactionPrice
						const costValueFC = Number(units,) * Number(costPrice,)
						const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
						const marketValueFC = Number(units,) * Number(lastPrice,)
						const marketValueUSD = marketValueFC * rate
						const profitUSD = marketValueUSD - costValueUSD
						const profitPercentage = costPrice > 0 ?
							((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
							0
						const updatedMetal = await tx.assetMetal.update({
							where: {
								id: assetId,
							},
							data: {
								productType:       MetalType.ETF,
								assetName:         AssetNamesType.METALS,
								currency,
								security,
								operation,
								transactionDate:   new Date(transactionDate,),
								transactionPrice,
								bankFee,
								isin,
								units,
								costPrice,
								costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
								costValueFC:         parseFloat(costValueFC.toFixed(2,),),
								marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
								marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
								profitUSD:         parseFloat(profitUSD.toFixed(2,),),
								profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								comment,
								rate:              costCurrencyDataRate ?? rate,
							},
						},)
						const group = await tx.assetMetalGroup.findFirst({
							where: {
								id: updatedMetal.groupId,

							},
							include: { metals: true, },
						},)
						if (!group) {
							throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
						}

						const accountAssets = group.metals
						let rateSum = 0
						let rateCount = 0
						let totalUnits = 0
						let totalValue = 0
						for (const a of accountAssets) {
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

						const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
							(latest, current,) => {
								return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
									current :
									latest)
							},
						)

						await tx.assetMetalGroup.update({
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
								issuer:            emitentName,
								sector:            branchName,
								country:           stockCountryName,
								currentStockPrice: lastPrice,
								transactionDate:   latestTransactionDate,
								avgRate,
							},
						},)

						const payload = JSON.stringify({
							comment:          updatedMetal.comment,
							productType:      updatedMetal.productType,
							currency:         updatedMetal.currency,
							transactionDate:	 	  updatedMetal.transactionDate,
							isin:             updatedMetal.isin,
							operation:        updatedMetal.operation,
							security:            updatedMetal.security,
							units:            updatedMetal.units,
							transactionPrice:       updatedMetal.transactionPrice,
							equityType:          MetalType.ETF,
							bankFee:          updatedMetal.bankFee,
						},)
						const prevPayload = {
							comment:          parsedPayload.comment,
							productType:      parsedPayload.productType,
							currency:         parsedPayload.currency,
							transactionDate:	 	  parsedPayload.transactionDate,
							isin:             parsedPayload.isin,
							operation:        parsedPayload.operation,
							security:            parsedPayload.security,
							units:            parsedPayload.units,
							transactionPrice:       parsedPayload.transactionPrice,
							equityType:          MetalType.ETF,
							bankFee:          parsedPayload.bankFee,
						}
						await tx.editLog.create({
							data: {
								clientId:     updatedMetal.clientId,
								portfolioId:  updatedMetal.portfolioId,
								entityId:     updatedMetal.clientId,
								bankId:       updatedMetal.clientId,
								accountId:    updatedMetal.accountId,
								instanceId:   updatedMetal.id,
								editedAt:     new Date(),
								instanceType: LogInstanceType.Asset,
								actionType:   LogActionType.Edit,
								assetName:    AssetNamesType.METALS,
								reason:       body.userInfo.reason,
								userName:     body.userInfo.name,
								userEmail:    body.userInfo.email,
								metaAfter:    {
									comment:          updatedMetal.comment,
									productType:      updatedMetal.productType,
									currency:         updatedMetal.currency,
									transactionDate:	 	  updatedMetal.transactionDate,
									isin:             updatedMetal.isin,
									operation:        updatedMetal.operation,
									security:            updatedMetal.security,
									units:            updatedMetal.units,
									transactionPrice:       updatedMetal.transactionPrice,
									equityType:          MetalType.ETF,
									bankFee:          updatedMetal.bankFee,
								},
								metaBefore: prevPayload,
							},
						},)
						return {
							id:               updatedMetal.id,
							clientId:         updatedMetal.clientId,
							portfolioId:      updatedMetal.portfolioId,
							entityId:         updatedMetal.entityId,
							bankId:           updatedMetal.bankId,
							accountId:        updatedMetal.accountId,
							assetName:        updatedMetal.assetName,
							createdAt:        updatedMetal.createdAt,
							updatedAt:        updatedMetal.updatedAt,
							payload,
							isFutureDated:    updatedMetal.isFutureDated,
							isArchived:       false,
							rate:             updatedMetal.rate,
							portfolioDraftId: null,
						}
					}
					const {
						currency,
						transactionDate,
						metalType,
						purchasePrice,
						units,
						comment,
					} = parsedPayload
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					const metalCurrencyData = metalData.find((c,) => {
						return c.currency === (metalType)
					},)
					if (!metalCurrencyData || !currencyData) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
					}
					const { rate, currency: metalCurrency, id: metalCurrencyId,} = metalCurrencyData
					const {rate: currencyRate,} = currencyData
					const costRateDate = new Date(transactionDate,)
					const costCurrencyHistoryRate = currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate

					const metalMarketPrice =  parseFloat((rate / currencyRate).toFixed(2,),)
					const costPrice = purchasePrice
					const costValueFC = costPrice * units
					const costValueUSD = costValueFC * ((costCurrencyHistoryRate ?? currencyRate))
					const marketValueFC = units * metalMarketPrice
					const marketValueUSD = units * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costValueUSD > 0 ?
						(profitUSD / costValueUSD) * 100	:
						0
					const updatedMetal = await tx.assetMetal.update({
						where: {
							id: assetId,
						},
						data: {
							assetName:          AssetNamesType.METALS,
							productType:        MetalType.DIRECT_HOLD,
							transactionDate:       new Date(transactionDate,),
							transactionPrice:  purchasePrice,
							costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:         parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							currentStockPrice: rate,
							units,
							rate,
							comment,
						},
					},)
					const group = await tx.assetMetalGroup.findFirst({
						where: {
							id: metalAsset.groupId,
						},
						include: { metals: true, },
					},)
					if (!group) {
						throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
					}
					const accountAssets = group.metals
					let rateSum = 0
					let rateCount = 0
					let totalUnits = 0
					let totalValue = 0
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
					const marketValueFCGroup = totalBuySellUnits *  metalMarketPrice
					const marketValueUSDGroup = totalBuySellUnits * rate
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
					await tx.assetMetalGroup.update({
						where: { id: group.id, },
						data:  {
							productType:        MetalType.DIRECT_HOLD,
							assetName:          AssetNamesType.METALS,
							isArchived:         false,
							transactionDate:       new Date(latestTransactionDate,),
							transactionPrice:  parseFloat(costPriceGroup.toFixed(2,),),
							costValueUSD:         parseFloat(costValueUSDGroup.toFixed(2,),),
							costValueFC:         parseFloat(costValueFCGroup.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUSDGroup.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueFCGroup.toFixed(2,),),
							profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentageGroup.toFixed(2,),),
							totalUnits:         totalBuySellUnits,
							currentStockPrice: rate,
							avgRate,
							costPrice:         costPriceGroup,
						},
					},)

					const payload = JSON.stringify({
						comment:         updatedMetal.comment,
						productType:         updatedMetal.productType,
						metalType:	 	    updatedMetal.metalType,
						transactionDate:               updatedMetal.transactionDate,
						purchasePrice:          updatedMetal.transactionPrice,
						units:            updatedMetal.units,
						operation:              updatedMetal.operation,
					},)
					const prevPayload = {
						comment:         parsedPayload.comment,
						productType:         parsedPayload.productType,
						metalType:	 	    parsedPayload.metalType,
						transactionDate:               parsedPayload.transactionDate,
						purchasePrice:          parsedPayload.transactionPrice,
						units:            parsedPayload.units,
						operation:              parsedPayload.operation,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedMetal.clientId,
							portfolioId:  updatedMetal.portfolioId,
							entityId:     updatedMetal.clientId,
							bankId:       updatedMetal.clientId,
							accountId:    updatedMetal.accountId,
							instanceId:   updatedMetal.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.Asset,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.METALS,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:         updatedMetal.comment,
								productType:         updatedMetal.productType,
								metalType:	 	    updatedMetal.metalType,
								transactionDate:               updatedMetal.transactionDate,
								purchasePrice:          updatedMetal.transactionPrice,
								units:            updatedMetal.units,
								operation:              updatedMetal.operation,
							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedMetal.id,
						clientId:         updatedMetal.clientId,
						portfolioId:      updatedMetal.portfolioId,
						entityId:         updatedMetal.entityId,
						bankId:           updatedMetal.bankId,
						accountId:        updatedMetal.accountId,
						assetName:        updatedMetal.assetName,
						createdAt:        updatedMetal.createdAt,
						updatedAt:        updatedMetal.updatedAt,
						payload,
						isFutureDated:    updatedMetal.isFutureDated,
						isArchived:       false,
						rate:             updatedMetal.rate,
						portfolioDraftId: null,
					}
				}
				const createdVersion = await tx.assetMetalVersion.create({
					data: {
						...data,
						metalId:    metalAsset.id,
						createdAt: Boolean(metalAsset.assetMetalVersions?.length,) ?
							new Date() :
							new Date(parsedPayload.transactionDate ?? parsedPayload.purchaseDate,),
						updatedAt: Boolean(metalAsset.assetMetalVersions?.length,) ?
							new Date() :
							new Date(parsedPayload.transactionDate ?? parsedPayload.purchaseDate,),
					},
				},)
				if (parsedPayload.productType === MetalType.ETF) {
					const { isin, currency, security, operation, units, transactionPrice, transactionDate, bankFee,comment,} = parsedPayload
					const [equities, etfs, currencyList, historyCurrencyData,] = await Promise.all([
						this.cBondsCurrencyService.getAllEquitiesWithHistory(),
						this.cBondsCurrencyService.getAllEtfsWithHistory(),
						this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
						this.prismaService.currencyHistoryData.findMany(),
					],)
					const equity = equities.find((e,) => {
						return e.isin === isin
					},)
					const etf = etfs.find((e,) => {
						return e.isin === isin
					},)
					const currencyData = currencyList.find((c,) => {
						return c.currency === currency
					},)
					if (!currencyData || (!equity && !etf)) {
						throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
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
					const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
					const costRateDate = new Date(transactionDate,)
					const costCurrencyDataRate = currency === CurrencyDataList.USD ?
						1 :
						historyCurrencyData
							.filter((item,) => {
								return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
							},)
							.sort((a, b,) => {
								return new Date(a.date,).getTime() - new Date(b.date,).getTime()
							},)[0]?.rate
					const costPrice = transactionPrice
					const costValueFC = Number(units,) * Number(costPrice,)
					const costValueUSD = costValueFC * (costCurrencyDataRate ?? rate)
					const marketValueFC = Number(units,) * Number(lastPrice,)
					const marketValueUSD = marketValueFC * rate
					const profitUSD = marketValueUSD - costValueUSD
					const profitPercentage = costPrice > 0 ?
						((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
						0
					const updatedAsset = await tx.assetMetal.update({
						where: {
							id: assetId,
						},
						data: {
							productType:       MetalType.ETF,
							assetName:         AssetNamesType.METALS,
							currency,
							security,
							operation,
							transactionDate:   new Date(transactionDate,),
							transactionPrice,
							bankFee,
							isin,
							units,
							costPrice,
							costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
							costValueFC:         parseFloat(costValueFC.toFixed(2,),),
							marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
							marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
							profitUSD:         parseFloat(profitUSD.toFixed(2,),),
							profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							comment,
							rate:              costCurrencyDataRate ?? rate,
						},
					},)
					const group = await tx.assetMetalGroup.findFirst({
						where: {
							id: updatedAsset.groupId,
						},
						include: { metals: true, },
					},)
					if (!group) {
						throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
					}
					const accountAssets = group.metals
					let rateSum = 0
					let rateCount = 0
					let totalUnits = 0
					let totalValue = 0
					for (const a of accountAssets) {
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

					const { transactionDate: latestTransactionDate, } = accountAssets.reduce(
						(latest, current,) => {
							return (new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
								current :
								latest)
						},
					)
					await tx.assetMetalGroup.update({
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
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionDate:   latestTransactionDate,
							avgRate,
						},
					},)

					const payload = JSON.stringify({
						comment:          updatedAsset.comment,
						productType:      updatedAsset.productType,
						currency:         updatedAsset.currency,
						transactionDate:	 	  updatedAsset.transactionDate,
						isin:             updatedAsset.isin,
						operation:        updatedAsset.operation,
						security:            updatedAsset.security,
						units:            updatedAsset.units,
						transactionPrice:       updatedAsset.transactionPrice,
						equityType:          MetalType.ETF,
						bankFee:          updatedAsset.bankFee,
					},)
					const prevPayload = {
						comment:          createdVersion.comment,
						productType:      createdVersion.productType,
						currency:         createdVersion.currency,
						transactionDate:	 	  createdVersion.transactionDate,
						isin:             createdVersion.isin,
						operation:        createdVersion.operation,
						security:            createdVersion.security,
						units:            createdVersion.units,
						transactionPrice:       createdVersion.transactionPrice,
						equityType:          MetalType.ETF,
						bankFee:          createdVersion.bankFee,
					}
					await tx.editLog.create({
						data: {
							clientId:     updatedAsset.clientId,
							portfolioId:  updatedAsset.portfolioId,
							entityId:     updatedAsset.clientId,
							bankId:       updatedAsset.clientId,
							accountId:    updatedAsset.accountId,
							instanceId:   updatedAsset.id,
							editedAt:     new Date(),
							instanceType: LogInstanceType.Asset,
							actionType:   LogActionType.Edit,
							assetName:    AssetNamesType.METALS,
							reason:       body.userInfo.reason,
							userName:     body.userInfo.name,
							userEmail:    body.userInfo.email,
							metaAfter:    {
								comment:          updatedAsset.comment,
								productType:      updatedAsset.productType,
								currency:         updatedAsset.currency,
								transactionDate:	 	  updatedAsset.transactionDate,
								isin:             updatedAsset.isin,
								operation:        updatedAsset.operation,
								security:            updatedAsset.security,
								units:            updatedAsset.units,
								transactionPrice:       updatedAsset.transactionPrice,
								equityType:          MetalType.ETF,
								bankFee:          updatedAsset.bankFee,

							},
							metaBefore: prevPayload,
						},
					},)
					return {
						id:               updatedAsset.id,
						clientId:         updatedAsset.clientId,
						portfolioId:      updatedAsset.portfolioId,
						entityId:         updatedAsset.entityId,
						bankId:           updatedAsset.bankId,
						accountId:        updatedAsset.accountId,
						assetName:        updatedAsset.assetName,
						createdAt:        updatedAsset.createdAt,
						updatedAt:        updatedAsset.updatedAt,
						payload,
						isFutureDated:    updatedAsset.isFutureDated,
						isArchived:       false,
						rate:             updatedAsset.rate,
						portfolioDraftId: null,
					}
				}
				const {
					currency,
					transactionDate,
					metalType,
					purchasePrice,
					units,
					comment,
				} = parsedPayload
				const currencyData = currencyList.find((c,) => {
					return c.currency === currency
				},)
				const metalCurrencyData = metalData.find((c,) => {
					return c.currency === (metalType)
				},)
				if (!metalCurrencyData || !currencyData) {
					throw new HttpException('Data is missing', HttpStatusCode.BadRequest,)
				}
				const { rate, currency: metalCurrency, id: metalCurrencyId,} = metalCurrencyData
				const {rate: currencyRate,} = currencyData
				const costRateDate = new Date(transactionDate,)
				const costCurrencyHistoryRate = currency === CurrencyDataList.USD ?
					1 :
					historyCurrencyData
						.filter((item,) => {
							return (new Date(item.date,).getTime() >= costRateDate.getTime() && currencyData?.id === item.currencyId)
						},)
						.sort((a, b,) => {
							return new Date(a.date,).getTime() - new Date(b.date,).getTime()
						},)[0]?.rate
				const metalMarketPrice =  parseFloat((rate / currencyRate).toFixed(2,),)
				const costPrice = purchasePrice
				const costValueFC = costPrice * units
				const costValueUSD = costValueFC * ((costCurrencyHistoryRate ?? currencyRate))
				const marketValueFC = units * metalMarketPrice
				const marketValueUSD = units * rate
				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = costValueUSD > 0 ?
					(profitUSD / costValueUSD) * 100	:
					0
				const updatedMetal = await tx.assetMetal.update({
					where: {
						id: assetId,
					},
					data: {
						assetName:          AssetNamesType.METALS,
						productType:        MetalType.DIRECT_HOLD,
						units,
						transactionDate:       new Date(transactionDate,),
						transactionPrice:  purchasePrice,
						costValueUSD:         parseFloat(costValueUSD.toFixed(2,),),
						costValueFC:         parseFloat(costValueFC.toFixed(2,),),
						marketValueUSD:         parseFloat(marketValueUSD.toFixed(2,),),
						marketValueFC:         parseFloat(marketValueFC.toFixed(2,),),
						profitUSD:         parseFloat(profitUSD.toFixed(2,),),
						profitPercentage:         parseFloat(profitPercentage.toFixed(2,),),
						currentStockPrice: rate,
						rate,
						comment,
					},
				},)
				const group = await tx.assetMetalGroup.findFirst({
					where: {
						id: metalAsset.groupId,
					},
					include: { metals: true, },
				},)
				if (!group) {
					throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
				}
				const accountAssets = group.metals
				let rateSum = 0
				let rateCount = 0
				let totalUnits = 0
				let totalValue = 0
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
				const marketValueFCGroup = totalBuySellUnits *  metalMarketPrice
				const marketValueUSDGroup = totalBuySellUnits * rate
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
				await tx.assetMetalGroup.update({
					where: { id: group.id, },
					data:  {
						productType:        MetalType.DIRECT_HOLD,
						assetName:          AssetNamesType.METALS,
						isArchived:         false,
						transactionDate:       new Date(latestTransactionDate,),
						transactionPrice:  costPriceGroup,
						costValueUSD:         parseFloat(costValueUSDGroup.toFixed(2,),),
						costValueFC:         parseFloat(costValueFCGroup.toFixed(2,),),
						marketValueUSD:         parseFloat(marketValueUSDGroup.toFixed(2,),),
						marketValueFC:         parseFloat(marketValueFCGroup.toFixed(2,),),
						profitUSD:         parseFloat(profitUSDGroup.toFixed(2,),),
						profitPercentage:         parseFloat(profitPercentageGroup.toFixed(2,),),
						totalUnits:         totalBuySellUnits,
						costPrice:         costPriceGroup,
						currentStockPrice: rate,
						avgRate,
					},
				},)

				const payload = JSON.stringify({
					comment:         updatedMetal.comment,
					productType:         updatedMetal.productType,
					metalType:	 	    updatedMetal.metalType,
					transactionDate:               updatedMetal.transactionDate,
					purchasePrice:          updatedMetal.transactionPrice,
					units:            updatedMetal.units,
					operation:              updatedMetal.operation,
				},)
				const prevPayload = {
					comment:         parsedPayload.comment,
					productType:         parsedPayload.productType,
					metalType:	 	    parsedPayload.metalType,
					transactionDate:               parsedPayload.transactionDate,
					purchasePrice:          parsedPayload.transactionPrice,
					units:            parsedPayload.units,
					operation:              parsedPayload.operation,
				}
				await tx.editLog.create({
					data: {
						clientId:     updatedMetal.clientId,
						portfolioId:  updatedMetal.portfolioId,
						entityId:     updatedMetal.clientId,
						bankId:       updatedMetal.clientId,
						accountId:    updatedMetal.accountId,
						instanceId:   updatedMetal.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Edit,
						assetName:    AssetNamesType.METALS,
						reason:       body.userInfo.reason,
						userName:     body.userInfo.name,
						userEmail:    body.userInfo.email,
						metaAfter:    {
							comment:         updatedMetal.comment,
							productType:         updatedMetal.productType,
							metalType:	 	    updatedMetal.metalType,
							transactionDate:               updatedMetal.transactionDate,
							purchasePrice:          updatedMetal.transactionPrice,
							units:            updatedMetal.units,
							operation:              updatedMetal.operation,
						},
						metaBefore: prevPayload,
					},
				},)
				return {
					id:               updatedMetal.id,
					clientId:         updatedMetal.clientId,
					portfolioId:      updatedMetal.portfolioId,
					entityId:         updatedMetal.entityId,
					bankId:           updatedMetal.bankId,
					accountId:        updatedMetal.accountId,
					assetName:        updatedMetal.assetName,
					createdAt:        updatedMetal.createdAt,
					updatedAt:        updatedMetal.updatedAt,
					payload,
					isFutureDated:    updatedMetal.isFutureDated,
					isArchived:       false,
					rate:             updatedMetal.rate,
					portfolioDraftId: null,
				}
			},)
		} catch (error) {
			this.logger.error(error,)
			throw new HttpException('Asset not found', HttpStatus.NOT_FOUND,)
		}
	}

	private roundNumber = (v: number,): number => {
		return Math.round(v * 10_000,) / 10_000
	}
}