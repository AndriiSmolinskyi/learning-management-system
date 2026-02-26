/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import {HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { Prisma,  LogInstanceType,} from '@prisma/client'
import type { Transaction,  CurrencyDataList,} from '@prisma/client'
import { text, } from '../../../shared/text'
import { DocumentService, } from '../../document/document.service'
import type { TDeleteRefactoredTransactionPayload, TransactionExtended, TransactionListRes, } from '../transaction.types'
import type { BudgetTransactionDto, CreateTransactionDto, CurrencyAmountDto, TransactionFilterDto, } from '../dto'
import type { UpdateTransactionDto, } from '../dto'
import { RedisCacheService, } from '../../redis-cache/redis-cache.service'
import { cacheKeysToDeleteTransaction, } from '../transaction.constants'
import { cacheKeysToDeleteAsset, } from '../../../modules/asset/asset.constants'
import { AnalyticsRoutes, } from '../../../modules/analytics/analytics.constants'
import { PortfolioRoutes, } from '../../../modules/portfolio/portfolio.constants'
import { EventEmitter2, } from '@nestjs/event-emitter'
import { AssetNamesType, } from '../../../modules/asset/asset.types'
import { CryptoService, } from '../../crypto/crypto.service'
import { ClientRoutes, } from '../../../modules/client/client.constants'
import { BudgetRoutes, } from '../../../modules/budget/budget.constants'
import { set,  } from 'date-fns'
import { ComputationsService, } from '../../../modules/common/computations/computations.service'

@Injectable()
export class TransactionService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly cacheService: RedisCacheService,
		private readonly eventEmitter: EventEmitter2,
		private readonly cryptoService: CryptoService,
		private readonly computationsService: ComputationsService,
	) { }

	/**
	 * 3.4
	 * Creates a transaction and links associated documents. Deletes the draft if provided.
	 *
	 * @remarks
	 * - Creates a transaction and links it to the correct entity via the account.
	 * - Transfers all draft documents to the new transaction.
	 * - Deletes the transaction draft if present.
	 *
	 * @param body - Transaction data including optional draft ID.
	 * @returns A Promise that resolves to the newly created transaction.
	 * @throws Will throw an error if account not found or transaction creation fails.
	 */
	public async createTransaction(body: CreateTransactionDto,): Promise<Transaction> {
		const {transactionDraftId, ...data} = body
		try {
			const transaction = await this.prismaService.$transaction(async(tx,) => {
				const { accountId, } = data

				const account = await tx.account.findUnique({
					where:  { id: accountId, },
					select: { entityId: true, },
				},)

				if (!account) {
					throw new Error('Account not found',)
				}
				const currencyWithHistory = await this.prismaService.currencyData.findFirst({
					where: {
						currency:  { equals: data.currency as CurrencyDataList, },
					},
					include: {
						currencyHistory: {
							where: {
								date: {gte: data.transactionDate,},
							},
							orderBy: {
								date: 'asc',
							},
							take: 1,
						},
					},
				},)
				const rate =
					currencyWithHistory?.currencyHistory[0]?.rate ??
					currencyWithHistory?.rate
				const isFutureDated = new Date(data.transactionDate,) > new Date()
				const budget = await this.prismaService.budgetPlan.findUnique({
					where: {
						clientId: data.clientId,
					},
				},)
				const currentVersion = await tx.transactionTypeVersion.findFirst({
					where:  { typeId: data.transactionTypeId, isCurrent: true, },
					select: { id: true, },
				},)
				if (!currentVersion) {
					throw new Error('Current transaction type version not found',)
				}
				const newTransaction = await this.prismaService.transaction.create({
					data: {
						...data,
						...(data.comment ?
							{comment: this.cryptoService.encryptString(data.comment,),} :
							{}),
						entityId:                 account.entityId,
						rate,
						isFutureDated,
						transactionTypeVersionId: currentVersion.id,
					},
					include: {
						transactionType: true,
					},
				},)
				// todo: Remove after asset refactor approved
				// this.eventEmitter.emit(eventNames.TRANSACTION_ACTION,{portfolioId: newTransaction.portfolioId, clientId: newTransaction.clientId,},)
				const { transactionTypeId, } = data
				// todo: Remove after optimization check
				await this.cacheService.deleteByUrl([
					...cacheKeysToDeleteTransaction,
					...cacheKeysToDeleteAsset.portfolio,
					...cacheKeysToDeleteAsset.client,
					`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${newTransaction.portfolioId}`,
					`/${ClientRoutes.MODULE}/${newTransaction.clientId}`,
					`/${BudgetRoutes.MODULE}/${budget?.id}`,
					`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
				],)
				const keyPayload = {
					method: 'get',
					url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
					query:  { clients: [newTransaction.clientId,], },
				}
				await this.cacheService.deleteByCacheParams(keyPayload,)
				await tx.transactionType.update({
					where: { id: transactionTypeId, },
					data:  { counter: { increment: 1, }, },
				},)

				if (transactionDraftId) {
					const transactionDraft = await tx.transactionDraft.findUnique({
						where:   { id: transactionDraftId, },
						include: {
							documents: true,
						},
					},)

					if (transactionDraft && transactionDraft.documents.length > 0) {
						const documentIds = transactionDraft.documents.map((doc,) => {
							return doc.id
						},)

						await tx.document.updateMany({
							where: {
								id: {
									in: documentIds,
								},
							},
							data: {
								transactionId:      newTransaction.id,
								transactionDraftId: null,
							},
						},)
					}

					if (transactionDraft) {
						await tx.transactionDraft.delete({
							where: { id: transactionDraftId, },
						},)
					}
				}
				return newTransaction
			}, { timeout: 10000, },)
			await this.computationsService.updateClientTotals(transaction.clientId,)
			return transaction
		} catch (error) {
			throw new HttpException('A lot of transactions are creating at the same time', HttpStatus.REQUEST_TIMEOUT,)
		}
	}

	/**
	 * 3.1.2 / 3.1.6 / 3.1.7
	 * Retrieves a filtered list of transactions with sorting and search.
	 *
	 * @remarks
	 * - Supports filtering by client, portfolio, asset, entity, bank, currency, and more.
	 * - Supports text search on several fields.
	 * - Returns the filtered transaction list with USD conversion and total count.
	 *
	 * @param filter - Filtering and sorting parameters.
	 * @returns A Promise resolving to the filtered transaction list with total count.
	 */
	public async getTransactionsFiltered(filter: TransactionFilterDto,): Promise<TransactionListRes> {
		const {
			sortBy = 'transactionDate',
			sortOrder = Prisma.SortOrder.desc,
			search,
			skip,
			take,
			currencies,
			transactionNames,
			clientIds,
			portfolioIds,
			entityIds,
			bankIds,
			accountIds,
			bankListIds,
			isins,
			securities,
			dateRange,
			serviceProviders,
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
		let transactionDate
		if (filter.date) {
			transactionDate = { lte: dateResult, }
		} else if (dateRange && startDate) {
			transactionDate = { gte: dateAt20, lte: dateRange[1], }
		}
		const where: Prisma.TransactionWhereInput = {
			...(search && {
				OR: [
					...(isNaN(Number(search,),) ?
						[] :
						[
							{
								id: {
									equals: Number(search,),
								},
							},
						]),
					{
						client: {
							OR: [
								{
									firstName: {
										contains: search,
										mode:     Prisma.QueryMode.insensitive,
									},
								},
								{
									lastName: {
										contains: search,
										mode:     Prisma.QueryMode.insensitive,
									},
								},
							],					},
					},
					{
						portfolio: {
							name: {
								contains: search,
								mode:     Prisma.QueryMode.insensitive,
							},
						},
					},
					{
						bank: {
							bankName: {
								contains: search,
								mode:     Prisma.QueryMode.insensitive,
							},
						},
					},
					// {
					// 	transactionType: {
					// 		OR: [
					// 			{
					// 				name: {
					// 					contains: search,
					// 					mode:     Prisma.QueryMode.insensitive,
					// 				},
					// 			},
					// 			{
					// 				category: {
					// 					contains: search,
					// 					mode:     Prisma.QueryMode.insensitive,
					// 				},
					// 			},
					// 		],
					// 	},
					// },
					{
						typeVersion: {
							is: {
								OR: [
									{ name: { contains: search, mode: Prisma.QueryMode.insensitive, }, },
									{ comment: { contains: search, mode: Prisma.QueryMode.insensitive, }, },
									{
										categoryType: {
											is: { name: { contains: search, mode: Prisma.QueryMode.insensitive, }, },
										},
									},
								],
							},
						},
					},
					{
						currency: {
							contains: search,
							mode:     Prisma.QueryMode.insensitive,
						},
					},
				],
			}),
			portfolio: {
				isActivated: true,
			},
			...(bankListIds?.length ?
				{
					bank: {
						is: {
							bankListId: { in: bankListIds, },
						},
					},
				} :
				undefined),
			clientId:          { in: clientIds, },
			portfolioId:       { in: portfolioIds, },
			entityId:          { in: entityIds, },
			bankId:            { in: bankIds, },
			accountId:         { in: accountIds, },
			isin:              { in: isins, },
			security:          { in: securities, },
			serviceProvider: {
				in: serviceProviders,
			},
			transactionDate,
			transactionTypeId: {
				in: filter.transactionTypes,
			},
			...(currencies?.length ?
				{ currency: { in: currencies, }, } :
				undefined),
			// ...(transactionNames?.length ?
			// 	{ transactionType: {
			// 		name: { in: transactionNames, },
			// 	}, } :
			// 	undefined),
		}
		const totalPromise =  this.prismaService.transaction.count({ where, },)
		const listPromise =  this.prismaService.transaction.findMany({
			where,
			orderBy,
			skip:    skip && Number(skip,),
			take:    take && Number(take,),
			include: {
				account:         true,
				entity:          true,
				bank:            true,
				client:          true,
				documents:       true,
				order:           true,
				portfolio:       true,
				transactionType: true,
				typeVersion:     true,
			},
		},
		)

		const [total, list,] = await Promise.all([
			totalPromise, listPromise,
		],)

		const result = list
			.map((el,) => {
				const usdValue = (Number(el.amount,) * (el.rate ?? 1))
				return {
					...el,
					usdValue,
				}
			},)
			.map((transaction,) => {
				return {
					...transaction,
					...(transaction.serviceProvider ?
						{serviceProvider: this.cryptoService.decryptString(transaction.serviceProvider,),} :
						{}),
					...(transaction.comment ?
						{comment: this.cryptoService.decryptString(transaction.comment,),} :
						{}),
					...(transaction.portfolio ?
						{portfolio: {
							...transaction.portfolio,
							name: this.cryptoService.decryptString(transaction.portfolio.name,),
						},} :
						{}),
					...(transaction.entity ?
						{entity: {
							...transaction.entity,
							name: this.cryptoService.decryptString(transaction.entity.name,),
						},} :
						{}),
					...(transaction.account ?
						{account: {
							...transaction.account,
							accountName: this.cryptoService.decryptString(transaction.account.accountName,),
						},} :
						{}),
				}
			},)
		return {
			total,
			list: result,
		}
	}

	/**
	 * 3.4
	 * Retrieves a full list of transactions.
	 *
	 * @remarks
	 * - Returns transactions with all related data.
	 * - Sorted by update time descending.
	 * - Adds USD converted value to each result.
	 *
	 * @returns A Promise resolving to all transactions with total count.
	 */
	public async getTransactions(): Promise<TransactionListRes> {
		const totalPromise =  this.prismaService.transaction.count()
		const listPromise = this.prismaService.transaction.findMany({
			orderBy: {
				updatedAt: 'desc',
			},
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
			.map((transaction,) => {
				return {
					...transaction,
					...(transaction.serviceProvider ?
						{serviceProvider: this.cryptoService.decryptString(transaction.serviceProvider,),} :
						{}),
					...(transaction.comment ?
						{comment: this.cryptoService.decryptString(transaction.comment,),} :
						{}),
					...(transaction.portfolio ?
						{portfolio: {
							...transaction.portfolio,
							name: this.cryptoService.decryptString(transaction.portfolio.name,),
						},} :
						{}),
					...(transaction.entity ?
						{entity: {
							...transaction.entity,
							name: this.cryptoService.decryptString(transaction.entity.name,),
						},} :
						{}),
					...(transaction.account ?
						{account: {
							...transaction.account,
							accountName: this.cryptoService.decryptString(transaction.account.accountName,),
						},} :
						{}),
				}
			},)

		return {
			total,
			list: result,
		}
	}

	/**
	 * 3.4
	 * Retrieves full details of a transaction by ID.
	 *
	 * @remarks
	 * - Returns full related data including documents, type, account, etc.
	 * - Adds USD converted amount to response.
	 *
	 * @param id - Unique identifier of the transaction.
	 * @returns A Promise resolving to the transaction with extended data.
	 * @throws Will throw a NOT_FOUND error if transaction does not exist.
	 */
	public async getTransactionById(id: number,): Promise<TransactionExtended> {
		const transaction = await this.prismaService.transaction.findUnique({
			where:   { id, },
			include: {
				account:         true,
				bank:            true,
				client:          true,
				documents:       true,
				order:           true,
				portfolio:       true,
				entity:          true,
				transactionType: true,
				expenseCategory: true,
				typeVersion:     {
					include: {
						categoryType: true,
					},
				},
			},
		},)
		if (!transaction) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}
		const usdValue = (Number(transaction.amount,) * (transaction.rate ?? 1))

		return {
			...transaction,
			...(transaction.serviceProvider ?
				{serviceProvider: this.cryptoService.decryptString(transaction.serviceProvider,),} :
				{}),
			...(transaction.comment ?
				{comment: this.cryptoService.decryptString(transaction.comment,),} :
				{}),
			...(transaction.portfolio ?
				{portfolio: {
					...transaction.portfolio,
					name: this.cryptoService.decryptString(transaction.portfolio.name,),
				},} :
				{}),
			...(transaction.entity ?
				{entity: {
					...transaction.entity,
					name: this.cryptoService.decryptString(transaction.entity.name,),
				},} :
				{}),
			...(transaction.account ?
				{account: {
					...transaction.account,
					accountName: this.cryptoService.decryptString(transaction.account.accountName,),
				},} :
				{}),
			...(transaction.client ?
				{client: {
					...transaction.client,
					firstName: this.cryptoService.decryptString(transaction.client.firstName,),
					lastName:  this.cryptoService.decryptString(transaction.client.lastName,),
				},} :
				{}),
			usdValue,
		}
	}

	/**
	 * 3.4
	 * Updates an existing transaction by ID.
	 *
	 * @remarks
	 * - Updates the provided fields and returns updated entity with relations.
	 *
	 * @param id - ID of the transaction to update.
	 * @param data - Transaction data to update.
	 * @returns A Promise resolving to the updated transaction.
	 */
	public async updateTransaction(id: number, body: UpdateTransactionDto,): Promise<TransactionExtended> {
		const {assetId, assetName, ...data} = body
		let transactionTypeVersion = null
		if (data.transactionTypeId) {
			transactionTypeVersion = await this.prismaService.transactionTypeVersion.findFirst({
				where: {
					typeId:    data.transactionTypeId,
					isCurrent: true,
				},
			},)
		}
		const updatedTransaction = await this.prismaService.transaction.update({
			where:   { id, },
			data:  {
				...data,
				...(data.comment ?
					{comment: this.cryptoService.encryptString(data.comment,),} :
					{}),
				...(transactionTypeVersion ?
					{transactionTypeVersionId: transactionTypeVersion.id,} :
					{}),
				...(assetId && assetName === AssetNamesType.BONDS ?
					{ assetBondId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.EQUITY_ASSET ?
					{ assetEquityId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.CASH_DEPOSIT ?
					{ assetDepositId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.CRYPTO ?
					{ assetCryptoId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.METALS ?
					{ assetMetalId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.LOAN ?
					{ assetLoanId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.OPTIONS ?
					{ assetOptionId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.REAL_ESTATE ?
					{ assetRealEstateId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.OTHER ?
					{ assetOtherInvestmentId: assetId, } :
					{}),
				...(assetId && assetName === AssetNamesType.PRIVATE_EQUITY ?
					{ assetPrivateEquityId: assetId, } :
					{}),
			},
			include: {
				account:         true,
				bank:            true,
				client:          true,
				documents:       true,
				order:           true,
				portfolio:       true,
				entity:          true,
				transactionType: true,
				expenseCategory: true,
				typeVersion:     true,
			},
		},)
		const usdValue = (Number(updatedTransaction.amount,) * (updatedTransaction.rate ?? 1))
		const isFutureDated = data.transactionDate ?
			(new Date(data.transactionDate,) > new Date()) :
			false
		const budget = await this.prismaService.budgetPlan.findUnique({
			where: {
				clientId: updatedTransaction.clientId,
			},
		},)
		if (data.amount) {
			await this.cacheService.deleteByUrl([
				...cacheKeysToDeleteTransaction,
				...cacheKeysToDeleteAsset.portfolio,
				...cacheKeysToDeleteAsset.client,
				`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${updatedTransaction.portfolioId}`,
				`/${BudgetRoutes.MODULE}/${budget?.id}`,
				`/${ClientRoutes.MODULE}/${updatedTransaction.clientId}`,
				`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,

			],)
			const keyPayload = {
				method: 'get',
				url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
				query:  { clients: [updatedTransaction.clientId,], },
			}
			await this.cacheService.deleteByCacheParams(keyPayload,)
			// todo: Remove after asset refactor approved
			// this.eventEmitter.emit(eventNames.TRANSACTION_ACTION,{portfolioId: updatedTransaction.portfolioId, clientId: updatedTransaction.clientId,},)
		}
		await this.computationsService.updateClientTotals(updatedTransaction.clientId,)
		return {
			...updatedTransaction,
			...(updatedTransaction.serviceProvider ?
				{serviceProvider: this.cryptoService.decryptString(updatedTransaction.serviceProvider,),} :
				{}),
			...(updatedTransaction.comment ?
				{comment: this.cryptoService.decryptString(updatedTransaction.comment,),} :
				{}),
			usdValue,
			isFutureDated,
		}
	}

	/**
	 * 3.4
	 * Deletes a transaction and all associated documents.
	 *
	 * @remarks
	 * - Fetches all linked documents and deletes them before removing transaction.
	 *
	 * @param id - ID of the transaction to delete.
	 * @returns A Promise that resolves once deletion is complete.
	 */
	public async deleteTransaction(id: number, data: TDeleteRefactoredTransactionPayload,): Promise<void> {
		const {userInfo,} = data
		const transaction = await this.getTransactionById(id,)
		const documentIds = transaction.documents.map((doc,) => {
			return doc.id
		},)

		await this.documentService.deleteDocumentsByIds({id: documentIds,},)
		const deletedTransaction = await this.prismaService.transaction.delete({ where: { id: transaction.id, }, },)
		const budget = await this.prismaService.budgetPlan.findUnique({
			where: {
				clientId: transaction.clientId,
			},
		},)
		// todo: Remove cache optimization check
		await this.cacheService.deleteByUrl([
			...cacheKeysToDeleteTransaction,
			...cacheKeysToDeleteAsset.portfolio,
			...cacheKeysToDeleteAsset.client,
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${transaction.portfolioId}`,
			`/${ClientRoutes.MODULE}/${transaction.clientId}`,
			`/${BudgetRoutes.MODULE}/${budget?.id}`,
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
		],)
		const keyPayload = {
			method: 'get',
			url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
			query:  { clients: [transaction.clientId,], },
		}
		await this.prismaService.deletionLog.create({
			data: {
				clientId:     transaction.clientId,
				portfolioId:  transaction.portfolioId,
				entityId:     transaction.entityId,
				bankId:       transaction.bankId,
				accountId:    transaction.accountId,
				meta:         transaction,
				instanceType: LogInstanceType.Transaction,
				userName:     userInfo.name,
				userEmail:    userInfo.email,
				reason:       userInfo.reason,
			},
		},)
		await this.cacheService.deleteByCacheParams(keyPayload,)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.TRANSACTION_ACTION,{portfolioId: transaction.portfolioId, clientId: transaction.clientId,},)
		await this.computationsService.updateClientTotals(deletedTransaction.clientId,)
	}

	/**
	 * 4.2.3
	 * Retrieves all budget transactions for a specific client.
	 *
	 * @remarks
	 * - Supports filters like date range, transaction type, currency, category, and search.
	 * - Uses fallback to default budget categories if none provided.
	 *
	 * @param filter - Filtering options including client ID and optional filters.
	 * @returns A Promise resolving to the filtered budget transactions.
	 */
	public async getBudgetTransactions(filter: BudgetTransactionDto,): Promise<Array<Transaction>> {
		const {
			sortBy,
			sortOrder,
			search,
			transactionNames,
			currencies,
			categories,
			dateRange,
			clientId,
		} = filter
		const orderBy: Prisma.TransactionOrderByWithRelationInput = {
			[sortBy]: sortOrder,
		}
		const where: Prisma.TransactionWhereInput = {
			clientId,
			...(currencies ?
				{ currency: { in: currencies, }, } :
				{}),
			...(transactionNames ?
				{ transactionTypeVersion: { name: { in: transactionNames, }, }, } :
				{}),
			...(categories ?
				{
					expenseCategory: {
						name: { in: categories, },
					},
				} :
				{	expenseCategory: {
					name: { in: await this.getBudgetCategoriesNames(clientId,), },
				},
				}),
			...(search ?
				{
					transactionTypeVersion: {
						name: { contains: search, mode: 'insensitive', },
					},
				} :
				{}),
			...(dateRange ?
				{
					transactionDate: {
						gte: new Date(dateRange[0],),
						lte: new Date(dateRange[1],),
					},
				} :
				{}),
		}
		const transactions = await this.prismaService.transaction.findMany({
			where,
			include: {
				expenseCategory: true,
				transactionType: true,
				typeVersion:     {
					include: {
						categoryType: true,
					},
				},
			},
			orderBy,
		},)
		return transactions.map((transaction,) => {
			return {
				...transaction,
				...(transaction.serviceProvider ?
					{serviceProvider: this.cryptoService.decryptString(transaction.serviceProvider,),} :
					{}),
				...(transaction.comment ?
					{comment: this.cryptoService.decryptString(transaction.comment,),} :
					{}),
			}
		},)
	}

	/**
	 * 4.2.3
	 * Calculates the total amount of cash assets and transactions by currency and account.
	 *
	 * @remarks
	 * - Filters assets and transactions by currency.
	 * - Aggregates amounts from both sources.
	 *
	 * @param body - Currency and account ID.
	 * @returns A Promise resolving to the total amount.
	 */
	public async getTotalAmountByCurrencyAndAccountId(body: CurrencyAmountDto,): Promise<number> {
		const transactions = await this.prismaService.transaction.findMany({
			where: {
				accountId: body.accountId,
				currency:  body.currency,
			},
		},)
		const transactionsSum = transactions.reduce((sum, transaction,) => {
			return Number(transaction.amount,) + sum
		}, 0,)
		return transactionsSum
	}

	/**
	 * 4.2.3
	 * Retrieves the list of expense category names for a given client's budget plan.
	 *
	 * @remarks
	 * - Finds the first budget plan associated with the specified client.
	 * - Extracts the names of all linked expense categories.
	 * - If no budget plan is found, returns `undefined`.
	 *
	 * This method is primarily used for filtering budget transactions by default categories.
	 *
	 * @param clientId - The unique identifier of the client.
	 * @returns A Promise that resolves to an array of expense category names, or `undefined` if no budget is found.
	 */
	private async getBudgetCategoriesNames(clientId: string,): Promise<Array<string> | undefined>  {
		const budget = await this.prismaService.budgetPlan.findFirst({
			where: {
				clientId,
			},
			include: {
				expenseCategories: true,
			},
		},)
		return budget?.expenseCategories.map((item,) => {
			return item.name
		},)
	}

	/**
	 * CR - 121 / Future dates enabled
 		* Updates currency rates for transactions marked as future-dated (`isFutureDated = true`)
 		* if their transaction date has already occurred (i.e., `transactionDate <= today`).
 		*
 		* Process:
 		* 1. Fetches all transactions where `isFutureDated = true`.
 		* 2. Loads current currency rates along with their historical data (`currencyHistory`).
 		* 3. For each transaction:
 		*    - Skips if `transactionDate` is still in the future.
 		*    - Finds the currency entry matching `transaction.currency`:
 		*      - If `updatedAt` is today, uses the current rate.
 		*      - Otherwise, searches `currencyHistory` for a rate entry with today's date.
 		*    - If a rate is found, updates the transaction:
 		*      - Sets the `rate` field.
 		*      - Sets `isFutureDated` to `false`.
 		*
 		* Note: Dates are normalized to ignore time (`setHours(0, 0, 0, 0)`) to compare only the day.
	 */
	public async transactionFutureDateRateUpdate(): Promise<void>  {
		const today = new Date()
		today.setHours(0, 0, 0, 0,)
		const futureDateTransactions = await this.prismaService.transaction.findMany({
			where: {
				isFutureDated: true,
			},
		},)
		const currencyData = await this.prismaService.currencyData.findMany({
			include: {
				currencyHistory: true,
			},
		},
		)

		await Promise.all(
			futureDateTransactions.map(async(transaction,) => {
				const transactionDate = new Date(transaction.transactionDate,)
				transactionDate.setHours(0, 0, 0, 0,)
				if (transactionDate > today) {
					return
				}
				const currencyEntry = currencyData.find((entry,) => {
					return entry.currency === transaction.currency
				},
				)
				if (!currencyEntry) {
					return
				}
				let rateValue: number | null = null
				if (currencyEntry.updatedAt.toDateString() === transactionDate.toDateString()) {
					rateValue = currencyEntry.rate
				} else {
					const historyEntry = currencyEntry.currencyHistory.find((h,) => {
						return new Date(h.date,).toDateString() === transactionDate.toDateString()
					},
					)
					if (historyEntry) {
						rateValue = historyEntry.rate
					}
				}
				if (rateValue === null) {
					return
				}
				await this.prismaService.transaction.update({
					where: { id: transaction.id, },
					data:  {
						rate:          rateValue,
						isFutureDated: false,
					},
				},)
			},),
		)
	}

	public async encryptionServicesCheck(): Promise<void> {
		const servers = await this.prismaService.serviceProvidersList.findMany()
		const updatedServeres = servers.map((item,) => {
			return {
				...item,
				decryptedName: this.cryptoService.decryptString(item.name,),
			}
		},)

		const transactions = await this.prismaService.transaction.findMany()
		const decryptedTransaction = transactions.map((item,) => {
			const serviceValue = updatedServeres.find((service,) => {
				return item.serviceProvider && service.decryptedName === this.cryptoService.decryptString(item.serviceProvider,)
			},)
			return {
				...item,
				serviceProvider: serviceValue?.name ?? item.serviceProvider,
			}
		},)
		// await Promise.all(decryptedTransaction.map(async(item,) => {
		// 	return this.prismaService.transaction.update({
		// 		where: {
		// 			id: item.id,
		// 		},
		// 		data: {
		// 			...item,
		// 			customFields: item.customFields ?? Prisma.JsonNull,
		// 		},
		// 	},)
		// },),)
		const BATCH = 10
		let updatedOk = 0
		let failedUpdate = 0

		for (let i = 0; i < decryptedTransaction.length; i = i + BATCH) {
			const chunk = decryptedTransaction.slice(i, i + BATCH,)
			await Promise.all(
				chunk.map(async(item,) => {
					try {
						await this.prismaService.transaction.update({
							where: { id: item.id, },
							data:  {
								serviceProvider: item.serviceProvider,
								customFields:    item.customFields ?? Prisma.JsonNull,
							},
						},)
						updatedOk++
					} catch (err) {
						failedUpdate++
					}
				},),
			)
		}
	}
	// todo: Remove after bug qa passed
	// public async depositRateFix(): Promise<void> {
	// 	const transactions = await this.prismaService.transaction.findMany({
	// 		where: {
	// 			transactionType: {
	// 				name: 'Deposit maturity',
	// 			},
	// 			currency: {
	// 				not: 'USD',
	// 			},
	// 			rate: null,
	// 		},
	// 	},)
	// 	await Promise.all(
	// 		transactions.map(async(tx,) => {
	// 			const currencyData = await this.thirdPartyPrismaService.client.currencyHistoryData.findFirst({
	// 				where: {
	// 					date: {
	// 						gte: tx.transactionDate,
	// 					},
	// 				},
	// 				orderBy: {
	// 					date: 'asc',
	// 				},
	// 				take: 1,
	// 			},)

	// 			if (!currencyData) {
	// 				return
	// 			}
	// 			await this.prismaService.transaction.update({
	// 				where: {
	// 					id: tx.id,
	// 				},
	// 				data: {
	// 					rate: currencyData.rate,
	// 				},
	// 			},)
	// 		},),
	// 	)
	// }
}