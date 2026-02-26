/* eslint-disable max-lines */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma, } from '@prisma/client'

import { CBondsCurrencyService, } from '../../apis/cbonds-api/services'
import type { OptionPairsBySourceIdsDto, OptionsFilterDto, } from '../dto'
import type {
	TBankAnalytics,
	TMaturityAnalytics,
	TOptionsAssetAnalytics,
} from '../analytics.types'
import { assetParser, } from '../../../shared/utils'
import {
	AssetNamesType,
	type IOptionAsset,
	type TAssetExtended,
} from '../../asset/asset.types'
import { endOfDay, } from 'date-fns'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TAssetCacheInitials, } from '../../../modules/common/cache-sync/cache-sync.types'
import type { TCurrencyDataWithHistory, } from 'src/modules/apis/cbonds-api/cbonds-api.types'
import type { AssetOption, } from '@prisma/client'

@Injectable()
export class OptionsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
 * 3.5.4
 * Retrieves filtered assets based on the provided filter criteria.
 * @remarks
 * - Filters assets based on asset IDs, client IDs, portfolio IDs, entity IDs, bank IDs, and date range.
 * - Ensures the assets belong to activated portfolios and are not archived.
 * @param filter - The filter criteria for retrieving assets.
 * @param clientId - An optional client ID to filter the assets.
 * @returns A Promise resolving to an array of filtered assets.
 */
	private async getFilteredAssets(filter: OptionsFilterDto, clientId?: string,): Promise<Array<TAssetExtended>> {
		if (
			filter.clientIds?.length === 0 ||
			filter.portfolioIds?.length === 0 ||
			filter.bankIds?.length === 0 ||
			filter.entityIds?.length === 0 ||
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
			clientId: {
				in: clientId ?
					[clientId,] :
					filter.clientIds,
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
				bank:      {include: { bankList: true, },},
				account:   true,
			},
		},)
	}

	/**
 * Parses and filters assets based on the provided filter criteria.
 * @remarks
 * - Filters assets by pairs (if provided) and maturity year (if provided).
 * - Maps through the filtered assets, parses them using the asset parser, and removes invalid or unmatching assets.
 * @param filter - The filter criteria for parsing and filtering assets.
 * @param clientId - An optional client ID to further filter the assets.
 * @returns A Promise resolving to an array of filtered and parsed assets.
 */
	private async parseAndFilterAssets(filter: OptionsFilterDto, clientId?: string,): Promise<Array<IOptionAsset>> {
		const assets = await this.getFilteredAssets(filter, clientId,)

		const parsedAssets = assets
			.map((asset,) => {
				const parsedAsset = assetParser<IOptionAsset>(asset,)

				if (!parsedAsset) {
					return null
				}
				if (
					filter.pairs &&
					parsedAsset.pairAssetCurrency &&
					!filter.pairs.includes(parsedAsset.pairAssetCurrency,)
				) {
					return null
				}
				if (parsedAsset.startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(parsedAsset.startDate,)) {
					return null
				}
				if (
					filter.maturityYear &&
					new Date(parsedAsset.maturityDate,).getUTCFullYear()  !== Number(filter.maturityYear,)
				) {
					return null
				}

				return parsedAsset
			},)
			.filter((item,): item is IOptionAsset => {
				return item !== null
			},)

		return parsedAssets
	}

	/**
 * 3.5.4
 * Retrieves bank analytics based on the provided filter.
 * @remarks
 * - Filters assets based on the provided filter and extracts relevant bank analytics.
 * - Converts the market value of assets to USD using the currency exchange service.
 * @param filter - The filter criteria for retrieving bank analytics.
 * @param clientId - An optional client ID to filter the results.
 * @returns A Promise resolving to an array of bank analytics, including USD values.
 */
	// todo: clear if new version good
	// public async getBankAnalytics(
	// 	filter: OptionsFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TBankAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetOptionVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:            true,
	// 					assetOptionId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const optionIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetOptionId
	// 					},)
	// 					.filter((id,): id is string => {
	// 						return Boolean(id,)
	// 					},)

	// 				const originalOptionIds = filter.assetIds.filter((id,) => {
	// 					return !versionIdSet.has(id,)
	// 				},)

	// 				resolvedAssetIds = Array.from(
	// 					new Set([...originalOptionIds, ...optionIdsFromVersions,],),
	// 				)
	// 			}
	// 		}

	// 		if (filter.date) {
	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetOption.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
	// 					accountId:   { in: filter.accountIds, },
	// 					bankId:      { in: filter.bankIds, },

	// 					...(clientId ?
	// 						{ client: { id: clientId, }, } :
	// 						{}),

	// 					bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 					portfolio: { isActivated: true, },

	// 					pairAssetCurrency: { in: filter.pairs, },

	// 					marketValueUSD: { not: 0, },

	// 					AND: [
	// 						{ startDate: { lte: endOfDay(new Date(filter.date,),), }, },
	// 						{ maturityDate: { gt: new Date(filter.date,), }, },
	// 						filter.maturityYear ?
	// 							{
	// 								maturityDate: {
	// 									gte: new Date(`${filter.maturityYear}-01-01`,),
	// 									lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
	// 								},
	// 							} :
	// 							{},
	// 					],

	// 					versions: { none: {}, },
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
	// 			this.prismaService.assetOption.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
	// 					accountId:   { in: filter.accountIds, },
	// 					bankId:      { in: filter.bankIds, },

	// 					...(clientId ?
	// 						{ client: { id: clientId, }, } :
	// 						{}),

	// 					bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 					portfolio: { isActivated: true, },

	// 					pairAssetCurrency: { in: filter.pairs, },

	// 					versions: {
	// 						some: {
	// 							startDate:    { lte: endOfDay(new Date(filter.date,),), },
	// 							maturityDate: { gt: new Date(filter.date,), },
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
	// 							createdAt: { lte: endOfDay(new Date(filter.date,),), },
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
	// 					currencyList.find((c,) => {
	// 						return c.currency === version.currency
	// 					},)

	// 						const rate = currencyData?.rate ?? 1

	// 						const usdValue = parseFloat(
	// 							(version.currentMarketValue * rate).toFixed(2,),
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

	// 					const rate = currencyData?.rate ?? 1

	// 					const usdValue = parseFloat(
	// 						(asset.currentMarketValue * rate).toFixed(2,),
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

	// 		const optionAssets = await this.prismaService.assetOption.findMany({
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
	// 				pairAssetCurrency: {
	// 					in: filter.pairs,
	// 				},
	// 				marketValueUSD: {
	// 					not: 0,
	// 				},
	// 				AND: [
	// 					{ maturityDate: { gt: new Date(), }, },
	// 					filter.maturityYear ?
	// 						{
	// 							maturityDate: {
	// 								gte: new Date(`${filter.maturityYear}-01-01`,),
	// 								lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
	// 							},
	// 						} :
	// 						{},
	// 				],
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

	// 		return optionAssets
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
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getBankAnalytics(
		filter: OptionsFilterDto,
		clientId?: string,
	): Promise<Array<TBankAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetOptionVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:            true,
						assetOptionId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const optionIdsFromVersions = versions
						.map((v,) => {
							return v.assetOptionId
						},)
						.filter((id,): id is string => {
							return Boolean(id,)
						},)

					const originalOptionIds = filter.assetIds.filter((id,) => {
						return !versionIdSet.has(id,)
					},)

					resolvedAssetIds = Array.from(
						new Set([...originalOptionIds, ...optionIdsFromVersions,],),
					)
				}
			}
			const year = filter.maturityYear ?
				Number(filter.maturityYear,) :
				filter.maturityYear
			if (filter.date) {
				const endDate = endOfDay(new Date(filter.date,),)

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetOption.findMany({
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
								{ client: { id: clientId, }, } :
								{}),

							bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

							portfolio: { isActivated: true, },

							pairAssetCurrency: { in: filter.pairs, },

							marketValueUSD: { not: 0, },

							AND: [
								{ startDate: { lte: endDate, }, },
								{ maturityDate: { gt: new Date(filter.date,), }, },
								filter.maturityYear && year ?
									{
										maturityDate: {
											gte: new Date(year, 0, 1,),
											lt:  new Date(year + 1, 0, 1,),
										},
									} :
									{},
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
					this.prismaService.assetOption.findMany({
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
								{ client: { id: clientId, }, } :
								{}),

							bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

							portfolio: { isActivated: true, },

							pairAssetCurrency: { in: filter.pairs, },

							AND: [
								{
									OR: [
										{ transferDate: { gte: endDate, }, },
										{ transferDate: null, },
									],
								},
							],

							versions: {
								some: {
									startDate:    { lte: endDate, },
									maturityDate: { gt: new Date(filter.date,), },
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
						currencyList.find((c,) => {
							return c.currency === version.currency
						},)

							const rate = currencyData?.rate ?? 1

							const usdValue = parseFloat(
								(version.currentMarketValue * rate).toFixed(2,),
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

						const rate = currencyData?.rate ?? 1

						const usdValue = parseFloat(
							(asset.currentMarketValue * rate).toFixed(2,),
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

			const optionAssets = await this.prismaService.assetOption.findMany({
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
					pairAssetCurrency: {
						in: filter.pairs,
					},
					marketValueUSD: {
						not: 0,
					},
					transferDate: null,
					AND:          [
						{ maturityDate: { gt: new Date(), }, },
						filter.maturityYear && year ?
							{
								maturityDate: {
									gte: new Date(year, 0, 1,),
									lt:  new Date(year + 1, 0, 1,),
								},
							} :
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
			},)

			return optionAssets
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
		} catch (error) {
			return []
		}
	}

	/**
 * 3.5.4
 * Retrieves maturity analytics based on the provided filter.
 * @remarks
 * - Filters assets based on the provided filter and returns the maturity year along with the market value of each asset.
 * @param filter - The filter criteria for retrieving maturity analytics.
 * @param clientId - An optional client ID to filter the results.
 * @returns A Promise resolving to an array of maturity analytics, including the year and USD value.
 */
	// todo: clear if new version good
	// public async getMaturityAnalytics(
	// 	filter: OptionsFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TMaturityAnalytics>> {
	// 	try {
	// 		const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
	// 		let resolvedAssetIds = filter.assetIds

	// 		if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
	// 			const versions = await this.prismaService.assetOptionVersion.findMany({
	// 				where: {
	// 					id: { in: filter.assetIds, },
	// 				},
	// 				select: {
	// 					id:            true,
	// 					assetOptionId: true,
	// 				},
	// 			},)

	// 			if (versions.length) {
	// 				const versionIdSet = new Set(versions.map((v,) => {
	// 					return v.id
	// 				},),)
	// 				const optionIdsFromVersions = versions
	// 					.map((v,) => {
	// 						return v.assetOptionId
	// 					},)
	// 					.filter((id,): id is string => {
	// 						return Boolean(id,)
	// 					},)

	// 				const originalOptionIds = filter.assetIds.filter((id,) => {
	// 					return !versionIdSet.has(id,)
	// 				},)

	// 				resolvedAssetIds = Array.from(
	// 					new Set([...originalOptionIds, ...optionIdsFromVersions,],),
	// 				)
	// 			}
	// 		}

	// 		if (filter.date) {
	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 		await Promise.all([
	// 			this.prismaService.assetOption.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
	// 					accountId:   { in: filter.accountIds, },

	// 					...(clientId ?
	// 						{ client: { id: clientId, }, } :
	// 						{}),

	// 					bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 					portfolio: { isActivated: true, },

	// 					pairAssetCurrency: { in: filter.pairs, },

	// 					marketValueUSD: { not: 0, },

	// 					AND: [
	// 						{ startDate: { lte: endOfDay(new Date(filter.date,),), }, },
	// 						{ maturityDate: { gt: new Date(filter.date,), }, },
	// 						filter.maturityYear ?
	// 							{
	// 								maturityDate: {
	// 									gte: new Date(`${filter.maturityYear}-01-01`,),
	// 									lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
	// 								},
	// 							} :
	// 							{},
	// 					],

	// 					versions: { none: {}, },
	// 				},
	// 				select: {
	// 					id:                 true,
	// 					currency:           true,
	// 					currentMarketValue: true,
	// 					maturityDate:       true,
	// 				},
	// 			},),
	// 			this.prismaService.assetOption.findMany({
	// 				where: {
	// 					...(hasAssetIdsFilter ?
	// 						{ id: { in: resolvedAssetIds, }, } :
	// 						{}),
	// 					clientId:    { in: filter.clientIds, },
	// 					portfolioId: { in: filter.portfolioIds, },
	// 					entityId:    { in: filter.entityIds, },
	// 					accountId:   { in: filter.accountIds, },

	// 					...(clientId ?
	// 						{ client: { id: clientId, }, } :
	// 						{}),

	// 					bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 					portfolio: { isActivated: true, },

	// 					pairAssetCurrency: { in: filter.pairs, },

	// 					versions: {
	// 						some: {
	// 							startDate:          { lte: endOfDay(new Date(filter.date,),), },
	// 							maturityDate:       { gt: new Date(filter.date,), },
	// 							currentMarketValue: { not: 0, },
	// 							...(filter.maturityYear ?
	// 								{
	// 									maturityDate: {
	// 										gte: new Date(`${filter.maturityYear}-01-01`,),
	// 										lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
	// 									},
	// 								} :
	// 								{}),
	// 						},
	// 					},
	// 				},
	// 				select: {
	// 					id:       true,
	// 					currency: true,
	// 					versions: {
	// 						where: {
	// 							createdAt: { lte: endOfDay(new Date(filter.date,),), },
	// 						},
	// 						orderBy: { createdAt: 'desc', },
	// 						take:    1,
	// 						select:  {
	// 							id:                 true,
	// 							currency:           true,
	// 							currentMarketValue: true,
	// 							maturityDate:       true,
	// 						},
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
	// 			return mergedAssets.map((asset: any,) => {
	// 				const version = asset.versions?.[0]

	// 				if (version) {
	// 					const currencyData = currencyList.find((c,) => {
	// 						return c.currency === version.currency
	// 					},)
	// 					const rate = currencyData?.rate ?? 1
	// 					const usdValue = parseFloat(
	// 						(version.currentMarketValue * rate).toFixed(2,),
	// 					)

	// 					return {
	// 						year:     new Date(version.maturityDate,).getUTCFullYear(),
	// 						usdValue,
	// 					}
	// 				}

	// 				const currencyData = currencyList.find((c,) => {
	// 					return c.currency === asset.currency
	// 				},)
	// 				const rate = currencyData?.rate ?? 1
	// 				const usdValue = parseFloat(
	// 					(asset.currentMarketValue * rate).toFixed(2,),
	// 				)

	// 				return {
	// 					year:     new Date(asset.maturityDate,).getUTCFullYear(),
	// 					usdValue,
	// 				}
	// 			},)
	// 		}

	// 		const optionAssets = await this.prismaService.assetOption.findMany({
	// 			where: {
	// 				...(hasAssetIdsFilter ?
	// 					{ id: { in: resolvedAssetIds, }, } :
	// 					{}),
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entityIds, },
	// 				accountId:   { in: filter.accountIds, },

	// 				...(clientId ?
	// 					{ client: { id: clientId, }, } :
	// 					{}),

	// 				bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 				portfolio: { isActivated: true, },

	// 				pairAssetCurrency: { in: filter.pairs, },

	// 				marketValueUSD: { not: 0, },

	// 				AND: [
	// 					{ maturityDate: { gt: new Date(), }, },
	// 					filter.maturityYear ?
	// 						{
	// 							maturityDate: {
	// 								gte: new Date(`${filter.maturityYear}-01-01`,),
	// 								lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
	// 							},
	// 						} :
	// 						{},
	// 				],
	// 			},
	// 			select: {
	// 				maturityDate:   true,
	// 				marketValueUSD: true,
	// 			},
	// 		},)

	// 		return optionAssets.map((asset,) => {
	// 			return {
	// 				year:     new Date(asset.maturityDate,).getUTCFullYear(),
	// 				usdValue: asset.marketValueUSD,
	// 			}
	// 		},)
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getMaturityAnalytics(
		filter: OptionsFilterDto,
		clientId?: string,
	): Promise<Array<TMaturityAnalytics>> {
		try {
			const hasAssetIdsFilter = typeof filter.assetIds !== 'undefined'
			let resolvedAssetIds = filter.assetIds

			if (Array.isArray(filter.assetIds,) && filter.assetIds.length) {
				const versions = await this.prismaService.assetOptionVersion.findMany({
					where: {
						id: { in: filter.assetIds, },
					},
					select: {
						id:            true,
						assetOptionId: true,
					},
				},)

				if (versions.length) {
					const versionIdSet = new Set(versions.map((v,) => {
						return v.id
					},),)
					const optionIdsFromVersions = versions
						.map((v,) => {
							return v.assetOptionId
						},)
						.filter((id,): id is string => {
							return Boolean(id,)
						},)

					const originalOptionIds = filter.assetIds.filter((id,) => {
						return !versionIdSet.has(id,)
					},)

					resolvedAssetIds = Array.from(
						new Set([...originalOptionIds, ...optionIdsFromVersions,],),
					)
				}
			}

			if (filter.date) {
				const endDate = endOfDay(new Date(filter.date,),)

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
				await Promise.all([
					this.prismaService.assetOption.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
							accountId:   { in: filter.accountIds, },

							...(clientId ?
								{ client: { id: clientId, }, } :
								{}),

							bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

							portfolio: { isActivated: true, },

							pairAssetCurrency: { in: filter.pairs, },

							marketValueUSD: { not: 0, },

							AND: [
								{ startDate: { lte: endDate, }, },
								{ maturityDate: { gt: new Date(filter.date,), }, },
								filter.maturityYear ?
									{
										maturityDate: {
											gte: new Date(`${filter.maturityYear}-01-01`,),
											lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
										},
									} :
									{},
								{
									OR: [
										{ transferDate: { gte: endDate, }, },
										{ transferDate: null, },
									],
								},
							],

							versions: { none: {}, },
						},
						select: {
							id:                 true,
							currency:           true,
							currentMarketValue: true,
							maturityDate:       true,
						},
					},),
					this.prismaService.assetOption.findMany({
						where: {
							...(hasAssetIdsFilter ?
								{ id: { in: resolvedAssetIds, }, } :
								{}),
							clientId:    { in: filter.clientIds, },
							portfolioId: { in: filter.portfolioIds, },
							entityId:    { in: filter.entityIds, },
							accountId:   { in: filter.accountIds, },

							...(clientId ?
								{ client: { id: clientId, }, } :
								{}),

							bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

							portfolio: { isActivated: true, },

							pairAssetCurrency: { in: filter.pairs, },

							AND: [
								{
									OR: [
										{ transferDate: { gte: endDate, }, },
										{ transferDate: null, },
									],
								},
							],

							versions: {
								some: {
									startDate:          { lte: endDate, },
									maturityDate:       { gt: new Date(filter.date,), },
									currentMarketValue: { not: 0, },
									...(filter.maturityYear ?
										{
											maturityDate: {
												gte: new Date(`${filter.maturityYear}-01-01`,),
												lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
											},
										} :
										{}),
								},
							},
						},
						select: {
							id:       true,
							currency: true,
							versions: {
								where: {
									createdAt: { lte: endDate, },
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
								select:  {
									id:                 true,
									currency:           true,
									currentMarketValue: true,
									maturityDate:       true,
								},
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
				return mergedAssets.map((asset: any,) => {
					const version = asset.versions?.[0]

					if (version) {
						const currencyData = currencyList.find((c,) => {
							return c.currency === version.currency
						},)
						const rate = currencyData?.rate ?? 1
						const usdValue = parseFloat(
							(version.currentMarketValue * rate).toFixed(2,),
						)

						return {
							year:     new Date(version.maturityDate,).getUTCFullYear(),
							usdValue,
						}
					}

					const currencyData = currencyList.find((c,) => {
						return c.currency === asset.currency
					},)
					const rate = currencyData?.rate ?? 1
					const usdValue = parseFloat(
						(asset.currentMarketValue * rate).toFixed(2,),
					)

					return {
						year:     new Date(asset.maturityDate,).getUTCFullYear(),
						usdValue,
					}
				},)
			}

			const optionAssets = await this.prismaService.assetOption.findMany({
				where: {
					...(hasAssetIdsFilter ?
						{ id: { in: resolvedAssetIds, }, } :
						{}),
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },

					...(clientId ?
						{ client: { id: clientId, }, } :
						{}),

					bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

					portfolio: { isActivated: true, },

					pairAssetCurrency: { in: filter.pairs, },

					marketValueUSD: { not: 0, },

					transferDate: null,

					AND: [
						{ maturityDate: { gt: new Date(), }, },
						filter.maturityYear ?
							{
								maturityDate: {
									gte: new Date(`${filter.maturityYear}-01-01`,),
									lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
								},
							} :
							{},
					],
				},
				select: {
					maturityDate:   true,
					marketValueUSD: true,
				},
			},)

			return optionAssets.map((asset,) => {
				return {
					year:     new Date(asset.maturityDate,).getUTCFullYear(),
					usdValue: asset.marketValueUSD,
				}
			},)
		} catch (error) {
			return []
		}
	}

	/**
		 * 3.5.3
		  * Retrieves a list of option pairs based on the specified bank IDs.
	 *
	 * @remarks
	 * - Fetches all assets with the name `OPTIONS` and matching any of the provided bank IDs.
	 * - Parses the `payload` field of each asset to extract the `pairAssetCurrency`.
	 * - Returns an array of extracted option pairs or an empty array if no matches are found.
	 *
	 * @param ids - Array of bank IDs to filter the assets.
	 * @returns A Promise that resolves to an array of option pairs.
	 */
	public async getOptionPairsListByBanksIds(filter: OptionPairsBySourceIdsDto, clientId?: string,): Promise<Array<string>> {
		const {clientIds, portfolioIds,entityIds,accountIds,bankListIds,} = filter

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
				portfolio: {
					isActivated: true,
				},
				assetName: AssetNamesType.OPTIONS,
			},
		},)
		try {
			const options = assets.map((asset,) => {
				const parsedPayload = JSON.parse(asset.payload as string,)
				return parsedPayload.pairAssetCurrency
			},)
			return Array.from(new Set(options,),)
		} catch (error) {
			return []
		}
	}

	public async getOptionsPremium(filter: OptionsFilterDto, clientId?: string,): Promise<number> {
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
					annualAssets: { has: AssetNamesType.OPTIONS, },
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

		const optionsPremium = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return optionsPremium
	}

	/**
	 * 3.5.4
	 * Retrieves asset analytics based on the provided filter.
	 * @remarks
	 * - Filters assets based on the provided filter criteria and returns detailed analytics for each asset.
	 * @param filter - The filter criteria for retrieving asset analytics.
	 * @param clientId - An optional client ID to filter the results.
	 * @returns A Promise resolving to an array of asset analytics, including exposure values and market values.
	 */
	// todo: clear if new version good
	// public async getAssetAnalytics(
	// 	filter: OptionsFilterDto,
	// 	clientId?: string,
	// ): Promise<Array<TOptionsAssetAnalytics>> {
	// 	try {
	// 		const orderBy = {
	// 			[filter.sortBy as keyof AssetOption]: filter.sortOrder,
	// 		}

	// 		// ---------- WITH DATE (VERSION LOGIC) ----------
	// 		if (filter.date) {
	// 			const [assetsNoVersion, assetsWithVersion, currencyList,] =
	// 			await Promise.all([
	// 				this.prismaService.assetOption.findMany({
	// 					where: {
	// 						id:          { in: filter.assetIds, },
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entityIds, },
	// 						accountId:   { in: filter.accountIds, },

	// 						...(clientId ?
	// 							{ client: { id: clientId, }, } :
	// 							{}),

	// 						bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 						portfolio: { isActivated: true, },

	// 						pairAssetCurrency: { in: filter.pairs, },

	// 						marketValueUSD: { not: 0, },

	// 						AND: [
	// 							{ startDate: { lte: endOfDay(new Date(filter.date,),), }, },
	// 							{ maturityDate: { gt: new Date(filter.date,), }, },
	// 							filter.maturityYear ?
	// 								{
	// 									maturityDate: {
	// 										gte: new Date(`${filter.maturityYear}-01-01`,),
	// 										lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
	// 									},
	// 								} :
	// 								{},
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
	// 						account: { select: { accountName: true, }, },
	// 					},
	// 					orderBy,
	// 				},),
	// 				this.prismaService.assetOption.findMany({
	// 					where: {
	// 						id:          { in: filter.assetIds, },
	// 						clientId:    { in: filter.clientIds, },
	// 						portfolioId: { in: filter.portfolioIds, },
	// 						entityId:    { in: filter.entityIds, },
	// 						accountId:   { in: filter.accountIds, },

	// 						...(clientId ?
	// 							{ client: { id: clientId, }, } :
	// 							{}),

	// 						bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 						portfolio: { isActivated: true, },

	// 						versions: {
	// 							some: {
	// 								startDate:    { lte: endOfDay(new Date(filter.date,),), },
	// 								maturityDate: { gt: new Date(filter.date,), },
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
	// 						account:  { select: { accountName: true, }, },
	// 						versions: {
	// 							where: {
	// 								createdAt: { lte: endOfDay(new Date(filter.date,),), },
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
	// 								account: { select: { accountName: true, }, },
	// 							},
	// 							orderBy: { createdAt: 'desc', },
	// 							take:    1,
	// 						},
	// 					},
	// 					orderBy,
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
	// 			return mergedAssets.map((asset: any,) => {
	// 				const version = asset.versions?.[0]

	// 				if (version) {
	// 					const currencyData = currencyList.find((c,) => {
	// 						return c.currency === version.currency
	// 					},)

	// 					const rate = currencyData?.rate ?? 1

	// 					const usdValue = parseFloat(
	// 						(version.currentMarketValue * rate).toFixed(2,),
	// 					)

	// 					return {
	// 						id:          version.id,
	// 						assetMainId: asset.id,

	// 						portfolio: this.cryptoService.decryptString(version.portfolio.name,),
	// 						entity:    this.cryptoService.decryptString(version.entity.name,),
	// 						account:   this.cryptoService.decryptString(
	// 							version.account.accountName,
	// 						),
	// 						bank: version.bank.bankName,

	// 						currency:       version.currency,
	// 						maturity:       version.maturityDate.toISOString(),
	// 						pair:           version.pairAssetCurrency,
	// 						strike:         version.strike,
	// 						principalValue: version.principalValue,
	// 						marketValue:    usdValue,
	// 						premium:        version.premium,
	// 						startDate:      version.startDate.toISOString(),
	// 					}
	// 				}

	// 				const currencyData = currencyList.find((c,) => {
	// 					return c.currency === asset.currency
	// 				},)

	// 				const rate = currencyData?.rate ?? 1

	// 				const usdValue = parseFloat(
	// 					(asset.currentMarketValue * rate).toFixed(2,),
	// 				)

	// 				return {
	// 					id: asset.id,

	// 					portfolio: this.cryptoService.decryptString(asset.portfolio.name,),
	// 					entity:    this.cryptoService.decryptString(asset.entity.name,),
	// 					account:   this.cryptoService.decryptString(asset.account.accountName,),
	// 					bank:      asset.bank.bankName,

	// 					currency:       asset.currency,
	// 					maturity:       asset.maturityDate.toISOString(),
	// 					pair:           asset.pairAssetCurrency,
	// 					strike:         asset.strike,
	// 					principalValue: asset.principalValue,
	// 					marketValue:    usdValue,
	// 					premium:        asset.premium,
	// 					startDate:      asset.startDate.toISOString(),
	// 				}
	// 			},)
	// 		}

	// 		// ---------- NO DATE (NO VERSION LOGIC) ----------
	// 		const optionAssets = await this.prismaService.assetOption.findMany({
	// 			where: {
	// 				id:          { in: filter.assetIds, },
	// 				clientId:    { in: filter.clientIds, },
	// 				portfolioId: { in: filter.portfolioIds, },
	// 				entityId:    { in: filter.entityIds, },
	// 				accountId:   { in: filter.accountIds, },

	// 				...(clientId ?
	// 					{ client: { id: clientId, }, } :
	// 					{}),

	// 				bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

	// 				portfolio: { isActivated: true, },

	// 				pairAssetCurrency: { in: filter.pairs, },

	// 				marketValueUSD: { not: 0, },

	// 				AND: [
	// 					{ maturityDate: { gt: new Date(), }, },
	// 					filter.maturityYear ?
	// 						{
	// 							maturityDate: {
	// 								gte: new Date(`${filter.maturityYear}-01-01`,),
	// 								lt:  new Date(`${filter.maturityYear + 1}-01-01`,),
	// 							},
	// 						} :
	// 						{},
	// 				],
	// 			},

	// 			include: {
	// 				portfolio: { select: { name: true, }, },
	// 				entity:    { select: { name: true, }, },
	// 				bank:      {
	// 					select: {
	// 						bankName:   true,
	// 						bankList:   true,
	// 						bankListId: true,
	// 					},
	// 				},
	// 				account: { select: { accountName: true, }, },
	// 			},

	// 			orderBy,
	// 		},)

	// 		return optionAssets.map((asset,) => {
	// 			return {
	// 				id: asset.id,

	// 				portfolio: this.cryptoService.decryptString(asset.portfolio.name,),
	// 				entity:    this.cryptoService.decryptString(asset.entity.name,),
	// 				account:   this.cryptoService.decryptString(asset.account.accountName,),
	// 				bank:      asset.bank.bankName,

	// 				currency:       asset.currency,
	// 				maturity:       asset.maturityDate.toISOString(),
	// 				pair:           asset.pairAssetCurrency,
	// 				strike:         asset.strike,
	// 				principalValue: asset.principalValue,
	// 				marketValue:    asset.marketValueUSD,
	// 				premium:        asset.premium,
	// 				startDate:      asset.startDate.toISOString(),
	// 			}
	// 		},)
	// 	} catch (error) {
	// 		return []
	// 	}
	// }
	public async getAssetAnalytics(
		filter: OptionsFilterDto,
		clientId?: string,
	): Promise<Array<TOptionsAssetAnalytics>> {
		try {
			const orderBy = {
				[filter.sortBy as keyof AssetOption]: filter.sortOrder,
			}
			const year = filter.maturityYear ?
				Number(filter.maturityYear,) :
				filter.maturityYear
			if (filter.date) {
				const endDate = endOfDay(new Date(filter.date,),)

				const [assetsNoVersion, assetsWithVersion, currencyList,] =
			await Promise.all([
				this.prismaService.assetOption.findMany({
					where: {
						id:          { in: filter.assetIds, },
						clientId:    { in: filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entityIds, },
						accountId:   { in: filter.accountIds, },

						...(clientId ?
							{ client: { id: clientId, }, } :
							{}),

						bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

						portfolio: { isActivated: true, },

						pairAssetCurrency: { in: filter.pairs, },

						marketValueUSD: { not: 0, },

						AND: [
							{ startDate: { lte: endDate, }, },
							{ maturityDate: { gt: new Date(filter.date,), }, },
							filter.maturityYear && year ?
								{
									maturityDate: {
										gte: new Date(year, 0, 1,),
										lt:  new Date(year + 1, 0, 1,),
									},
								} :
								{},
							{
								OR: [
									{ transferDate: { gte: endOfDay(new Date(filter.date,),), }, },
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
						account: { select: { accountName: true, }, },
					},
					orderBy,
				},),
				this.prismaService.assetOption.findMany({
					where: {
						id:          { in: filter.assetIds, },
						clientId:    { in: filter.clientIds, },
						portfolioId: { in: filter.portfolioIds, },
						entityId:    { in: filter.entityIds, },
						accountId:   { in: filter.accountIds, },

						...(clientId ?
							{ client: { id: clientId, }, } :
							{}),

						bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

						portfolio: { isActivated: true, },

						AND: [
							{
								OR: [
									{ transferDate: { gte: endDate, }, },
									{ transferDate: null, },
								],
							},
						],

						versions: {
							some: {
								startDate:    { lte: endDate, },
								maturityDate: { gt: new Date(filter.date,), },
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
						account:  { select: { accountName: true, }, },
						versions: {
							where: {
								createdAt: { lte: endDate, },
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
								account: { select: { accountName: true, }, },
							},
							orderBy: { createdAt: 'desc', },
							take:    1,
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

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return mergedAssets.map((asset: any,) => {
					const version = asset.versions?.[0]

					if (version) {
						const currencyData = currencyList.find((c,) => {
							return c.currency === version.currency
						},)

						const rate = currencyData?.rate ?? 1

						const usdValue = parseFloat(
							(version.currentMarketValue * rate).toFixed(2,),
						)

						return {
							id:          version.id,
							assetMainId: asset.id,

							portfolio: this.cryptoService.decryptString(version.portfolio.name,),
							entity:    this.cryptoService.decryptString(version.entity.name,),
							account:   this.cryptoService.decryptString(
								version.account.accountName,
							),
							bank: version.bank.bankName,

							currency:       version.currency,
							maturity:       version.maturityDate.toISOString(),
							pair:           version.pairAssetCurrency,
							strike:         version.strike,
							principalValue: version.principalValue,
							marketValue:    usdValue,
							premium:        version.premium,
							startDate:      version.startDate.toISOString(),
							isTransferred:  Boolean(asset.transferDate,),
						}
					}

					const currencyData = currencyList.find((c,) => {
						return c.currency === asset.currency
					},)

					const rate = currencyData?.rate ?? 1

					const usdValue = parseFloat(
						(asset.currentMarketValue * rate).toFixed(2,),
					)

					return {
						id: asset.id,

						portfolio: this.cryptoService.decryptString(asset.portfolio.name,),
						entity:    this.cryptoService.decryptString(asset.entity.name,),
						account:   this.cryptoService.decryptString(asset.account.accountName,),
						bank:      asset.bank.bankName,

						currency:       asset.currency,
						maturity:       asset.maturityDate.toISOString(),
						pair:           asset.pairAssetCurrency,
						strike:         asset.strike,
						principalValue: asset.principalValue,
						marketValue:    usdValue,
						premium:        asset.premium,
						startDate:      asset.startDate.toISOString(),
						isTransferred:  Boolean(asset.transferDate,),
					}
				},)
			}

			const optionAssets = await this.prismaService.assetOption.findMany({
				where: {
					id:          { in: filter.assetIds, },
					clientId:    { in: filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },

					...(clientId ?
						{ client: { id: clientId, }, } :
						{}),

					bank: { is: { bankListId: { in: filter.bankListIds, }, }, },

					portfolio: { isActivated: true, },

					pairAssetCurrency: { in: filter.pairs, },

					marketValueUSD: { not: 0, },

					transferDate: null,

					AND: [
						{ maturityDate: { gt: new Date(), }, },
						filter.maturityYear && year ?
							{
								maturityDate: {
									gte: new Date(year, 0, 1,),
									lt:  new Date(year + 1, 0, 1,),
								},
							} :
							{},
					],
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
					account: { select: { accountName: true, }, },
				},

				orderBy,
			},)

			return optionAssets.map((asset,) => {
				return {
					id: asset.id,

					portfolio: this.cryptoService.decryptString(asset.portfolio.name,),
					entity:    this.cryptoService.decryptString(asset.entity.name,),
					account:   this.cryptoService.decryptString(asset.account.accountName,),
					bank:      asset.bank.bankName,

					currency:       asset.currency,
					maturity:       asset.maturityDate.toISOString(),
					pair:           asset.pairAssetCurrency,
					strike:         asset.strike,
					principalValue: asset.principalValue,
					marketValue:    asset.marketValueUSD,
					premium:        asset.premium,
					startDate:      asset.startDate.toISOString(),
					isTransferred:  Boolean(asset.transferDate,),
				}
			},)
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
	private syncParseAndFilterAssets(assets: Array<TAssetExtended>,): Array<IOptionAsset> {
		const parsedAssets = assets
			.map((asset,) => {
				const parsedAsset = assetParser<IOptionAsset>(asset,)
				if (!parsedAsset) {
					return null
				}
				return parsedAsset
			},)
			.filter((item,): item is IOptionAsset => {
				return item !== null
			},)
		return parsedAssets
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetAssetAnalytics(data: TAssetCacheInitials, filter: OptionsFilterDto, clientId?: string,): Array<TOptionsAssetAnalytics> {
		const {assets, currencyList,} = data
		const parsedAsset = this.syncParseAndFilterAssets(assets,)
		return parsedAsset
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				if (!asset.portfolio || !asset.entity || !asset.bank || !asset.account) {
					return null
				}
				const maturity = new Date(asset.maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const marketUsdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      asset.currency,
					currencyValue: Number(asset.currentMarketValue,),
					currencyList,
					historyDate:   filter.date,
				},)
				if (marketUsdValue === 0) {
					return null
				}
				return {
					id:             asset.id,
					portfolio:      this.cryptoService.decryptString(asset.portfolio.name,),
					entity:         this.cryptoService.decryptString(asset.entity.name,),
					account:        this.cryptoService.decryptString(asset.account.accountName,),
					bank:           asset.bank.bankName,
					startDate:      asset.startDate,
					maturity:       asset.maturityDate,
					pair:           asset.pairAssetCurrency,
					strike:         asset.strike,
					principalValue: asset.principalValue,
					marketValue:    marketUsdValue,
					premium:        asset.premium,
				}
			},)
			.filter((item,): item is TOptionsAssetAnalytics => {
				return item !== null
			},)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetBankAnalytics(data: TAssetCacheInitials, filter: OptionsFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets,currencyList,} = data
		const parsedAssets = this.syncParseAndFilterAssets(assets,)
		return parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const { maturityDate, } = asset
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				if (!asset.bank) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      asset.currency,
					currencyValue: Number(asset.currentMarketValue,),
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					id:       asset.bank.bankListId,
					bankName: asset.bank.bankList?.name ?? asset.bank.bankName,
					usdValue,
				}
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetMaturityAnalytics(data: TAssetCacheInitials, filter: OptionsFilterDto, clientId?: string,): Array<TMaturityAnalytics> {
		const {assets, currencyList,} = data
		const parsedAssets = this.syncParseAndFilterAssets(assets,)
		return parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const maturity = new Date(asset.maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const marketUsdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      asset.currency,
					currencyValue: Number(asset.currentMarketValue,),
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					year:     new Date(asset.maturityDate,).getUTCFullYear(),
					usdValue: marketUsdValue,
				}
			},)
			.filter((asset,): asset is TMaturityAnalytics => {
				return asset !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
	}
}