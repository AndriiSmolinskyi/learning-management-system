/* eslint-disable max-lines */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma, } from '@prisma/client'

import { CBondsCurrencyService, } from '../../apis/cbonds-api/services'

import type { PrivateEquityFilterSelectsBySourceIdsDto, RealEstateFilterDto, } from '../dto'
import type {
	TCityAnalytics,
	TCurrencyAnalytics,
	TRealEstateAssetAnalytics,
} from '../analytics.types'
import { assetParser, } from '../../../shared/utils'
import type {
	IRealEstateFilterSelects,
} from '../../asset/asset.types'
import {
	AssetNamesType,
	type IRealEstateAsset,
	type TAssetExtended,
} from '../../asset/asset.types'
import { endOfDay, } from 'date-fns'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TAssetCacheInitials, } from '../../../modules/common/cache-sync/cache-sync.types'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'

@Injectable()
export class RealEstateService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
 * 3.5.4
 * Filters real estate assets based on the provided filter criteria.
 * @remarks
 * - Filters assets based on various criteria, such as asset type, portfolio, bank, country, city, and date range.
 * @param filter - The filter criteria for retrieving assets.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of filtered real estate assets.
 */
	private async getFilteredAssets(filter: RealEstateFilterDto, clientId?: string,): Promise<Array<TAssetExtended>> {
		if (
			filter.clientIds?.length === 0 ||
			filter.portfolioIds?.length === 0 ||
			filter.bankIds?.length === 0 ||
			filter.bankListIds?.length === 0 ||
			filter.accountIds?.length === 0 ||
			filter.currencies?.length === 0 ||
			filter.operations?.length === 0 ||
			filter.projectTransactions?.length === 0 ||
			filter.countries?.length === 0 ||
			filter.cities?.length === 0 ||
			filter.assetIds?.length === 0
		) {
			return []
		}

		const where: Prisma.AssetWhereInput = {
			isArchived:  false,
			assetName:  filter.type,
			id:         {
				in: filter.assetIds,
			},
			portfolioId: {
				in: filter.portfolioIds,
			},
			entityId: {
				in: filter.entityIds,
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
		}

		return this.prismaService.asset.findMany({
			where,
			include: {
				portfolio: true,
				entity:    true,
				bank:      true,
				account:   true,
			},
		},)
	}

	/**
 * 3.5.4
 * Parses and filters real estate assets based on the provided filter criteria.
 * @remarks
 * - Filters assets by currency, operation, project transaction, country, and city.
 * @param filter - The filter criteria for retrieving and filtering real estate assets.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of parsed and filtered real estate assets.
 */
	private async parseAndFilterAssets(filter: RealEstateFilterDto, clientId?: string,): Promise<Array<IRealEstateAsset>> {
		const assets = await this.getFilteredAssets(filter, clientId,)

		const analyticsData = assets
			.map((asset,) => {
				const parsedAsset = assetParser<IRealEstateAsset>(asset,)

				if (!parsedAsset) {
					return null
				}

				if (
					filter.currencies &&
					!filter.currencies.includes(parsedAsset.currency,
					)) {
					return null
				}

				if (
					filter.operations &&
					parsedAsset.operation &&
					!filter.operations.includes(parsedAsset.operation,)
				) {
					return null
				}

				if (
					filter.projectTransactions &&
					!filter.projectTransactions.includes(parsedAsset.projectTransaction,)
				) {
					return null
				}

				if (
					filter.countries &&
					parsedAsset.country &&
					!filter.countries.includes(parsedAsset.country,)
				) {
					return null
				}

				if (
					filter.cities &&
					parsedAsset.city &&
					!filter.cities.includes(parsedAsset.city,)
				) {
					return null
				}
				if (parsedAsset.investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedAsset.investmentDate,)) {
					return null
				}

				return parsedAsset
			},)
			.filter((item,): item is IRealEstateAsset => {
				return item !== null
			},)

		return analyticsData
	}

	/**
 * 3.5.4
 * Retrieves currency analytics based on the provided filter criteria.
 * @remarks
 * - Filters assets using `parseAndFilterAssets`, then calculates the USD value for each asset.
 * - Returns analytics data including currency, currency value, and USD value.
 * @param filter - The filter criteria for retrieving currency analytics.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of currency analytics data.
 */
	// todo: clear if new version good
	// public async getCurrencyAnalytics(
	// 	filter: RealEstateFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TCurrencyAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetRealEstateVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:                true,
	// 					assetRealEstateId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const assetIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetRealEstateId
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

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] = await Promise.all([
	// 				this.prismaService.assetRealEstate.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entityIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						bankId:      { in: filter.bankIds, },
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
	// 						operation: {
	// 							in: filter.operations,
	// 						},
	// 						country: {
	// 							in: filter.countries,
	// 						},
	// 						city: {
	// 							in: filter.cities,
	// 						},
	// 						projectTransaction: {
	// 							in: filter.projectTransactions,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						AND: [
	// 							{
	// 								investmentDate: {
	// 									lte: endOfDay(filterDate,),
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
	// 				},),
	// 				this.prismaService.assetRealEstate.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entityIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						bankId:      { in: filter.bankIds, },
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
	// 						operation: {
	// 							in: filter.operations,
	// 						},
	// 						country: {
	// 							in: filter.countries,
	// 						},
	// 						city: {
	// 							in: filter.cities,
	// 						},
	// 						projectTransaction: {
	// 							in: filter.projectTransactions,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						versions: {
	// 							some: {
	// 								investmentDate: {
	// 									lte: endOfDay(filterDate,),
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
	// 								createdAt: { lte: endOfDay(filterDate,), },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 						},
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 			],)

	// 			const mergedAssets = [
	// 				...assetsWithVersion,
	// 				...assetsNoVersion.map((asset,) => {
	// 					return { ...asset, versions: [], }
	// 				},),
	// 			]

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const analyticsData = (mergedAssets as Array<any>).map((asset,) => {
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

	// 			return analyticsData
	// 		}

	// 		const reAssets = await this.prismaService.assetRealEstate.findMany({
	// 			where: {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entityIds, },
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
	// 				operation: {
	// 					in: filter.operations,
	// 				},
	// 				country: {
	// 					in: filter.countries,
	// 				},
	// 				city: {
	// 					in: filter.cities,
	// 				},
	// 				projectTransaction: {
	// 					in: filter.projectTransactions,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 			},
	// 		},)

	// 		const assetsWithUsdValue = reAssets.map((asset,) => {
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
		filter: RealEstateFilterDto,
		clientId?: string,
	): Promise<Array<TCurrencyAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetRealEstateVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:                true,
						assetRealEstateId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const assetIdsFromVersions = versions
						.map((v,) => {
							return v.assetRealEstateId
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

				const [assetsNoVersion, assetsWithVersion, currencyList,] = await Promise.all([
					this.prismaService.assetRealEstate.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
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
							operation: {
								in: filter.operations,
							},
							country: {
								in: filter.countries,
							},
							city: {
								in: filter.cities,
							},
							projectTransaction: {
								in: filter.projectTransactions,
							},
							usdValue: {
								not: 0,
							},
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
					this.prismaService.assetRealEstate.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
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
							operation: {
								in: filter.operations,
							},
							country: {
								in: filter.countries,
							},
							city: {
								in: filter.cities,
							},
							projectTransaction: {
								in: filter.projectTransactions,
							},
							usdValue: {
								not: 0,
							},
							OR: [
								{ transferDate: { gte: endDate, }, },
								{ transferDate: null, },
							],
							versions: {
								some: {
									investmentDate: {
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
									createdAt: { lte: endDate, },
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
					...assetsNoVersion.map((asset,) => {
						return { ...asset, versions: [], }
					},),
				]

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const analyticsData = (mergedAssets as Array<any>).map((asset,) => {
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

				return analyticsData
			}

			const reAssets = await this.prismaService.assetRealEstate.findMany({
				where: {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
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
					operation: {
						in: filter.operations,
					},
					country: {
						in: filter.countries,
					},
					city: {
						in: filter.cities,
					},
					projectTransaction: {
						in: filter.projectTransactions,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
				},
			},)

			const assetsWithUsdValue = reAssets.map((asset,) => {
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
 * 3.5.4
 * Retrieves city analytics based on the provided filter criteria.
 * @remarks
 * - Filters assets using `parseAndFilterAssets` and calculates the USD value for each asset.
 * - Returns analytics data for each city, including the city name and USD value.
 * @param filter - The filter criteria for retrieving city analytics.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of city analytics data.
 */
	// todo: clear if new version good
	// public async getCityAnalytics(
	// 	filter: RealEstateFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TCityAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetRealEstateVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:                true,
	// 					assetRealEstateId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const assetIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetRealEstateId
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

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] = await Promise.all([
	// 				this.prismaService.assetRealEstate.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entityIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						bankId:      { in: filter.bankIds, },
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
	// 						operation: {
	// 							in: filter.operations,
	// 						},
	// 						country: {
	// 							in: filter.countries,
	// 						},
	// 						city: {
	// 							in: filter.cities,
	// 						},
	// 						projectTransaction: {
	// 							in: filter.projectTransactions,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						AND: [
	// 							{
	// 								investmentDate: {
	// 									lte: endOfDay(filterDate,),
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
	// 				},),
	// 				this.prismaService.assetRealEstate.findMany({
	// 					where: {
	// 						...(hasAssetIdsFilter ?
	// 							{ id: { in: resolvedAssetIds, }, } :
	// 							{}),
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entityIds, },
	// 						accountId:   { in: filter.accountIds, },
	// 						bankId:      { in: filter.bankIds, },
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
	// 						operation: {
	// 							in: filter.operations,
	// 						},
	// 						country: {
	// 							in: filter.countries,
	// 						},
	// 						city: {
	// 							in: filter.cities,
	// 						},
	// 						projectTransaction: {
	// 							in: filter.projectTransactions,
	// 						},
	// 						usdValue: {
	// 							not: 0,
	// 						},
	// 						versions: {
	// 							some: {
	// 								investmentDate: {
	// 									lte: endOfDay(filterDate,),
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
	// 								createdAt: { lte: endOfDay(filterDate,), },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 						},
	// 					},
	// 				},),
	// 				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 			],)

	// 			const mergedAssets = [
	// 				...assetsWithVersion,
	// 				...assetsNoVersion.map((asset,) => {
	// 					return { ...asset, versions: [], }
	// 				},),
	// 			]

	// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 			const analyticsData = (mergedAssets as Array<any>).map((asset,) => {
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
	// 						city:     version.city,
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
	// 					city:     asset.city,
	// 					usdValue,
	// 				}
	// 			},)

	// 			return analyticsData
	// 		}

	// 		const reAssets = await this.prismaService.assetRealEstate.findMany({
	// 			where: {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entityIds, },
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
	// 				operation: {
	// 					in: filter.operations,
	// 				},
	// 				country: {
	// 					in: filter.countries,
	// 				},
	// 				city: {
	// 					in: filter.cities,
	// 				},
	// 				projectTransaction: {
	// 					in: filter.projectTransactions,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 			},
	// 		},)

	// 		const assetsWithUsdValue = reAssets.map((asset,) => {
	// 			return {
	// 				city:     asset.city,
	// 				usdValue: asset.marketValueUSD,
	// 			}
	// 		},)

	// 		return assetsWithUsdValue
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getCityAnalytics(
		filter: RealEstateFilterDto,
		clientId?: string,
	): Promise<Array<TCityAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetRealEstateVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:                true,
						assetRealEstateId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const assetIdsFromVersions = versions
						.map((v,) => {
							return v.assetRealEstateId
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

				const [assetsNoVersion, assetsWithVersion, currencyList,] = await Promise.all([
					this.prismaService.assetRealEstate.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
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
							operation: {
								in: filter.operations,
							},
							country: {
								in: filter.countries,
							},
							city: {
								in: filter.cities,
							},
							projectTransaction: {
								in: filter.projectTransactions,
							},
							usdValue: {
								not: 0,
							},
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
					this.prismaService.assetRealEstate.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
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
							operation: {
								in: filter.operations,
							},
							country: {
								in: filter.countries,
							},
							city: {
								in: filter.cities,
							},
							projectTransaction: {
								in: filter.projectTransactions,
							},
							usdValue: {
								not: 0,
							},
							OR: [
								{ transferDate: { gte: endDate, }, },
								{ transferDate: null, },
							],
							versions: {
								some: {
									investmentDate: {
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
									createdAt: { lte: endDate, },
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
					...assetsNoVersion.map((asset,) => {
						return { ...asset, versions: [], }
					},),
				]

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const analyticsData = (mergedAssets as Array<any>).map((asset,) => {
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
							city:     version.city,
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
						city:     asset.city,
						usdValue,
					}
				},)

				return analyticsData
			}

			const reAssets = await this.prismaService.assetRealEstate.findMany({
				where: {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
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
					operation: {
						in: filter.operations,
					},
					country: {
						in: filter.countries,
					},
					city: {
						in: filter.cities,
					},
					projectTransaction: {
						in: filter.projectTransactions,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
				},
			},)

			const assetsWithUsdValue = reAssets.map((asset,) => {
				return {
					city:     asset.city,
					usdValue: asset.marketValueUSD,
				}
			},)

			return assetsWithUsdValue
		} catch (error) {
			return []
		}
	}

	/**
 * 3.5.4
 * Retrieves asset analytics based on the provided filter criteria.
 * @remarks
 * - Filters assets using `parseAndFilterAssets`.
 * - For each asset, calculates the market USD value, profit in USD, and profit percentage.
 * @param filter - The filter criteria for retrieving asset analytics.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of asset analytics data for real estate assets.
 */
	// todo: clear if new version good
	// public async getAssetAnalytics(
	// 	filter: RealEstateFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TRealEstateAssetAnalytics>> {
	// 	try {
	// 		if (filter.date) {
	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetRealEstate.findMany({
	// 				where: {
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
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
	// 					operation: {
	// 						in: filter.operations,
	// 					},
	// 					country: {
	// 						in: filter.countries,
	// 					},
	// 					city: {
	// 						in: filter.cities,
	// 					},
	// 					projectTransaction: {
	// 						in: filter.projectTransactions,
	// 					},
	// 					usdValue: {
	// 						not: 0,
	// 					},
	// 					AND: [
	// 						{
	// 							investmentDate: {
	// 								lte: endOfDay(new Date(filter.date,),),
	// 							},
	// 						},
	// 					],
	// 					versions: {
	// 						none: {},
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
	// 				orderBy: {
	// 					[filter.sortBy as string]: filter.sortOrder,
	// 				},
	// 			},),
	// 			this.prismaService.assetRealEstate.findMany({
	// 				where: {
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
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
	// 					operation: {
	// 						in: filter.operations,
	// 					},
	// 					country: {
	// 						in: filter.countries,
	// 					},
	// 					city: {
	// 						in: filter.cities,
	// 					},
	// 					projectTransaction: {
	// 						in: filter.projectTransactions,
	// 					},
	// 					usdValue: {
	// 						not: 0,
	// 					},
	// 					versions: {
	// 						some: {
	// 							investmentDate: {
	// 								lte: endOfDay(new Date(filter.date,),),
	// 							},
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
	// 							createdAt: {
	// 								lte: endOfDay(new Date(filter.date,),),
	// 							},
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
	// 				orderBy: {
	// 					[filter.sortBy as string]: filter.sortOrder,
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

	// 					const marketUsdValue = parseFloat(
	// 						(version.currencyValue * rate).toFixed(2,),
	// 					)

	// 					const profitUsd = parseFloat(
	// 						(
	// 							Math.round((marketUsdValue - version.usdValue) * 100,) / 100
	// 						).toFixed(2,),
	// 					)

	// 					const profitPercentage = version.usdValue ?
	// 						parseFloat((profitUsd / version.usdValue * 100).toFixed(2,),) :
	// 						0

	// 					return {
	// 						id:                 version.id,
	// 						assetMainId:        asset.id,
	// 						portfolio:          this.cryptoService.decryptString(version.portfolio.name,),
	// 						entity:             this.cryptoService.decryptString(version.entity.name,),
	// 						account:            this.cryptoService.decryptString(version.account.accountName,),
	// 						bank:               version.bank.bankName,
	// 						country:            version.country,
	// 						city:               version.city,
	// 						projectTransaction: version.projectTransaction,
	// 						operation:          version.operation ?? 'N/A',
	// 						date:               version.investmentDate.toISOString(),
	// 						currency:           version.currency,
	// 						currencyValue:      version.currencyValue,
	// 						usdValue:           version.usdValue,
	// 						marketUsdValue,
	// 						marketValueFC:      version.marketValueFC,
	// 						profitUsd,
	// 						profitPercentage,
	// 					}
	// 				}

	// 				const currencyData: TCurrencyDataWithHistory | undefined =
	// 			currencyList.find((item,) => {
	// 				return item.currency === asset.currency
	// 			},)

	// 				const rate = currencyData ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					1

	// 				const marketUsdValue = parseFloat(
	// 					(asset.currencyValue * rate).toFixed(2,),
	// 				)

	// 				const profitUsd = parseFloat(
	// 					(
	// 						Math.round((marketUsdValue - asset.usdValue) * 100,) / 100
	// 					).toFixed(2,),
	// 				)

	// 				const profitPercentage = asset.usdValue ?
	// 					parseFloat((profitUsd / asset.usdValue * 100).toFixed(2,),) :
	// 					0

	// 				return {
	// 					id:                 asset.id,
	// 					portfolio:          this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entity:             this.cryptoService.decryptString(asset.entity.name,),
	// 					account:            this.cryptoService.decryptString(asset.account.accountName,),
	// 					bank:               asset.bank.bankName,
	// 					country:            asset.country,
	// 					city:               asset.city,
	// 					projectTransaction: asset.projectTransaction,
	// 					operation:          asset.operation ?? 'N/A',
	// 					date:               asset.investmentDate.toISOString(),
	// 					currency:           asset.currency,
	// 					currencyValue:      asset.currencyValue,
	// 					usdValue:           asset.usdValue,
	// 					marketUsdValue,
	// 					marketValueFC:      asset.marketValueFC,
	// 					profitUsd,
	// 					profitPercentage,
	// 				}
	// 			},)

	// 			return assetsWithUsdValue
	// 		}

	// 		const reAssets = await this.prismaService.assetRealEstate.findMany({
	// 			where: {
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entityIds, },
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
	// 				operation: {
	// 					in: filter.operations,
	// 				},
	// 				country: {
	// 					in: filter.countries,
	// 				},
	// 				city: {
	// 					in: filter.cities,
	// 				},
	// 				projectTransaction: {
	// 					in: filter.projectTransactions,
	// 				},
	// 				usdValue: {
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

	// 		const assetsWithUsdValue = reAssets
	// 			.map((asset,) => {
	// 				return {
	// 					id:                 asset.id,
	// 					portfolio:          this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entity:             this.cryptoService.decryptString(asset.entity.name,),
	// 					account:            this.cryptoService.decryptString(asset.account.accountName,),
	// 					bank:               asset.bank.bankName,
	// 					country:            asset.country,
	// 					city:               asset.city,
	// 					projectTransaction: asset.projectTransaction,
	// 					operation:          asset.operation ?? 'N/A',
	// 					date:               asset.investmentDate.toISOString(),
	// 					currency:           asset.currency,
	// 					currencyValue:      asset.currencyValue,
	// 					usdValue:           asset.usdValue,
	// 					marketUsdValue:     asset.marketValueUSD,
	// 					marketValueFC:      asset.marketValueFC,
	// 					profitUsd:          asset.profitUSD,
	// 					profitPercentage:   asset.profitPercentage,
	// 				}
	// 			},)

	// 		return assetsWithUsdValue
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	// public async getAssetAnalytics(
	// 	filter: RealEstateFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TRealEstateAssetAnalytics>> {
	// 	try {
	// 		if (filter.date) {
	// 			const filterDate = new Date(filter.date,)
	// 			const endDate = endOfDay(filterDate,)

	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetRealEstate.findMany({
	// 				where: {
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
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
	// 					operation: {
	// 						in: filter.operations,
	// 					},
	// 					country: {
	// 						in: filter.countries,
	// 					},
	// 					city: {
	// 						in: filter.cities,
	// 					},
	// 					projectTransaction: {
	// 						in: filter.projectTransactions,
	// 					},
	// 					usdValue: {
	// 						not: 0,
	// 					},
	// 					AND: [
	// 						{
	// 							investmentDate: {
	// 								lte: endDate,
	// 							},
	// 						},
	// 						{
	// 							OR: [
	// 								{ transferDate: { gte: endDate, }, },
	// 								{ transferDate: null, },
	// 							],
	// 						},
	// 					],
	// 					versions: {
	// 						none: {},
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
	// 				orderBy: {
	// 					[filter.sortBy as string]: filter.sortOrder,
	// 				},
	// 			},),
	// 			this.prismaService.assetRealEstate.findMany({
	// 				where: {
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
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
	// 					operation: {
	// 						in: filter.operations,
	// 					},
	// 					country: {
	// 						in: filter.countries,
	// 					},
	// 					city: {
	// 						in: filter.cities,
	// 					},
	// 					projectTransaction: {
	// 						in: filter.projectTransactions,
	// 					},
	// 					usdValue: {
	// 						not: 0,
	// 					},
	// 					OR: [
	// 						{ transferDate: { gte: endDate, }, },
	// 						{ transferDate: null, },
	// 					],
	// 					versions: {
	// 						some: {
	// 							investmentDate: {
	// 								lte: endDate,
	// 							},
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
	// 							createdAt: {
	// 								lte: endDate,
	// 							},
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
	// 				orderBy: {
	// 					[filter.sortBy as string]: filter.sortOrder,
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

	// 					const marketUsdValue = parseFloat(
	// 						(version.currencyValue * rate).toFixed(2,),
	// 					)

	// 					const profitUsd = parseFloat(
	// 						(
	// 							Math.round((marketUsdValue - version.usdValue) * 100,) / 100
	// 						).toFixed(2,),
	// 					)

	// 					const profitPercentage = version.usdValue ?
	// 						parseFloat((profitUsd / version.usdValue * 100).toFixed(2,),) :
	// 						0

	// 					return {
	// 						id:                 version.id,
	// 						assetMainId:        asset.id,
	// 						portfolio:          this.cryptoService.decryptString(version.portfolio.name,),
	// 						entity:             this.cryptoService.decryptString(version.entity.name,),
	// 						account:            this.cryptoService.decryptString(version.account.accountName,),
	// 						bank:               version.bank.bankName,
	// 						country:            version.country,
	// 						city:               version.city,
	// 						projectTransaction: version.projectTransaction,
	// 						operation:          version.operation ?? 'N/A',
	// 						date:               version.investmentDate.toISOString(),
	// 						currency:           version.currency,
	// 						currencyValue:      version.currencyValue,
	// 						usdValue:           version.usdValue,
	// 						marketUsdValue,
	// 						marketValueFC:      version.marketValueFC,
	// 						profitUsd,
	// 						profitPercentage,
	// 					}
	// 				}

	// 				const currencyData: TCurrencyDataWithHistory | undefined =
	// 			currencyList.find((item,) => {
	// 				return item.currency === asset.currency
	// 			},)

	// 				const rate = currencyData ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					1

	// 				const marketUsdValue = parseFloat(
	// 					(asset.currencyValue * rate).toFixed(2,),
	// 				)

	// 				const profitUsd = parseFloat(
	// 					(
	// 						Math.round((marketUsdValue - asset.usdValue) * 100,) / 100
	// 					).toFixed(2,),
	// 				)

	// 				const profitPercentage = asset.usdValue ?
	// 					parseFloat((profitUsd / asset.usdValue * 100).toFixed(2,),) :
	// 					0

	// 				return {
	// 					id:                 asset.id,
	// 					portfolio:          this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entity:             this.cryptoService.decryptString(asset.entity.name,),
	// 					account:            this.cryptoService.decryptString(asset.account.accountName,),
	// 					bank:               asset.bank.bankName,
	// 					country:            asset.country,
	// 					city:               asset.city,
	// 					projectTransaction: asset.projectTransaction,
	// 					operation:          asset.operation ?? 'N/A',
	// 					date:               asset.investmentDate.toISOString(),
	// 					currency:           asset.currency,
	// 					currencyValue:      asset.currencyValue,
	// 					usdValue:           asset.usdValue,
	// 					marketUsdValue,
	// 					marketValueFC:      asset.marketValueFC,
	// 					profitUsd,
	// 					profitPercentage,
	// 				}
	// 			},)

	// 			return assetsWithUsdValue
	// 		}

	// 		const reAssets = await this.prismaService.assetRealEstate.findMany({
	// 			where: {
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entityIds, },
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
	// 				operation: {
	// 					in: filter.operations,
	// 				},
	// 				country: {
	// 					in: filter.countries,
	// 				},
	// 				city: {
	// 					in: filter.cities,
	// 				},
	// 				projectTransaction: {
	// 					in: filter.projectTransactions,
	// 				},
	// 				usdValue: {
	// 					not: 0,
	// 				},
	// 				transferDate: null,
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

	// 		const assetsWithUsdValue = reAssets
	// 			.map((asset,) => {
	// 				return {
	// 					id:                 asset.id,
	// 					portfolio:          this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entity:             this.cryptoService.decryptString(asset.entity.name,),
	// 					account:            this.cryptoService.decryptString(asset.account.accountName,),
	// 					bank:               asset.bank.bankName,
	// 					country:            asset.country,
	// 					city:               asset.city,
	// 					projectTransaction: asset.projectTransaction,
	// 					operation:          asset.operation ?? 'N/A',
	// 					date:               asset.investmentDate.toISOString(),
	// 					currency:           asset.currency,
	// 					currencyValue:      asset.currencyValue,
	// 					usdValue:           asset.usdValue,
	// 					marketUsdValue:     asset.marketValueUSD,
	// 					marketValueFC:      asset.marketValueFC,
	// 					profitUsd:          asset.profitUSD,
	// 					profitPercentage:   asset.profitPercentage,
	// 				}
	// 			},)

	// 		return assetsWithUsdValue
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getAssetAnalytics(
		filter: RealEstateFilterDto,
		clientId?: string,
	): Promise<Array<TRealEstateAssetAnalytics>> {
		try {
			if (filter.date) {
				const filterDate = new Date(filter.date,)
				const endDate = endOfDay(filterDate,)

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetRealEstate.findMany({
						where: {
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
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
							operation: {
								in: filter.operations,
							},
							country: {
								in: filter.countries,
							},
							city: {
								in: filter.cities,
							},
							projectTransaction: {
								in: filter.projectTransactions,
							},
							usdValue: {
								not: 0,
							},
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
							[filter.sortBy as string]: filter.sortOrder,
						},
					},),
					this.prismaService.assetRealEstate.findMany({
						where: {
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
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
							operation: {
								in: filter.operations,
							},
							country: {
								in: filter.countries,
							},
							city: {
								in: filter.cities,
							},
							projectTransaction: {
								in: filter.projectTransactions,
							},
							usdValue: {
								not: 0,
							},
							OR: [
								{ transferDate: { gte: endDate, }, },
								{ transferDate: null, },
							],
							versions: {
								some: {
									investmentDate: {
										lte: endDate,
									},
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
									createdAt: {
										lte: endDate,
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
									createdAt: 'desc',
								},
								take: 1,
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
				const assetsWithUsdValue = mergedAssets.map((asset: any,) => {
					const version = asset.versions?.[0]

					// eslint-disable-next-line no-unused-vars
					const isTransferred = asset.transferDate ?
						new Date(asset.transferDate,).getTime() <= endDate.getTime() :
						false

					if (version) {
						const currencyData: TCurrencyDataWithHistory | undefined =
						currencyList.find((item,) => {
							return item.currency === version.currency
						},)

						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1

						const marketUsdValue = parseFloat(
							(version.currencyValue * rate).toFixed(2,),
						)

						const profitUsd = parseFloat(
							(
								Math.round((marketUsdValue - version.usdValue) * 100,) / 100
							).toFixed(2,),
						)

						const profitPercentage = version.usdValue ?
							parseFloat((profitUsd / version.usdValue * 100).toFixed(2,),) :
							0

						return {
							id:                 version.id,
							assetMainId:        asset.id,
							portfolio:          this.cryptoService.decryptString(version.portfolio.name,),
							entity:             this.cryptoService.decryptString(version.entity.name,),
							account:            this.cryptoService.decryptString(version.account.accountName,),
							bank:               version.bank.bankName,
							country:            version.country,
							city:               version.city,
							projectTransaction: version.projectTransaction,
							operation:          version.operation ?? 'N/A',
							date:               version.investmentDate.toISOString(),
							currency:           version.currency,
							currencyValue:      version.currencyValue,
							usdValue:           version.usdValue,
							marketUsdValue,
							marketValueFC:      version.marketValueFC,
							profitUsd,
							profitPercentage,
							isTransferred:      Boolean(asset.transferDate,),
						}
					}

					const currencyData: TCurrencyDataWithHistory | undefined =
					currencyList.find((item,) => {
						return item.currency === asset.currency
					},)

					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1

					const marketUsdValue = parseFloat(
						(asset.currencyValue * rate).toFixed(2,),
					)

					const profitUsd = parseFloat(
						(
							Math.round((marketUsdValue - asset.usdValue) * 100,) / 100
						).toFixed(2,),
					)

					const profitPercentage = asset.usdValue ?
						parseFloat((profitUsd / asset.usdValue * 100).toFixed(2,),) :
						0

					return {
						id:                 asset.id,
						portfolio:          this.cryptoService.decryptString(asset.portfolio.name,),
						entity:             this.cryptoService.decryptString(asset.entity.name,),
						account:            this.cryptoService.decryptString(asset.account.accountName,),
						bank:               asset.bank.bankName,
						country:            asset.country,
						city:               asset.city,
						projectTransaction: asset.projectTransaction,
						operation:          asset.operation ?? '- -',
						date:               asset.investmentDate.toISOString(),
						currency:           asset.currency,
						currencyValue:      asset.currencyValue,
						usdValue:           asset.usdValue,
						marketUsdValue,
						marketValueFC:      asset.marketValueFC,
						profitUsd,
						profitPercentage,
						isTransferred:      Boolean(asset.transferDate,),
					}
				},)

				return assetsWithUsdValue
			}

			const reAssets = await this.prismaService.assetRealEstate.findMany({
				where: {
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
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
					operation: {
						in: filter.operations,
					},
					country: {
						in: filter.countries,
					},
					city: {
						in: filter.cities,
					},
					projectTransaction: {
						in: filter.projectTransactions,
					},
					usdValue: {
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

			const assetsWithUsdValue = reAssets
				.map((asset,) => {
					return {
						id:                 asset.id,
						portfolio:          this.cryptoService.decryptString(asset.portfolio.name,),
						entity:             this.cryptoService.decryptString(asset.entity.name,),
						account:            this.cryptoService.decryptString(asset.account.accountName,),
						bank:               asset.bank.bankName,
						country:            asset.country,
						city:               asset.city,
						projectTransaction: asset.projectTransaction,
						operation:          asset.operation ?? '- -',
						date:               asset.investmentDate.toISOString(),
						currency:           asset.currency,
						currencyValue:      asset.currencyValue,
						usdValue:           asset.usdValue,
						marketUsdValue:     asset.marketValueUSD,
						marketValueFC:      asset.marketValueFC,
						profitUsd:          asset.profitUSD,
						profitPercentage:   asset.profitPercentage,
						isTransferred:      Boolean(asset.transferDate,),
					}
				},)

			return assetsWithUsdValue
		} catch (error) {
			return []
		}
	}

	/**
	 * 3.5.3
	 * Retrieves filter values for real estate assets associated with the specified bank IDs.
	 *
	 * @remarks
	 * - Filters assets based on the provided bank IDs and the asset name `REAL_ESTATE`.
	 * - Parses the `payload` field of each matching asset to extract real estate filter values.
	 * - Returns an array of objects containing operation, project transaction, country, and city details.
	 * - If an error occurs during processing, an empty array is returned.
	 *
	 * @param ids - Array of bank IDs to filter the real estate assets.
	 * @returns A Promise that resolves to an array of filter values for real estate assets.
	 */
	public async getRealEstateFilterValuesBySourceIds(filter: PrivateEquityFilterSelectsBySourceIdsDto, clientId?: string,): Promise<IRealEstateFilterSelects> {
		const assets = await this.prismaService.assetRealEstate.findMany({
			where: {
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				usdValue: {
					not: 0,
				},
				transferDate: null,
			},
		},)
		try {
			const newAssets =  assets.map((asset,) => {
				return {
					operation:          asset.operation,
					projectTransaction: asset.projectTransaction,
					country:            asset.country,
					city:               asset.city,
				}
			},)
			const operations = newAssets.map((item,) => {
				return item.operation
			},)
				.filter((value, index, self,): value is string => {
					return value !== null && self.indexOf(value,) === index
				},)
			const projectTransactions = newAssets.map((item,) => {
				return item.projectTransaction
			},)
				.filter((value, index, self,) => {
					return self.findIndex((item,) => {
						return item === value
					},) === index
				},)
			const countries = newAssets.map((item,) => {
				return item.country
			},)
				.filter((value, index, self,): value is string => {
					return self.indexOf(value,) === index
				},)
			const cities = newAssets.map((item,) => {
				return item.city
			},)
				.filter((value, index, self,): value is string => {
					return self.indexOf(value,) === index
				},)
			return {
				operations,
				projectTransactions,
				countries,
				cities,
			}
		} catch (error) {
			return {
				operations:          [],
				projectTransactions: [],
				countries:           [],
				cities:              [],
			}
		}
	}

	public async getRealIncome(filter: RealEstateFilterDto, clientId?: string,): Promise<number> {
		const selectedDate = filter.date ?
			new Date(filter.date,) :
			new Date()
		const year = selectedDate.getFullYear()

		const startOfYear = new Date(Date.UTC(year, 0, 1,),)
		const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999,),)
		const transactionsPromise = this.prismaService.transaction.findMany({
			where: {
				portfolioId: {
					in: filter.portfolioIds,
				},
				entityId: {
					in: filter.entityIds,
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
					annualAssets: { has: AssetNamesType.REAL_ESTATE, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)

		const [transactions,] = await Promise.all([
			transactionsPromise,
		],)

		const annualIncome = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return annualIncome
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	private syncParseAndFilterAssets(assets: Array<TAssetExtended>,): Array<IRealEstateAsset> {
		const analyticsData = assets
			.map((asset,) => {
				const parsedAsset = assetParser<IRealEstateAsset>(asset,)
				if (!parsedAsset) {
					return null
				}
				return parsedAsset
			},)
			.filter((item,): item is IRealEstateAsset => {
				return item !== null
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
	public syncGetAssetAnalytics(data: TAssetCacheInitials ,filter: RealEstateFilterDto, clientId?: string,): Array<TRealEstateAssetAnalytics> {
		const {assets, currencyList,} = data
		const parsedAssets = this.syncParseAndFilterAssets(assets,)
		return parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				if (!asset.portfolio || !asset.entity || !asset.bank || !asset.account) {
					return null
				}
				const marketUsdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					currencyList,
					historyDate:   filter.date,
				},)
				const profitUsd = Number((Math.round((marketUsdValue - asset.usdValue) * 100,) / 100).toFixed(2,),)
				const profitPercentage = profitUsd / asset.usdValue * 100
				return {
					id:                 asset.id,
					portfolio:          this.cryptoService.decryptString(asset.portfolio.name,),
					entity:             this.cryptoService.decryptString(asset.entity.name,),
					account:            this.cryptoService.decryptString(asset.account.accountName,),
					bank:               asset.bank.bankName,
					country:            asset.country,
					city:               asset.city,
					projectTransaction: asset.projectTransaction,
					operation:          asset.operation,
					date:               asset.investmentDate ?
						new Date(asset.investmentDate,) :
						'N/A',
					currency:           asset.currency,
					currencyValue:      asset.currencyValue,
					usdValue:           asset.usdValue,
					marketUsdValue,
					marketValueFC: asset.marketValueFC,
					profitUsd,
					profitPercentage,
				} as TRealEstateAssetAnalytics
			},)
			.filter((item,): item is TRealEstateAssetAnalytics => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
	}

	/**
	 * CR -114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetCurrencyAnalytics(data: TAssetCacheInitials,filter: RealEstateFilterDto, clientId?: string,): Array<TCurrencyAnalytics> {
		const {assets, currencyList,} = data
		const parsedAssets = this.syncParseAndFilterAssets(assets,)
		return parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue,
				}
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
	}

	/**
	 * CR -114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetCityAnalytics(data: TAssetCacheInitials,filter: RealEstateFilterDto, clientId?: string,): Array<TCityAnalytics> {
		const {assets,currencyList,} = data
		const parsedAssets = this.syncParseAndFilterAssets(assets,)
		const analyticsData = parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				if (!asset.city) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					city: asset.city,
					usdValue,
				}
			},)
			.filter((item,): item is TCityAnalytics => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
		return analyticsData
	}
}