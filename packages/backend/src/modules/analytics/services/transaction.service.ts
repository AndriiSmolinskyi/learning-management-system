/* eslint-disable no-mixed-operators */
/* eslint-disable max-lines */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Transaction,} from '@prisma/client'
import { Prisma, } from '@prisma/client'
import { format, min, set,  } from 'date-fns'

import type { TransactionFilterDto, } from '../dto'
import type { TransactionAnalyticsRes, TransactionListRes, TransactionPl,} from '../../transaction/transaction.types'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'
import { CryptoService, } from '../../../modules/crypto/crypto.service'
import type { ITransactionFilteredSelects, TransactionChartData,} from '../analytics.types'
import { TransactionType, } from '../analytics.types'
import type { CurrencyDataList, } from '@prisma/client'
import type { TransactionSelectsFilterDto, } from '../dto/transaction-selects.dto'
import type { ITransactionTypeList, } from '../../../modules/list-hub/list-hub.types'

@Injectable()
export class TransactionService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,

	) { }

	/**
 * 3.5.4
 * Retrieves filtered transactions based on the provided filter criteria.
 * @remarks
 * - Filters transactions based on various criteria such as client ID, portfolio, bank, service providers, currencies, transaction types, securities, ISINs, and date range.
 * - Converts the transaction amounts to USD using `cBondsCurrencyService`.
 * - Returns an array of filtered transactions with their details including USD value.
 * @param filter - The filter criteria for retrieving transactions.
 * @param clientId - The optional client ID to filter the transactions further.
 * @returns A Promise resolving to an object containing the total number of transactions and the filtered list of transactions.
 */
	public async getFilteredTransactions(filter: TransactionFilterDto, clientId?: string,): Promise<TransactionAnalyticsRes> {
		const {
			sortBy = 'transactionDate',
			sortOrder = Prisma.SortOrder.desc,
			skip,
			take,
		} = filter

		const orderBy: Array<Prisma.TransactionOrderByWithRelationInput> = [
			{[sortBy]: sortOrder,},
			{ id: Prisma.SortOrder.desc,},
		]
		const date = filter.date ?
			new Date(filter.date,) :
			undefined
		date?.setUTCHours(0, 0, 59, 0,)
		const dateResult = date?.toISOString()
		const startDate = filter.dateRange ?
			new Date(filter.dateRange[0],) :
			undefined
		if (startDate) {
			startDate.setDate(startDate.getDate() - 1,)
		}
		const dateAt20 = startDate && set(startDate, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0, },)
		const where: Prisma.TransactionWhereInput = {
			id: {
				in: filter.transactionIds,
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
			serviceProvider: {
				in: filter.serviceProviders,
			},
			currency: {
				in: filter.currencies,
			},
			transactionTypeId: {
				in: filter.transactionTypes,
			},
			isin: {
				in: filter.isins,
			},
			security: {
				in: filter.securities,
			},
			portfolio: {
				is: {
					isActivated: true,
				},
			},
			transactionDate: filter.date ?
				{ lte: dateResult, } :
				filter.dateRange && startDate ?
					{
						// gte: endOfDay(startDate,).toISOString(),
						gte: dateAt20,
						lte: filter.dateRange[1],
					} :
					undefined,
		}

		const totalPromise =  this.prismaService.transaction.count({ where, },)
		const listPromise =  this.prismaService.transaction.findMany({
			where,
			orderBy,
			skip:    skip && Number(skip,),
			take:    take && Number(take,),
			include: {
				account:         true,
				bank:            {include: { bankList: true, },},
				client:          true,
				documents:       true,
				order:           true,
				portfolio:       true,
				entity:          true,
				transactionType: true,
				typeVersion:     true,
			},
		},
		)

		const [total, list,] = await Promise.all([
			totalPromise, listPromise,
		],)

		const result = list.map((el,) => {
			const usdValue = (Number(el.amount,) * (el.rate ?? 1))

			return {
				id:              el.id,
				transactionDate: el.transactionDate,
				portfolioName:   el.portfolio?.name && this.cryptoService.decryptString(el.portfolio.name,),
				entityName:      el.entity?.name && this.cryptoService.decryptString(el.entity.name,),
				bankName:        el.bank?.bankList?.name ?? el.bank?.bankName,
				accountName:     el.account?.accountName && this.cryptoService.decryptString(el.account.accountName,),
				transactionType: el.transactionType,
				typeVersion:     el.typeVersion,
				currency:        el.currency,
				amount:          Number(el.amount,),
				usdValue,
				isin:            el.isin ?? undefined,
				security:        el.security ?? undefined,
				serviceProvider: el.serviceProvider  ?
					this.cryptoService.decryptString(el.serviceProvider,) :
					undefined,
				comment:         el.comment ?
					this.cryptoService.decryptString(el.comment,) :
					undefined,
			}
		},)

		return {
			total,
			list: result,
		}
	}

	/**
 * 3.5.4
 * Retrieves filtered transactions based on the provided filter criteria and transaction IDs.
 * @remarks
 * - Filters transactions based on various criteria including transaction IDs, client ID, portfolio, bank, service providers, currencies, transaction types, securities, and ISINs.
 * - Converts the transaction amounts to USD using `cBondsCurrencyService`.
 * - Returns an array of transactions with their details including USD value.
 * @param filter - The filter criteria for retrieving transactions.
 * @param clientId - The optional client ID to filter the transactions further.
 * @returns A Promise resolving to an object containing the total number of transactions and the filtered list of transactions.
 */
	public async getFilteredTransactionsByIds(filter: TransactionFilterDto, clientId?: string,): Promise<TransactionListRes> {
		const date = filter.date ?
			new Date(filter.date,) :
			undefined
		date?.setUTCHours(0, 0, 59, 0,)
		const dateResult = date?.toISOString()
		const startDate = filter.dateRange ?
			new Date(filter.dateRange[0],) :
			undefined
		if (startDate) {
			startDate.setDate(startDate.getDate() - 1,)
		}
		const dateAt20 = startDate && set(startDate, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0, },)
		const where: Prisma.TransactionWhereInput = {
			id: {
				in: filter.transactionIds,
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
			serviceProvider: {
				in: filter.serviceProviders,
			},
			currency: {
				in: filter.currencies,
			},
			transactionTypeId: {
				in: filter.transactionTypes,
			},
			isin: {
				in: filter.isins,
			},
			portfolio: {
				is: {
					isActivated: true,
				},
			},
			security: {
				in: filter.securities,
			},
			transactionDate: filter.date ?
				{ lte: dateResult, } :
				filter.dateRange && startDate ?
					{
						// gte: endOfDay(startDate,).toISOString(),
						gte: dateAt20,
						lte: filter.dateRange[1],
					} :
					undefined,
		}

		const totalPromise =  this.prismaService.transaction.count({ where, },)
		const listPromise = this.prismaService.transaction.findMany({
			where,
			include: {
				account:         true,
				bank:            true,
				client:          true,
				documents:       true,
				order:           true,
				portfolio:       true,
				entity:          true,
				transactionType: true,
				typeVersion:     true,
			},
		},
		)
		const [total, list,] = await Promise.all([
			totalPromise, listPromise,
		],)

		const result = list.map((el,) => {
			const usdValue = (Number(el.amount,) * (el.rate ?? 1))
			return {
				...el,
				usdValue,
			}
		},)

		return {
			total,
			list: result,
		}
	}

	// public async getFilteredTransactionsAnalyticsByIds(
	// 	filter: TransactionFilterDto,
	// 	clientId?: string,
	// ): Promise<TransactionPl> {
	// 	const date = filter.date ?
	// 		new Date(filter.date,) :
	// 		undefined
	// 	date?.setUTCHours(0, 0, 59, 0,)
	// 	const dateResult = date?.toISOString()

	// 	const startDate = filter.dateRange ?
	// 		new Date(filter.dateRange[0],) :
	// 		undefined
	// 	if (startDate) {
	// 		startDate.setDate(startDate.getDate() - 1,)
	// 	}
	// 	const dateAt20 =
	// 	startDate &&
	// 	set(startDate, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0, },)

	// 	const where: Prisma.TransactionWhereInput = {
	// 		id:                { in: filter.transactionIds, },
	// 		clientId:          { in: clientId ?
	// 			[clientId,] :
	// 			filter.clientIds, },
	// 		portfolioId:       { in: filter.portfolioIds, },
	// 		entityId:          { in: filter.entityIds, },
	// 		bankId:            { in: filter.bankIds, },
	// 		bank:              { is: { bankListId: { in: filter.bankListIds, }, }, },
	// 		accountId:         { in: filter.accountIds, },
	// 		serviceProvider:   { in: filter.serviceProviders, },
	// 		currency:          { in: filter.currencies, },
	// 		transactionTypeId: { in: filter.transactionTypes, },
	// 		isin:              { in: filter.isins, },
	// 		portfolio:         { is: { isActivated: true, }, },
	// 		security:          { in: filter.securities, },
	// 		transactionDate:   filter.date ?
	// 			{ lte: dateResult, } :
	// 			filter.dateRange && startDate ?
	// 				{ gte: dateAt20, lte: filter.dateRange[1], } :
	// 				undefined,
	// 	}

	// 	const totalPromise = this.prismaService.transaction.count({ where, },)

	// 	const listPromise = this.prismaService.transaction.findMany({
	// 		where,
	// 		include: {
	// 			account:         true,
	// 			bank:            true,
	// 			client:          true,
	// 			documents:       true,
	// 			order:           true,
	// 			portfolio:       true,
	// 			entity:          true,
	// 			transactionType: true,
	// 			typeVersion:     { select: { pl: true, }, },
	// 		},
	// 	},)

	// 	const [total, list,] = await Promise.all([totalPromise, listPromise,],)

	// 	const chartData: Array<TransactionChartData> = [
	// 		{
	// 			name:  TransactionType.INCOME,
	// 			value: list.reduce((sum, item,) => {
	// 				const pl = item.typeVersion?.pl ?? null
	// 				if (pl === 'P') {
	// 					return sum + Number(item.amount,) * (item.rate ?? 1)
	// 				}
	// 				return sum
	// 			}, 0,),
	// 		},
	// 		{
	// 			name:  TransactionType.EXPENSE,
	// 			value: list.reduce((sum, item,) => {
	// 				const pl = item.typeVersion?.pl ?? null
	// 				if (pl === 'L') {
	// 					return sum + Math.abs(Number(item.amount,) * (item.rate ?? 1),)
	// 				}
	// 				return sum
	// 			}, 0,),
	// 		},
	// 	].filter((item,) => {
	// 		return item.value && item.value > 0
	// 	},)

	// 	const totalUsdValue = list.reduce<number>((acc, t,) => {
	// 		return acc + Number(t.amount,) * (t.rate ?? 1)
	// 	}, 0,)

	// 	const totalCurrencyValue = list.reduce<number>((acc, t,) => {
	// 		return acc + Number(t.amount,)
	// 	}, 0,)

	// 	const isins = Array.from(
	// 		new Set(
	// 			list
	// 				.map((t,) => {
	// 					return t.isin
	// 				},)
	// 				.filter((isin,): isin is string => {
	// 					return isin !== null
	// 				},),
	// 		),
	// 	)

	// 	const securities = Array.from(
	// 		new Set(
	// 			list
	// 				.map((t,) => {
	// 					return t.security
	// 				},)
	// 				.filter((security,): security is string => {
	// 					return security !== null
	// 				},),
	// 		),
	// 	)

	// 	const oldestDate = this.getOldestTransactionDate(list,)

	// 	return {
	// 		total,
	// 		totalUsdValue,
	// 		totalCurrencyValue,
	// 		isins,
	// 		securities,
	// 		chartData,
	// 		oldestDate,
	// 	}
	// }
	public async getFilteredTransactionsAnalyticsByIds(
		filter: TransactionFilterDto,
		clientId?: string,
	): Promise<TransactionPl> {
		const date = filter.date ?
			new Date(filter.date,) :
			undefined
		if (date) {
			date.setUTCHours(0, 0, 59, 0,)
		}
		const dateResult = date ?
			date.toISOString() :
			undefined

		const startDate = filter.dateRange ?
			new Date(filter.dateRange[0],) :
			undefined
		if (startDate) {
			startDate.setDate(startDate.getDate() - 1,)
		}
		const dateAt20 =
		startDate &&
		set(startDate, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0, },)

		const where: Prisma.TransactionWhereInput = {
			id:                { in: filter.transactionIds, },
			clientId:          { in: clientId ?
				[clientId,] :
				filter.clientIds, },
			portfolioId:       { in: filter.portfolioIds, },
			entityId:          { in: filter.entityIds, },
			bankId:            { in: filter.bankIds, },
			bank:              { is: { bankListId: { in: filter.bankListIds, }, }, },
			accountId:         { in: filter.accountIds, },
			serviceProvider:   { in: filter.serviceProviders, },
			currency:          { in: filter.currencies, },
			transactionTypeId: { in: filter.transactionTypes, },
			isin:              { in: filter.isins, },
			portfolio:         { is: { isActivated: true, }, },
			security:          { in: filter.securities, },
			transactionDate:   filter.date ?
				{ lte: dateResult, } :
				filter.dateRange && startDate ?
					{ gte: dateAt20, lte: filter.dateRange[1], } :
					undefined,
		}

		const historyDate = filter.date ?? filter.dateRange?.[1]

		const [total, list, currencyList,] = await Promise.all([
			this.prismaService.transaction.count({ where, },),
			this.prismaService.transaction.findMany({
				where,
				include: {
					account:         true,
					bank:            true,
					client:          true,
					documents:       true,
					order:           true,
					portfolio:       true,
					entity:          true,
					transactionType: true,
					typeVersion:     { select: { pl: true, }, },
				},
			},),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(historyDate,),
		],)

		const listWithUsd = list.map((transaction,) => {
			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
				currency:      transaction.currency as CurrencyDataList,
				currencyValue: Number(transaction.amount,),
				currencyList,
				historyDate,
			},)

			return {
				...transaction,
				usdValue: Number(usdValue.toFixed(6,),),
			}
		},)

		const chartData: Array<TransactionChartData> = [
			{
				name:  TransactionType.INCOME,
				value: listWithUsd.reduce((sum, item,) => {
					const pl = item.typeVersion?.pl ?? null
					if (pl === 'P') {
						return sum + item.usdValue
					}
					return sum
				}, 0,),
			},
			{
				name:  TransactionType.EXPENSE,
				value: listWithUsd.reduce((sum, item,) => {
					const pl = item.typeVersion?.pl ?? null
					if (pl === 'L') {
						return sum + Math.abs(item.usdValue,)
					}
					return sum
				}, 0,),
			},
		].filter((item,) => {
			return item.value && item.value > 0
		},)

		const totalUsdValue = listWithUsd.reduce<number>((acc, t,) => {
			return acc + t.usdValue
		}, 0,)

		const totalCurrencyValue = list.reduce<number>((acc, t,) => {
			return acc + Number(t.amount,)
		}, 0,)

		const isins = Array.from(
			new Set(
				list
					.map((t,) => {
						return t.isin
					},)
					.filter((isin,): isin is string => {
						return isin !== null
					},),
			),
		)

		const securities = Array.from(
			new Set(
				list
					.map((t,) => {
						return t.security
					},)
					.filter((security,): security is string => {
						return security !== null
					},),
			),
		)

		const oldestDate = this.getOldestTransactionDate(list,)
		return {
			total,
			totalUsdValue,
			totalCurrencyValue,
			isins,
			securities,
			chartData,
			oldestDate,
		}
	}

	/**
 * Retrieves unique values for transaction filter selects.
 * @remarks
 * Builds a Prisma `where` condition based on the provided filter and optional client ID,
 * then queries the database to retrieve distinct values for:
 * - ISINs
 * - Securities
 * - Service providers (with decryption and normalization)
 * - Transaction type names
 * The method is optimized for large datasets by using `distinct` queries
 * and parallel execution via `Promise.all`.
 * Service providers are additionally deduplicated in-memory after decryption
 * and sorted alphabetically in a case-insensitive manner.
 * @param filter - Transaction selects filter criteria.
 * @param clientId - Optional client ID used to restrict access to client-specific data.
 * @returns A promise that resolves to an object containing deduplicated and formatted
 * select values for transaction filters.
 */
	public async getTransactionsFilteredSelects(filter: TransactionSelectsFilterDto, clientId?: string,): Promise<ITransactionFilteredSelects> {
		const { clientIds, portfolioIds, entityIds, accountIds, bankListIds, bankIds, } = filter

		const date = filter.date ?
			new Date(filter.date,) :
			undefined
		date?.setUTCHours(0, 0, 59, 0,)
		const dateResult = date?.toISOString()

		const startDate = filter.dateRange ?
			new Date(filter.dateRange[0],) :
			undefined
		if (startDate) {
			startDate.setDate(startDate.getDate() - 1,)
		}
		const dateAt20 =
		startDate ?
			set(startDate, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0, },) :
			undefined

		const where = {
			clientId: {
				in: clientId ?
					[clientId,] :
					clientIds,
			},
			portfolioId: {
				in: portfolioIds,
			},
			entityId: {
				in: entityIds,
			},
			accountId: {
				in: accountIds,
			},
			bankId: {
				in: bankIds,
			},
			...(clientId ?
				{
					client: {
						id: clientId,
					},
				} :
				{}),
			bank: {
				is: {
					bankListId: {
						in: bankListIds,
					},
				},
			},
			transactionDate: filter.date ?
				{ lte: dateResult, } :
				filter.dateRange && startDate ?
					{ gte: dateAt20, lte: filter.dateRange[1], } :
					undefined,

		}

		const [isins, serviceProviders, securities, distinctTypeIds,] = await Promise.all([
			this.prismaService.transaction.findMany({
				where,
				select: {
					isin: true,
				},
				distinct: ['isin',],
			},),
			this.prismaService.transaction.findMany({
				where,
				select: {
					serviceProvider: true,
				},
				distinct: ['serviceProvider',],
			},),
			this.prismaService.transaction.findMany({
				where,
				select: {
					security: true,
				},
				distinct: ['security',],
			},),
			this.prismaService.transaction.findMany({
				where,
				select: {
					transactionTypeId: true,
				},
				distinct: ['transactionTypeId',],
			},),
		],)
		const filteredIsins = isins.map((item,) => {
			if (!item.isin) {
				return null
			}
			return item.isin
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const filteredSecurities = securities.map((item,) => {
			if (!item.security) {
				return null
			}
			return item.security
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const types = await this.prismaService.transactionType.findMany({
			where: {
				id: {
					in: distinctTypeIds
						.map((t,) => {
							return t.transactionTypeId
						},)
						.filter((id,): id is string => {
							return Boolean(id,)
						},),
				},
				isDeleted:   false,
				isActivated: true,
			},
			select: {
				id:            true,
				relatedTypeId: true,
				asset:         true,
				versions:      {
					where: { isCurrent: true, },
					take:  1,
				},
			},
		},)
		const filteredNames: Array<ITransactionTypeList> = types
			.map((t,) => {
				const [version,] = t.versions
				return {
					id:            t.id,
					relatedTypeId: t.relatedTypeId ?? '',
					asset:         t.asset ?? '',
					name:          version.name ?
						version.name :
						'',
					cashFlow:      version.cashFlow ?
						version.cashFlow :
						'',
					pl:            version.pl ?? '',
				}
			},)
			.filter((item,) => {
				return Boolean(item.name,)
			},)
		const decrypted = serviceProviders.map((p,) => {
			if (!p.serviceProvider) {
				return null
			}
			const decryptedName = this.cryptoService.decryptString(p.serviceProvider,)
			return {
				value: p.serviceProvider,
				label: decryptedName,
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const uniqueProviders = (providers: Array<{ value: string; label: string }>,): Array<{ value: string; label: string }> => {
			const map = new Map<string, { value: string; label: string }>()
			for (const p of providers) {
				map.set(p.label.toLowerCase(), p,)
			}
			return [...map.values(),].sort((a, b,) => {
				return a.label.localeCompare(b.label, undefined, { sensitivity: 'base', },)
			},
			)
		}
		const uniqueServiceProviders = uniqueProviders(decrypted,)
		return {
			serviceProviders: uniqueServiceProviders,
			isins:            Array.from(new Set(filteredIsins,),),
			securities:       Array.from(new Set(filteredSecurities,),),
			transactionNames: filteredNames,
		}
	}

	private getOldestTransactionDate = (transactions: Array<Transaction>,): string | null => {
		if (!transactions.length) {
			return null
		}
		const dates = transactions
			.map((t,) => {
				return (new Date(t.transactionDate,))
			},)
		if (!dates.length) {
			return null
		}
		const oldestDate = min(dates,)
		return format(oldestDate, 'dd.MM.yyyy',)
	}
}