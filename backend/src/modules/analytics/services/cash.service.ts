/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
import { Injectable, Logger, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { CurrencyDataList, Prisma, } from '@prisma/client'

import { CBondsCurrencyService, } from '../../apis/cbonds-api/services'
import type { CashFilterDto, } from '../dto'
import type { TBankCashAnalytics, TCurrencyAnalytics, TEntityCashAnalytics, } from '../analytics.types'
import { assetParser, } from '../../../shared/utils'
import type { ICashAsset, TAssetExtended, } from '../../asset/asset.types'
import { CryptoService, } from '../../crypto/crypto.service'
import type { TCacheInitials, } from '../../../modules/common/cache-sync/cache-sync.types'

export type TransactionResult = Prisma.TransactionGetPayload<{
  select: {
    currency: true;
    amount: true;
    bank: {
      select: {
        bankName: true;
        bankList: true;
      };
    };
	entity: {
					select: {
						id: true;
						name: true;
					}
				};
  };
}>

@Injectable()
export class CashService {
	private readonly logger = new Logger(CashService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
 * 3.5.4
 * Retrieves and filters assets based on the provided filter criteria.
 * @remarks
 * This method filters assets based on the specified criteria, including portfolio IDs, entity IDs, bank IDs, account IDs, and currencies.
 * It also supports filtering by date range.
 * @param filter - The filter criteria for retrieving assets.
 * @param clientId - An optional client ID to further filter assets.
 * @returns A promise that resolves to an array of extended asset data.
 */
	private async getFilteredAssets(filter: CashFilterDto, clientId?: string,): Promise<Array<TAssetExtended>> {
		const {
			type,
		} = filter

		if (
			filter.clientIds?.length === 0 ||
			filter.portfolioIds?.length === 0 ||
			filter.entitiesIds?.length === 0 ||
			filter.bankIds?.length === 0 ||
			filter.bankListIds?.length === 0 ||
			filter.currencies?.length === 0
		) {
			return []
		}
		// todo: Clarification needed
		// const date = filter.date ?
		// 	new Date(filter.date,) :
		// 	new Date()
		// date.setUTCHours(23, 59, 59, 0,)
		// const dateResult = date.toISOString()
		const where: Prisma.AssetWhereInput = {
			assetName:   type,
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
			// todo: Clarification needed
			// ...(filter.date ?
			// 	{ createdAt: { lte: dateResult, }, } :
			// 	{}),
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
 * 3.5.2
 * Retrieves and filters transactions based on the provided filter criteria.
 * @remarks
 * This method filters transactions based on the specified criteria, including portfolio IDs, entity IDs, bank IDs, account IDs, and dates.
 * @param filter - The filter criteria for retrieving transactions.
 * @param clientId - An optional client ID to further filter transactions.
 * @returns A promise that resolves to an array of transaction data.
 */
	// private async getFilteredTransactions(filter: CashFilterDto, clientId?: string,): Promise<Array<Transaction>> {
	private async getFilteredTransactions(filter: CashFilterDto, clientId?: string,): Promise<Array<TransactionResult>> {
		// todo: Clarification needed
		const date = filter.date ?
			new Date(filter.date,) :
			new Date()
		date.setUTCHours(0, 0, 59, 0,)
		const dateResult = date.toISOString()
		return this.prismaService.transaction.findMany({
			where: {
				clientId: {
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
					isActivated: true,
				},
				currency: {
					in: filter.currencies,
				},
				transactionDate: filter.date &&
					{
						lte: dateResult,
					},
			},
			select: {
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				bank: {
					select: {
						bankName: true,
						bankList: true,
					},
				},
				amount:   true,
				currency: true,
			},
		},)
	}

	/**
 * 3.5.4
 * Parses and filters assets based on the provided filter criteria.
 * @remarks
 * This method parses the filtered assets to ensure they conform to the correct format and filter out unwanted assets based on the provided criteria.
 * It also filters assets by currency.
 * @param filter - The filter criteria for retrieving assets.
 * @param clientId - An optional client ID to further filter assets.
 * @returns A promise that resolves to an array of filtered and parsed asset data.
 */
	private async parseAndFilterAssets(filter: CashFilterDto, clientId?: string,): Promise<Array<ICashAsset>> {
		const assets = await this.getFilteredAssets(filter, clientId,)

		const analyticsData = assets
			.map((asset,) => {
				const parsedAsset = assetParser<ICashAsset>(asset,)

				if (!parsedAsset) {
					return null
				}

				if (filter.currencies && !filter.currencies.includes(parsedAsset.currency,)) {
					return null
				}

				return parsedAsset
			},)
			.filter((item,): item is ICashAsset => {
				return item !== null
			},)

		return analyticsData
	}

	/**
 * 3.5.4
 * Retrieves entity-specific analytics data based on the provided filter.
 * @remarks
 * This method aggregates asset and transaction data to provide entity-specific analytics, including currency values in USD.
 * @param filter - The filter criteria for retrieving entity analytics.
 * @param clientId - An optional client ID to filter the analytics.
 * @returns A promise that resolves to an array of entity analytics data.
 */
	// New refactored version
	public async getEntityAnalytics(filter: CashFilterDto, clientId?: string,): Promise<Array<TEntityCashAnalytics>> {
		const [transactions, currencyList,] = await Promise.all([
			this.getFilteredTransactions(filter, clientId,),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
		],)
		const updatedAssets = transactions
			.map((transaction,) => {
				const { currency, entity, amount, } = transaction
				if (!entity) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      currency as CurrencyDataList,
					currencyValue: Number(amount,),
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:            entity.id,
					entityName:    this.cryptoService.decryptString(entity.name,),
					currencyValue: Number(amount,),
					usdValue,

				}
			},)
			.filter((item,): item is TEntityCashAnalytics => {
				return item !== null
			},)
			.reduce<Array<TEntityCashAnalytics>>((acc, asset,) => {
				const {
					id,
					entityName,
					currencyValue,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.usdValue = existing.usdValue + usdValue
					existing.currencyValue = existing.currencyValue + currencyValue
				} else {
					acc.push({
						id,
						entityName,
						usdValue,
						currencyValue,
					},)
				}
				return acc
			}, [],)
		return updatedAssets
	}

	// public async getEntityAnalytics(filter: CashFilterDto, clientId?: string,): Promise<Array<TEntityCashAnalytics>> {
	// 	const log = this.getTimestampLogger()
	// 	log('getEntityAnalytics','Start',)
	// 	const [assets, transactions, currencyList,] = await Promise.all([
	// 		this.parseAndFilterAssets(filter, clientId,),
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 	],)
	// 	log('getEntityAnalytics','After DB query',)

	// 	const updatedAssets = assets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const {currency, accountId,} = asset
	// 			const transactionValues = transactions.reduce((acc, transaction,) => {
	// 				if (transaction.currency === currency && transaction.accountId === accountId) {
	// 					acc.currencyValue = Number(acc.currencyValue,) + Number(transaction.amount,)
	// 					acc.usdValue = Number(acc.usdValue,) + (Number(transaction.amount,) * (transaction.rate ?? 1))
	// 				}
	// 				return acc
	// 			}, {
	// 				currencyValue: 0,
	// 				usdValue:      0,
	// 			},)
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: transactionValues.currencyValue,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    this.cryptoService.decryptString(asset.entity.name,),
	// 				currencyValue: transactionValues.currencyValue,
	// 				usdValue,

	// 			}
	// 		},)
	// 		.filter((item,): item is TEntityCashAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.reduce<Array<TEntityCashAnalytics>>((acc, asset,) => {
	// 			const {
	// 				id,
	// 				entityName,
	// 				currencyValue,
	// 				usdValue,
	// 			} = asset
	// 			const existing = acc.find((item,) => {
	// 				return item.id === id
	// 			},)
	// 			if (existing) {
	// 				existing.usdValue = existing.usdValue + usdValue
	// 				existing.currencyValue = existing.currencyValue + currencyValue
	// 			} else {
	// 				acc.push({
	// 					id,
	// 					entityName,
	// 					usdValue,
	// 					currencyValue,
	// 				},)
	// 			}
	// 			return acc
	// 		}, [],)
	// 	log('getEntityAnalytics','After computing (map)',)

	// 	return updatedAssets
	// }

	/**
 * 3.5.4
 * Retrieves bank-specific analytics data based on the provided filter.
 * @remarks
 * This method aggregates asset and transaction data to provide bank-specific analytics, including currency values in USD.
 * @param filter - The filter criteria for retrieving bank analytics.
 * @param clientId - An optional client ID to filter the analytics.
 * @returns A promise that resolves to an array of bank analytics data.
 */
	// New refactored version
	public async getBankAnalytics(filter: CashFilterDto, clientId?: string,): Promise<Array<TBankCashAnalytics>> {
		const [transactions, currencyList,] = await Promise.all([
			this.getFilteredTransactions(filter, clientId,),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
		],)
		const udatedAssets =  transactions
			.map((transaction,) => {
				const { currency, bank, amount, } = transaction
				if (!bank?.bankList) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      currency as CurrencyDataList,
					currencyValue: Number(amount,),
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:            bank.bankList.id,
					bankName:      bank.bankName,
					currencyValue: parseFloat(amount.toFixed(2,),),
					usdValue:      parseFloat(usdValue.toFixed(2,),),
				}
			},)
			.filter((item,): item is TBankCashAnalytics => {
				return item !== null
			},)
			.reduce<Array<TBankCashAnalytics>>((acc, asset,) => {
				const {
					id,
					bankName,
					currencyValue,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.usdValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),) === 0 ?
						0 :
						parseFloat((existing.usdValue + usdValue).toFixed(2,),)
					existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
				} else {
					acc.push({
						id,
						bankName,
						usdValue,
						currencyValue,
					},)
				}
				return acc
			}, [],)
		return udatedAssets
	}

	// public async getBankAnalytics(filter: CashFilterDto, clientId?: string,): Promise<Array<TBankCashAnalytics>> {
	// 	const [assets, transactions, currencyList,] = await Promise.all([
	// 		this.parseAndFilterAssets(filter, clientId,),
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 	],)
	// 	const udatedAssets =  assets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { currency,accountId, bank,} = asset
	// 			const transactionValues = transactions.reduce((acc, transaction,) => {
	// 				if (transaction.currency === currency && transaction.accountId === accountId && bank.id === transaction.bankId) {
	// 					acc.currencyValue = Number(acc.currencyValue,) + Number(transaction.amount,)
	// 					acc.usdValue = Number(acc.usdValue,) + (Number(transaction.amount,) * (transaction.rate ?? 1))
	// 				}
	// 				return acc
	// 			}, {
	// 				currencyValue: 0,
	// 				usdValue:      0,
	// 			},)
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: transactionValues.currencyValue,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				id:            asset.bank.bankListId,
	// 				bankName:      asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				currencyValue: parseFloat(transactionValues.currencyValue.toFixed(2,),),
	// 				usdValue:      parseFloat(usdValue.toFixed(2,),),
	// 			}
	// 		},)
	// 		.filter((item,): item is TBankCashAnalytics => {
	// 			return item !== null
	// 		},)
	// 		.reduce<Array<TBankCashAnalytics>>((acc, asset,) => {
	// 			const {
	// 				id,
	// 				bankName,
	// 				currencyValue,
	// 				usdValue,
	// 			} = asset
	// 			const existing = acc.find((item,) => {
	// 				return item.id === id
	// 			},)
	// 			if (existing) {
	// 				existing.usdValue = existing.usdValue + usdValue
	// 				existing.currencyValue = existing.currencyValue + currencyValue
	// 			} else {
	// 				acc.push({
	// 					id,
	// 					bankName,
	// 					usdValue,
	// 					currencyValue,
	// 				},)
	// 			}
	// 			return acc
	// 		}, [],)
	// 	return udatedAssets
	// }

	/**
 * 3.5.4
 * Retrieves currency-specific analytics data based on the provided filter.
 * @remarks
 * This method aggregates asset and transaction data to provide currency-specific analytics, including currency values and their equivalent in USD.
 * @param filter - The filter criteria for retrieving currency analytics.
 * @param clientId - An optional client ID to filter the analytics.
 * @returns A promise that resolves to an array of currency analytics data.
 */
	// todo: delete after new ver good
	// public async getCurrencyAnalytics(filter: CashFilterDto, clientId?: string,): Promise<Array<TCurrencyAnalytics>> {
	// 	const [transactions, currencyList,] = await Promise.all([
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 	],)
	// 	const updatedAssets = transactions
	// 		.map((transaction,) => {
	// 			const { currency, amount, } = transaction
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency:      currency as CurrencyDataList,
	// 				currencyValue: Number(amount,),
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				currency:      currency as CurrencyDataList,
	// 				currencyValue: Number(amount.toFixed(2,),),
	// 				usdValue:      Number(usdValue.toFixed(2,),),
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			if (filter.transactionCreation) {
	// 				return true
	// 			}
	// 			return asset.currencyValue !== 0
	// 		},)
	// 		.reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
	// 			if (!asset) {
	// 				return acc
	// 			}
	// 			const {
	// 				currency,
	// 				currencyValue,
	// 				usdValue,
	// 			} = asset
	// 			const existing = acc.find((item,) => {
	// 				return item.currency === currency
	// 			},)
	// 			if (existing) {
	// 				existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
	// 				existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
	// 			} else {
	// 				acc.push({
	// 					usdValue:      parseFloat(usdValue.toFixed(2,),),
	// 					currencyValue: parseFloat(currencyValue.toFixed(2,),),
	// 					currency,
	// 				},)
	// 			}
	// 			return acc
	// 		}, [],)
	// 	return updatedAssets
	// }
	public async getCurrencyAnalytics(filter: CashFilterDto, clientId?: string,): Promise<Array<TCurrencyAnalytics>> {
		const [transactions, currencyList,] = await Promise.all([
			this.getFilteredTransactions(filter, clientId,),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
		],)

		const updatedAssets = transactions
			.map((transaction,) => {
				const { currency, amount, } = transaction
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      currency as CurrencyDataList,
					currencyValue: Number(amount,),
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					currency:      currency as CurrencyDataList,
					currencyValue: parseFloat(amount.toFixed(2,),),
					usdValue:      parseFloat(usdValue.toFixed(2,),),
				}
			},)
			.filter((asset,) => {
				if (filter.transactionCreation) {
					return true
				}
				return asset.currencyValue !== 0
			},)
			.reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
				if (!asset) {
					return acc
				}
				const {
					currency,
					currencyValue,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.currency === currency
				},)
				if (existing) {
					existing.usdValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),) === 0 ?
						0 :
						parseFloat((existing.usdValue + usdValue).toFixed(2,),)
					existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
				} else {
					acc.push({
						usdValue:      currencyValue === 0 ?
							0 :
							parseFloat(usdValue.toFixed(2,),),
						currencyValue: parseFloat(currencyValue.toFixed(2,),),
						currency,
					},)
				}
				return acc
			}, [],)

		if (filter.transactionCreation) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const accountIds = (filter as any).accountIds as Array<string> | undefined

			const cashAssets = await this.prismaService.assetCash.findMany({
				where: {
					...(clientId ?
						{ clientId, } :
						{}),
					...(accountIds?.length ?
						{ accountId: { in: accountIds, }, } :
						{}),
				},
				select: {
					currency: true,
				},
			},)

			const existingCurrencies = new Set(updatedAssets.map((item,) => {
				return item.currency
			},),)

			cashAssets.forEach((cash,) => {
				const currency = cash.currency as CurrencyDataList

				if (!existingCurrencies.has(currency,)) {
					updatedAssets.push({
						currency,
						currencyValue: 0,
						usdValue:      0,
					},)
				}
			},)
		}
		return updatedAssets
	}

	// public async getCurrencyAnalytics(filter: CashFilterDto, clientId?: string,): Promise<Array<TCurrencyAnalytics>> {
	// 	const log = this.getTimestampLogger()
	// 	log('getCurrencyAnalytics','Start',)
	// 	const [assets, transactions, currencyList,] = await Promise.all([
	// 		this.parseAndFilterAssets(filter, clientId,),
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 	],)
	// 	log('getCurrencyAnalytics','After DB query',)

	// 	const updatedAssets = assets
	// 		.map((asset,) => {
	// 			const {currency, accountId,} = asset
	// 			const transactionValues = transactions.reduce<{currencyValue: number, usdValue: number}>((acc, transaction,) => {
	// 				if (transaction.currency === currency && accountId === transaction.accountId) {
	// 					acc.currencyValue = Number(acc.currencyValue,) + Number(transaction.amount,)
	// 					acc.usdValue = Number(acc.usdValue,) + (Number(transaction.amount,) * (transaction.rate ?? 1))
	// 				}
	// 				return acc
	// 			}, {
	// 				currencyValue: 0,
	// 				usdValue:      0,
	// 			},)
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: transactionValues.currencyValue,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				currency,
	// 				currencyValue: Number(transactionValues.currencyValue.toFixed(2,),),
	// 				usdValue:      Number(usdValue.toFixed(2,),),
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			if (filter.transactionCreation) {
	// 				return true
	// 			}
	// 			return asset.currencyValue !== 0
	// 		},)
	// 		.reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
	// 			if (!asset) {
	// 				return acc
	// 			}
	// 			const {
	// 				currency,
	// 				currencyValue,
	// 				usdValue,
	// 			} = asset
	// 			const existing = acc.find((item,) => {
	// 				return item.currency === currency
	// 			},)
	// 			if (existing) {
	// 				existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
	// 				existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
	// 			} else {
	// 				acc.push({
	// 					usdValue:      parseFloat(usdValue.toFixed(2,),),
	// 					currencyValue: parseFloat(currencyValue.toFixed(2,),),
	// 					currency,
	// 				},)
	// 			}
	// 			return acc
	// 		}, [],)
	// 	log('getCurrencyAnalytics','After computing (map)',)

	// 	return updatedAssets
	// }

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	private syncParseAndFilterAssets(assets: Array<TAssetExtended>,): Array<ICashAsset> {
		const analyticsData = assets
			.map((asset,) => {
				const parsedAsset = assetParser<ICashAsset>(asset,)
				if (!parsedAsset) {
					return null
				}
				return parsedAsset
			},)
			.filter((item,): item is ICashAsset => {
				return item !== null
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
	public syncGetEntityAnalytics(data: TCacheInitials,filter: CashFilterDto, clientId?: string,): Array<TEntityCashAnalytics> {
		const {assets, transactions, currencyList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const parsedAssets = this.syncParseAndFilterAssets(assets,)
		return parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const {currency, accountId,} = asset
				const transactionValues = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.accountId === accountId) {
						acc.currencyValue = Number(acc.currencyValue,) + Number(transaction.amount,)
						acc.usdValue = Number(acc.usdValue,) + (Number(transaction.amount,) * (transaction.rate ?? 1))
					}
					return acc
				}, {
					currencyValue: 0,
					usdValue:      0,
				},)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionValues.currencyValue,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:            asset.entity.id,
					entityName:    this.cryptoService.decryptString(asset.entity.name,),
					currencyValue: transactionValues.currencyValue,
					usdValue,
				}
			},)
			.filter((item,): item is TEntityCashAnalytics => {
				return item !== null
			},)
			.reduce<Array<TEntityCashAnalytics>>((acc, asset,) => {
				const {
					id,
					entityName,
					currencyValue,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.usdValue = existing.usdValue + usdValue
					existing.currencyValue = existing.currencyValue + currencyValue
				} else {
					acc.push({
						id,
						entityName,
						usdValue,
						currencyValue,
					},)
				}
				return acc
			}, [],)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetBankAnalytics(data: TCacheInitials,filter: CashFilterDto, clientId?: string,): Array<TBankCashAnalytics> {
		const {assets, transactions, currencyList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const parsedAssets = this.syncParseAndFilterAssets(assets,)
		return parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currency,accountId, bank,} = asset
				const transactionValues = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.accountId === accountId && bank.id === transaction.bankId) {
						acc.currencyValue = Number(acc.currencyValue,) + Number(transaction.amount,)
						acc.usdValue = Number(acc.usdValue,) + (Number(transaction.amount,) * (transaction.rate ?? 1))
					}
					return acc
				}, {
					currencyValue: 0,
					usdValue:      0,
				},)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionValues.currencyValue,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:            asset.bank.bankListId,
					bankName:      asset.bank.bankList?.name ?? asset.bank.bankName,
					currencyValue: parseFloat(transactionValues.currencyValue.toFixed(2,),),
					usdValue:      parseFloat(usdValue.toFixed(2,),),
				}
			},)
			.filter((item,): item is TBankCashAnalytics => {
				return item !== null
			},)
			.reduce<Array<TBankCashAnalytics>>((acc, asset,) => {
				const {
					id,
					bankName,
					currencyValue,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.usdValue = existing.usdValue + usdValue
					existing.currencyValue = existing.currencyValue + currencyValue
				} else {
					acc.push({
						id,
						bankName,
						usdValue,
						currencyValue,
					},)
				}
				return acc
			}, [],)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetCurrencyAnalytics(data: TCacheInitials,filter: CashFilterDto, clientId?: string,): Array<TCurrencyAnalytics> {
		const {assets, transactions, currencyList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const parsedAssets = this.syncParseAndFilterAssets(assets,)

		return parsedAssets
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.map((asset,) => {
				const {currency, accountId,} = asset
				const transactionValues = filteredTransactions.reduce<{currencyValue: number, usdValue: number}>((acc, transaction,) => {
					if (transaction.currency === currency && accountId === transaction.accountId) {
						acc.currencyValue = Number(acc.currencyValue,) + Number(transaction.amount,)
						acc.usdValue = Number(acc.usdValue,) + (Number(transaction.amount,) * (transaction.rate ?? 1))
					}
					return acc
				}, {
					currencyValue: 0,
					usdValue:      0,
				},)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionValues.currencyValue,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					currency,
					currencyValue: Number(transactionValues.currencyValue.toFixed(2,),),
					usdValue:      Number(usdValue.toFixed(2,),),
				}
			},)
			.filter((asset,) => {
				if (filter.transactionCreation) {
					return true
				}
				if (filter.transactionCreation) {
					return true
				}
				return asset.currencyValue !== 0
			},)
			.reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
				if (!asset) {
					return acc
				}
				const {
					currency,
					currencyValue,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.currency === currency
				},)
				if (existing) {
					existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
					existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
				} else {
					acc.push({
						usdValue:      parseFloat(usdValue.toFixed(2,),),
						currencyValue: parseFloat(currencyValue.toFixed(2,),),
						currency,
					},)
				}
				return acc
			}, [],)
	}
}