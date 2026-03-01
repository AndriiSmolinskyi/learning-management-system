/* eslint-disable max-lines */
/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { IPrivateAsset, } from '../../asset/asset.types'
import { AssetNamesType, } from '../../asset/asset.types'
import { assetParser, } from '../../../shared/utils'
import type { Prisma, } from '@prisma/client'
import { CBondsCurrencyService, } from '../../apis/cbonds-api/services'
import type { PrivateEquityFilterDto, PrivateEquityFilterSelectsBySourceIdsDto, } from '../dto/private-equity-filter.dto'
import type { IPrivateEquityFilterSelectsData, TBankAnalytics, TCurrencyAnalytics, } from '../analytics.types'
import type { TAssetExtended, } from '../../asset/asset.types'
import type { IPrivateByFilter, IAnalyticPrivate, } from '../analytics.types'
import { TPrivateEquityTableSortVariants, } from '../../asset/asset.types'
import { endOfDay, } from 'date-fns'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TAssetCacheInitials, } from '../../../modules/common/cache-sync/cache-sync.types'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'

@Injectable()
export class PrivateEquityAssetService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
		* 3.5.4
 		* Calculates the annual income from private equity transactions based on the provided filter criteria.
 		* @remarks
 		* This method queries the database for private equity transactions matching the given filter parameters,
 		* including portfolio, bank, account, and client associations. It filters transactions that occurred
 		* from the beginning of the current year up to the specified date (or the current date if not provided),
 		* and calculates the total amount by multiplying each transaction amount by its rate (if present).
 		* If the selected year is the previous year, the method returns 0.
 		*
 		* @param filter - The filter criteria used to narrow down transactions (e.g., portfolios, banks, accounts, etc.).
 		* @param clientId - Optional client ID to override client filtering in the request.
 		* @returns A promise that resolves to a number representing the total private equity income for the current year.
 	*/
	public async getPEAnnual(filter: PrivateEquityFilterDto, clientId?: string,): Promise<number> {
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
					annualAssets: { has: AssetNamesType.PRIVATE_EQUITY, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)
		const peAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return peAnnual
	}

	/**
	 * 3.5.3
	  * Retrieves the names of private equity assets associated with the specified bank IDs.
	*
	* @remarks
	* - Filters assets based on the provided bank IDs and the asset name `PRIVATE_EQUITY`.
	* - Parses the `payload` field of each matching asset to extract loan names.
	* - Returns an array of private equity names.
	* - In case of an error during processing, an empty array is returned.
	*
	* @param ids - Array of bank IDs to filter the private equity assets.
	* @returns A Promise that resolves to an array of private equity asset names.
	*/
	public async getPrivateFilterSelectsBySourceIds(filter: PrivateEquityFilterSelectsBySourceIdsDto, clientId?: string,): Promise<IPrivateEquityFilterSelectsData> {
		const {clientIds, portfolioIds,entityIds,accountIds,bankListIds,} = filter

		const assets = await this.prismaService.assetPrivateEquity.findMany({
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
					is: {
						isActivated: true,
					},
				},
				transferDate:   null,
				marketValueUSD: {
					not: 0,
				},
			},
		},)
		try {
			const fundNames = assets.map((asset,) => {
				return asset.fundName
			},)
			const fundTypes = assets.map((asset,) => {
				return asset.fundType
			},)
			return {
				peFundNames: Array.from(new Set(fundNames,),),
				peFundTyped: Array.from(new Set(fundTypes,),),
			}
		} catch (error) {
			return {
				peFundNames: [],
				peFundTyped: [],
			}
		}
	}

	/**
	 * 3.5.4
	 * Retrieves loan assets based on the provided filters and calculates their USD value.
	 *
	 * @remarks
	 * - Filters assets by `type`, `portfolioIds`, `entitiesIds`, `bankIds`, and optional `loanNames` and `currencies`.
	 * - Parses the `payload` field of each asset to extract relevant loan details.
	 * - Converts asset values to USD using the currency exchange service.
	 * - Sorts results by `startDate` or `maturityDate` based on `sortBy` and `sortOrder`.
	 * - In case of an error, returns an empty list with a total asset value of 0.
	 *
	 * @param {PrivateEquityFilterDto} filters - The filter criteria for retrieving loan assets.
	 * @returns {Promise<ILoansByFilter>} - A Promise resolving to an object containing the list of filtered loan assets and their total value.
	 */
	// todo: clear if new version good
	// public async getAllByFilters(filter: PrivateEquityFilterDto, clientId?: string,): Promise<IPrivateByFilter> {
	// 	try {
	// 		let totalAssets = 0

	// 		if (filter.date) {
	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] = await Promise.all([
	// 				this.prismaService.assetPrivateEquity.findMany({
	// 					where: {
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						bankId:      { in: filter.bankIds, },
	// 						...(clientId ?
	// 							{
	// 								client: { id: clientId, },
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio:      { isActivated: true, },
	// 						currency:       { in: filter.currencies, },
	// 						fundName:       { in: filter.fundNames, },
	// 						fundType:       { in: filter.fundTypes, },
	// 						marketValueUSD: {
	// 							not: 0,
	// 						},
	// 						AND: [
	// 							{
	// 								entryDate: {
	// 									lte: endOfDay(new Date(filter.date,),),
	// 								},
	// 							},
	// 						],
	// 						versions: { none: {}, },
	// 					},
	// 					include: {
	// 						portfolio: { select: { name: true, }, },
	// 						entity:    { select: { name: true, }, },
	// 						bank:      {
	// 							select: {
	// 								bankName:   true,
	// 								bankList:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account:   { select: { accountName: true, }, },
	// 					},
	// 					orderBy: {
	// 						[filter.sortBy as string]: filter.sortOrder,
	// 					},
	// 				},),
	// 				this.prismaService.assetPrivateEquity.findMany({
	// 					where: {
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						bankId:      { in: filter.bankIds, },
	// 						...(clientId ?
	// 							{
	// 								client: { id: clientId, },
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: { isActivated: true, },
	// 						currency:  { in: filter.currencies, },
	// 						fundName:  { in: filter.fundNames, },
	// 						fundType:  { in: filter.fundTypes, },
	// 						AND:       [
	// 							{
	// 								entryDate: {
	// 									lte: endOfDay(new Date(filter.date,),),
	// 								},
	// 							},
	// 						],
	// 						versions: {
	// 							some: {
	// 								createdAt: {
	// 									lte: endOfDay(new Date(filter.date,),),
	// 								},
	// 							},
	// 						},
	// 					},
	// 					include: {
	// 						portfolio: { select: { name: true, }, },
	// 						entity:    { select: { name: true, }, },
	// 						bank:      {
	// 							select: {
	// 								bankName:   true,
	// 								bankList:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account:   { select: { accountName: true, }, },
	// 						versions:  {
	// 							where: {
	// 								createdAt: {
	// 									lte: endOfDay(new Date(filter.date,),),
	// 								},
	// 							},
	// 							include: {
	// 								portfolio: { select: { name: true, }, },
	// 								entity:    { select: { name: true, }, },
	// 								bank:      {
	// 									select: {
	// 										bankName:   true,
	// 										bankList:   true,
	// 										bankListId: true,
	// 									},
	// 								},
	// 								account:   { select: { accountName: true, }, },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 						},
	// 					},
	// 					orderBy: {
	// 						[filter.sortBy as string]: filter.sortOrder,
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 			],)

	// 			const mergedAssets = [
	// 				...assetsWithVersion,
	// 				...assetsNoVersion.map((a,) => {
	// 					return { ...a, versions: [], }
	// 				},),
	// 			]

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const assetsWithUsdValue: Array<IAnalyticPrivate> = mergedAssets.map((asset: any,) => {
	// 				const version = asset.versions?.[0]

	// 				if (version) {
	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 						currencyList.find((item,) => {
	// 							return item.currency === version.currency
	// 						},)

	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1

	// 					const usdValue = parseFloat((version.currencyValue * rate).toFixed(2,),)
	// 					totalAssets = totalAssets + usdValue

	// 					return {
	// 						assetId:         version.id,
	// 						assetMainId:     asset.id,
	// 						portfolioName:   this.cryptoService.decryptString(version.portfolio.name,),
	// 						entityName:      this.cryptoService.decryptString(version.entity.name,),
	// 						accountName:     this.cryptoService.decryptString(version.account.accountName,),
	// 						bankName:        version.bank.bankName,
	// 						status:          version.status,
	// 						currency:        version.currency,
	// 						currencyValue:   version.currencyValue,
	// 						fundType:        version.fundType,
	// 						fundName:        version.fundName,
	// 						fundID:          version.fundID,
	// 						entryDate:       version.entryDate.toISOString(),
	// 						capitalCalled:   version.capitalCalled,
	// 						totalCommitment: version.totalCommitment,
	// 						usdValue,
	// 						pl:              version.pl,
	// 					}
	// 				}

	// 				const currencyData: TCurrencyDataWithHistory | undefined =
	// 					currencyList.find((item,) => {
	// 						return item.currency === asset.currency
	// 					},)

	// 				const rate = currencyData ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					1

	// 				const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
	// 				totalAssets = totalAssets + usdValue

	// 				return {
	// 					assetId:         asset.id,
	// 					portfolioName:   this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entityName:      this.cryptoService.decryptString(asset.entity.name,),
	// 					accountName:     this.cryptoService.decryptString(asset.account.accountName,),
	// 					bankName:        asset.bank.bankName,
	// 					status:          asset.status,
	// 					currency:        asset.currency,
	// 					currencyValue:   asset.currencyValue,
	// 					fundType:        asset.fundType,
	// 					fundName:        asset.fundName,
	// 					fundID:          asset.fundID,
	// 					entryDate:       asset.entryDate.toISOString(),
	// 					capitalCalled:   asset.capitalCalled,
	// 					totalCommitment: asset.totalCommitment,
	// 					usdValue,
	// 					pl:              asset.pl,
	// 				}
	// 			},)

	// 			return {
	// 				list:       assetsWithUsdValue,
	// 				totalAssets,
	// 			}
	// 		}

	// 		let totalAssetsNoDate = 0

	// 		const peAssets = await this.prismaService.assetPrivateEquity.findMany({
	// 			where: {
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },
	// 				bankId:      { in: filter.bankIds, },
	// 				...(clientId ?
	// 					{
	// 						client: { id: clientId, },
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
	// 				fundName: {
	// 					in: filter.fundNames,
	// 				},
	// 				fundType: {
	// 					in: filter.fundTypes,
	// 				},
	// 				marketValueUSD: {
	// 					not: 0,
	// 				},
	// 			},
	// 			include: {
	// 				portfolio: {
	// 					select: {
	// 						name: true,
	// 					},
	// 				},
	// 				entity: {
	// 					select: {
	// 						name: true,
	// 					},
	// 				},
	// 				bank: {
	// 					select: {
	// 						bankName:   true,
	// 						bankList:   true,
	// 						bankListId: true,
	// 					},
	// 				},
	// 				account: {
	// 					select: {
	// 						accountName: true,
	// 					},
	// 				},
	// 			},
	// 			orderBy: {
	// 				[filter.sortBy as string]: filter.sortOrder,
	// 			},
	// 		},)

	// 		const assetsWithUsdValueNoDate: Array<IAnalyticPrivate> = peAssets.map((asset,) => {
	// 			totalAssetsNoDate = totalAssetsNoDate + asset.marketValueUSD
	// 			return {
	// 				assetId:         asset.id,
	// 				portfolioName:   this.cryptoService.decryptString(asset.portfolio.name,),
	// 				entityName:      this.cryptoService.decryptString(asset.entity.name,),
	// 				accountName:     this.cryptoService.decryptString(asset.account.accountName,),
	// 				bankName:        asset.bank.bankName,
	// 				status:          asset.status,
	// 				currency:        asset.currency,
	// 				currencyValue:   asset.currencyValue,
	// 				fundType:        asset.fundType,
	// 				fundName:        asset.fundName,
	// 				fundID:          asset.fundID,
	// 				entryDate:       asset.entryDate.toISOString(),
	// 				capitalCalled:   asset.capitalCalled,
	// 				totalCommitment: asset.totalCommitment,
	// 				usdValue:        asset.marketValueUSD,
	// 				pl:              asset.pl,
	// 			}
	// 		},)

	// 		return {
	// 			list:        assetsWithUsdValueNoDate,
	// 			totalAssets: totalAssetsNoDate,
	// 		}
	// 	} catch (error) {
	// 		return {
	// 			list:        [],
	// 			totalAssets: 0,
	// 		}
	// 	}
	// }
	public async getAllByFilters(
		filter: PrivateEquityFilterDto,
		clientId?: string,
	): Promise<IPrivateByFilter> {
		try {
			let totalAssets = 0

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
							client: { id: clientId, },
						} :
						{}),
					bank: {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio:      { isActivated: true, },
					currency:       { in: filter.currencies, },
					fundName:       { in: filter.fundNames, },
					fundType:       { in: filter.fundTypes, },
					marketValueUSD: {
						not: 0,
					},
					AND: [
						{
							entryDate: {
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
				}

				const [assetsNoVersion, assetsWithVersion, currencyList,] = await Promise.all([
					this.prismaService.assetPrivateEquity.findMany({
						where: {
							...baseWhere,
							versions: { none: {}, },
						},
						include: {
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							account:   { select: { accountName: true, }, },
						},
						orderBy: {
							[filter.sortBy as string]: filter.sortOrder,
						},
					},),
					this.prismaService.assetPrivateEquity.findMany({
						where: {
							...baseWhere,
							versions: {
								some: {
									entryDate: {
										lte: endDate,
									},
								},
							},
						},
						include: {
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							account:   { select: { accountName: true, }, },
							versions:  {
								where: {
									createdAt: {
										lte: endDate,
									},
								},
								include: {
									portfolio: { select: { name: true, }, },
									entity:    { select: { name: true, }, },
									bank:      {
										select: {
											bankName:   true,
											bankList:   true,
											bankListId: true,
										},
									},
									account:   { select: { accountName: true, }, },
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
							},
						},
						orderBy: {
							[filter.sortBy as string]: filter.sortOrder,
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
				const assetsWithUsdValue: Array<IAnalyticPrivate> = mergedAssets.map((asset: any,) => {
					const version = asset.versions?.[0]

					if (version) {
						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((item,) => {
							return item.currency === version.currency
						},)

						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1

						const usdValue = parseFloat((version.currencyValue * rate).toFixed(2,),)
						totalAssets = totalAssets + usdValue

						return {
							assetId:         version.id,
							assetMainId:     asset.id,
							portfolioName:   this.cryptoService.decryptString(version.portfolio.name,),
							entityName:      this.cryptoService.decryptString(version.entity.name,),
							accountName:     this.cryptoService.decryptString(version.account.accountName,),
							bankName:        version.bank.bankName,
							status:          version.status,
							currency:        version.currency,
							currencyValue:   version.currencyValue,
							fundType:        version.fundType,
							fundName:        version.fundName,
							fundID:          version.fundID,
							entryDate:       version.entryDate.toISOString(),
							capitalCalled:   version.capitalCalled,
							totalCommitment: version.totalCommitment,
							usdValue,
							pl:              version.pl,
							isTransferred:   Boolean(asset.transferDate,),
						}
					}

					const currencyData: TCurrencyDataWithHistory | undefined =
					currencyList.find((item,) => {
						return item.currency === asset.currency
					},)

					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1

					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					totalAssets = totalAssets + usdValue

					return {
						assetId:         asset.id,
						portfolioName:   this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:      this.cryptoService.decryptString(asset.entity.name,),
						accountName:     this.cryptoService.decryptString(asset.account.accountName,),
						bankName:        asset.bank.bankName,
						status:          asset.status,
						currency:        asset.currency,
						currencyValue:   asset.currencyValue,
						fundType:        asset.fundType,
						fundName:        asset.fundName,
						fundID:          asset.fundID,
						entryDate:       asset.entryDate.toISOString(),
						capitalCalled:   asset.capitalCalled,
						totalCommitment: asset.totalCommitment,
						usdValue,
						pl:              asset.pl,
						isTransferred:   Boolean(asset.transferDate,),
					}
				},)

				return {
					list:       assetsWithUsdValue,
					totalAssets,
				}
			}

			let totalAssetsNoDate = 0

			const peAssets = await this.prismaService.assetPrivateEquity.findMany({
				where: {
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					fundName: {
						in: filter.fundNames,
					},
					fundType: {
						in: filter.fundTypes,
					},
					marketValueUSD: {
						not: 0,
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
				orderBy: {
					[filter.sortBy as string]: filter.sortOrder,
				},
			},)

			const assetsWithUsdValueNoDate: Array<IAnalyticPrivate> = peAssets.map((asset,) => {
				totalAssetsNoDate = totalAssetsNoDate + asset.marketValueUSD
				return {
					assetId:         asset.id,
					portfolioName:   this.cryptoService.decryptString(asset.portfolio.name,),
					entityName:      this.cryptoService.decryptString(asset.entity.name,),
					accountName:     this.cryptoService.decryptString(asset.account.accountName,),
					bankName:        asset.bank.bankName,
					status:          asset.status,
					currency:        asset.currency,
					currencyValue:   asset.currencyValue,
					fundType:        asset.fundType,
					fundName:        asset.fundName,
					fundID:          asset.fundID,
					entryDate:       asset.entryDate.toISOString(),
					capitalCalled:   asset.capitalCalled,
					totalCommitment: asset.totalCommitment,
					usdValue:        asset.marketValueUSD,
					pl:              asset.pl,
					isTransferred:   Boolean(asset.transferDate,),
				}
			},)

			return {
				list:        assetsWithUsdValueNoDate,
				totalAssets: totalAssetsNoDate,
			}
		} catch (error) {
			return {
				list:        [],
				totalAssets: 0,
			}
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
	public async getFilteredAssets(filter: PrivateEquityFilterDto, assetIds?: Array<string>, clientId?: string,): Promise<Array<TAssetExtended>> {
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
			clientId:  {
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

		const allAssets = await this.prismaService.asset.findMany({
			where,
			include: {
				entity: true,
				bank:   {include: { bankList: true, },},
			},
		},)

		const filteredAssets = allAssets
			.filter((asset,) => {
				if (!filter.fundTypes || filter.fundTypes.length === 0) {
					return true
				}
				const parsedPayload = assetParser<IPrivateAsset>(asset,)
				return parsedPayload && filter.fundTypes.includes(parsedPayload.fundType,)
			},)
			.filter((asset,) => {
				if (!filter.fundNames || filter.fundNames.length === 0) {
					return true
				}
				const parsedPayload = assetParser<IPrivateAsset>(asset,)
				return parsedPayload && filter.fundNames.includes(parsedPayload.fundName,)
			},)

		return filteredAssets
	}

	/**
	 * 3.5.4
	 * Retrieves bank analytics based on the provided filter criteria.
	 *
	 * @remarks
	 * - Uses `getFilteredAssets` to fetch assets matching the filter.
	 * - Loads the currency list via `cBondsCurrencyService.getAllCurrencies()`.
	 * - Parses the `payload` of each asset to extract currency and value.
	 * - Filters assets based on `filter.currencies`, if provided.
	 * - Returns an array of bank analytics, including bank IDs, names, and USD values.
	 *
	 * @param {PrivateEquityFilterDto} filter - The filter criteria for retrieving bank analytics.
	 * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics data.
	 */
	// todo: clear if new version good
	// public async getBankAnalytics(
	// 	filter: PrivateEquityFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TBankAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetPrivateEquityVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:                   true,
	// 					assetPrivateEquityId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const assetIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetPrivateEquityId
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

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetPrivateEquity.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
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
	// 					fundName: {
	// 						in: filter.fundNames,
	// 					},
	// 					fundType: {
	// 						in: filter.fundTypes,
	// 					},
	// 					marketValueUSD: {
	// 						not: 0,
	// 					},
	// 					AND: [
	// 						{
	// 							entryDate: {
	// 								lte: endDate,
	// 							},
	// 						},
	// 					],
	// 					versions: {
	// 						none: {},
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
	// 				},
	// 			},),
	// 			this.prismaService.assetPrivateEquity.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
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
	// 					fundName: {
	// 						in: filter.fundNames,
	// 					},
	// 					fundType: {
	// 						in: filter.fundTypes,
	// 					},
	// 					AND: [
	// 						{
	// 							entryDate: {
	// 								lte: endDate,
	// 							},
	// 						},
	// 					],
	// 					versions: {
	// 						some: {
	// 							createdAt: {
	// 								lte: endDate,
	// 							},
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
	// 							createdAt: {
	// 								lte: endDate,
	// 							},
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
	// 						orderBy: { createdAt: 'desc', },
	// 						take:    1,
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
	// 					currencyList.find((item,) => {
	// 						return item.currency === version.currency
	// 					},)

	// 						const rate = currencyData ?
	// 							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 							1

	// 						const usdValue = parseFloat((version.currencyValue * rate).toFixed(2,),)

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
	// 				currencyList.find((item,) => {
	// 					return item.currency === asset.currency
	// 				},)

	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1

	// 					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)

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

	// 		const peAssets = await this.prismaService.assetPrivateEquity.findMany({
	// 			where: {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },
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
	// 				fundName: {
	// 					in: filter.fundNames,
	// 				},
	// 				fundType: {
	// 					in: filter.fundTypes,
	// 				},
	// 				marketValueUSD: {
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

	// 		const analyticsData = peAssets
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

	// 		return analyticsData
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getBankAnalytics(
		filter: PrivateEquityFilterDto,
		clientId?: string,
	): Promise<Array<TBankAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetPrivateEquityVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:                   true,
						assetPrivateEquityId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const assetIdsFromVersions = versions
						.map((v,) => {
							return v.assetPrivateEquityId
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

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetPrivateEquity.findMany({
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
							fundName: {
								in: filter.fundNames,
							},
							fundType: {
								in: filter.fundTypes,
							},
							marketValueUSD: {
								not: 0,
							},
							AND: [
								{
									entryDate: {
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
							versions: {
								none: {},
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
						},
					},),
					this.prismaService.assetPrivateEquity.findMany({
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
							fundName: {
								in: filter.fundNames,
							},
							fundType: {
								in: filter.fundTypes,
							},
							AND: [
								{
									entryDate: {
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
							versions: {
								some: {
									createdAt: {
										lte: endDate,
									},
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
									createdAt: {
										lte: endDate,
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
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
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
							currencyList.find((item,) => {
								return item.currency === version.currency
							},)

							const rate = currencyData ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								1

							const usdValue = parseFloat((version.currencyValue * rate).toFixed(2,),)

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
						currencyList.find((item,) => {
							return item.currency === asset.currency
						},)

						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1

						const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)

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

			const peAssets = await this.prismaService.assetPrivateEquity.findMany({
				where: {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					fundName: {
						in: filter.fundNames,
					},
					fundType: {
						in: filter.fundTypes,
					},
					marketValueUSD: {
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

			const analyticsData = peAssets
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

			return analyticsData
		} catch (error) {
			return []
		}
	}

	/**
	 * 3.5.4
	 * Retrieves currency analytics based on the provided filters.
	 *
	 * @remarks
	 * - Filters assets by `assetIds` and `currencies` if specified.
	 * - Parses the `payload` field to extract currency details.
	 * - Converts currency values to USD using the exchange service.
	 * - Returns an array of currency analytics, including original and USD values.
	 * - In case of an error during processing, an empty array is returned.
	 *
	 * @param {PrivateEquityFilterDto} filter - The filter criteria for retrieving currency analytics.
	 * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
	 */
	// todo: clear if new version good
	// public async getCurrencyAnalytics(
	// 	filter: PrivateEquityFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TCurrencyAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetPrivateEquityVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:                   true,
	// 					assetPrivateEquityId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const assetIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetPrivateEquityId
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
	// 			const filterDate = new Date(filter.date,)
	// 			const endDate = endOfDay(filterDate,)

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetPrivateEquity.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entitiesIds, },
	// 					accountId:   { in: filter.accountIds, },

	// 					...(clientId ?
	// 						{
	// 							client: { id: clientId, },
	// 						} :
	// 						{}),

	// 					bank: {
	// 						is: {
	// 							bankListId: { in: filter.bankListIds, },
	// 						},
	// 					},
	// 					portfolio: { isActivated: true, },

	// 					currency: { in: filter.currencies, },
	// 					fundName: { in: filter.fundNames, },
	// 					fundType: { in: filter.fundTypes, },

	// 					marketValueUSD: { not: 0, },

	// 					AND: [
	// 						{
	// 							entryDate: {
	// 								lte: endDate,
	// 							},
	// 						},
	// 					],

	// 					versions: { none: {}, },
	// 				},
	// 				include: {
	// 					portfolio: { select: { name: true, }, },
	// 					entity:    { select: { name: true, }, },
	// 					bank:      {
	// 						select: {
	// 							bankName:   true,
	// 							bankList:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					account:   { select: { accountName: true, }, },
	// 				},
	// 			},),
	// 			this.prismaService.assetPrivateEquity.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entitiesIds, },
	// 					accountId:   { in: filter.accountIds, },

	// 					...(clientId ?
	// 						{
	// 							client: { id: clientId, },
	// 						} :
	// 						{}),

	// 					bank: {
	// 						is: {
	// 							bankListId: { in: filter.bankListIds, },
	// 						},
	// 					},
	// 					portfolio: { isActivated: true, },

	// 					currency: { in: filter.currencies, },
	// 					fundName: { in: filter.fundNames, },
	// 					fundType: { in: filter.fundTypes, },

	// 					AND: [
	// 						{
	// 							entryDate: {
	// 								lte: endDate,
	// 							},
	// 						},
	// 					],

	// 					versions: {
	// 						some: {
	// 							createdAt: {
	// 								lte: endDate,
	// 							},
	// 						},
	// 					},
	// 				},
	// 				include: {
	// 					portfolio: { select: { name: true, }, },
	// 					entity:    { select: { name: true, }, },
	// 					bank:      {
	// 						select: {
	// 							bankName:   true,
	// 							bankList:   true,
	// 							bankListId: true,
	// 						},
	// 					},
	// 					account:   { select: { accountName: true, }, },
	// 					versions:  {
	// 						where: {
	// 							createdAt: {
	// 								lte: endDate,
	// 							},
	// 						},
	// 						orderBy: { createdAt: 'desc', },
	// 						take:    1,
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
	// 			const analyticsData: Array<TCurrencyAnalytics> = mergedAssets.map((asset: any,) => {
	// 				const version = asset.versions?.[0]

	// 				if (version) {
	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 				currencyList.find((item,) => {
	// 					return item.currency === version.currency
	// 				},)

	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1

	// 					const usdValue = parseFloat((version.currencyValue * rate).toFixed(2,),)

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

	// 				const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)

	// 				return {
	// 					currency:      asset.currency,
	// 					currencyValue: asset.currencyValue,
	// 					usdValue,
	// 				}
	// 			},)

	// 			return analyticsData
	// 		}

	// 		const peAssets = await this.prismaService.assetPrivateEquity.findMany({
	// 			where: {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entitiesIds, },
	// 				accountId:   { in: filter.accountIds, },

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
	// 				fundName: {
	// 					in: filter.fundNames,
	// 				},
	// 				fundType: {
	// 					in: filter.fundTypes,
	// 				},
	// 				marketValueUSD: {
	// 					not: 0,
	// 				},
	// 			},
	// 			include: {
	// 				portfolio: {
	// 					select: {
	// 						name: true,
	// 					},
	// 				},
	// 				entity: {
	// 					select: {
	// 						name: true,
	// 					},
	// 				},
	// 				bank: {
	// 					select: {
	// 						bankName:   true,
	// 						bankList:   true,
	// 						bankListId: true,
	// 					},
	// 				},
	// 				account: {
	// 					select: {
	// 						accountName: true,
	// 					},
	// 				},
	// 			},
	// 		},)

	// 		const analyticsData = peAssets.map((asset,) => {
	// 			return {
	// 				currency:      asset.currency,
	// 				currencyValue: asset.currencyValue,
	// 				usdValue:      asset.marketValueUSD,
	// 			}
	// 		},)

	// 		return analyticsData
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getCurrencyAnalytics(
		filter: PrivateEquityFilterDto,
		clientId?: string,
	): Promise<Array<TCurrencyAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetPrivateEquityVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:                   true,
						assetPrivateEquityId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const assetIdsFromVersions = versions
						.map((v,) => {
							return v.assetPrivateEquityId
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
				const filterDate = new Date(filter.date,)
				const endDate = endOfDay(filterDate,)

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetPrivateEquity.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entitiesIds, },
							accountId:   { in: filter.accountIds, },

							...(clientId ?
								{ client: { id: clientId, }, } :
								{}),

							bank: {
								is: {
									bankListId: { in: filter.bankListIds, },
								},
							},
							portfolio: { isActivated: true, },

							currency: { in: filter.currencies, },
							fundName: { in: filter.fundNames, },
							fundType: { in: filter.fundTypes, },

							marketValueUSD: { not: 0, },

							AND: [
								{
									entryDate: {
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
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							account:   { select: { accountName: true, }, },
						},
					},),
					this.prismaService.assetPrivateEquity.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entitiesIds, },
							accountId:   { in: filter.accountIds, },

							...(clientId ?
								{ client: { id: clientId, }, } :
								{}),

							bank: {
								is: {
									bankListId: { in: filter.bankListIds, },
								},
							},
							portfolio: { isActivated: true, },

							currency: { in: filter.currencies, },
							fundName: { in: filter.fundNames, },
							fundType: { in: filter.fundTypes, },

							AND: [
								{
									entryDate: {
										lte: endDate,
									},
								},
							],

							OR: [
								{ transferDate: { gte: endDate, }, },
								{ transferDate: null, },
							],

							versions: {
								some: {
									createdAt: {
										lte: endDate,
									},
								},
							},
						},
						include: {
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							account:   { select: { accountName: true, }, },
							versions:  {
								where: {
									createdAt: {
										lte: endDate,
									},
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
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
				const analyticsData: Array<TCurrencyAnalytics> = mergedAssets.map((asset: any,) => {
					const version = asset.versions?.[0]

					if (version) {
						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((item,) => {
							return item.currency === version.currency
						},)

						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1

						const usdValue = parseFloat((version.currencyValue * rate).toFixed(2,),)

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

					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)

					return {
						currency:      asset.currency,
						currencyValue: asset.currencyValue,
						usdValue,
					}
				},)

				return analyticsData
			}

			const peAssets = await this.prismaService.assetPrivateEquity.findMany({
				where: {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entitiesIds, },
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
					currency: {
						in: filter.currencies,
					},
					fundName: {
						in: filter.fundNames,
					},
					fundType: {
						in: filter.fundTypes,
					},
					marketValueUSD: {
						not: 0,
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
			},)

			const analyticsData = peAssets.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.marketValueUSD,
				}
			},)

			return analyticsData
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
	public syncGetAllByFilters(data: TAssetCacheInitials,filters: PrivateEquityFilterDto, clientId?: string,): IPrivateByFilter {
		let totalAssets = 0
		const {assets, currencyList, } = data

		const assetsWithUsdValue = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.filter((asset,) => {
				if (!filters.fundTypes || filters.fundTypes.length === 0) {
					return true
				}
				if (typeof asset.payload === 'string') {
					const parsedPayload = JSON.parse(asset.payload,)
					return filters.fundTypes.includes(parsedPayload?.fundType,)
				}
				return false
			},)
			.filter((asset,) => {
				if (!filters.fundNames || filters.fundNames.length === 0) {
					return true
				}
				if (typeof asset.payload === 'string') {
					const parsedPayload = JSON.parse(asset.payload,)
					return filters.fundNames.includes(parsedPayload?.fundName,)
				}

				return false
			},)
			.filter((asset,) => {
				if (!filters.currencies || filters.currencies.length === 0) {
					return true
				}
				if (typeof asset.payload === 'string') {
					const parsedPayload = JSON.parse(asset.payload,)
					return filters.currencies.includes(parsedPayload?.currency,)
				}

				return false
			},)
			.map((asset,) => {
				const assetPayload = assetParser<IPrivateAsset>(asset,)
				if (assetPayload) {
					if (assetPayload.entryDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(assetPayload.entryDate,)) {
						return null
					}
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      assetPayload.currency,
						currencyValue: assetPayload.currencyValue,
						currencyList,
						historyDate:   filters.date,
					},)
					if (usdValue === 0) {
						return null
					}
					const managementExpenses = assetPayload.managementExpenses ?? 0
					const otherExpenses = assetPayload.otherExpenses ?? 0
					const currentValue = assetPayload.currencyValue || 0

					const pl = (currentValue - assetPayload.capitalCalled - managementExpenses - otherExpenses) / assetPayload.capitalCalled * 100
					totalAssets = totalAssets + usdValue
					return {
						assetId:         asset.id,
						portfolioName:       asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:          asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
						accountName:         asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
						bankName:        asset.bank?.bankName,
						status:          assetPayload.status,
						currency:        assetPayload.currency,
						currencyValue:   assetPayload.currencyValue,
						fundType:        assetPayload.fundType,
						fundName:        assetPayload.fundName,
						fundID:          assetPayload.fundID,
						entryDate:        assetPayload.entryDate,
						capitalCalled:        assetPayload.capitalCalled,
						totalCommitment:        assetPayload.totalCommitment,
						usdValue,
						pl,
					}
				}
				return null
			},)
			.filter((item,): item is IAnalyticPrivate => {
				return item !== null
			},)
			.sort((a, b,) => {
				let aValue: number
				let bValue: number

				switch (filters.sortBy) {
				case TPrivateEquityTableSortVariants.ENTRY_DATE:
					aValue = new Date(a.entryDate,).getTime()
					bValue = new Date(b.entryDate,).getTime()
					break
				case TPrivateEquityTableSortVariants.USD_VALUE:
					aValue = Number(a.usdValue,)
					bValue = Number(b.usdValue,)
					break
				case TPrivateEquityTableSortVariants.TOTAL_COMMITMENT:
					aValue = Number(a.totalCommitment,)
					bValue = Number(b.totalCommitment,)
					break
				case TPrivateEquityTableSortVariants.CALLED_CAPITAL:
					aValue = Number(a.capitalCalled,)
					bValue = Number(b.capitalCalled,)
					break
				case TPrivateEquityTableSortVariants.PROFIT:
					aValue = Number(a.pl,)
					bValue = Number(b.pl,)
					break
				default:
					return 0
				}

				if (aValue < bValue) {
					return filters.sortOrder === 'asc' ?
						-1 :
						1
				}
				if (aValue > bValue) {
					return filters.sortOrder === 'asc' ?
						1 :
						-1
				}
				return 0
			},)

		return {
			list: assetsWithUsdValue,
			totalAssets,
		}
	}

	/**
	 * CR -114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetBankAnalytics(data: TAssetCacheInitials, filter: PrivateEquityFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IPrivateAsset>(asset,)
				if (parsedPayload) {
					if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
						return null
					}
					if (parsedPayload.entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedPayload.entryDate,)) {
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
						bankName:  asset.bank?.bankList?.name ??  asset.bank?.bankName,
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
	public syncGetCurrencyAnalytics(data: TAssetCacheInitials,filter: PrivateEquityFilterDto, clientId?: string,): Array<TCurrencyAnalytics> {
		const {assets, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IPrivateAsset>(asset,)
				if (parsedPayload) {
					if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
						return null
					}
					if (parsedPayload.entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedPayload.entryDate,)) {
						return null
					}
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      parsedPayload.currency,
						currencyValue: parsedPayload.currencyValue,
						currencyList,
						historyDate:   filter.date,
					},)

					return {
						currency:      parsedPayload.currency,
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