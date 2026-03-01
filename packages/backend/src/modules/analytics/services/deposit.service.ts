/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { Prisma, } from '@prisma/client'

import { CBondsCurrencyService, } from '../../apis/cbonds-api/services'

import type {
	DepositCurrencyFilterDto,
	DepositFilterDto,
} from '../dto/deposit-filter.dto'
import type {
	IAnalyticDeposit,
	TBankAnalytics,
	TCurrencyAnalytics,
} from '../analytics.types'
import { assetParser, } from '../../../shared/utils'
import type { IDepositAsset, TAssetExtended, } from '../../asset/asset.types'
import { TDepositTableSortVariants, } from '../analytics.types'
import type { IDepositByFilter, } from '../analytics.types'
import { endOfDay, } from 'date-fns'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TAssetCacheInitials, } from '../../../modules/common/cache-sync/cache-sync.types'
import { AssetNamesType, } from '../../asset/asset.types'
import type { TCurrencyDataWithHistory, } from '../../../modules/apis/cbonds-api/cbonds-api.types'

@Injectable()
export class DepositService {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cBondsCurrencyService: CBondsCurrencyService,
    private readonly cryptoService: CryptoService,
	) {}

	/**
   * 3.5.4
   * Calculates the annual income from deposit transactions based on the provided filter criteria.
   * @remarks
   * This method queries the database for deposit transactions matching the given filter parameters,
   * including portfolio, bank, account, and client associations. It filters transactions that occurred
   * from the beginning of the current year up to the specified date (or the current date if not provided),
   * and calculates the total amount by multiplying each transaction amount by its rate (if present).
   * If the selected year is the previous year, the method returns 0.
   *
   * @param filter - The filter criteria used to narrow down transactions (e.g., portfolios, banks, accounts, etc.).
   * @param clientId - Optional client ID to override client filtering in the request.
   * @returns A promise that resolves to a number representing the total deposit income for the current year.
   */
	public async getDepositAnnual(
		filter: DepositFilterDto,
		clientId?: string,
	): Promise<number> {
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
					annualAssets: { has: AssetNamesType.CASH_DEPOSIT, },
				},
				transactionDate: {
					gte: startOfYear,
					lte: endOfYear,
				},
			},
		},)
		const depositAnnual = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)

		return depositAnnual
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
   * @param {DepositFilterDto} filters - The filter criteria for retrieving loan assets.
   * @returns {Promise<ILoansByFilter>} - A Promise resolving to an object containing the list of filtered loan assets and their total value.
   */
	// New after asset refactor
	// public async getAllByFilters(
	// 	filters: DepositFilterDto,
	// 	clientId?: string,
	// ): Promise<IDepositByFilter> {
	// 	try {
	// 		let totalAssets = 0
	// 		const now = new Date()
	//    type DepositSortField = 'startDate' | 'maturityDate' | 'usdValue';
	//    const orderBy: Prisma.AssetDepositOrderByWithRelationInput =
	//      filters.sortBy === 'maturityDate' ?
	//      	{
	//      		maturityDate: {
	//      			sort:  filters.sortOrder,
	//      			nulls: 'last' as const,
	//      		},
	//      	} :
	//      	{
	//      		[filters.sortBy as DepositSortField]: filters.sortOrder,
	//      	}
	//    if (filters.date) {
	//    	const [depositAssets, depositAssetsWithVersion, currencyList,] =
	//        await Promise.all([
	//        	this.prismaService.assetDeposit.findMany({
	//        		where: {
	//        			clientId:    { in: filters.clientIds, },
	//        			portfolioId: { in: filters.portfolioIds, },
	//        			entityId:    { in: filters.entityIds, },
	//        			accountId:   { in: filters.accountIds, },
	//        			bankId:      { in: filters.bankIds, },
	//        			...(clientId ?
	//        				{
	//        					client: {
	//        						id: clientId,
	//        					},
	//        				} :
	//        				{}),
	//        			bank: {
	//        				is: {
	//        					bankListId: { in: filters.bankListIds, },
	//        				},
	//        			},
	//        			portfolio: {
	//        				isActivated: true,
	//        			},
	//        			currency: {
	//        				in: filters.currencies,
	//        			},
	//        			usdValue: {
	//        				not: 0,
	//        			},
	//        			AND: [
	//        					{
	//        						OR: [
	//        							{ maturityDate: { gt: endOfDay(new Date(filters.date,),), }, },
	//        							{ maturityDate: null, },
	//        						],
	//        					},
	//        				{ startDate: { lte: endOfDay(new Date(filters.date,),), }, },
	//        				{OR: [
	//        							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
	//        							{ transferDate: null, },
	//        						],},
	//        			],
	//        			assetDepositVersions: {
	//        				none: {},
	//        			},
	//        		},
	//        		orderBy,
	//        		include: {
	//        			portfolio: {
	//        				select: {
	//        					name: true,
	//        				},
	//        			},
	//        			entity: {
	//        				select: {
	//        					name: true,
	//        				},
	//        			},
	//        			bank: {
	//        				select: {
	//        					bankName: true,
	//        				},
	//        			},
	//        			account: {
	//        				select: {
	//        					accountName: true,
	//        				},
	//        			},
	//        		},
	//        	},),
	//        	this.prismaService.assetDeposit.findMany({
	//        		where: {
	//        			clientId:    { in: filters.clientIds, },
	//        			portfolioId: { in: filters.portfolioIds, },
	//        			entityId:    { in: filters.entityIds, },
	//        			accountId:   { in: filters.accountIds, },
	//        			bankId:      { in: filters.bankIds, },
	//        			...(clientId ?
	//        				{
	//        					client: {
	//        						id: clientId,
	//        					},
	//        				} :
	//        				{}),
	//        			bank: {
	//        				is: {
	//        					bankListId: { in: filters.bankListIds, },
	//        				},
	//        			},
	//        			portfolio: {
	//        				isActivated: true,
	//        			},
	//        			OR: [
	//        							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
	//        							{ transferDate: null, },
	//        			],
	//        			assetDepositVersions: {
	//        				some: {
	//        					usdValue:  { not: 0, },
	//        					currency:  { in: filters.currencies, },
	//        					startDate: { lte: endOfDay(new Date(filters.date,),), },
	//        					OR:        [
	//        						{ maturityDate: { gt: endOfDay(new Date(filters.date,),), }, },
	//        						{
	//        							AND: [
	//        								{ maturityDate: null, },
	//        								{ startDate: { lte: endOfDay(new Date(filters.date,),), }, },
	//        							],
	//        						},
	//        					],
	//        				},
	//        			},
	//        		},
	//        		include: {
	//        			portfolio: {
	//        				select: {
	//        					name: true,
	//        				},
	//        			},
	//        			entity: {
	//        				select: {
	//        					name: true,
	//        				},
	//        			},
	//        			bank: {
	//        				select: {
	//        					bankName: true,
	//        				},
	//        			},
	//        			account: {
	//        				select: {
	//        					accountName: true,
	//        				},
	//        			},
	//        			assetDepositVersions: {
	//        				where: {
	//        					createdAt: { lte: endOfDay(new Date(filters.date,),), },
	//        				},
	//        				include: {
	//        					account:   { select: { accountName: true, }, },
	//        					bank:      { select: { bankName: true, }, },
	//        					entity:    { select: { name: true, }, },
	//        					portfolio: { select: { name: true, }, },
	//        				},
	//        				orderBy: { createdAt: 'desc', },
	//        				take:    1,
	//        			},
	//        		},
	//        	},),
	//        	this.cBondsCurrencyService.getAllCurrenciesWithHistory(
	//        		filters.date,
	//        	),
	//        ],)
	//    	const normalizedDepositAssets = depositAssets.map((a,) => {
	//    		return {
	//    		...a,
	//    		assetDepositVersions: [],
	//    	}
	//    	},)
	//    	const allAssets = [
	//    		...depositAssetsWithVersion,
	//    		...normalizedDepositAssets,
	//    	]
	//    	const sortField: DepositSortField = filters.sortBy as DepositSortField
	//    	const direction = filters.sortOrder === 'asc' ?
	//    		1 :
	//    		-1
	//    	const sortedAssets = allAssets.sort((a, b,) => {
	//    		const valA = a[sortField]
	//    		const valB = b[sortField]
	//    		if (valA === null) {
	//    			return 1
	//    		}
	//    		if (valB === null) {
	//    			return -1
	//    		}
	//    		if (valA instanceof Date || valB instanceof Date) {
	//    			return (new Date(valA,).getTime() - new Date(valB,).getTime()) * direction
	//    		}
	//    		return (valA - valB) * direction
	//    	},)
	//    	const mappedDepositAssets = sortedAssets.map((asset,) => {
	//    		if (Boolean(asset.assetDepositVersions.length,)) {
	//    			const [assetVersion,] = asset.assetDepositVersions
	//    			const currencyData: TCurrencyDataWithHistory | undefined =
	//            currencyList.find((item,) => {
	//            	return item.currency === assetVersion.currency
	//            },)
	//    			const rate = currencyData ?
	//    				currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	//    				1
	//    			const { currencyValue, } = assetVersion
	//    			const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
	//    			totalAssets = totalAssets + usdValue
	//    			return {
	//    				assetId:       assetVersion.id,
	//    				portfolioName: this.cryptoService.decryptString(
	//    					assetVersion.portfolio.name,
	//    				),
	//    				entityName: this.cryptoService.decryptString(
	//    					assetVersion.entity.name,
	//    				),
	//    				accountName: this.cryptoService.decryptString(
	//    					assetVersion.account.accountName,
	//    				),
	//    				bankName:  assetVersion.bank.bankName,
	//    				startDate: assetVersion.startDate.toISOString(),
	//    				...(assetVersion.maturityDate ?
	//    					{ maturityDate: assetVersion.maturityDate.toISOString(), } :
	//    					{}),
	//    				currency:      assetVersion.currency,
	//    				currencyValue: assetVersion.currencyValue,
	//    				interest:      assetVersion.interest,
	//    				policy:        assetVersion.policy,
	//    				usdValue,
	//    				mainAssetId:   asset.id,
	//    				isTransferred: Boolean(asset.transferDate,),
	//    			}
	//    		}
	//    		const currencyData: TCurrencyDataWithHistory | undefined =
	//          currencyList.find((item,) => {
	//          	return item.currency === asset.currency
	//          },)
	//    		const rate = currencyData ?
	//    			currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	//    			1
	//    		const { currencyValue, } = asset
	//    		const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
	//    		totalAssets = totalAssets + usdValue
	//    		return {
	//    			assetId:       asset.id,
	//    			portfolioName: this.cryptoService.decryptString(
	//    				asset.portfolio.name,
	//    			),
	//    			entityName:  this.cryptoService.decryptString(asset.entity.name,),
	//    			accountName: this.cryptoService.decryptString(
	//    				asset.account.accountName,
	//    			),
	//    			bankName:  asset.bank.bankName,
	//    			startDate: asset.startDate.toISOString(),
	//    			...(asset.maturityDate ?
	//    				{ maturityDate: asset.maturityDate.toISOString(), } :
	//    				{}),
	//    			currency:      asset.currency,
	//    			currencyValue: asset.currencyValue,
	//    			interest:      asset.interest,
	//    			policy:        asset.policy,
	//    			usdValue,
	//    			isTransferred: Boolean(asset.transferDate,),
	//    		}
	//    	},)
	//    	return {
	//    		list: mappedDepositAssets,
	//    		totalAssets,
	//    	}
	//    }
	//    const [depositAssets,] = await Promise.all([
	//    	this.prismaService.assetDeposit.findMany({
	//    		where: {
	//    			clientId:    { in: filters.clientIds, },
	//    			portfolioId: { in: filters.portfolioIds, },
	//    			entityId:    { in: filters.entityIds, },
	//    			accountId:   { in: filters.accountIds, },
	//    			bankId:      { in: filters.bankIds, },
	//    			...(clientId ?
	//    				{
	//    					client: {
	//    						id: clientId,
	//    					},
	//    				} :
	//    				{}),
	//    			bank: {
	//    				is: {
	//    					bankListId: { in: filters.bankListIds, },
	//    				},
	//    			},
	//    			portfolio: {
	//    				isActivated: true,
	//    			},
	//    			currency: {
	//    				in: filters.currencies,
	//    			},
	//    			usdValue: {
	//    				not: 0,
	//    			},
	//    			transferDate: null,
	//    			AND:          [
	//    					{
	//    						OR: [{ maturityDate: { gt: endOfDay(now,), }, }, { maturityDate: null, },],
	//    					},
	//    				filters.date ?
	//    					{ startDate: { lte: endOfDay(new Date(filters.date,),), }, } :
	//    					{},
	//    			],
	//    		},
	//    		orderBy,
	//    		include: {
	//    			portfolio: {
	//    				select: {
	//    					name: true,
	//    				},
	//    			},
	//    			entity: {
	//    				select: {
	//    					name: true,
	//    				},
	//    			},
	//    			bank: {
	//    				select: {
	//    					bankName: true,
	//    				},
	//    			},
	//    			account: {
	//    				select: {
	//    					accountName: true,
	//    				},
	//    			},
	//    		},
	//    	},),
	//    ],)
	//    const mappedDepositAssets = depositAssets.map((asset,) => {
	//    	const { usdValue, } = asset
	//    	totalAssets = totalAssets + usdValue
	//    	return {
	//    		assetId:       asset.id,
	//    		portfolioName: this.cryptoService.decryptString(asset.portfolio.name,),
	//    		entityName:    this.cryptoService.decryptString(asset.entity.name,),
	//    		accountName:   this.cryptoService.decryptString(
	//    			asset.account.accountName,
	//    		),
	//    		bankName:  asset.bank.bankName,
	//    		startDate: asset.startDate.toISOString(),
	//    		...(asset.maturityDate ?
	//    			{ maturityDate: asset.maturityDate.toISOString(), } :
	//    			{}),
	//    		currency:      asset.currency,
	//    		currencyValue: asset.currencyValue,
	//    		interest:      asset.interest,
	//    		policy:        asset.policy,
	//    		usdValue,
	//    		isTransferred: Boolean(asset.transferDate,),
	//    	}
	//    },)
	//    return {
	//    	list: mappedDepositAssets,
	//    	totalAssets,
	//    }
	// 	} catch (error) {
	// 		return {
	// 			list:        [],
	// 			totalAssets: 0,
	// 		}
	// 	}
	// }
	public async getAllByFilters(
		filters: DepositFilterDto,
		clientId?: string,
	): Promise<IDepositByFilter> {
		try {
			let totalAssets = 0
			const now = new Date()

			const buildOrderBy = (
				sortBy: TDepositTableSortVariants | undefined,
				sortOrder: Prisma.SortOrder,
			): Prisma.AssetDepositOrderByWithRelationInput => {
				switch (sortBy) {
				case TDepositTableSortVariants.MATURITY_DATE:
					return {
						maturityDate: {
							sort:  sortOrder,
							nulls: 'last' as const,
						},
					}
				case TDepositTableSortVariants.START_DATE:
					return { startDate: sortOrder, }
				case TDepositTableSortVariants.USD_VALUE:
					return { usdValue: sortOrder, }
				case TDepositTableSortVariants.CURRENCY_VALUE:
					return { currencyValue: sortOrder, }
				case TDepositTableSortVariants.INTEREST:
					return { interest: sortOrder, }
				case TDepositTableSortVariants.CURRENCY:
					return { currency: sortOrder, }
				case TDepositTableSortVariants.POLICY:
					return { policy: sortOrder, }
				case TDepositTableSortVariants.PORTFOLIO_NAME:
					return { portfolio: { name: sortOrder, }, }
				case TDepositTableSortVariants.ENTITY_NAME:
					return { entity: { name: sortOrder, }, }
				case TDepositTableSortVariants.ACCOUNT_NAME:
					return { account: { accountName: sortOrder, }, }
				case TDepositTableSortVariants.BANK_NAME:
					return { bank: { bankName: sortOrder, }, }
				default:
					return { startDate: Prisma.SortOrder.desc, }
				}
			}

			const direction: number = filters.sortOrder === Prisma.SortOrder.asc ?
				1 :
				-1

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const sortMapped = (list: Array<any>,): Array<any> => {
				const {sortBy,} = filters
				if (!sortBy) {
					return list
				}

				const isNil = (v: unknown,): boolean => {
					return v === null || v === undefined
				}

				const cmpString = (a: string, b: string,): number => {
					return a.localeCompare(b, undefined, { sensitivity: 'base', },)
				}

				const cmpNumber = (a: number, b: number,): number => {
					return a - b
				}

				const cmpDateIso = (a: string, b: string,): number => {
					return new Date(a,).getTime() - new Date(b,).getTime()
				}

				const nullsLast = (a: unknown, b: unknown,): number => {
					if (isNil(a,) && isNil(b,)) {
						return 0
					}
					if (isNil(a,)) {
						return 1
					}
					if (isNil(b,)) {
						return -1
					}
					return 0
				}

				return [...list,].sort((a, b,) => {
					const va = a?.[sortBy]
					const vb = b?.[sortBy]

					const n = nullsLast(va, vb,)
					if (n !== 0) {
						return n
					}

					switch (sortBy) {
					case TDepositTableSortVariants.START_DATE:
					case TDepositTableSortVariants.MATURITY_DATE:
						return cmpDateIso(String(va,), String(vb,),) * direction

					case TDepositTableSortVariants.USD_VALUE:
					case TDepositTableSortVariants.CURRENCY_VALUE:
					case TDepositTableSortVariants.INTEREST:
						return cmpNumber(Number(va,), Number(vb,),) * direction

					case TDepositTableSortVariants.PORTFOLIO_NAME:
					case TDepositTableSortVariants.ENTITY_NAME:
					case TDepositTableSortVariants.BANK_NAME:
					case TDepositTableSortVariants.ACCOUNT_NAME:
					case TDepositTableSortVariants.CURRENCY:
					case TDepositTableSortVariants.POLICY:
						return cmpString(String(va,), String(vb,),) * direction

					default:
						return cmpString(String(va,), String(vb,),) * direction
					}
				},)
			}

			const orderBy = buildOrderBy(filters.sortBy, filters.sortOrder,)

			if (filters.date) {
				const dateEnd = endOfDay(new Date(filters.date,),)

				const [depositAssets, depositAssetsWithVersion, currencyList,] = await Promise.all([
					this.prismaService.assetDeposit.findMany({
						where: {
							clientId:    { in: filters.clientIds, },
							portfolioId: { in: filters.portfolioIds, },
							entityId:    { in: filters.entityIds, },
							accountId:   { in: filters.accountIds, },
							bankId:      { in: filters.bankIds, },
							...(clientId ?
								{ client: { id: clientId, }, } :
								{}),
							bank:        {
								is: {
									bankListId: { in: filters.bankListIds, },
								},
							},
							portfolio: { isActivated: true, },
							currency:  { in: filters.currencies, },
							usdValue:  { not: 0, },
							AND:       [
								{
									OR: [
										{ maturityDate: { gt: dateEnd, }, },
										{ maturityDate: null, },
									],
								},
								{ startDate: { lte: dateEnd, }, },
								{
									OR: [
										{ transferDate: { gte: dateEnd, }, },
										{ transferDate: null, },
									],
								},
							],
							assetDepositVersions: { none: {}, },
						},
						orderBy,
						include: {
							portfolio: { select: { name: true, }, },
							entity:    { select: { name: true, }, },
							bank:      { select: { bankName: true, }, },
							account:   { select: { accountName: true, }, },
						},
					},),
					this.prismaService.assetDeposit.findMany({
						where: {
							clientId:    { in: filters.clientIds, },
							portfolioId: { in: filters.portfolioIds, },
							entityId:    { in: filters.entityIds, },
							accountId:   { in: filters.accountIds, },
							bankId:      { in: filters.bankIds, },
							...(clientId ?
								{ client: { id: clientId, }, } :
								{}),
							bank:        {
								is: {
									bankListId: { in: filters.bankListIds, },
								},
							},
							portfolio: { isActivated: true, },
							OR:        [
								{ transferDate: { gte: dateEnd, }, },
								{ transferDate: null, },
							],
							assetDepositVersions: {
								some: {
									usdValue:  { not: 0, },
									currency:  { in: filters.currencies, },
									startDate: { lte: dateEnd, },
									OR:        [
										{ maturityDate: { gt: dateEnd, }, },
										{
											AND: [
												{ maturityDate: null, },
												{ startDate: { lte: dateEnd, }, },
											],
										},
									],
								},
							},
						},
						include: {
							portfolio:            { select: { name: true, }, },
							entity:               { select: { name: true, }, },
							bank:                 { select: { bankName: true, }, },
							account:              { select: { accountName: true, }, },
							assetDepositVersions: {
								where:   { createdAt: { lte: dateEnd, }, },
								include: {
									account:   { select: { accountName: true, }, },
									bank:      { select: { bankName: true, }, },
									entity:    { select: { name: true, }, },
									portfolio: { select: { name: true, }, },
								},
								orderBy: { createdAt: 'desc', },
								take:    1,
							},
						},
					},),
					this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
				],)

				const normalizedDepositAssets = depositAssets.map((a,) => {
					return { ...a, assetDepositVersions: [], }
				},)

				const allAssets = [...depositAssetsWithVersion, ...normalizedDepositAssets,]

				const mappedDepositAssets = allAssets.map((asset,) => {
					if (Boolean(asset.assetDepositVersions.length,)) {
						const [assetVersion,] = asset.assetDepositVersions

						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)

						const rate = currencyData ?
							(currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate) :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * rate).toFixed(2,),)
						totalAssets = totalAssets + usdValue

						return {
							assetId:       assetVersion.id,
							portfolioName: this.cryptoService.decryptString(assetVersion.portfolio.name,),
							entityName:    this.cryptoService.decryptString(assetVersion.entity.name,),
							accountName:   this.cryptoService.decryptString(assetVersion.account.accountName,),
							bankName:      assetVersion.bank.bankName,
							startDate:     assetVersion.startDate.toISOString(),
							...(assetVersion.maturityDate ?
								{ maturityDate: assetVersion.maturityDate.toISOString(), } :
								{}),
							currency:      assetVersion.currency,
							currencyValue: assetVersion.currencyValue,
							interest:      assetVersion.interest,
							policy:        assetVersion.policy,
							usdValue,
							mainAssetId:   asset.id,
							isTransferred: Boolean(asset.transferDate,),
						}
					}

					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)

					const rate = currencyData ?
						(currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate) :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					totalAssets = totalAssets + usdValue

					return {
						assetId:       asset.id,
						portfolioName: this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:    this.cryptoService.decryptString(asset.entity.name,),
						accountName:   this.cryptoService.decryptString(asset.account.accountName,),
						bankName:      asset.bank.bankName,
						startDate:     asset.startDate.toISOString(),
						...(asset.maturityDate ?
							{ maturityDate: asset.maturityDate.toISOString(), } :
							{}),
						currency:      asset.currency,
						currencyValue: asset.currencyValue,
						interest:      asset.interest,
						policy:        asset.policy,
						usdValue,
						isTransferred: Boolean(asset.transferDate,),
					}
				},)

				return {
					list: sortMapped(mappedDepositAssets,),
					totalAssets,
				}
			}

			const [depositAssets,] = await Promise.all([
				this.prismaService.assetDeposit.findMany({
					where: {
						clientId:    { in: filters.clientIds, },
						portfolioId: { in: filters.portfolioIds, },
						entityId:    { in: filters.entityIds, },
						accountId:   { in: filters.accountIds, },
						bankId:      { in: filters.bankIds, },
						...(clientId ?
							{ client: { id: clientId, }, } :
							{}),
						bank:        {
							is: {
								bankListId: { in: filters.bankListIds, },
							},
						},
						portfolio:    { isActivated: true, },
						currency:     { in: filters.currencies, },
						usdValue:     { not: 0, },
						transferDate: null,
						AND:          [
							{
								OR: [
									{ maturityDate: { gt: endOfDay(now,), }, },
									{ maturityDate: null, },
								],
							},
							filters.date ?
								{ startDate: { lte: endOfDay(new Date(filters.date,),), }, } :
								{},
						],
					},
					orderBy,
					include: {
						portfolio: { select: { name: true, }, },
						entity:    { select: { name: true, }, },
						bank:      { select: { bankName: true, }, },
						account:   { select: { accountName: true, }, },
					},
				},),
			],)

			const mappedDepositAssets = depositAssets.map((asset,) => {
				totalAssets = totalAssets + asset.usdValue

				return {
					assetId:       asset.id,
					portfolioName: this.cryptoService.decryptString(asset.portfolio.name,),
					entityName:    this.cryptoService.decryptString(asset.entity.name,),
					accountName:   this.cryptoService.decryptString(asset.account.accountName,),
					bankName:      asset.bank.bankName,
					startDate:     asset.startDate.toISOString(),
					...(asset.maturityDate ?
						{ maturityDate: asset.maturityDate.toISOString(), } :
						{}),
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					interest:      asset.interest,
					policy:        asset.policy,
					usdValue:      asset.usdValue,
					isTransferred: Boolean(asset.transferDate,),
				}
			},)

			return {
				list: sortMapped(mappedDepositAssets,),
				totalAssets,
			}
		} catch (error) {
			return {
				list:        [],
				totalAssets: 0,
			}
		}
	}

	// public async getAllByFilters(filters: DepositFilterDto, clientId?: string,): Promise<IDepositByFilter> {
	// 	const where: Prisma.AssetWhereInput = {
	// 		isArchived:  false,
	// 		assetName:  filters.type,
	// 		clientId:   {
	// 			in: clientId ?
	// 				[clientId,] :
	// 				filters.clientIds,
	// 		},
	// 		portfolioId: {
	// 			in: filters.portfolioIds,
	// 		},
	// 		entityId: {
	// 			in: filters.entityIds,
	// 		},
	// 		bankId: {
	// 			in: filters.bankIds,
	// 		},
	// 		bank: {
	// 			is: {
	// 				bankListId: { in: filters.bankListIds, },
	// 			},
	// 		},
	// 		accountId: {
	// 			in: filters.accountIds,
	// 		},
	// 		portfolio: {
	// 			is: {
	// 				isActivated: true,
	// 			},
	// 		},
	// 	}
	// 	try {
	// 		let totalAssets = 0

	// 		const [allAssets, currencyList,] = await Promise.all([
	// 			this.prismaService.asset.findMany({
	// 				where,
	// 				include: {
	// 					portfolio: true,
	// 					entity:    true,
	// 					bank:      true,
	// 					account:   true,
	// 				},
	// 			},),
	// 			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
	// 		],)
	// 		const assetsWithUsdValue = allAssets
	// 			.filter((asset,) => {
	// 				if (!filters.currencies || filters.currencies.length === 0) {
	// 					return true
	// 				}
	// 				if (typeof asset.payload === 'string') {
	// 					const parsedPayload = JSON.parse(asset.payload,)
	// 					return filters.currencies.includes(parsedPayload?.currency,)
	// 				}

	// 				return false
	// 			},)
	// 			.map((asset,) => {
	// 				const assetPayload = assetParser<IDepositAsset>(asset,)
	// 				if (assetPayload) {
	// 					const { currencyValue, startDate, currency, maturityDate,} = assetPayload
	// 					if (startDate && filters.date && endOfDay(new Date(filters.date,),) < new Date(startDate,)) {
	// 						return null
	// 					}
	// 					if (!filters.date && maturityDate && new Date(maturityDate,) < new Date()) {
	// 						return null
	// 					}
	// 					if (filters.date && maturityDate && new Date(filters.date,) >= new Date(maturityDate,)) {
	// 						return null
	// 					}
	// 					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 						currency,
	// 						currencyValue,
	// 						currencyList,
	// 						historyDate:   filters.date,
	// 					},)
	// 					totalAssets = totalAssets + usdValue
	// 					return {
	// 						assetId:       asset.id,
	// 						portfolioName: asset.portfolio?.name && this.cryptoService.decryptString(asset.portfolio.name,),
	// 						entityName:    asset.entity?.name  && this.cryptoService.decryptString(asset.entity.name,),
	// 						accountName:    asset.account?.accountName && this.cryptoService.decryptString(asset.account.accountName,),
	// 						bankName:      asset.bank?.bankName,
	// 						startDate:     assetPayload.startDate,
	// 						maturityDate:  assetPayload.maturityDate,
	// 						currency:      assetPayload.currency,
	// 						currencyValue: assetPayload.currencyValue,
	// 						interest:      assetPayload.interest,
	// 						policy:        assetPayload.policy,
	// 						usdValue,
	// 					}
	// 				}
	// 				return null
	// 			},)
	// 			.filter((item,): item is IAnalyticDeposit => {
	// 				return item !== null
	// 			},)
	// 			.filter((item,) => {
	// 				return item.usdValue !== 0
	// 			},)
	// 			.sort((a, b,) => {
	// 				if (filters.sortBy === TDepositTableSortVariants.MATURITY_DATE) {
	// 					return this.compareDatesForSorting(a.maturityDate, b.maturityDate, filters.sortOrder,)
	// 				}
	// 				let aValue: number = 0
	// 				let bValue: number = 0

	// 				if (filters.sortBy === TDepositTableSortVariants.START_DATE) {
	// 					aValue = new Date(a.startDate,).getTime()
	// 					bValue = new Date(b.startDate,).getTime()
	// 				} else {
	// 					aValue = a.usdValue
	// 					bValue = b.usdValue
	// 				}

	// 				const comparison = aValue - bValue

	// 				if (comparison !== 0) {
	// 					return filters.sortOrder === 'asc' ?
	// 						comparison :
	// 						-comparison
	// 				}
	// 				return 0
	// 			},)

	// 		return {
	// 			list: assetsWithUsdValue,
	// 			totalAssets,
	// 		}
	// 	} catch (error) {
	// 		return {
	// 			list:             [],
	// 			totalAssets:      0,
	// 		}
	// 	}
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
	public async getFilteredAssets(
		filter: DepositCurrencyFilterDto,
		assetIds?: Array<string>,
		clientId?: string,
	): Promise<Array<TAssetExtended>> {
		const where: Prisma.AssetWhereInput = {
			isArchived: false,
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
			...(assetIds?.length ?
				{ id: { in: assetIds, }, } :
				{}),
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
				bank:   {
					include: {
						bankList: true,
					},
				},
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
   * @param {AnalyticsCashFilterDto} filter - The filter criteria for retrieving bank analytics.
   * @returns {Promise<Array<TBankAnalytics>>} - A Promise resolving to an array of bank analytics data.
   */
	// New after asset refactor
	public async getBankAnalytics(
		filters: DepositCurrencyFilterDto,
		clientId?: string,
	): Promise<Array<TBankAnalytics>> {
		try {
			const now = new Date()
			if (filters.date) {
				const [depositAssets, depositAssetsWithVersion, currencyList,] = await Promise.all([
          	this.prismaService.assetDeposit.findMany({
          		where: {
          			clientId:    { in: filters.clientIds, },
          			portfolioId: { in: filters.portfolioIds, },
          			entityId:    { in: filters.entityIds, },
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
							...(filters.assetIds?.length ?
								{ id: { in: filters.assetIds, }, } :
								{}),
          			AND: [
          					{
          						OR: [
          							{ maturityDate: { gt: endOfDay(new Date(filters.date,),), }, },
          							{ maturityDate: null, },
          						],
          					},
          				{ startDate: { lte: endOfDay(new Date(filters.date,),), }, },
          				{OR: [
          							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
          							{ transferDate: null, },
          						],},
          			],
          			assetDepositVersions: {
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
          	},),
          	this.prismaService.assetDeposit.findMany({
          		where: {
          			clientId:    { in: filters.clientIds, },
          			portfolioId: { in: filters.portfolioIds, },
          			entityId:    { in: filters.entityIds, },
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
							OR: [
          							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
          							{ transferDate: null, },
          			],
          			assetDepositVersions: {
          				some: {
									...(filters.assetIds?.length ?
										{ id: { in: filters.assetIds, }, } :
										{}),
          					usdValue:  { not: 0, },
          					currency:  { in: filters.currencies, },
          					startDate: { lte: endOfDay(new Date(filters.date,),), },
          					OR:        [
          						{ maturityDate: { gt: endOfDay(new Date(filters.date,),), }, },
          						{
          							AND: [
          								{ maturityDate: null, },
          								{ startDate: { lte: endOfDay(new Date(filters.date,),), }, },
          							],
          						},
          					],
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
          			assetDepositVersions: {
          				where: {
          					createdAt: { lte: endOfDay(new Date(filters.date,),), },
          				},
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
          				orderBy: { createdAt: 'desc', },
          				take:    1,
          			},
          		},
          	},),
          	this.cBondsCurrencyService.getAllCurrenciesWithHistory(filters.date,),
         	],)
			 const normalizedDepositAssets = depositAssets.map((a,) => {
      		return {
      		...a,
      		assetDepositVersions: [],
      	}
      	},)
      	const allAssets = [
      		...depositAssetsWithVersion,
      		...normalizedDepositAssets,
      	]
				const mappedDepositAssets = allAssets
					.map((asset,) => {
						if (Boolean(asset.assetDepositVersions.length,)) {
      			const [assetVersion,] = asset.assetDepositVersions
							const { currencyValue, bank, currency,} = assetVersion
							const bankListName = bank.bankList?.name
							const bankName = bankListName ?? bank.bankName
							if (!bankName || !bank.bankListId) {
								return null
							}
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
              				return item.currency === currency
							},)
							const rate = currencyData ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								1
							const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
							return {
								id:       bank.bankListId,
								bankName,
								usdValue,
							}
      		}
						const { currencyValue, currency, bank, } = asset
						const bankListName = bank.bankList?.name
						const bankName = bankListName ?? bank.bankName

						if (!bankName || !bank.bankListId) {
							return null
						}
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
              			return item.currency === currency
              		},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
						return {
							id: bank.bankListId,
							bankName,
							usdValue,
						}
					},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				return mappedDepositAssets
			}
			const [depositAssets,] = await Promise.all([
				this.prismaService.assetDeposit.findMany({
					where: {
						clientId:    { in: filters.clientIds, },
						portfolioId: { in: filters.portfolioIds, },
						entityId:    { in: filters.entityIds, },
						accountId:   { in: filters.accountIds, },
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
						...(filters.assetIds?.length ?
							{ id: { in: filters.assetIds, }, } :
							{}),
						transferDate: null,
      			AND:          [
      					{
      						OR: [{ maturityDate: { gt: endOfDay(now,), }, }, { maturityDate: null, },],
      					},
      				filters.date ?
      					{ startDate: { lte: endOfDay(new Date(filters.date,),), }, } :
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
				},),
			],)

			const mappedDepositAssets = depositAssets
				.map((asset,) => {
					const { usdValue, bank, } = asset
					const bankListName = bank.bankList?.name
					const bankName = bankListName ?? bank.bankName

					if (!bankName || !bank.bankListId) {
						return null
					}

					return {
						id: bank.bankListId,
						bankName,
						usdValue,
					}
				},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			return mappedDepositAssets
		} catch (error) {
			return []
		}
	}

	// public async getBankAnalytics(filter: DepositCurrencyFilterDto, clientId?: string,): Promise<Array<TBankAnalytics>> {
	// 	const [assets,currencyList,] = await Promise.all([
	// 		this.getFilteredAssets(filter, filter.assetIds, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 	],)

	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const parsedPayload = assetParser<IDepositAsset>(asset,)
	// 			if (parsedPayload) {
	// 				const { currencyValue, currency, startDate, maturityDate,} = parsedPayload
	// 				if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 					return null
	// 				}
	// 				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 					return null
	// 				}
	// 				if (maturityDate && new Date(maturityDate,) < new Date()) {
	// 					return null
	// 				}
	// 				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 					currency:    parsedPayload.currency,
	// 					currencyValue,
	// 					currencyList,
	// 					historyDate:   filter.date,
	// 				},)
	// 				return {
	// 					id:       asset.bank?.bankListId,
	// 					bankName: asset.bank?.bankList?.name ?? asset.bank?.bankName ,
	// 					usdValue,
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
	// 	return analyticsData
	// }

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
   * @param {DepositCurrencyFilterDto} filter - The filter criteria for retrieving currency analytics.
   * @returns {Promise<Array<TCurrencyAnalytics>>} - A Promise resolving to an array of currency analytics.
   */
	public async getCurrencyAnalytics(
		filters: DepositCurrencyFilterDto,
		clientId?: string,
	): Promise<Array<TCurrencyAnalytics>> {
		try {
			const now = new Date()
			if (filters.date) {
				const [depositAssets, depositAssetsWithVersion, currencyList,] =
          await Promise.all([
          	this.prismaService.assetDeposit.findMany({
          		where: {
          			clientId:    { in: filters.clientIds, },
          			portfolioId: { in: filters.portfolioIds, },
          			entityId:    { in: filters.entityIds, },
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
          			...(filters.assetIds?.length ?
          				{ id: { in: filters.assetIds, }, } :
          				{}),
          			AND: [
          					{
          						OR: [
          							{ maturityDate: { gt: endOfDay(new Date(filters.date,),), }, },
          							{ maturityDate: null, },
          						],
          					},
          				{ startDate: { lte: endOfDay(new Date(filters.date,),), }, },
          				{OR: [
          							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
          							{ transferDate: null, },
          						],},
          			],
          			assetDepositVersions: {
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
          	this.prismaService.assetDeposit.findMany({
          		where: {
          			clientId:    { in: filters.clientIds, },
          			portfolioId: { in: filters.portfolioIds, },
          			entityId:    { in: filters.entityIds, },
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
          			OR: [
          							{ transferDate: { gte: endOfDay(new Date(filters.date,),), }, },
          							{ transferDate: null, },
          			],
          			assetDepositVersions: {
          				some: {
          					...(filters.assetIds?.length ?
          				{ id: { in: filters.assetIds, }, } :
          				{}),
          					usdValue:  { not: 0, },
          					currency:  { in: filters.currencies, },
          					startDate: { lte: endOfDay(new Date(filters.date,),), },
          					OR:        [
          						{ maturityDate: { gt: endOfDay(new Date(filters.date,),), }, },
          						{
          							AND: [
          								{ maturityDate: null, },
          								{ startDate: { lte: endOfDay(new Date(filters.date,),), }, },
          							],
          						},
          					],
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
          					bankName: true,
          				},
          			},
          			account: {
          				select: {
          					accountName: true,
          				},
          			},

          			assetDepositVersions: {
          				where: {
          					createdAt: { lte: endOfDay(new Date(filters.date,),), },

          				},
          				include: {
          					account:   { select: { accountName: true, }, },
          					bank:      { select: { bankName: true, }, },
          					entity:    { select: { name: true, }, },
          					portfolio: { select: { name: true, }, },
          				},
          				orderBy: { createdAt: 'desc', },
          				take:    1,
          			},
          		},
          	},),
          	this.cBondsCurrencyService.getAllCurrenciesWithHistory(
          		filters.date,
          	),
          ],)
			 const normalizedDepositAssets = depositAssets.map((a,) => {
      		return {
      		...a,
      		assetDepositVersions: [],
      	}
      	},)
      	const allAssets = [
      		...depositAssetsWithVersion,
      		...normalizedDepositAssets,
      	]
				const mappedDepositAssets = allAssets.map((asset,) => {
					if (Boolean(asset.assetDepositVersions.length,)) {
      			const [assetVersion,] = asset.assetDepositVersions
						const { currencyValue, currency,} = assetVersion
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
            	return item.currency === currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
						return {
							currency,
							currencyValue,
							usdValue,
						} as TCurrencyAnalytics
      		}
					const { currencyValue, currency, } = asset
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
            	return item.currency === currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((currencyValue * rate).toFixed(2,),)
					return {
						currency,
						currencyValue,
						usdValue,
					} as TCurrencyAnalytics
				},)
				const currencyTotals = mappedDepositAssets.reduce((acc, item,) => {
					return  acc + item.usdValue
				},0,)
				return mappedDepositAssets
			}
			const [depositAssets,] = await Promise.all([
				this.prismaService.assetDeposit.findMany({
					where: {
						clientId:    { in: filters.clientIds, },
						portfolioId: { in: filters.portfolioIds, },
						entityId:    { in: filters.entityIds, },
						accountId:   { in: filters.accountIds, },
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
						...(filters.assetIds?.length ?
							{ id: { in: filters.assetIds, }, } :
							{}),
						transferDate: null,
      			AND:          [
      					{
      						OR: [{ maturityDate: { gt: endOfDay(now,), }, }, { maturityDate: null, },],
      					},
      				filters.date ?
      					{ startDate: { lte: endOfDay(new Date(filters.date,),), }, } :
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
				},),
			],)

			const mappedDepositAssets = depositAssets.map((asset,) => {
				const { usdValue, currency, currencyValue, } = asset
				return {
					currency,
					currencyValue,
					usdValue,
				} as TCurrencyAnalytics
			},)
			return mappedDepositAssets
		} catch (error) {
			return []
		}
	}

	// public async getCurrencyAnalytics(filter: DepositCurrencyFilterDto, clientId?: string,): Promise<Array<TCurrencyAnalytics>> {
	// 	const [assets, currencyList,] = await Promise.all([
	// 		this.getFilteredAssets(filter, filter.assetIds, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 	],)
	// 	const analyticsData = assets
	// 		.map((asset,) => {
	// 			const parsedPayload = assetParser<IDepositAsset>(asset,)
	// 			if (parsedPayload) {
	// 				const {currency, currencyValue, startDate, maturityDate,} = parsedPayload
	// 				if (filter.currencies && !filter.currencies.includes(currency,)) {
	// 					return null
	// 				}
	// 				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 					return null
	// 				}
	// 				if (maturityDate && new Date(maturityDate,) < new Date()) {
	// 					return null
	// 				}
	// 				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 					currency,
	// 					currencyValue,
	// 					currencyList,
	// 					historyDate:   filter.date,
	// 				},)
	// 				return {
	// 					currency,
	// 					currencyValue,
	// 					usdValue,
	// 				} as TCurrencyAnalytics
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is TCurrencyAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.filter((item,) => {
	// 			return item.usdValue !== 0
	// 		},)
	// 	return analyticsData
	// }

	/**
   * CR - 114/138
   * Synchronous duplicate of an existing asynchronous function.
   * The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
   * is passed directly via function arguments to avoid additional asynchronous calls.
   * Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
   */
	public syncGetAllByFilters(
		data: TAssetCacheInitials,
		filters: DepositFilterDto,
		clientId?: string,
	): IDepositByFilter {
		const { assets, currencyList, } = data
		let totalAssets = 0
		const assetsWithUsdValue = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
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
				const assetPayload = assetParser<IDepositAsset>(asset,)
				if (assetPayload) {
					const { currencyValue, startDate, currency, maturityDate, } =
            assetPayload
					if (
						startDate &&
            filters.date &&
            endOfDay(new Date(filters.date,),) < new Date(startDate,)
					) {
						return null
					}
					if (maturityDate && new Date(maturityDate,) < new Date()) {
						return null
					}
					const usdValue =
            this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory(
            	{
            		currency,
            		currencyValue,
            		currencyList,
            		historyDate: filters.date,
            	},
            )
					totalAssets = totalAssets + usdValue
					return {
						assetId: asset.id,
						portfolioName:
              asset.portfolio?.name &&
              this.cryptoService.decryptString(asset.portfolio.name,),
						entityName:
              asset.entity?.name &&
              this.cryptoService.decryptString(asset.entity.name,),
						accountName:
              asset.account?.accountName &&
              this.cryptoService.decryptString(asset.account.accountName,),
						bankName:      asset.bank?.bankName,
						startDate:     assetPayload.startDate,
						maturityDate:  assetPayload.maturityDate,
						currency:      assetPayload.currency,
						currencyValue: assetPayload.currencyValue,
						interest:      assetPayload.interest,
						policy:        assetPayload.policy,
						usdValue,
      				isTransferred: false,
					}
				}
				return null
			},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
			.filter((item,) => {
				return item.usdValue !== 0
			},)
		// .sort((a, b,) => {
		// 	if (filters.sortBy === TDepositTableSortVariants.MATURITY_DATE) {
		// 		return this.compareDatesForSorting(a.maturityDate, b.maturityDate, filters.sortOrder,)
		// 	}

		// 	let aValue: number = 0
		// 	let bValue: number = 0

		// 	if (filters.sortBy === TDepositTableSortVariants.START_DATE) {
		// 		aValue = new Date(a.startDate,).getTime()
		// 		bValue = new Date(b.startDate,).getTime()
		// 	} else {
		// 		aValue = a.usdValue
		// 		bValue = b.usdValue
		// 	}

		// 	const comparison = aValue - bValue

		// 	if (comparison !== 0) {
		// 		return filters.sortOrder === 'asc' ?
		// 			comparison :
		// 			-comparison
		// 	}
		// 	return 0
		// },)
		return {
			list: assetsWithUsdValue,
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
	public syncGetBankAnalytics(
		data: TAssetCacheInitials,
		filter: DepositCurrencyFilterDto,
		clientId?: string,
	): Array<TBankAnalytics> {
		const { assets, currencyList, } = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IDepositAsset>(asset,)
				if (parsedPayload) {
					const { currencyValue, currency, startDate, maturityDate, } =
            parsedPayload
					if (filter.currencies && !filter.currencies.includes(currency,)) {
						return null
					}
					if (
						startDate &&
            filter.date &&
            endOfDay(new Date(filter.date,),) < new Date(startDate,)
					) {
						return null
					}
					if (maturityDate && new Date(maturityDate,) < new Date()) {
						return null
					}
					const usdValue =
            this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory(
            	{
            		currency:    parsedPayload.currency,
            		currencyValue,
            		currencyList,
            		historyDate: filter.date,
            	},
            )
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
	public syncGetCurrencyAnalytics(
		data: TAssetCacheInitials,
		filter: DepositCurrencyFilterDto,
		clientId?: string,
	): Array<TCurrencyAnalytics> {
		const { assets, currencyList, } = data
		const analyticsData = assets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const parsedPayload = assetParser<IDepositAsset>(asset,)
				if (parsedPayload) {
					const { currency, currencyValue, startDate, maturityDate, } =
            parsedPayload
					if (filter.currencies && !filter.currencies.includes(currency,)) {
						return null
					}
					if (
						startDate &&
            filter.date &&
            endOfDay(new Date(filter.date,),) < new Date(startDate,)
					) {
						return null
					}
					if (maturityDate && new Date(maturityDate,) < new Date()) {
						return null
					}
					const usdValue =
            this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory(
            	{
            		currency,
            		currencyValue,
            		currencyList,
            		historyDate: filter.date,
            	},
            )
					return {
						currency,
						currencyValue,
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

	/**
   * 3.5.4
   * Compares two date strings for sorting, considering sort order and "N/A" values.
   * @remarks
   * Treats "N/A" or invalid dates as maximum values to always place them at the end,
   * regardless of ascending or descending order.
   * @param aDate - First date string or "N/A".
   * @param bDate - Second date string or "N/A".
   * @param order - Sort order: 'asc' for ascending, 'desc' for descending.
   * @returns A number indicating sort order: negative if aDate < bDate, positive if greater, zero if equal.
   */
	private compareDatesForSorting(
		aDate: string,
		bDate: string,
		order: 'asc' | 'desc',
	): number {
		const max = Number.MAX_SAFE_INTEGER
		function getTimeSafe(dateStr: string,): number {
			if (!dateStr || dateStr.toLowerCase() === 'n/a') {
				return max
			}
			const t = new Date(dateStr,).getTime()
			return isNaN(t,) ?
				max :
				t
		}
		const aTime = getTimeSafe(aDate,)
		const bTime = getTimeSafe(bDate,)
		if (aTime === max && bTime === max) {
			return 0
		}
		if (aTime === max) {
			return 1
		}
		if (bTime === max) {
			return -1
		}
		return order === 'asc' ?
			aTime - bTime :
			bTime - aTime
	}
}
