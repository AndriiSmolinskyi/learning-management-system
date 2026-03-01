/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { Prisma, } from '@prisma/client'

import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'
import { assetParser, } from '../../../shared/utils'
import type { ILoanAnalytic, ILoansByFilter, TBankAnalytics, TCurrencyAnalytics,} from '../analytics.types'
import type { ILoanAsset, TAssetExtended,} from '../../asset/asset.types'
import { AssetNamesType, } from '../../asset/asset.types'
import type { LoanCurrencyFilterDto, LoanFilterDto, LoanNamesBySourceIdsDto, } from '../dto'
import { TLoanTableSortVariants, } from '../analytics.types'
import { endOfDay, } from 'date-fns'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TAssetCacheInitials, } from '../../../modules/common/cache-sync/cache-sync.types'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'

@Injectable()
export class LoanAssetService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
		* 3.5.4
 		* Calculates annual income from loan transactions based on the provided filters.
		* @remarks
		* Retrieves loan-related transactions for the current year (up to the given date or today),
		* filtered by portfolios, banks, accounts, entities, and clients.
		* Returns 0 if the selected year is the previous year.
		* Otherwise, sums transaction amounts multiplied by their rates.
		* @param filter - Filtering criteria for transactions.
		* @param clientId - Optional client ID to override filter.
		* @returns Total loan income for the current year.
	*/
	public async getLoanAnnual(filter: LoanFilterDto, clientId?: string,): Promise<number> {
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
					annualAssets: { has: AssetNamesType.LOAN, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)
		const loanAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return loanAnnual
	}

	/**
	 * 3.5.3
	  * Retrieves the names of loan assets associated with the specified bank IDs.
	*
	* @remarks
	* - Filters assets based on the provided bank IDs and the asset name `LOAN`.
	* - Parses the `payload` field of each matching asset to extract loan names.
	* - Returns an array of loan names.
	* - In case of an error during processing, an empty array is returned.
	*
	* @param ids - Array of bank IDs to filter the loan assets.
	* @returns A Promise that resolves to an array of loan asset names.
	*/

	public async getAssetLoanNamesByBanksIds(data: LoanNamesBySourceIdsDto, clientId?: string,): Promise<Array<string>> {
		const {clientIds, portfolioIds, entityIds, bankListIds, accountIds,} = data
		const assets = await this.prismaService.asset.findMany({
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
				assetName: AssetNamesType.LOAN,
				portfolio: {
					is: {
						isActivated: true,
						// client:      {
						// 	id: clientId,
						// },
					},
				},
			},
		},)
		try {
			const options = assets
				.filter((asset,) => {
					const parsedAsset = assetParser<ILoanAsset>(asset,)
					if (parsedAsset) {
						const maturity = new Date(parsedAsset.maturityDate,)
						return maturity > new Date()
					}
					return asset
				},)
				.map((asset,) => {
					const parsedPayload = JSON.parse(asset.payload as string,)
					return parsedPayload.loanName
				},)
			return Array.from(new Set(options,),)
		} catch (error) {
			return []
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
	 * @param {LoanFilterDto} filters - The filter criteria for retrieving loan assets.
	 * @returns {Promise<ILoansByFilter>} - A Promise resolving to an object containing the list of filtered loan assets and their total value.
	 */
	// todo: clear if new version good
	// public async getAllByFilters(
	// 	filters: LoanFilterDto,
	// 	clientId?: string,
	// ): Promise<ILoansByFilter> {
	// 	try {
	// 		const now = new Date()

	// 		if (filters.date) {
	// 			const filterDate = new Date(filters.date,)

	// 			const [loansNoVersion, loansWithVersion, currencyList,] = await Promise.all([
	// 				this.prismaService.assetLoan.findMany({
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
	// 						currency: {
	// 							in: filters.currencies,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						AND: [
	// 							{ startDate: { lte: endOfDay(filterDate,), }, },
	// 							{ maturityDate: { gt: filterDate, }, },
	// 						],
	// 						versions: { none: {}, },
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account: {
	// 							select: {
	// 								accountName: true,
	// 							},
	// 						},
	// 					},
	// 					orderBy: {
	// 						[filters.sortBy]: filters.sortOrder,
	// 					},
	// 				},),
	// 				this.prismaService.assetLoan.findMany({
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
	// 						versions: {
	// 							some: {
	// 								startDate:    { lte: endOfDay(filterDate,), },
	// 								maturityDate: { gt: filterDate, },
	// 							},
	// 						},
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account: {
	// 							select: {
	// 								accountName: true,
	// 							},
	// 						},
	// 						versions: {
	// 							where: {
	// 								createdAt: { lte: endOfDay(filterDate,), },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 							include: {
	// 								portfolio: {
	// 									select: { name: true, },
	// 								},
	// 								entity: {
	// 									select: { name: true, },
	// 								},
	// 								bank: {
	// 									select: {
	// 										bankName:   true,
	// 										bankList:   true,
	// 										bankListId: true,
	// 									},
	// 								},
	// 								account: {
	// 									select: {
	// 										accountName: true,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 					orderBy: {
	// 						[filters.sortBy]: filters.sortOrder,
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
	// 			],)

	// 			const mergedLoans = [
	// 				...loansWithVersion,
	// 				...loansNoVersion.map((loan,) => {
	// 					return { ...loan, versions: [], }
	// 				},),
	// 			]

	// 			const totalAssets = 0

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const assetsWithUsdValue = (mergedLoans as Array<any>)
	// 				.map((asset,) => {
	// 					const version = asset.versions?.[0]

	// 					if (version) {
	// 						const { currencyValue, currency,} = version
	// 						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 							return item.currency === currency
	// 						},)
	// 						const rate = currencyData ?
	// 							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 							1
	// 						const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 						return {
	// 							id:               version.id,
	// 							assetMainId:      asset.id,
	// 							portfolioName:    this.cryptoService.decryptString(version.portfolio.name,),
	// 							entityName:       this.cryptoService.decryptString(version.entity.name,),
	// 							accountName:      this.cryptoService.decryptString(version.account.accountName,),
	// 							bankName:         version.bank.bankName,
	// 							name:             version.name,
	// 							startDate:        version.startDate.toISOString(),
	// 							maturityDate:     version.maturityDate.toISOString(),
	// 							currency:         version.currency,
	// 							currencyValue:    version.currencyValue,
	// 							usdValue,
	// 							interest:         version.interest,
	// 							todayInterest:    version.todayInterest,
	// 							maturityInterest: version.maturityInterest,
	// 						}
	// 					}

	// 					const { currencyValue, currency,} = asset
	// 					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 						return item.currency === currency
	// 					},)
	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1
	// 					const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 					return {
	// 						id:               asset.id,
	// 						portfolioName:    this.cryptoService.decryptString(asset.portfolio.name,),
	// 						entityName:       this.cryptoService.decryptString(asset.entity.name,),
	// 						accountName:      this.cryptoService.decryptString(asset.account.accountName,),
	// 						bankName:         asset.bank.bankName,
	// 						name:             asset.name,
	// 						startDate:        asset.startDate.toISOString(),
	// 						maturityDate:     asset.maturityDate.toISOString(),
	// 						currency:         asset.currency,
	// 						currencyValue:    asset.currencyValue,
	// 						usdValue,
	// 						interest:         asset.interest,
	// 						todayInterest:    asset.todayInterest,
	// 						maturityInterest: asset.maturityInterest,
	// 					}
	// 				},)

	// 			return {
	// 				list:        assetsWithUsdValue,
	// 				totalAssets,
	// 			}
	// 		}

	// 		const [loanAssets,] = await Promise.all([
	// 			this.prismaService.assetLoan.findMany({
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
	// 					currency: {
	// 						in: filters.currencies,
	// 					},
	// 					usdValue: {
	// 						not: 0,
	// 					},
	// 					AND: [
	// 						{ maturityDate: { gt: now, }, },
	// 					],
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
	// 				orderBy: {
	// 					[filters.sortBy]: filters.sortOrder,
	// 				},
	// 			},),
	// 		],)

	// 		const totalAssets = 0

	// 		const assetsWithUsdValue = loanAssets
	// 			.map((asset,) => {
	// 				return {
	// 					id:               asset.id,
	// 					portfolioName:    this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entityName:       this.cryptoService.decryptString(asset.entity.name,),
	// 					accountName:      this.cryptoService.decryptString(asset.account.accountName,),
	// 					bankName:         asset.bank.bankName,
	// 					name:             asset.name,
	// 					startDate:        asset.startDate.toISOString(),
	// 					maturityDate:     asset.maturityDate.toISOString(),
	// 					currency:         asset.currency,
	// 					currencyValue:    asset.currencyValue,
	// 					usdValue:         asset.marketValueUSD,
	// 					interest:         asset.interest,
	// 					todayInterest:    asset.todayInterest,
	// 					maturityInterest: asset.maturityInterest,
	// 				}
	// 			},)

	// 		return {
	// 			list:        assetsWithUsdValue,
	// 			totalAssets,
	// 		}
	// 	} catch (error) {
	// 		return {
	// 			list:        [],
	// 			totalAssets: 0,
	// 		}
	// 	}
	// }
	public async getAllByFilters(
		filters: LoanFilterDto,
		clientId?: string,
	): Promise<ILoansByFilter> {
		try {
			let totalAssets = 0
			const now = new Date()

			if (filters.date) {
				const filterDate = new Date(filters.date,)

				const [loansNoVersion, loansWithVersion, currencyList,] = await Promise.all([
					this.prismaService.assetLoan.findMany({
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
							currency: {
								in: filters.currencies,
							},
							usdValue: {
								not: 0,
							},
							AND: [
								{ startDate: { lte: endOfDay(filterDate,), }, },
								{ maturityDate: { gt: filterDate, }, },
								{
									OR: [
										{ transferDate: { gte: endOfDay(filterDate,), }, },
										{ transferDate: null, },
									],
								},
							],
							versions: {
								none: {},
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
						},
						orderBy: {
							[filters.sortBy]: filters.sortOrder,
						},
					},),
					this.prismaService.assetLoan.findMany({
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
							versions: {
								some: {
									startDate:    { lte: endOfDay(filterDate,), },
									maturityDate: { gt: filterDate, },
								},
							},
							AND: [
								{
									OR: [
										{ transferDate: { gte: endOfDay(filterDate,), }, },
										{ transferDate: null, },
									],
								},
							],
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
									createdAt: { lte: endOfDay(filterDate,), },
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
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
									account: {
										select: {
											accountName: true,
										},
									},
								},
							},
						},
						orderBy: {
							[filters.sortBy]: filters.sortOrder,
						},
					},),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
				],)

				const mergedLoans = [
					...loansWithVersion,
					...loansNoVersion.map((loan,) => {
						return { ...loan, versions: [], }
					},),
				]

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const assetsWithUsdValue = (mergedLoans as Array<any>)
					.map((asset,) => {
						const version = asset.versions?.[0]

						if (version) {
							const { currencyValue, currency, } = version
							const currencyData: TCurrencyDataWithHistory | undefined =
					currencyList.find((item,) => {
						return item.currency === currency
					},)
							const rate = currencyData ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								1
							const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
							totalAssets = totalAssets + usdValue

							return {
								id:               version.id,
								mainAssetId:      asset.id,
								portfolioName:    this.cryptoService.decryptString(version.portfolio.name,),
								entityName:       this.cryptoService.decryptString(version.entity.name,),
								accountName:      this.cryptoService.decryptString(version.account.accountName,),
								bankName:         version.bank.bankName,
								name:             version.name,
								startDate:        version.startDate.toISOString(),
								maturityDate:     version.maturityDate.toISOString(),
								currency:         version.currency,
								currencyValue:    version.currencyValue,
								usdValue:         version.usdValue,
								interest:         version.interest,
								todayInterest:    version.todayInterest,
								maturityInterest: version.maturityInterest,
								isTransferred:    Boolean(asset.transferDate,),
							}
						}

						const { currencyValue, currency, } = asset
						const currencyData: TCurrencyDataWithHistory | undefined =
					currencyList.find((item,) => {
						return item.currency === currency
					},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
						totalAssets = totalAssets + usdValue

						return {
							id:               asset.id,
							portfolioName:    this.cryptoService.decryptString(asset.portfolio.name,),
							entityName:       this.cryptoService.decryptString(asset.entity.name,),
							accountName:      this.cryptoService.decryptString(asset.account.accountName,),
							bankName:         asset.bank.bankName,
							name:             asset.name,
							startDate:        asset.startDate.toISOString(),
							maturityDate:     asset.maturityDate.toISOString(),
							currency:         asset.currency,
							currencyValue:    asset.currencyValue,
							usdValue:         asset.usdValue,
							interest:         asset.interest,
							todayInterest:    asset.todayInterest,
							maturityInterest: asset.maturityInterest,
							isTransferred:    Boolean(asset.transferDate,),
						}
					},)

				return {
					list:        assetsWithUsdValue,
					totalAssets,
				}
			}

			const [loanAssets,] = await Promise.all([
				this.prismaService.assetLoan.findMany({
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
						currency: {
							in: filters.currencies,
						},
						usdValue: {
							not: 0,
						},
						transferDate: null,
						AND:          [
							{ maturityDate: { gt: now, }, },
						],
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
						[filters.sortBy]: filters.sortOrder,
					},
				},),
			],)

			const assetsWithUsdValue = loanAssets
				.map((asset,) => {
					const usdValue = asset.marketValueUSD
					totalAssets = totalAssets + usdValue

					return {
						id:               asset.id,
						portfolioName:    this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:       this.cryptoService.decryptString(asset.entity.name,),
						accountName:      this.cryptoService.decryptString(asset.account.accountName,),
						bankName:         asset.bank.bankName,
						name:             asset.name,
						startDate:        asset.startDate.toISOString(),
						maturityDate:     asset.maturityDate.toISOString(),
						currency:         asset.currency,
						currencyValue:    asset.currencyValue,
						usdValue:         asset.usdValue,
						interest:         asset.interest,
						todayInterest:    asset.todayInterest,
						maturityInterest: asset.maturityInterest,
						isTransferred:    Boolean(asset.transferDate,),
					}
				},)

			return {
				list:        assetsWithUsdValue,
				totalAssets,
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
	public async getFilteredAssets(filter: LoanCurrencyFilterDto, assetIds?: Array<string>, clientId?: string,): Promise<Array<TAssetExtended>> {
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
			include: {
				entity: true,
				bank:   {include: { bankList: true, },},
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
	 * - Filters assets based on `filter.currencies`, if provided.
	 * - Returns an array of bank analytics, including bank IDs, names, and USD values.
	 *
	 * @param {LoanFilterDto} filter - The filter criteria for retrieving bank analytics.
	 * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics data.
	 */
	// todo: clear if new version good
	// public async getBankAnalytics(
	// 	filter: LoanCurrencyFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TBankAnalytics>> {
	// 	try {
	// 		const now = new Date()
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetLoanVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:          true,
	// 					assetLoanId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const loanIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetLoanId
	// 					},)
	// 					.filter((id,): id is string => {
	// 						return Boolean(id,)
	// 					},)

	// 				const originalLoanIds = filter.assetIds.filter((id,) => {
	// 					return !versionIdSet.has(id,)
	// 				},)

	// 				resolvedAssetIds = Array.from(
	// 					new Set([...originalLoanIds, ...loanIdsFromVersions,],),
	// 				)
	// 			}
	// 		}

	// 		if (filter.date) {
	// 			const filterDate = new Date(filter.date,)

	// 			const [loansNoVersion, loansWithVersion, currencyList,] = await Promise.all([
	// 				this.prismaService.assetLoan.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						currency: {
	// 							in: filter.currencies,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						AND: [
	// 							{ startDate: { lte: endOfDay(filterDate,), }, },
	// 							{ maturityDate: { gt: filterDate, }, },
	// 						],
	// 						versions: { none: {}, },
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
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
	// 				this.prismaService.assetLoan.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						currency: {
	// 							in: filter.currencies,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						versions: {
	// 							some: {
	// 								startDate:    { lte: endOfDay(filterDate,), },
	// 								maturityDate: { gt: filterDate, },
	// 							},
	// 						},
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account: {
	// 							select: {
	// 								accountName: true,
	// 							},
	// 						},
	// 						versions: {
	// 							where: {
	// 								createdAt: { lte: endOfDay(filterDate,), },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 							include: {
	// 								portfolio: {
	// 									select: { name: true, },
	// 								},
	// 								entity: {
	// 									select: { name: true, },
	// 								},
	// 								bank: {
	// 									select: {
	// 										bankName:   true,
	// 										bankList:   true,
	// 										bankListId: true,
	// 									},
	// 								},
	// 								account: {
	// 									select: {
	// 										accountName: true,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 			],)

	// 			const mergedLoans = [
	// 				...loansWithVersion,
	// 				...loansNoVersion.map((loan,) => {
	// 					return { ...loan, versions: [], }
	// 				},),
	// 			]

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const analyticsData = (mergedLoans as Array<any>)
	// 				.map((asset,) => {
	// 					const version = asset.versions?.[0]

	// 					if (version) {
	// 						if (!version.bank.bankListId) {
	// 							return null
	// 						}

	// 						const { currencyValue, currency, } = version
	// 						const currencyData: TCurrencyDataWithHistory | undefined =
	// 					currencyList.find((item,) => {
	// 						return item.currency === currency
	// 					},)
	// 						const rate = currencyData ?
	// 							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 							1
	// 						const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 						return {
	// 							id:       version.bank.bankListId,
	// 							bankName: version.bank.bankList?.name ?? version.bank.bankName,
	// 							usdValue,
	// 						}
	// 					}

	// 					if (!asset.bank.bankListId) {
	// 						return null
	// 					}

	// 					const { currencyValue, currency, } = asset
	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 				currencyList.find((item,) => {
	// 					return item.currency === currency
	// 				},)
	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1
	// 					const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 					return {
	// 						id:       asset.bank.bankListId,
	// 						bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
	// 						usdValue,
	// 					}
	// 				},)
	// 				.filter((item,): item is NonNullable<typeof item> => {
	// 					return item !== null
	// 				},)

	// 			return analyticsData
	// 		}

	// 		const [loanAssets,] = await Promise.all([
	// 			this.prismaService.assetLoan.findMany({
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
	// 					AND: [
	// 						{ maturityDate: { gt: now, }, },
	// 					],
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
	// 			},),
	// 		],)

	// 		const analyticsData = loanAssets
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
	// 			.filter((item,): item is NonNullable<typeof item> => {
	// 				return item !== null
	// 			},)

	// 		return analyticsData
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	// public async getBankAnalytics(
	// 	filter: LoanCurrencyFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TBankAnalytics>> {
	// 	try {
	// 		const now = new Date()
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetLoanVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:          true,
	// 					assetLoanId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const loanIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetLoanId
	// 					},)
	// 					.filter((id,): id is string => {
	// 						return Boolean(id,)
	// 					},)

	// 				const originalLoanIds = filter.assetIds.filter((id,) => {
	// 					return !versionIdSet.has(id,)
	// 				},)

	// 				resolvedAssetIds = Array.from(
	// 					new Set([...originalLoanIds, ...loanIdsFromVersions,],),
	// 				)
	// 			}
	// 		}

	// 		if (filter.date) {
	// 			const filterDate = new Date(filter.date,)

	// 			// eslint-disable-next-line no-unused-vars
	// 			const [loansNoVersion, loansWithVersion, currencyList,] = await Promise.all([
	// 				this.prismaService.assetLoan.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						currency: {
	// 							in: filter.currencies,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						AND: [
	// 							{ startDate: { lte: endOfDay(filterDate,), }, },
	// 							{ maturityDate: { gt: filterDate, }, },
	// 							{
	// 								OR: [
	// 									{ transferDate: { gte: endOfDay(filterDate,), }, },
	// 									{ transferDate: null, },
	// 								],
	// 							},
	// 						],
	// 						versions: { none: {}, },
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
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
	// 				this.prismaService.assetLoan.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						currency: {
	// 							in: filter.currencies,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						versions: {
	// 							some: {
	// 								startDate:    { lte: endOfDay(filterDate,), },
	// 								maturityDate: { gt: filterDate, },
	// 							},
	// 						},
	// 						AND: [
	// 							{
	// 								OR: [
	// 									{ transferDate: { gte: endOfDay(filterDate,), }, },
	// 									{ transferDate: null, },
	// 								],
	// 							},
	// 						],
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account: {
	// 							select: {
	// 								accountName: true,
	// 							},
	// 						},
	// 						versions: {
	// 							where: {
	// 								createdAt: { lte: endOfDay(filterDate,), },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 							include: {
	// 								portfolio: {
	// 									select: { name: true, },
	// 								},
	// 								entity: {
	// 									select: { name: true, },
	// 								},
	// 								bank: {
	// 									select: {
	// 										bankName:   true,
	// 										bankList:   true,
	// 										bankListId: true,
	// 									},
	// 								},
	// 								account: {
	// 									select: {
	// 										accountName: true,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 			],)

	// 			const mergedLoans = [
	// 				...loansWithVersion,
	// 				...loansNoVersion.map((loan,) => {
	// 					return { ...loan, versions: [], }
	// 				},),
	// 			]

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const analyticsData = (mergedLoans as Array<any>)
	// 				.map((asset,) => {
	// 					const version = asset.versions?.[0]

	// 					if (version) {
	// 						if (!version.bank.bankListId) {
	// 							return null
	// 						}

	// 						// const { currencyValue, currency, } = version
	// 						// const currencyData: TCurrencyDataWithHistory | undefined =
	// 						// currencyList.find((item,) => {
	// 						// 	return item.currency === currency
	// 						// },)
	// 						// const rate = currencyData ?
	// 						// 	currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						// 	1
	// 						// const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 						return {
	// 							id:       version.bank.bankListId,
	// 							bankName: version.bank.bankList?.name ?? version.bank.bankName,
	// 							usdValue: version.usdValue,
	// 						}
	// 					}

	// 					if (!asset.bank.bankListId) {
	// 						return null
	// 					}

	// 					// 	const { currencyValue, currency, } = asset
	// 					// 	const currencyData: TCurrencyDataWithHistory | undefined =
	// 					// currencyList.find((item,) => {
	// 					// 	return item.currency === currency
	// 					// },)
	// 					// const rate = currencyData ?
	// 					// 	currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					// 	1
	// 					// const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 					return {
	// 						id:       asset.bank.bankListId,
	// 						bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
	// 						usdValue: asset.usdValue,
	// 					}
	// 				},)
	// 				.filter((item,): item is NonNullable<typeof item> => {
	// 					return item !== null
	// 				},)

	// 			return analyticsData
	// 		}

	// 		const [loanAssets,] = await Promise.all([
	// 			this.prismaService.assetLoan.findMany({
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
	// 					transferDate: null,
	// 					AND:          [
	// 						{ maturityDate: { gt: now, }, },
	// 						filter.date ?
	// 							{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
	// 							{},
	// 					],
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
	// 			},),
	// 		],)

	// 		const analyticsData = loanAssets
	// 			.map((asset,) => {
	// 				if (!asset.bank.bankListId) {
	// 					return null
	// 				}

	// 				return {
	// 					id:       asset.bank.bankListId,
	// 					bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
	// 					usdValue: asset.usdValue,
	// 				}
	// 			},)
	// 			.filter((item,): item is NonNullable<typeof item> => {
	// 				return item !== null
	// 			},)

	// 		return analyticsData
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getBankAnalytics(
		filter: LoanCurrencyFilterDto,
		clientId?: string,
	): Promise<Array<TBankAnalytics>> {
		try {
			const now = new Date()
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetLoanVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:          true,
						assetLoanId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)

					const loanIdsFromVersions = versions
						.map((v,) => {
							return v.assetLoanId
						},)
						.filter((id,): id is string => {
							return Boolean(id,)
						},)

					const originalLoanIds = filter.assetIds.filter((id,) => {
						return !versionIdSet.has(id,)
					},)

					resolvedAssetIds = Array.from(
						new Set([...originalLoanIds, ...loanIdsFromVersions,],),
					)
				}
			}

			if (filter.date) {
				const filterDate = new Date(filter.date,)
				const endDate = endOfDay(filterDate,)

				const andNoVersion: Array<Prisma.AssetLoanWhereInput> = [
					{ startDate: { lte: endDate, }, },
					{ maturityDate: { gt: filterDate, }, },
					{
						OR: [
							{ transferDate: { gte: endDate, }, },
							{ transferDate: null, },
						],
					},
				]

				const andWithVersion: Array<Prisma.AssetLoanWhereInput> = [
					{
						OR: [
							{ transferDate: { gte: endDate, }, },
							{ transferDate: null, },
						],
					},
				]

				const [loansNoVersion, loansWithVersion,] = await Promise.all([
					this.prismaService.assetLoan.findMany({
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
							bank:        {
								is: {
									bankListId: { in: filter.bankListIds, },
								},
							},
							portfolio: { isActivated: true, },
							currency:  { in: filter.currencies, },
							usdValue:  { not: 0, },
							AND:       andNoVersion,
							versions:  { none: {}, },
						},
						include: {
							bank: {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
							versions: true,
						},
					},),

					this.prismaService.assetLoan.findMany({
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
							bank:        {
								is: {
									bankListId: { in: filter.bankListIds, },
								},
							},
							portfolio: { isActivated: true, },
							usdValue:  { not: 0, },
							AND:       andWithVersion,
							versions:  {
								some: {
									createdAt:    { lte: endDate, },
									startDate:    { lte: endDate, },
									maturityDate: { gt: filterDate, },
									usdValue:     { not: 0, },
									currency:     { in: filter.currencies, },
								},
							},
						},
						include: {
							versions: {
								where: {
									createdAt: { lte: endDate, },
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
								include: {
									bank: {
										select: {
											bankName:   true,
											bankList:   true,
											bankListId: true,
										},
									},
								},
							},
							bank: {
								select: {
									bankName:   true,
									bankList:   true,
									bankListId: true,
								},
							},
						},
					},),
				],)

				const mergedLoans = [
					...loansWithVersion,
					...loansNoVersion.map((loan,) => {
						return { ...loan, versions: [], }
					},),
				]

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const analyticsData = (mergedLoans as Array<any>)
					.map((asset,) => {
						const version = asset.versions?.[0]

						if (version) {
							const {bank,} = version
							if (!bank?.bankListId) {
								return null
							}
							return {
								id:       bank.bankListId,
								bankName: bank.bankList?.name ?? bank.bankName,
								usdValue: version.usdValue,
							}
						}

						const {bank,} = asset
						if (!bank?.bankListId) {
							return null
						}

						return {
							id:       bank.bankListId,
							bankName: bank.bankList?.name ?? bank.bankName,
							usdValue: asset.usdValue,
						}
					},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)

				return analyticsData
			}

			const [loanAssets,] = await Promise.all([
				this.prismaService.assetLoan.findMany({
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
						bank:        {
							is: {
								bankListId: { in: filter.bankListIds, },
							},
						},
						portfolio:    { isActivated: true, },
						currency:     { in: filter.currencies, },
						usdValue:     { not: 0, },
						transferDate: null,
						AND:          [
							{ maturityDate: { gt: now, }, },
							filter.date ?
								{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
								{},
						],
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
			],)

			const analyticsData = loanAssets
				.map((asset,) => {
					if (!asset.bank.bankListId) {
						return null
					}

					return {
						id:       asset.bank.bankListId,
						bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
						usdValue: asset.usdValue,
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
	 * @param {LoanFilterDto} filter - The filter criteria for retrieving currency analytics.
	 * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
	 */
	// todo: clear if new version good
	// public async getCurrencyAnalytics(
	// 	filter: LoanCurrencyFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TCurrencyAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetLoanVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:          true,
	// 					assetLoanId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const loanIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetLoanId
	// 					},)
	// 					.filter((id,): id is string => {
	// 						return Boolean(id,)
	// 					},)

	// 				const originalLoanIds = filter.assetIds.filter((id,) => {
	// 					return !versionIdSet.has(id,)
	// 				},)

	// 				resolvedAssetIds = Array.from(
	// 					new Set([...originalLoanIds, ...loanIdsFromVersions,],),
	// 				)
	// 			}
	// 		}

	// 		if (filter.date) {
	// 			const filterDate = new Date(filter.date,)

	// 			const [loansNoVersion, loansWithVersion, currencyList,] = await Promise.all([
	// 				this.prismaService.assetLoan.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						currency: {
	// 							in: filter.currencies,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						AND: [
	// 							{ startDate: { lte: endOfDay(filterDate,), }, },
	// 							{ maturityDate: { gt: filterDate, }, },
	// 						],
	// 						versions: { none: {}, },
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
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
	// 				this.prismaService.assetLoan.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entitiesIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						...(clientId ?
	// 							{
	// 								client: {
	// 									id: clientId,
	// 								},
	// 							} :
	// 							{}),
	// 						bank: {
	// 							is: {
	// 								bankListId: { in: filter.bankListIds, },
	// 							},
	// 						},
	// 						portfolio: {
	// 							isActivated: true,
	// 						},
	// 						currency: {
	// 							in: filter.currencies,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						versions: {
	// 							some: {
	// 								startDate:    { lte: endOfDay(filterDate,), },
	// 								maturityDate: { gt: filterDate, },
	// 							},
	// 						},
	// 					},
	// 					include: {
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
	// 								bankName:   true,
	// 								bankList:   true,
	// 								bankListId: true,
	// 							},
	// 						},
	// 						account: {
	// 							select: {
	// 								accountName: true,
	// 							},
	// 						},
	// 						versions: {
	// 							where: {
	// 								createdAt: { lte: endOfDay(filterDate,), },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 							include: {
	// 								portfolio: {
	// 									select: { name: true, },
	// 								},
	// 								entity: {
	// 									select: { name: true, },
	// 								},
	// 								bank: {
	// 									select: {
	// 										bankName:   true,
	// 										bankList:   true,
	// 										bankListId: true,
	// 									},
	// 								},
	// 								account: {
	// 									select: {
	// 										accountName: true,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 			],)

	// 			const mergedLoans = [
	// 				...loansWithVersion,
	// 				...loansNoVersion.map((loan,) => {
	// 					return { ...loan, versions: [], }
	// 				},),
	// 			]

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const analyticsData = (mergedLoans as Array<any>)
	// 				.map((asset,) => {
	// 					const version = asset.versions?.[0]

	// 					if (version) {
	// 						const { currencyValue, currency, } = version
	// 						const currencyData: TCurrencyDataWithHistory | undefined =
	// 					currencyList.find((item,) => {
	// 						return item.currency === currency
	// 					},)
	// 						const rate = currencyData ?
	// 							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 							1
	// 						const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 						return {
	// 							currency:      version.currency,
	// 							currencyValue: version.currencyValue,
	// 							usdValue,
	// 						}
	// 					}

	// 					const { currencyValue, currency, } = asset
	// 					const currencyData: TCurrencyDataWithHistory | undefined =
	// 				currencyList.find((item,) => {
	// 					return item.currency === currency
	// 				},)
	// 					const rate = currencyData ?
	// 						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 						1
	// 					const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

	// 					return {
	// 						currency:      asset.currency,
	// 						currencyValue: asset.currencyValue,
	// 						usdValue,
	// 					}
	// 				},)

	// 			return analyticsData
	// 		}

	// 		const loanAssets = await this.prismaService.assetLoan.findMany({
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
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 				AND: [
	// 					{ maturityDate: { gt: new Date(), }, },
	// 				],
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

	// 		const analyticsData = loanAssets.map((asset,) => {
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
		filter: LoanCurrencyFilterDto,
		clientId?: string,
	): Promise<Array<TCurrencyAnalytics>> {
		try {
			const now = new Date()
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetLoanVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:          true,
						assetLoanId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const loanIdsFromVersions = versions
						.map((v,) => {
							return v.assetLoanId
						},)
						.filter((id,): id is string => {
							return Boolean(id,)
						},)

					const originalLoanIds = filter.assetIds.filter((id,) => {
						return !versionIdSet.has(id,)
					},)

					resolvedAssetIds = Array.from(
						new Set([...originalLoanIds, ...loanIdsFromVersions,],),
					)
				}
			}

			if (filter.date) {
				const filterDate = new Date(filter.date,)

				// eslint-disable-next-line no-unused-vars
				const [loansNoVersion, loansWithVersion, currencyList,] = await Promise.all([
					this.prismaService.assetLoan.findMany({
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
							usdValue: {
								not: 0,
							},
							AND: [
								{ startDate: { lte: endOfDay(filterDate,), }, },
								{ maturityDate: { gt: filterDate, }, },
								{
									OR: [
										{ transferDate: { gte: endOfDay(filterDate,), }, },
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
					},),
					this.prismaService.assetLoan.findMany({
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
							usdValue: {
								not: 0,
							},
							versions: {
								some: {
									startDate:    { lte: endOfDay(filterDate,), },
									maturityDate: { gt: filterDate, },
								},
							},
							AND: [
								{
									OR: [
										{ transferDate: { gte: endOfDay(filterDate,), }, },
										{ transferDate: null, },
									],
								},
							],
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
									createdAt: { lte: endOfDay(filterDate,), },
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
								include: {
									portfolio: {
										select: { name: true, },
									},
									entity: {
										select: { name: true, },
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
							},
						},
					},),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				],)

				const mergedLoans = [
					...loansWithVersion,
					...loansNoVersion.map((loan,) => {
						return { ...loan, versions: [], }
					},),
				]

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const analyticsData = (mergedLoans as Array<any>)
					.map((asset,) => {
						const version = asset.versions?.[0]

						if (version) {
							// const { currencyValue, currency, } = version
							// const currencyData: TCurrencyDataWithHistory | undefined =
							// currencyList.find((item,) => {
							// 	return item.currency === currency
							// },)
							// const rate = currencyData ?
							// 	currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							// 	1
							// const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

							return {
								currency:      version.currency,
								currencyValue: version.currencyValue,
								usdValue:      version.usdValue,
							}
						}

						// const { currencyValue, currency, } = asset
						// const currencyData: TCurrencyDataWithHistory | undefined =
						// 	currencyList.find((item,) => {
						// 		return item.currency === currency
						// 	},)
						// const rate = currencyData ?
						// 	currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						// 	1
						// const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)

						return {
							currency:      asset.currency,
							currencyValue: asset.currencyValue,
							usdValue:      asset.usdValue,
						}
					},)

				return analyticsData
			}

			const loanAssets = await this.prismaService.assetLoan.findMany({
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
					usdValue: {
						not: 0,
					},
					transferDate: null,
					AND:          [
						{ maturityDate: { gt: now, }, },
						filter.date ?
							{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
							{},
					],
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

			const analyticsData = loanAssets.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.usdValue,
				}
			},)

			return analyticsData
		} catch (error) {
			return []
		}
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetAllByFilters(data: TAssetCacheInitials, filters: LoanFilterDto, clientId?: string,): ILoansByFilter {
		let totalAssets = 0
		const {assets, currencyList, } = data
		const assetsWithUsdValue = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const assetPayload = assetParser<ILoanAsset>(asset,)
				if (assetPayload) {
					const maturity = new Date(assetPayload.maturityDate,)
					if (maturity < new Date()) {
						return null
					}
					if (filters.currencies && !filters.currencies.includes(assetPayload.currency,)) {
						return null
					}
					if (filters.loanNames && !filters.loanNames.includes(assetPayload.loanName,)) {
						return null
					}
					if (assetPayload.startDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(assetPayload.startDate,)) {
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
					totalAssets = totalAssets + usdValue
					return {
						id:               asset.id,
						portfolioName:    asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:       asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
						accountName:      asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
						bankName:         asset.bank?.bankName,
						name:             assetPayload.loanName,
						startDate:        assetPayload.startDate,
						maturityDate:     assetPayload.maturityDate,
						currency: 		      assetPayload.currency,
						currencyValue: 		   assetPayload.currencyValue,
						usdValue,
						interest:		       assetPayload.interest,
						todayInterest:    assetPayload.todayInterest,
						maturityInterest:  assetPayload.maturityInterest,
					} as ILoanAnalytic
				}
				return null
			},)
			.filter((item,): item is ILoanAnalytic => {
				return item !== null
			},)
			.sort((a, b,) => {
				let aValue: number
				let bValue: number

				switch (filters.sortBy) {
				case TLoanTableSortVariants.START_DATE:
					aValue = new Date(a.startDate,).getTime()
					bValue = new Date(b.startDate,).getTime()
					break
				case TLoanTableSortVariants.MATURITY_DATE:
					aValue = new Date(a.maturityDate,).getTime()
					bValue = new Date(b.maturityDate,).getTime()
					break
				case TLoanTableSortVariants.USD_VALUE:
					aValue = a.usdValue
					bValue = b.usdValue
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
			list:             assetsWithUsdValue,
			totalAssets,
		}
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetBankAnalytics(data: TAssetCacheInitials, filter: LoanCurrencyFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<ILoanAsset>(asset,)
				if (parsedPayload) {
					const maturity = new Date(parsedPayload.maturityDate,)
					if (maturity < new Date()) {
						return null
					}
					if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
						return null
					}
					if (filter.loanNames && !filter.loanNames.includes(parsedPayload.loanName,)) {
						return null
					}
					if (parsedPayload.startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedPayload.startDate,)) {
						return null
					}
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      parsedPayload.currency,
						currencyValue: Number(parsedPayload.currencyValue,),
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
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetCurrencyAnalytics(data: TAssetCacheInitials,  filter: LoanCurrencyFilterDto, clientId?: string,): Array<TCurrencyAnalytics> {
		const {assets, currencyList,} = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<ILoanAsset>(asset,)
				if (parsedPayload) {
					const maturity = new Date(parsedPayload.maturityDate,)
					if (maturity < new Date()) {
						return null
					}
					if (filter.currencies && !filter.currencies.includes(parsedPayload.currency,)) {
						return null
					}
					if (filter.loanNames && !filter.loanNames.includes(parsedPayload.loanName,)) {
						return null
					}
					if (parsedPayload.startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedPayload.startDate,)) {
						return null
					}
					const {currency, currencyValue,} = parsedPayload
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency,
						currencyValue: Number(currencyValue,),
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