/* eslint-disable max-lines */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { CurrencyHistoryData, Prisma, } from '@prisma/client'

import type { OtherInvestmentsFilterDto, OtherInvestmentsFilterSelectsBySourceIdsDto, } from '../dto'
import { AssetNamesType, OtherInvestmentsSortVariants, } from '../../asset/asset.types'
import type { IOthersByFilter, TAssetExtended, IOtherAsset, TOtherInvestmenFiltered,} from '../../asset/asset.types'
import type { IOtherInvestmentsSelects, TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import { assetParser, } from '../../../shared/utils'
import { endOfDay, } from 'date-fns'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TAssetCacheInitials, TOtherAssetCacheInitials, } from '../../../modules/common/cache-sync/cache-sync.types'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'

@Injectable()
export class OtherInvestmentsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
		* 3.5.4
 		* Calculates annual income from other investments based on the provided filters.
		* @remarks
		* Fetches transactions of type "Other" within the current year (up to the specified date or today),
		* filtered by portfolios, banks, accounts, entities, and clients.
		* Returns 0 if the selected year is the previous year.
		* Otherwise, sums transaction amounts multiplied by their rates.
		* @param filter - Criteria to filter transactions.
		* @param clientId - Optional client ID to override filter.
		* @returns Total income from other investments for the current year.
	*/
	public async getOtherInvestmentsAnnual(filter: OtherInvestmentsFilterDto, clientId?: string,): Promise<number> {
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
					annualAssets: { has: AssetNamesType.OTHER, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)
		const otherAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return otherAnnual
	}

	/**
		 * 	 * 3.5.3
		 * Retrieves the names of other assets associated with the specified bank IDs.
		 *
		 * @remarks
		 * - Filters assets based on the provided bank IDs and the asset name `OTHER`.
		 * - Parses the `payload` field of each matching asset to extract the names of other assets.
		 * - Returns an array of other asset names.
		 * - If an error occurs during processing, an empty array is returned.
		 *
		 * @param ids - Array of bank IDs to filter the assets.
		 * @returns A Promise that resolves to an array of other asset names.
		 */
	public async getAssetOtherNamesBySourceIds(filter: OtherInvestmentsFilterSelectsBySourceIdsDto, clientId?: string,): Promise<IOtherInvestmentsSelects> {
		const {clientIds, portfolioIds,entityIds,accountIds,bankListIds,} = filter

		const assets = await this.prismaService.assetOtherInvestment.findMany({
			where: {
				clientId:    {in: clientIds,},
				portfolioId:  { in: portfolioIds, },
				entityId:    { in: entityIds, },
				accountId:   { in: accountIds,},
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
				portfolio: {
					isActivated: true,
				},
				transferDate:   null,
				usdValue:     {
					not: 0,
				},
			},
			select: {
				investmentAssetName: true,
				serviceProvider:     true,
			},
		},)
		try {
			const investmentAssetNames = assets.map((asset,) => {
				return asset.investmentAssetName
			},)
			const serviceProviders = assets.map((asset,) => {
				return asset.serviceProvider
			},)
			return {
				investmentAssetNames: Array.from(new Set(investmentAssetNames,),),
				serviceProviders:     Array.from(new Set(serviceProviders,),),
			}
		} catch (error) {
			return {
				investmentAssetNames: [],
				serviceProviders:     [],
			}
		}
	}

	/**
 * 3.5.4
 * Retrieves filtered other investments based on the provided filter criteria.
 * @remarks
 * - Filters assets by various criteria such as portfolio, bank, entity, and client IDs.
 * - Also filters by investment asset names, service providers, and currencies.
 * - Computes USD values for the filtered assets and calculates market values, profit, and percentage.
 * - Sorts the results based on the provided filter criteria.
 * @param filter - The filter criteria for retrieving other investments.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an object containing the list of filtered other investments and total USD value.
 */
	// todo: clear if new version good
	// public async getFilteredOtherInvestments(
	// 	filter: OtherInvestmentsFilterDto,
	// 	clientId?: string,
	// ): Promise<IOthersByFilter> {
	// 	try {
	// 		const orderBy = {
	// 			[filter.sortBy as string]: filter.sortOrder,
	// 		}

	// 		// ---------- WITH DATE (VERSION LOGIC) ----------
	// 		if (filter.date) {
	// 			const endDate = endOfDay(new Date(filter.date,),)

	// 			const baseWhere = {
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },
	// 				bankId:      { in: filter.bankIds, },
	// 				...(clientId ?
	// 					{
	// 						client: {
	// 							id: clientId,
	// 						},
	// 					} :
	// 					{}),
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filter.bankListIds, },
	// 					},
	// 				},
	// 				portfolio: {
	// 					isActivated: true,
	// 				},
	// 				currency: {
	// 					in: filter.currencies,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 				serviceProvider: {
	// 					in: filter.serviceProviders,
	// 				},
	// 				investmentAssetName: {
	// 					in: filter.investmentAssetNames,
	// 				},
	// 			}

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetOtherInvestment.findMany({
	// 				where: {
	// 					...baseWhere,
	// 					investmentDate: { lte: endDate, },
	// 					versions:       { none: {}, },
	// 				},
	// 				include: {
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
	// 							bankName:   true,
	// 							bankList:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					account: {
	// 						select: {
	// 							accountName: true,
	// 						},
	// 					},
	// 				},
	// 				orderBy,
	// 			},),
	// 			this.prismaService.assetOtherInvestment.findMany({
	// 				where: {
	// 					...baseWhere,
	// 					versions: {
	// 						some: {
	// 							investmentDate: { lte: endDate, },
	// 						},
	// 					},
	// 				},
	// 				include: {
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
	// 							bankName:   true,
	// 							bankList:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					account: {
	// 						select: {
	// 							accountName: true,
	// 						},
	// 					},
	// 					versions: {
	// 						where: {
	// 							createdAt: { lte: endDate, },
	// 						},
	// 						include: {
	// 							portfolio: {
	// 								select: {
	// 									name: true,
	// 								},
	// 							},
	// 							entity: {
	// 								select: {
	// 									name: true,
	// 								},
	// 							},
	// 							bank: {
	// 								select: {
	// 									bankName:   true,
	// 									bankList:   true,
	// 									bankListId: true,
	// 								},
	// 							},
	// 							account: {
	// 								select: {
	// 									accountName: true,
	// 								},
	// 							},
	// 						},
	// 						orderBy: {
	// 							createdAt: 'desc',
	// 						},
	// 						take: 1,
	// 					},
	// 				},
	// 				orderBy,
	// 			},),
	// 			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		],)

	// 			const mergedAssets = [
	// 				...assetsWithVersion,
	// 				...assetsNoVersion.map((a,) => {
	// 					return { ...a, versions: [], }
	// 				},),
	// 			]

	// 			let totalUsdValue = 0

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const assetsWithUsdValue = mergedAssets.map((asset: any,) => {
	// 				const version = asset.versions?.[0]

	// 				// ---- VERSION ----
	// 				if (version) {
	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 				currencyList.find((item,) => {
	// 					return item.currency === version.currency
	// 				},)

	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1

	// 					const marketValueUsd = parseFloat(
	// 						(version.currencyValue * rate).toFixed(2,),
	// 					)

	// 					const profitUsd = parseFloat(
	// 						(
	// 							Math.round((marketValueUsd - version.costValueUSD) * 100,) /
	// 						100
	// 						).toFixed(2,),
	// 					)

	// 					const profitPercentage = version.costValueUSD ?
	// 						parseFloat((profitUsd / version.costValueUSD * 100).toFixed(2,),) :
	// 						0

	// 					totalUsdValue = totalUsdValue + marketValueUsd

	// 					return {
	// 						id:                  version.id,
	// 						assetMainId:         asset.id,
	// 						portfolioName:       this.cryptoService.decryptString(version.portfolio.name,),
	// 						entityName:          this.cryptoService.decryptString(version.entity.name,),
	// 						accountName:         this.cryptoService.decryptString(version.account.accountName,),
	// 						bankName:            version.bank.bankName,
	// 						investmentAssetName: version.investmentAssetName,
	// 						serviceProvider:     version.serviceProvider,
	// 						currency:            version.currency as string,
	// 						currencyValue:       version.currencyValue,
	// 						investmentDate:      version.investmentDate.toISOString(),
	// 						usdValue:            version.costValueUSD,
	// 						marketValueUsd,
	// 						profitUsd,
	// 						percent:             profitPercentage,
	// 					}
	// 				}

	// 				// ---- CURRENT ASSET ----
	// 				const currencyData: TCurrencyDataWithHistory | undefined =
	// 			currencyList.find((item,) => {
	// 				return item.currency === asset.currency
	// 			},)

	// 				const rate = currencyData ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					1

	// 				const marketValueUsd = parseFloat(
	// 					(asset.currencyValue * rate).toFixed(2,),
	// 				)

	// 				const profitUsd = parseFloat(
	// 					(
	// 						Math.round((marketValueUsd - asset.costValueUSD) * 100,) /
	// 					100
	// 					).toFixed(2,),
	// 				)

	// 				const profitPercentage = asset.costValueUSD ?
	// 					parseFloat((profitUsd / asset.costValueUSD * 100).toFixed(2,),) :
	// 					0

	// 				totalUsdValue = totalUsdValue + marketValueUsd

	// 				return {
	// 					id:                  asset.id,
	// 					portfolioName:       this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entityName:          this.cryptoService.decryptString(asset.entity.name,),
	// 					accountName:         this.cryptoService.decryptString(asset.account.accountName,),
	// 					bankName:            asset.bank.bankName,
	// 					investmentAssetName: asset.investmentAssetName,
	// 					serviceProvider:     asset.serviceProvider,
	// 					currency:            asset.currency as string,
	// 					currencyValue:       asset.currencyValue,
	// 					investmentDate:      asset.investmentDate.toISOString(),
	// 					usdValue:            asset.costValueUSD,
	// 					marketValueUsd,
	// 					profitUsd,
	// 					percent:             profitPercentage,
	// 				}
	// 			},)

	// 			return {
	// 				list:         assetsWithUsdValue,
	// 				totalUsdValue,
	// 			}
	// 		}

	// 		// ---------- WITHOUT DATE (NO VERSION LOGIC) ----------
	// 		const [otherAssets,] = await Promise.all([
	// 			this.prismaService.assetOtherInvestment.findMany({
	// 				where: {
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entitiesIds, },
	// 					accountId:   { in: filter.accountIds, },
	// 					bankId:      { in: filter.bankIds, },
	// 					...(clientId ?
	// 						{
	// 							client: {
	// 								id: clientId,
	// 							},
	// 						} :
	// 						{}),
	// 					bank: {
	// 						is: {
	// 							bankListId: { in: filter.bankListIds, },
	// 						},
	// 					},
	// 					portfolio: {
	// 						isActivated: true,
	// 					},
	// 					currency: {
	// 						in: filter.currencies,
	// 					},
	// 					usdValue: {
	// 						not: 0,
	// 					},
	// 					serviceProvider: {
	// 						in: filter.serviceProviders,
	// 					},
	// 					investmentAssetName: {
	// 						in: filter.investmentAssetNames,
	// 					},
	// 				},
	// 				include: {
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
	// 							bankName:   true,
	// 							bankList:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					account: {
	// 						select: {
	// 							accountName: true,
	// 						},
	// 					},
	// 				},
	// 				orderBy,
	// 			},),
	// 		],)

	// 		let totalUsdValue = 0
	// 		const assetsWithUsdValue = otherAssets
	// 			.map((asset,) => {
	// 				totalUsdValue = totalUsdValue + Number(asset.marketValueUSD,)
	// 				return {
	// 					id:                  asset.id,
	// 					portfolioName:       this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entityName:          this.cryptoService.decryptString(asset.entity.name,),
	// 					accountName:         this.cryptoService.decryptString(asset.account.accountName,),
	// 					bankName:            asset.bank.bankName,
	// 					investmentAssetName: asset.investmentAssetName,
	// 					serviceProvider:     asset.serviceProvider,
	// 					currency:            asset.currency as string,
	// 					currencyValue:       asset.currencyValue,
	// 					investmentDate:      asset.investmentDate.toISOString(),
	// 					usdValue:            asset.costValueUSD,
	// 					marketValueUsd:      asset.marketValueUSD,
	// 					profitUsd:           asset.profitUSD,
	// 					percent:             asset.profitPercentage,
	// 				}
	// 			},)

	// 		return {
	// 			list:         assetsWithUsdValue,
	// 			totalUsdValue,
	// 		}
	// 	} catch (error) {
	// 		return {
	// 			list:          [],
	// 			totalUsdValue: 0,
	// 		}
	// 	}
	// }
	public async getFilteredOtherInvestments(
		filter: OtherInvestmentsFilterDto,
		clientId?: string,
	): Promise<IOthersByFilter> {
		try {
			const orderBy = {
				[filter.sortBy as string]: filter.sortOrder,
			}

			if (filter.date) {
				const endDate = endOfDay(new Date(filter.date,),)

				const baseWhere = {
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					usdValue: {
						not: 0,
					},
					serviceProvider: {
						in: filter.serviceProviders,
					},
					investmentAssetName: {
						in: filter.investmentAssetNames,
					},
				}

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetOtherInvestment.findMany({
						where: {
							...baseWhere,
							AND: [
								{
									investmentDate: {
										lte: endDate,
									},
								},
								{
									OR: [
										{ transferDate: { gte: endDate, }, },
										{ transferDate: null, },
									],
								},
							],
							versions: { none: {}, },
						},
						include: {
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
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							account: {
								select: {
									accountName: true,
								},
							},
						},
						orderBy,
					},),
					this.prismaService.assetOtherInvestment.findMany({
						where: {
							...baseWhere,
							OR: [
								{ transferDate: { gte: endDate, }, },
								{ transferDate: null, },
							],
							versions: {
								some: {
									investmentDate: { lte: endDate, },
								},
							},
						},
						include: {
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
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							account: {
								select: {
									accountName: true,
								},
							},
							versions: {
								where: {
									createdAt: { lte: endDate, },
								},
								include: {
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
											bankName:   true,
											bankList:   true,
											bankListId: true,
										},
									},
									account: {
										select: {
											accountName: true,
										},
									},
								},
								orderBy: {
									createdAt: 'desc',
								},
								take: 1,
							},
						},
						orderBy,
					},),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				],)

				const mergedAssets = [
					...assetsWithVersion,
					...assetsNoVersion.map((a,) => {
						return { ...a, versions: [], }
					},),
				]

				let totalUsdValue = 0

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const assetsWithUsdValue = mergedAssets.map((asset: any,) => {
					const version = asset.versions?.[0]

					if (version) {
						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((item,) => {
							return item.currency === version.currency
						},)

						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1

						const marketValueUsd = parseFloat(
							(version.currencyValue * rate).toFixed(2,),
						)

						const profitUsd = parseFloat(
							(
								Math.round((marketValueUsd - version.costValueUSD) * 100,) /
							100
							).toFixed(2,),
						)

						const profitPercentage = version.costValueUSD ?
							parseFloat((profitUsd / version.costValueUSD * 100).toFixed(2,),) :
							0

						totalUsdValue = totalUsdValue + marketValueUsd

						return {
							id:                  version.id,
							assetMainId:         asset.id,
							portfolioName:       this.cryptoService.decryptString(version.portfolio.name,),
							entityName:          this.cryptoService.decryptString(version.entity.name,),
							accountName:         this.cryptoService.decryptString(version.account.accountName,),
							bankName:            version.bank.bankName,
							investmentAssetName: version.investmentAssetName,
							serviceProvider:     version.serviceProvider,
							currency:            version.currency as string,
							currencyValue:       version.currencyValue,
							investmentDate:      version.investmentDate.toISOString(),
							usdValue:            version.costValueUSD,
							marketValueUsd,
							profitUsd,
							percent:             profitPercentage,
							isTransferred:       Boolean(asset.transferDate,),
						}
					}

					const currencyData: TCurrencyDataWithHistory | undefined =
					currencyList.find((item,) => {
						return item.currency === asset.currency
					},)

					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1

					const marketValueUsd = parseFloat(
						(asset.currencyValue * rate).toFixed(2,),
					)

					const profitUsd = parseFloat(
						(
							Math.round((marketValueUsd - asset.costValueUSD) * 100,) /
						100
						).toFixed(2,),
					)

					const profitPercentage = asset.costValueUSD ?
						parseFloat((profitUsd / asset.costValueUSD * 100).toFixed(2,),) :
						0

					totalUsdValue = totalUsdValue + marketValueUsd

					return {
						id:                  asset.id,
						portfolioName:       this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:          this.cryptoService.decryptString(asset.entity.name,),
						accountName:         this.cryptoService.decryptString(asset.account.accountName,),
						bankName:            asset.bank.bankName,
						investmentAssetName: asset.investmentAssetName,
						serviceProvider:     asset.serviceProvider,
						currency:            asset.currency as string,
						currencyValue:       asset.currencyValue,
						investmentDate:      asset.investmentDate.toISOString(),
						usdValue:            asset.costValueUSD,
						marketValueUsd,
						profitUsd,
						percent:             profitPercentage,
						isTransferred:       Boolean(asset.transferDate,),
					}
				},)

				return {
					list:         assetsWithUsdValue,
					totalUsdValue,
				}
			}

			const [otherAssets,] = await Promise.all([
				this.prismaService.assetOtherInvestment.findMany({
					where: {
						clientId:    { in: filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entitiesIds, },
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
						currency: {
							in: filter.currencies,
						},
						usdValue: {
							not: 0,
						},
						serviceProvider: {
							in: filter.serviceProviders,
						},
						investmentAssetName: {
							in: filter.investmentAssetNames,
						},
						transferDate: null,
					},
					include: {
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
								bankName:   true,
								bankList:   true,
								bankListId: true,
							},
						},
						account: {
							select: {
								accountName: true,
							},
						},
					},
					orderBy,
				},),
			],)

			let totalUsdValue = 0
			const assetsWithUsdValue = otherAssets
				.map((asset,) => {
					totalUsdValue = totalUsdValue + Number(asset.marketValueUSD,)
					return {
						id:                  asset.id,
						portfolioName:       this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:          this.cryptoService.decryptString(asset.entity.name,),
						accountName:         this.cryptoService.decryptString(asset.account.accountName,),
						bankName:            asset.bank.bankName,
						investmentAssetName: asset.investmentAssetName,
						serviceProvider:     asset.serviceProvider,
						currency:            asset.currency as string,
						currencyValue:       asset.currencyValue,
						investmentDate:      asset.investmentDate.toISOString(),
						usdValue:            asset.costValueUSD,
						marketValueUsd:      asset.marketValueUSD,
						profitUsd:           asset.profitUSD,
						percent:             asset.profitPercentage,
						isTransferred:       Boolean(asset.transferDate,),
					}
				},)

			return {
				list:         assetsWithUsdValue,
				totalUsdValue,
			}
		} catch (error) {
			return {
				list:          [],
				totalUsdValue: 0,
			}
		}
	}

	/**
 * Filters the assets based on the provided filter criteria.
 * @remarks
 * - Filters assets by various criteria such as portfolio, entity, bank, client, and date range.
 * @param filter - The filter criteria for retrieving assets.
 * @param assetIds - Optional list of asset IDs to further filter the results.
 * @param clientId - Optional client ID for filtering.
 * @returns A Promise resolving to an array of filtered assets.
 */
	public async getFilteredAssets(filter: OtherInvestmentsFilterDto, assetIds?: Array<string>, clientId?: string,): Promise<Array<TAssetExtended>> {
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
				entity: true,
				bank:      {include: { bankList: true, },},
			},
		},)
	}

	/**
 * 3.5.4
 * Retrieves bank analytics based on the provided filter criteria.
 * @remarks
 * - Uses `getFilteredAssets` to fetch assets matching the filter.
 * - Loads the currency list via `cBondsCurrencyService.getAllCurrencies()`.
 * - Parses the `payload` of each asset to extract currency and value.
 * - Filters assets based on `filter.currencies`, if provided.
 * - Returns an array of bank analytics, including bank IDs, names, and USD values.
 * @param {OtherInvestmentsFilterDto} filter - The filter criteria for retrieving bank analytics.
 * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics data.
 */
	// todo: clear if new version good
	// public async getBankAnalytics(
	// 	filter: OtherInvestmentsFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TBankAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetOtherInvestmentVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:                     true,
	// 					assetOtherInvestmentId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const assetIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetOtherInvestmentId
	// 					},)
	// 					.filter((id,): id is string => {
	// 						return Boolean(id,)
	// 					},)

	// 				const originalAssetIds = filter.assetIds.filter((id,) => {
	// 					return !versionIdSet.has(id,)
	// 				},)

	// 				resolvedAssetIds = Array.from(
	// 					new Set([...originalAssetIds, ...assetIdsFromVersions,],),
	// 				)
	// 			}
	// 		}

	// 		if (filter.date) {
	// 			const endDate = endOfDay(new Date(filter.date,),)

	// 			const baseWhere = {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },
	// 				bankId:      { in: filter.bankIds, },
	// 				...(clientId ?
	// 					{
	// 						client: {
	// 							id: clientId,
	// 						},
	// 					} :
	// 					{}),
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filter.bankListIds, },
	// 					},
	// 				},
	// 				portfolio: {
	// 					isActivated: true,
	// 				},
	// 				currency: {
	// 					in: filter.currencies,
	// 				},
	// 				serviceProvider: {
	// 					in: filter.serviceProviders,
	// 				},
	// 				investmentAssetName: {
	// 					in: filter.investmentAssetNames,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 			}

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetOtherInvestment.findMany({
	// 				where: {
	// 					...baseWhere,
	// 					investmentDate: { lte: endDate, },
	// 					versions:       { none: {}, },
	// 				},
	// 				include: {
	// 					bank: {
	// 						select: {
	// 							bankName:   true,
	// 							bankList:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 				},
	// 			},),
	// 			this.prismaService.assetOtherInvestment.findMany({
	// 				where: {
	// 					...baseWhere,
	// 					versions: {
	// 						some: {
	// 							investmentDate: { lte: endDate, },
	// 						},
	// 					},
	// 				},
	// 				include: {
	// 					bank: {
	// 						select: {
	// 							bankName:   true,
	// 							bankList:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					versions: {
	// 						where: {
	// 							createdAt: { lte: endDate, },
	// 						},
	// 						include: {
	// 							bank: {
	// 								select: {
	// 									bankName:   true,
	// 									bankList:   true,
	// 									bankListId: true,
	// 								},
	// 							},
	// 						},
	// 						orderBy: {
	// 							createdAt: 'desc',
	// 						},
	// 						take: 1,
	// 					},
	// 				},
	// 			},),
	// 			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		],)

	// 			const mergedAssets = [
	// 				...assetsWithVersion,
	// 				...assetsNoVersion.map((a,) => {
	// 					return { ...a, versions: [], }
	// 				},),
	// 			]

	// 			const analyticsData = mergedAssets
	// 				// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 				.map((asset: any,) => {
	// 					const version = asset.versions?.[0]

	// 					if (version) {
	// 						if (!version.bank?.bankListId) {
	// 							return null
	// 						}

	// 						const currencyData: TCurrencyDataWithHistory | undefined =
	// 					currencyList.find((c,) => {
	// 						return c.currency === version.currency
	// 					},)

	// 						const rate = currencyData ?
	// 							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 							1

	// 						const usdValue = parseFloat(
	// 							(version.currencyValue * rate).toFixed(2,),
	// 						)

	// 						return {
	// 							id:       version.bank.bankListId,
	// 							bankName: version.bank.bankList?.name ?? version.bank.bankName,
	// 							usdValue,
	// 						}
	// 					}

	// 					if (!asset.bank?.bankListId) {
	// 						return null
	// 					}

	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 				currencyList.find((c,) => {
	// 					return c.currency === asset.currency
	// 				},)

	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1

	// 					const usdValue = parseFloat(
	// 						(asset.currencyValue * rate).toFixed(2,),
	// 					)

	// 					return {
	// 						id:       asset.bank.bankListId,
	// 						bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
	// 						usdValue,
	// 					}
	// 				},)
	// 				.filter((item,): item is TBankAnalytics => {
	// 					return item !== null
	// 				},)

	// 			return analyticsData
	// 		}

	// 		const otherAssets = await this.prismaService.assetOtherInvestment.findMany({
	// 			where: {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },
	// 				bankId:      { in: filter.bankIds, },
	// 				...(clientId ?
	// 					{
	// 						client: {
	// 							id: clientId,
	// 						},
	// 					} :
	// 					{}),
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filter.bankListIds, },
	// 					},
	// 				},
	// 				portfolio: {
	// 					isActivated: true,
	// 				},
	// 				currency: {
	// 					in: filter.currencies,
	// 				},
	// 				serviceProvider: {
	// 					in: filter.serviceProviders,
	// 				},
	// 				investmentAssetName: {
	// 					in: filter.investmentAssetNames,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 			},
	// 			include: {
	// 				bank: {
	// 					select: {
	// 						bankName:   true,
	// 						bankList:   true,
	// 						bankListId: true,
	// 					},
	// 				},
	// 			},
	// 		},)

	// 		const assetsWithUsdValue = otherAssets
	// 			.map((asset,) => {
	// 				if (!asset.bank.bankListId) {
	// 					return null
	// 				}
	// 				return {
	// 					id:       asset.bank.bankListId,
	// 					bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
	// 					usdValue: asset.marketValueUSD,
	// 				}
	// 			},)
	// 			.filter((item,): item is TBankAnalytics => {
	// 				return item !== null
	// 			},)

	// 		return assetsWithUsdValue
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getBankAnalytics(
		filter: OtherInvestmentsFilterDto,
		clientId?: string,
	): Promise<Array<TBankAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetOtherInvestmentVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:                     true,
						assetOtherInvestmentId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const assetIdsFromVersions = versions
						.map((v,) => {
							return v.assetOtherInvestmentId
						},)
						.filter((id,): id is string => {
							return Boolean(id,)
						},)

					const originalAssetIds = filter.assetIds.filter((id,) => {
						return !versionIdSet.has(id,)
					},)

					resolvedAssetIds = Array.from(
						new Set([...originalAssetIds, ...assetIdsFromVersions,],),
					)
				}
			}

			if (filter.date) {
				const endDate = endOfDay(new Date(filter.date,),)

				const baseWhere = {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					serviceProvider: {
						in: filter.serviceProviders,
					},
					investmentAssetName: {
						in: filter.investmentAssetNames,
					},
					usdValue: {
						not: 0,
					},
				}

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetOtherInvestment.findMany({
						where: {
							...baseWhere,
							AND: [
								{
									investmentDate: { lte: endDate, },
								},
								{
									OR: [
										{ transferDate: { gte: endDate, }, },
										{ transferDate: null, },
									],
								},
							],
							versions: { none: {}, },
						},
						include: {
							bank: {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
						},
					},),
					this.prismaService.assetOtherInvestment.findMany({
						where: {
							...baseWhere,
							OR: [
								{ transferDate: { gte: endDate, }, },
								{ transferDate: null, },
							],
							versions: {
								some: {
									investmentDate: { lte: endDate, },
								},
							},
						},
						include: {
							bank: {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							versions: {
								where: {
									createdAt: { lte: endDate, },
								},
								include: {
									bank: {
										select: {
											bankName:   true,
											bankList:   true,
											bankListId: true,
										},
									},
								},
								orderBy: {
									createdAt: 'desc',
								},
								take: 1,
							},
						},
					},),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				],)

				const mergedAssets = [
					...assetsWithVersion,
					...assetsNoVersion.map((a,) => {
						return { ...a, versions: [], }
					},),
				]

				const analyticsData = mergedAssets
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.map((asset: any,) => {
						const version = asset.versions?.[0]

						if (version) {
							if (!version.bank?.bankListId) {
								return null
							}

							const currencyData: TCurrencyDataWithHistory | undefined =
							currencyList.find((c,) => {
								return c.currency === version.currency
							},)

							const rate = currencyData ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								1

							const usdValue = parseFloat(
								(version.currencyValue * rate).toFixed(2,),
							)

							return {
								id:       version.bank.bankListId,
								bankName: version.bank.bankList?.name ?? version.bank.bankName,
								usdValue,
							}
						}

						if (!asset.bank?.bankListId) {
							return null
						}

						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((c,) => {
							return c.currency === asset.currency
						},)

						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1

						const usdValue = parseFloat(
							(asset.currencyValue * rate).toFixed(2,),
						)

						return {
							id:       asset.bank.bankListId,
							bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
							usdValue,
						}
					},)
					.filter((item,): item is TBankAnalytics => {
						return item !== null
					},)

				return analyticsData
			}

			const otherAssets = await this.prismaService.assetOtherInvestment.findMany({
				where: {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					serviceProvider: {
						in: filter.serviceProviders,
					},
					investmentAssetName: {
						in: filter.investmentAssetNames,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
				},
				include: {
					bank: {
						select: {
							bankName:   true,
							bankList:   true,
							bankListId: true,
						},
					},
				},
			},)

			const assetsWithUsdValue = otherAssets
				.map((asset,) => {
					if (!asset.bank.bankListId) {
						return null
					}
					return {
						id:       asset.bank.bankListId,
						bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
						usdValue: asset.marketValueUSD,
					}
				},)
				.filter((item,): item is TBankAnalytics => {
					return item !== null
				},)

			return assetsWithUsdValue
		} catch (error) {
			return []
		}
	}

	/**
 * 3.5.4
 * Retrieves currency analytics based on the provided filters.
 * @remarks
 * - Filters assets by `assetIds` and `currencies` if specified.
 * - Parses the `payload` field to extract currency details.
 * - Converts currency values to USD using the exchange service.
 * - Returns an array of currency analytics, including original and USD values.
 * - In case of an error during processing, an empty array is returned.
 * @param {OtherInvestmentsFilterDto} filter - The filter criteria for retrieving currency analytics.
 * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
 */
	// todo: clear if new version good
	// public async getCurrencyAnalytics(
	// 	filter: OtherInvestmentsFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TCurrencyAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetOtherInvestmentVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:                     true,
	// 					assetOtherInvestmentId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const assetIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetOtherInvestmentId
	// 					},)
	// 					.filter((id,): id is string => {
	// 						return Boolean(id,)
	// 					},)

	// 				const originalAssetIds = filter.assetIds.filter((id,) => {
	// 					return !versionIdSet.has(id,)
	// 				},)

	// 				resolvedAssetIds = Array.from(
	// 					new Set([...originalAssetIds, ...assetIdsFromVersions,],),
	// 				)
	// 			}
	// 		}

	// 		if (filter.date) {
	// 			const endDate = endOfDay(new Date(filter.date,),)

	// 			const baseWhere = {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },
	// 				bankId:      { in: filter.bankIds, },
	// 				...(clientId ?
	// 					{
	// 						client: {
	// 							id: clientId,
	// 						},
	// 					} :
	// 					{}),
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filter.bankListIds, },
	// 					},
	// 				},
	// 				portfolio: {
	// 					isActivated: true,
	// 				},
	// 				currency: {
	// 					in: filter.currencies,
	// 				},
	// 				serviceProvider: {
	// 					in: filter.serviceProviders,
	// 				},
	// 				investmentAssetName: {
	// 					in: filter.investmentAssetNames,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 			}

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetOtherInvestment.findMany({
	// 				where: {
	// 					...baseWhere,
	// 					investmentDate: { lte: endDate, },
	// 					versions:       { none: {}, },
	// 				},
	// 			},),
	// 			this.prismaService.assetOtherInvestment.findMany({
	// 				where: {
	// 					...baseWhere,
	// 					versions: {
	// 						some: {
	// 							investmentDate: { lte: endDate, },
	// 						},
	// 					},
	// 				},
	// 				include: {
	// 					versions: {
	// 						where: {
	// 							createdAt: { lte: endDate, },
	// 						},
	// 						orderBy: {
	// 							createdAt: 'desc',
	// 						},
	// 						take: 1,
	// 					},
	// 				},
	// 			},),
	// 			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		],)

	// 			const mergedAssets = [
	// 				...assetsWithVersion,
	// 				...assetsNoVersion.map((a,) => {
	// 					return { ...a, versions: [], }
	// 				},),
	// 			]

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const assetsWithUsdValue = mergedAssets.map((asset: any,) => {
	// 				const version = asset.versions?.[0]

	// 				if (version) {
	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 				currencyList.find((item,) => {
	// 					return item.currency === version.currency
	// 				},)

	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1

	// 					const usdValue = parseFloat(
	// 						(version.currencyValue * rate).toFixed(2,),
	// 					)

	// 					return {
	// 						currency:      version.currency,
	// 						currencyValue: version.currencyValue,
	// 						usdValue,
	// 					}
	// 				}

	// 				const currencyData: TCurrencyDataWithHistory | undefined =
	// 			currencyList.find((item,) => {
	// 				return item.currency === asset.currency
	// 			},)

	// 				const rate = currencyData ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					1

	// 				const usdValue = parseFloat(
	// 					(asset.currencyValue * rate).toFixed(2,),
	// 				)

	// 				return {
	// 					currency:      asset.currency,
	// 					currencyValue: asset.currencyValue,
	// 					usdValue,
	// 				}
	// 			},)

	// 			return assetsWithUsdValue
	// 		}

	// 		const otherAssets = await this.prismaService.assetOtherInvestment.findMany({
	// 			where: {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },
	// 				bankId:      { in: filter.bankIds, },
	// 				...(clientId ?
	// 					{
	// 						client: {
	// 							id: clientId,
	// 						},
	// 					} :
	// 					{}),
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filter.bankListIds, },
	// 					},
	// 				},
	// 				portfolio: {
	// 					isActivated: true,
	// 				},
	// 				currency: {
	// 					in: filter.currencies,
	// 				},
	// 				serviceProvider: {
	// 					in: filter.serviceProviders,
	// 				},
	// 				investmentAssetName: {
	// 					in: filter.investmentAssetNames,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 			},
	// 		},)

	// 		const assetsWithUsdValue = otherAssets.map((asset,) => {
	// 			return {
	// 				currency:      asset.currency,
	// 				currencyValue: asset.currencyValue,
	// 				usdValue:      asset.marketValueUSD,
	// 			}
	// 		},)

	// 		return assetsWithUsdValue
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getCurrencyAnalytics(
		filter: OtherInvestmentsFilterDto,
		clientId?: string,
	): Promise<Array<TCurrencyAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetOtherInvestmentVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:                     true,
						assetOtherInvestmentId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const assetIdsFromVersions = versions
						.map((v,) => {
							return v.assetOtherInvestmentId
						},)
						.filter((id,): id is string => {
							return Boolean(id,)
						},)

					const originalAssetIds = filter.assetIds.filter((id,) => {
						return !versionIdSet.has(id,)
					},)

					resolvedAssetIds = Array.from(
						new Set([...originalAssetIds, ...assetIdsFromVersions,],),
					)
				}
			}

			if (filter.date) {
				const endDate = endOfDay(new Date(filter.date,),)

				const baseWhere = {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					serviceProvider: {
						in: filter.serviceProviders,
					},
					investmentAssetName: {
						in: filter.investmentAssetNames,
					},
					usdValue: {
						not: 0,
					},
				}

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetOtherInvestment.findMany({
						where: {
							...baseWhere,
							AND: [
								{ investmentDate: { lte: endDate, }, },
								{
									OR: [
										{ transferDate: { gte: endDate, }, },
										{ transferDate: null, },
									],
								},
							],
							versions: { none: {}, },
						},
					},),
					this.prismaService.assetOtherInvestment.findMany({
						where: {
							...baseWhere,
							OR: [
								{ transferDate: { gte: endDate, }, },
								{ transferDate: null, },
							],
							versions: {
								some: {
									investmentDate: { lte: endDate, },
								},
							},
						},
						include: {
							versions: {
								where: {
									createdAt: { lte: endDate, },
								},
								orderBy: {
									createdAt: 'desc',
								},
								take: 1,
							},
						},
					},),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				],)

				const mergedAssets = [
					...assetsWithVersion,
					...assetsNoVersion.map((a,) => {
						return { ...a, versions: [], }
					},),
				]

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const assetsWithUsdValue = mergedAssets.map((asset: any,) => {
					const version = asset.versions?.[0]

					if (version) {
						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((item,) => {
							return item.currency === version.currency
						},)

						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1

						const usdValue = parseFloat(
							(version.currencyValue * rate).toFixed(2,),
						)

						return {
							currency:      version.currency,
							currencyValue: version.currencyValue,
							usdValue,
						}
					}

					const currencyData: TCurrencyDataWithHistory | undefined =
					currencyList.find((item,) => {
						return item.currency === asset.currency
					},)

					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1

					const usdValue = parseFloat(
						(asset.currencyValue * rate).toFixed(2,),
					)

					return {
						currency:      asset.currency,
						currencyValue: asset.currencyValue,
						usdValue,
					}
				},)

				return assetsWithUsdValue
			}

			// eslint-disable-next-line no-unused-vars
			const now = new Date()
			const otherAssets = await this.prismaService.assetOtherInvestment.findMany({
				where: {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					serviceProvider: {
						in: filter.serviceProviders,
					},
					investmentAssetName: {
						in: filter.investmentAssetNames,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
					AND:          [
						filter.date ?
							{ investmentDate: { lte: endOfDay(new Date(filter.date,),), }, } :
							{},
					],
				},
			},)

			const assetsWithUsdValue = otherAssets.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.marketValueUSD,
				}
			},)

			return assetsWithUsdValue
		} catch (error) {
			return []
		}
	}

	/**
	 * CR -114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetFilteredOtherInvestments(data: TOtherAssetCacheInitials,filter: OtherInvestmentsFilterDto, clientId?: string,): IOthersByFilter {
		const {assets, currencyList, costHistoryCurrencyList,} = data
		let totalUsdValue = 0

		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const assetPayload = assetParser<IOtherAsset>(asset,)
				if (assetPayload) {
					if (assetPayload.currencyValue === 0) {
						return null
					}
					if (assetPayload.investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(assetPayload.investmentDate,)) {
						return null
					}
					if (filter.currencies && !filter.currencies.includes(assetPayload.currency,)) {
						return null
					}
					if (filter.serviceProviders && !filter.serviceProviders.includes(assetPayload.serviceProvider,)) {
						return null
					}
					if (filter.investmentAssetNames && !filter.investmentAssetNames.includes(assetPayload.investmentAssetName,)) {
						return null
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === assetPayload.currency
					},)
					const costRateDate = new Date(assetPayload.investmentDate,)
					const costCurrencyData = (costHistoryCurrencyList
						.filter((item,) => {
							return new Date(item.date,).getTime() <= costRateDate.getTime() && currencyData?.id === item.currencyId
						},)
						.sort((a, b,) => {
							return new Date(b.date,).getTime() - new Date(a.date,).getTime()
						},)[0]) as CurrencyHistoryData | undefined
					const usdValue = (Number(assetPayload.currencyValue,) * (costCurrencyData?.rate ?? currencyData?.rate ?? 1))

					totalUsdValue = totalUsdValue + Number(usdValue,)
					const marketValueUsd = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      assetPayload.currency,
						currencyValue: assetPayload.currencyValue,
						currencyList,
						historyDate:   filter.date,
					},)
					const profitUsd = marketValueUsd && usdValue && (Math.abs(Number(marketValueUsd,) - Number(usdValue,),))
					const percent = profitUsd && usdValue && profitUsd / usdValue * 100
					const result: TOtherInvestmenFiltered = {
						id:                  asset.id,
						portfolioName:       asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:          asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
						accountName:         asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
						bankName:            asset.bank?.bankName,
						investmentAssetName: assetPayload.investmentAssetName,
						serviceProvider:     assetPayload.serviceProvider,
						currency:            assetPayload.currency as string,
						currencyValue:       assetPayload.currencyValue,
						investmentDate:      assetPayload.investmentDate,
						usdValue,
						marketValueUsd,
						profitUsd,
						percent,
					}
					return result
				}
				return null
			},)
			.filter((item,): item is TOtherInvestmenFiltered => {
				return item !== null
			},)
			.sort((a, b,) => {
				const { sortBy, sortOrder, } = filter
				const order = sortOrder === 'asc' ?
					1 :
					-1
				switch (sortBy) {
				case OtherInvestmentsSortVariants.CURRENCY_VALUE:
					return (Number(a.currencyValue,) - Number(b.currencyValue,)) * order
				case OtherInvestmentsSortVariants.USD_VALUE:
					return (a.usdValue - b.usdValue) * order
				case OtherInvestmentsSortVariants.INVESTMENT_DATE:
					return (new Date(a.investmentDate,).getTime() - new Date(b.investmentDate,).getTime()) * order
				case OtherInvestmentsSortVariants.PROFIT_USD:
					const profitUsdA = a.profitUsd ?? 0
					const profitUsdB = b.profitUsd ?? 0
					return (profitUsdA - profitUsdB) * order
				case OtherInvestmentsSortVariants.PROFIT_PER:
					const profitA = a.percent ?? 0
					const profitB = b.percent ?? 0
					return (profitA - profitB) * order
				case OtherInvestmentsSortVariants.MARKET_VALUE_USD:
					const marketValueA = a.marketValueUsd ?? 0
					const marketValueB = b.marketValueUsd ?? 0
					return (marketValueA - marketValueB) * order
				default:
					return (new Date(a.investmentDate,).getTime() - new Date(b.investmentDate,).getTime()) * order
				}
			},)
		return {
			list: analyticsData,
			totalUsdValue,
		}
	}

	/**
	 * CR -114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetBankAnalytics(data: TAssetCacheInitials, filter: OtherInvestmentsFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IOtherAsset>(asset,)
				if (parsedPayload) {
					if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
						return null
					}
					if (parsedPayload.investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedPayload.investmentDate,)) {
						return null
					}
					if (filter.serviceProviders && !filter.serviceProviders.includes(parsedPayload.serviceProvider,)) {
						return null
					}
					if (filter.investmentAssetNames && !filter.investmentAssetNames.includes(parsedPayload.investmentAssetName,)) {
						return null
					}
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      parsedPayload.currency,
						currencyValue: parsedPayload.currencyValue,
						currencyList,
						historyDate:   filter.date,
					},)
					return {
						id:       asset.bank?.bankListId,
						bankName: asset.bank?.bankList?.name ?? asset.bank?.bankName,
						usdValue,
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
	 * CR -114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetCurrencyAnalytics(data: TAssetCacheInitials,filter: OtherInvestmentsFilterDto, clientId?: string,): Array<TCurrencyAnalytics> {
		const {assets, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IOtherAsset>(asset,)
				if (parsedPayload) {
					if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
						return null
					}
					if (parsedPayload.investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedPayload.investmentDate,)) {
						return null
					}
					if (filter.serviceProviders && !filter.serviceProviders.includes(parsedPayload.serviceProvider,)) {
						return null
					}
					if (filter.investmentAssetNames && !filter.investmentAssetNames.includes(parsedPayload.investmentAssetName,)) {
						return null
					}
					const {currency,currencyValue,} = parsedPayload
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency,
						currencyValue,
						currencyList,
						historyDate:   filter.date,
					},)
					return {
						currency,
						currencyValue: parsedPayload.currencyValue,
						usdValue,
					} as TCurrencyAnalytics
				}
				return null
			},)
			.filter((item,): item is TCurrencyAnalytics => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
		return analyticsData
	}
}