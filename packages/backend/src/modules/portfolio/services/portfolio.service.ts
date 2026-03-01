/* eslint-disable no-negated-condition */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, Logger,} from '@nestjs/common'
import { Prisma, type Portfolio, } from '@prisma/client'

import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from '../../../shared/constants/messages.constants'
import {
	DocumentService,
} from '../../../modules/document/document.service'
import {
	PortfolioRepository,
} from '../../../repositories/portfolio/portfolio.repository'
import {
	CBondsCurrencyService,
} from '../../../modules/apis/cbonds-api/services'
import {
	BudgetService,
} from '../../../modules/budget/services'

import type {
	Message,
} from '../../../shared/types'
import type {
	IPortfolio,
	PortfolioWithRelations,
	IFilterProps,
	IFilterConditionsProps,
	IPortfolioPatch,
	IPortfolioChartResponse,
	IPortfoliosFiltered,
	PortfolioWithExtendedRelations,
	IPortfoliosThirdPartyListCBondsParted,
	IPortfolioDetailedThirdPartyListCBondsParted,
	IAsyncPortfoliosFiltered,
	RefactoredPortfolioWithRelations,
} from '../portfolio.types'
import type {
	PortfolioChartDto,
	CreatePortfolioDto,
} from '../dto'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import { PortfolioRoutes, } from '../portfolio.constants'
import { CryptoService, } from '../../crypto/crypto.service'
import { EventEmitter2, } from '@nestjs/event-emitter'
import { cacheKeysToDeleteClient, } from '../../../modules/client/client.constants'

@Injectable()
export class PortfolioService {
	private readonly logger = new Logger(PortfolioService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly portfolioRepository: PortfolioRepository,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly budgetService: BudgetService,
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	private getTimestampLogger = (): ((functionName: string, label: string) => void) => {
		const start = performance.now()
		return (functionName: string, label: string,): void => {
			const now = performance.now()
			this.logger.warn(`[PortfolioList-${functionName}]: [${label}] ${Math.round(now - start,)} ms`,)
		}
	}

	/**
	 * 1.3
	 * Retrieves a list of client portfolios and drafts based on the provided filters.
	 * This function combines portfolios and drafts, returning them in descending order of creation.
	 * @param filters - An object containing optional filter parameters:
	 *   - clients (optional): An array of client IDs to filter the portfolios by.
	 *   - types (optional): An array of portfolio types to filter by.
	 *   - isActivated (optional): A string representing whether to filter by activated status ('true' or 'false').
	 *   - isDeactivated (optional): A string representing whether to filter by deactivated status ('true' or 'false').
	 *
	 * @returns A Promise that resolves to an array containing portfolios and drafts, sorted in descending order by creation date.
	 * @throws HttpException - If there is an error retrieving the portfolio and draft data, an exception with a message and a BAD_REQUEST status is thrown.
	 */
	// Old version todo: To be removed
	// public async getPortfolioListFiltered(filters: IFilterProps, clientId?: string,): Promise<IPortfoliosFiltered> {
	// 	try {
	// 		const log = this.getTimestampLogger()
	// 		log('getPortfolioListFiltered','Start',)
	// 		const { isActivated, isDeactivated, clients, types, range, search = '', } = filters
	// 		const isActivatedBoolean = isActivated === 'true'
	// 		const isDeactivatedBoolean = isDeactivated === 'true'
	// 		const where: IFilterConditionsProps = {}
	// 		if (clientId) {
	// 			where.clientId = { in: [clientId,], }
	// 		} else if (clients && clients.length > 0) {
	// 			where.clientId = { in: 	clients, }
	// 		}
	// 		if (types && types.length > 0) {
	// 			where.type = { in: types, }
	// 		}
	// 		if (!(isActivated === 'false' && isDeactivated === 'false')) {
	// 			if (isActivated !== undefined && isDeactivated !== undefined) {
	// 				where.isActivated = isActivatedBoolean
	// 			} else if (isActivated !== undefined) {
	// 				where.isActivated = isActivatedBoolean
	// 			} else if (isDeactivated !== undefined) {
	// 				where.isActivated = !isDeactivatedBoolean
	// 			}
	// 		}
	// 		where.name = { contains: search, mode: 'insensitive',}
	// 		const portfoliosPromise = this.prismaService.portfolio.findMany({
	// 			where: {
	// 				...where,
	// 				mainPortfolioId: null,
	// 			},
	// 			include: {
	// 				documents:    true,
	// 				banks:           true,
	// 				entities:        true,
	// 				accounts:     true,
	// 				assets:       {
	// 					where: {
	// 						isArchived: false,
	// 					},
	// 					include: {
	// 						portfolio: true,
	// 						entity:    true,
	// 						bank:      {include: { bankList: true, },},
	// 						account:   true,
	// 					},
	// 				},
	// 				transactions: true,
	// 			},
	// 			orderBy: {
	// 				createdAt: 'desc',
	// 			},
	// 		},)
	// 		const draftsPromise = this.prismaService.portfolioDraft.findMany({
	// 			where: {
	// 				name: { contains: search, mode: 'insensitive',},
	// 			},
	// 			include: {
	// 				banks:           true,
	// 				entities:        true,
	// 				accounts:  true,
	// 				documents: true,
	// 			},
	// 			orderBy: {
	// 				createdAt: 'desc',
	// 			},
	// 		},)
	// 		const [portfolios, drafts, currencyList, cryptoList, bonds,equities, etfs, metalList,] = await Promise.all([
	// 			portfoliosPromise,
	// 			draftsPromise,
	// 			this.cBondsCurrencyService.getAllCurrencies(),
	// 			this.prismaService.cryptoData.findMany(),
	// 			this.prismaService.bond.findMany(),
	// 			this.prismaService.equity.findMany(),
	// 			this.prismaService.etf.findMany(),
	// 			this.cBondsCurrencyService.getAllMetalsWithHistory(),
	// 		],)
	// 		log('getPortfolioListFiltered','After DB query',)

	// 		const [min, max,] = Array.isArray(range,) && range.length === 2 ?
	// 			range :
	// 			[null, null,]
	// 		const portfoliosWithTotalAssets = portfolios
	// 			.map((portfolio,) => {
	// 				const portfolioWithTotals = this.portfolioRepository.getPortfolioTotals(portfolio, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)
	// 				if (min && max && (portfolioWithTotals.totalAssets < Number(min,) || portfolioWithTotals.totalAssets > Number(max,))) {
	// 					return null
	// 				}
	// 				return portfolioWithTotals as IPortfolio
	// 			},)
	// 			.filter((portfolio,): portfolio is IPortfolio => {
	// 				return portfolio !== null
	// 			},)
	// 		const encryptedDrafts = drafts.map((draft,) => {
	// 			return {
	// 				...draft,
	// 				name: this.cryptoService.decryptString(draft.name,),
	// 				...(draft.resident ?
	// 					{resident: this.cryptoService.decryptString(draft.resident,),} :
	// 					{}),
	// 				...(draft.taxResident ?
	// 					{taxResident: this.cryptoService.decryptString(draft.taxResident,),} :
	// 					{}),
	// 			}
	// 		},)
	// 		const encryptedPortfolios = portfoliosWithTotalAssets.map((portfolio,) => {
	// 			return {
	// 				...portfolio,
	// 				name: this.cryptoService.decryptString(portfolio.name,),
	// 				...(portfolio.resident ?
	// 					{resident: this.cryptoService.decryptString(portfolio.resident,),} :
	// 					{}),
	// 				...(portfolio.taxResident ?
	// 					{taxResident: this.cryptoService.decryptString(portfolio.taxResident,),} :
	// 					{}),
	// 			}
	// 		},)
	// 		log('getPortfolioListFiltered','After computing (map)',)

	// 		return {
	// 			list:      [...encryptedDrafts, ...encryptedPortfolios,],
	// 		}
	// 	} catch (error) {
	// 		throw new HttpException(ERROR_MESSAGES.GET_CLIENT_PORTFOLIO_LIST_ERROR, HttpStatus.BAD_REQUEST,)
	// 	}
	// }

	// New version
	public async getPortfolioListFiltered(filters: IFilterProps, clientId?: string,): Promise<IAsyncPortfoliosFiltered> {
		try {
			const { isActivated, isDeactivated, clients, types, range, search = '', } = filters
			const isActivatedBoolean = isActivated === 'true'
			const isDeactivatedBoolean = isDeactivated === 'true'
			const where: IFilterConditionsProps = {}
			if (clientId) {
				where.clientId = { in: [clientId,], }
			} else if (clients && clients.length > 0) {
				where.clientId = { in: 	clients, }
			}
			if (types && types.length > 0) {
				where.type = { in: types, }
			}
			if (!(isActivated === 'false' && isDeactivated === 'false')) {
				if (isActivated !== undefined && isDeactivated !== undefined) {
					where.isActivated = isActivatedBoolean
				} else if (isActivated !== undefined) {
					where.isActivated = isActivatedBoolean
				} else if (isDeactivated !== undefined) {
					where.isActivated = !isDeactivatedBoolean
				}
			}
			const [min, max,] = Array.isArray(range,) && range.length === 2 ?
				range :
				[null, null,]
			const portfoliosPromise = this.prismaService.portfolio.findMany({
				where: {
					...where,
					mainPortfolioId: null,
					totals:          {
						gte: min !== null ?
							new Prisma.Decimal(min,) :
							undefined,
						lte: max !== null ?
							new Prisma.Decimal(max,) :
							undefined,
					},
				},
				include: {
					documents:    true,
					banks:           true,
					entities:        true,
					accounts:     true,
					assets:       {
						where: {
							isArchived: false,
						},
						include: {
							portfolio: true,
							entity:    true,
							bank:      {include: { bankList: true, },},
							account:   true,
						},
					},
					transactions: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},)
			const draftsPromise = this.prismaService.portfolioDraft.findMany({
				include: {
					banks:           true,
					entities:        true,
					accounts:  true,
					documents: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},)
			const [portfolios, drafts,] = await Promise.all([
				portfoliosPromise,
				draftsPromise,
			],)
			const encryptedDrafts = drafts.map((draft,) => {
				const decryptedName = this.cryptoService.decryptString(draft.name,)
				if (search && !decryptedName.toLowerCase().includes(search.toLowerCase(),)) {
					return null
				}
				return {
					...draft,
					name: decryptedName,
					...(draft.resident ?
						{resident: this.cryptoService.decryptString(draft.resident,),} :
						{}),
					...(draft.taxResident ?
						{taxResident: this.cryptoService.decryptString(draft.taxResident,),} :
						{}),
				}
			},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			const encryptedPortfolios = portfolios.map((portfolio,) => {
				const decryptedName = this.cryptoService.decryptString(portfolio.name,)
				if (search && !decryptedName.toLowerCase().includes(search.toLowerCase(),)) {
					return null
				}
				return {
					id:              portfolio.id,
					clientId:        portfolio.clientId,
					type:            portfolio.type,
					isActivated:     portfolio.isActivated,
					createdAt:       portfolio.createdAt,
					updatedAt:       portfolio.updatedAt,
					mainPortfolioId: portfolio.mainPortfolioId,
					accounts:        portfolio.accounts,
					banks:           portfolio.banks,
					entities:        portfolio.entities,
					documents:       portfolio.documents,
					totalAssets:     Number(portfolio.totals,),
					name:            decryptedName,
					...(portfolio.resident ?
						{resident: this.cryptoService.decryptString(portfolio.resident,),} :
						{}),
					...(portfolio.taxResident ?
						{taxResident: this.cryptoService.decryptString(portfolio.taxResident,),} :
						{}),
				}
			},)
				.filter((item,): item is NonNullable<typeof item> => {
					return item !== null
				},)
			return {
				list:      [...encryptedDrafts, ...encryptedPortfolios,],
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.GET_CLIENT_PORTFOLIO_LIST_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 3.1.7
 * Retrieves a list of all portfolios from the database.
 * @returns A promise that resolves to an array of `Portfolio` objects.
 *
 * This method fetches all portfolios stored in the database by calling `prismaService.portfolio.findMany()`.
 * It returns an array of `Portfolio` objects containing all available portfolio records.
 *
 * Error Handling:
 * - If any error occurs during the data retrieval, an exception may be thrown and handled by the calling code or global error handler.
 */
	public async getPortfolioList(): Promise<Array<Portfolio>> {
		const portfolios = await this.prismaService.portfolio.findMany()
		return portfolios.map((portfolio,) => {
			return {
				...portfolio,
				name:        this.cryptoService.decryptString(portfolio.name,),
				...(portfolio.resident ?
					{resident:    this.cryptoService.decryptString(portfolio.resident,),} :
					{}),
				...(portfolio.taxResident ?
					{taxResident:    this.cryptoService.decryptString(portfolio.taxResident,),} :
					{}),
			}
		},)
	}

	/**
 * Retrieves a list of activated portfolios based on the provided client IDs.
 *
 * @param clientIds - Optional array of client IDs to filter portfolios by.
 * @param clientId - Optional single client ID used if clientIds is not provided.
 * @returns A Promise that resolves to an array of activated portfolios associated with the given client(s).
 *
 * If both `clientIds` and `clientId` are undefined, an empty list will be returned.
 */
	public async getPortfolioListByClientsIds(clientIds?: Array<string>, clientId?: string,): Promise<Array<Portfolio>> {
		const portfolios = await this.prismaService.portfolio.findMany({
			where: {
				...(clientIds && clientIds.length > 0 ?
					{ OR: clientIds.map((id,) => {
						return { clientId: id, }
					},), } :
					clientId ?
						{ clientId, } :
						{}),
				isActivated: true,
			},
		},)
		return portfolios.map((portfolio,) => {
			return {
				...portfolio,
				name:        this.cryptoService.decryptString(portfolio.name,),
				...(portfolio.resident ?
					{resident:    this.cryptoService.decryptString(portfolio.resident,),} :
					{}),
				...(portfolio.taxResident ?
					{taxResident:    this.cryptoService.decryptString(portfolio.taxResident,),} :
					{}),
			}
		},)
	}

	/**
	 * 1.3
	 * Retrieves the details of a specific portfolio by its unique identifier.
	 * @param id - The unique identifier of the portfolio to be retrieved.
	 * @returns A Promise that resolves to the PortfolioWithRelations object containing all related data.
	 * @throws HttpException - If the portfolio with the given id is not found, or an error occurs while fetching the data.
	 */
	// public async getPortfolioDetailsById(id: string,): Promise<PortfolioWithRelations> {
	public async getPortfolioDetailsById(id: string,): Promise<RefactoredPortfolioWithRelations> {
		try {
			const portfolio = await this.portfolioRepository.getPortfolioDetailsById(id,)
			if (!portfolio) {
				throw new HttpException(ERROR_MESSAGES.PORTFOLIO_NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const {
				entitiesWithTotalAssetsValue,
				banksWithTotalAssetsValue,
				accountsWithTotalAssetsValue,
				assetsWithTotalAssetsValue,
				assetsAmount,
			} = await this.portfolioRepository.getInstancesTotalAssetsOfPortfolio(portfolio,)

			return {
				...portfolio,
				assetsAmount,
				entities: entitiesWithTotalAssetsValue,
				banks:    banksWithTotalAssetsValue,
				accounts: accountsWithTotalAssetsValue,
				assets:   assetsWithTotalAssetsValue,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.PORTFOLIO_NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
	}

	/**
	 * 1.3
	 * Retrieves  a specific portfolio by its unique identifier.
	 * @param id - The unique identifier of the portfolio to be retrieved.
	 * @returns A Promise that resolves to the IPortfolio object containing all related data.
	 * @throws HttpException - If the portfolio with the given id is not found, or an error occurs while fetching the data.
	 */
	public async getPortfolioById(id: string,): Promise<IPortfolio> {
		const portfolio = await this.prismaService.portfolio.findUnique({
			where: {
				id,
			},
			include: {
				documents: true,
			},
		},)
		if (!portfolio) {
			throw new HttpException(ERROR_MESSAGES.PORTFOLIO_NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
		return {
			...portfolio,
			name:        this.cryptoService.decryptString(portfolio.name,),
			...(portfolio.resident ?
				{resident:    this.cryptoService.decryptString(portfolio.resident,),} :
				{}),
			...(portfolio.taxResident ?
				{taxResident:    this.cryptoService.decryptString(portfolio.taxResident,),} :
				{}),
		}
	}

	/**
	 * 1.3
	 * Creates a new portfolio based on the provided form values.
	 * @param body - The form values for the portfolio creation, including portfolio name, type, residency information, client ID, and reference type.
	 * @returns A Promise that resolves to an object containing the created portfolio.
	 * @throws PrismaError - If an error occurs during the portfolio creation process, an exception with a message is thrown.
	 */
	public async createPortfolio(data: CreatePortfolioDto,): Promise<Portfolio> {
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
		],)
		return this.prismaService.portfolio.create({
			data: {
				...data,
				name:        this.cryptoService.encryptString(data.name,),
				...(data.resident ?
					{resident:    this.cryptoService.encryptString(data.resident,),} :
					{}),
				...(data.taxResident ?
					{taxResident:    this.cryptoService.encryptString(data.taxResident,),} :
					{}),
			},
		},)
	}

	/**
 * 3.1.1
 * Retrieves a list of portfolios associated with the specified client ID.
 *
 * @param clientId - The unique identifier of the client whose portfolios should be fetched.
 * @returns A Promise that resolves to an array of Portfolio objects belonging to the client.
 * @throws PrismaError - Throws an error if the database query fails.
 */
	public async getPortfolioListByClientId(clientId: string,): Promise<Array<Portfolio>> {
		const portfolios = await this.prismaService.portfolio.findMany({
			where: {clientId,},
		},)
		return portfolios.map((portfolio,) => {
			return {
				...portfolio,
				name:        this.cryptoService.decryptString(portfolio.name,),
				...(portfolio.resident ?
					{resident:    this.cryptoService.decryptString(portfolio.resident,),} :
					{}),
				...(portfolio.taxResident ?
					{taxResident:    this.cryptoService.decryptString(portfolio.taxResident,),} :
					{}),
			}
		},)
	}

	/**
	 * 1.3
	 * Toggles the activation status of a portfolio.
	 * This method updates the `isActivated` field of the portfolio with the provided ID.
	 * If the portfolio is found, it will toggle the activation status (enabled/disabled).
	 * @param id - The ID of the portfolio whose status needs to be updated.
	 * @returns A Promise that resolves to a message indicating the success of the update.
	 * @throws HttpException - If the portfolio is not found or an error occurs during the update process, an exception with an appropriate message is thrown.
	 */
	public async updatePortfolioStatus(id: string, body: IPortfolioPatch,): Promise<Message> {
		const {oldDocumentsIds, ...data} = body
		try {
			const portfolio = await this.prismaService.portfolio.findUnique({
				where:   { id, },
				include: { documents: true, },
			},)
			if (!portfolio) {
				throw new HttpException(ERROR_MESSAGES.PORTFOLIO_NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const currentDocumentIds = portfolio.documents.map((doc,) => {
				return doc.id
			},)
			if (oldDocumentsIds) {
				const documentsToDelete = currentDocumentIds.filter((docId,) => {
					return !oldDocumentsIds.includes(docId,)
				},)
				await this.documentService.deleteDocumentsByIds({id: documentsToDelete,},)
			}
			const updatedPortfolio = await this.prismaService.portfolio.update({
				where: {
					id,
				},
				data: {
					...data,
					...(data.name ?
						{name:    this.cryptoService.encryptString(data.name,),} :
						{}),
					...(data.taxResident ?
						{taxResident:    this.cryptoService.encryptString(data.taxResident,),} :
						{}),
					...(data.resident ?
						{resident:    this.cryptoService.encryptString(data.resident,),} :
						{}),
					...(data.taxResident ?
						{taxResident:    this.cryptoService.encryptString(data.taxResident,),} :
						{}),
				},
			},)
			await this.prismaService.portfolio.updateMany({
				where: {
					mainPortfolioId: id,
				},
				data: {
					isActivated: updatedPortfolio.isActivated,
				},
			},)
			await this.cacheService.deleteByUrl([
				`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${id}`,
				...cacheKeysToDeleteClient,
			]
				,)
			// todo: Remove after asset refactor approved
			// this.eventEmitter.emit(eventNames.PORTFOLIO_ACTION, {portfolioId: id, message: 'Portfolio edited!', ...(body.isActivated !== undefined && { isActivated: body.isActivated, }),},)
			if (body.isActivated) {
				await this.prismaService.client.update({
					where: {
						id: portfolio.clientId,
					},
					data: {
						isActivated: body.isActivated,
					},
				},)
				// this.eventEmitter.emit(eventNames.CLIENT_LIST_UPDATED,{clientId: portfolio.clientId,},)
			}
			return {
				message: SUCCESS_MESSAGES.PORTFOLIO_STATUS_UPDATED,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.PORTFOLIO_STATUS_UPDATE_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 * 3.5.1
 * Retrieves portfolio chart analytics data based on the specified filter type.
 *
 * @remarks
 * This method fetches assets and transactions associated with the portfolio,
 * depending on the selected filter type, and delegates analytics calculation
 * to the repository method `getPortfolioChartAnalyticsById`.
 *
 * The chart data is used for visualizing portfolio composition and dynamics.
 *
 * @param filter - The filtering criteria including portfolio ID and the desired filter type (`ASSET`, `BANK`, or `ENTITY`).
 * @returns A Promise that resolves to an array of chart response objects for visualization.
 * If the portfolio is not found, it returns an empty array.
 */
	// New version
	public async getPortfolioChartAnalyticsById(filter: PortfolioChartDto,): Promise<Array<IPortfolioChartResponse>> {
		const portfolio = await this.prismaService.portfolio.findUnique({
			where: {
				id: filter.portfolioId,
			},
			include: {
				entities: { include: { assets: true, transactions: true,}, },
				banks:    { include: { assets: true, transactions: true,}, },
			},
		},)
		if (!portfolio) {
			return []
		}
		return this.portfolioRepository.getPortfolioChartAnalyticsById(portfolio, filter.filterType,)
	}

	// public async getPortfolioChartAnalyticsById(filter: PortfolioChartDto,): Promise<Array<IPortfolioChartResponse>> {
	// 	const portfolio = await this.prismaService.portfolio.findUnique({
	// 		where: {
	// 			id: filter.portfolioId,
	// 		},
	// 		include: {
	// 			entities: { include: { assets: true, transactions: true,}, },
	// 			banks:    { include: { assets: true, transactions: true,}, },
	// 			assets:   filter.filterType === PortfolioChartFilterEnum.ASSET ?
	// 				{
	// 					where: { isArchived: false, },
	// 				} :
	// 				false,
	// 		},
	// 	},)
	// 	if (!portfolio) {
	// 		return []
	// 	}
	// 	return this.portfolioRepository.getPortfolioChartAnalyticsById(portfolio, filter.filterType,)
	// }

	/**
	 * CR-013
	 * Deletes a portfolio by its ID along with all associated data.
	 *
	 * @remarks
	 * This method performs a cascading deletion process:
	 * - Retrieves and deletes all documents associated with the portfolio and its related entities.
	 * - Deletes all budget plans related to the portfolio.
	 * - Deletes all sub-portfolios that reference this portfolio as their `mainPortfolioId`.
	 * - Finally, deletes the main portfolio itself.
	 *
	 * This ensures proper cleanup of all dependent data and avoids orphaned records.
	 *
	 * @param id - The unique identifier of the portfolio to be deleted.
	 * @returns A Promise that resolves when the deletion process is complete.
	 * @throws Will throw an error if the deletion fails at any step.
	 */
	public async deletePortfolioById(id: string,): Promise<void> {
		const documentIds = await this.portfolioRepository.getAllDocumentIdsOfPortfolioAndItsEntities(id,)
		await this.documentService.deleteDocumentsByIds({id: documentIds,},)
		await this.budgetService.deleteBudgetPlansByPortfolioId(id,)
		await this.prismaService.portfolio.deleteMany({
			where: {
				mainPortfolioId: id,
			},
		},)
		await this.prismaService.portfolio.delete({
			where: {
				id,
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${PortfolioRoutes.ID}`,
			...cacheKeysToDeleteClient,
		],)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.PORTFOLIO_ACTION, {portfolioId: id,},)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// New Version
	public syncGetPortfolioListFiltered(data: IPortfoliosThirdPartyListCBondsParted, filters: IFilterProps, clientId?: string,): IPortfoliosFiltered {
		const {portfolios, drafts, currencyList, cryptoList, bonds, equities, etfs, metalList,} = data
		const { isActivated, isDeactivated, clients, types, range, search = '', } = filters
		const isActivatedBoolean = isActivated === 'true'
		const isDeactivatedBoolean = isDeactivated === 'true'
		const where: IFilterConditionsProps = {}
		if (clientId) {
			where.clientId = { in: [clientId,], }
		} else if (clients && clients.length > 0) {
			where.clientId = { in: 	clients, }
		}
		if (types && types.length > 0) {
			where.type = { in: types, }
		}
		if (!(isActivated === 'false' && isDeactivated === 'false')) {
			if (isActivated !== undefined && isDeactivated !== undefined) {
				where.isActivated = isActivatedBoolean
			} else if (isActivated !== undefined) {
				where.isActivated = isActivatedBoolean
			} else if (isDeactivated !== undefined) {
				where.isActivated = !isDeactivatedBoolean
			}
		}
		where.name = { contains: search, mode: 'insensitive',}

		const [min, max,] = Array.isArray(range,) && range.length === 2 ?
			range :
			[null, null,]
		const portfoliosWithTotalAssets = portfolios
			.map((portfolio,) => {
				const portfolioWithTotals = this.portfolioRepository.getPortfolioTotals(portfolio, {
					currencyList,
					cryptoList,
					bonds,
					equities,
					etfs,
					metalList,
				},)
				if (min && max && (portfolioWithTotals.totalAssets < Number(min,) || portfolioWithTotals.totalAssets > Number(max,))) {
					return null
				}
				return portfolioWithTotals as IPortfolio
			},)
			.filter((portfolio,): portfolio is IPortfolio => {
				return portfolio !== null
			},)
		const encryptedDrafts = drafts.map((draft,) => {
			return {
				...draft,
				name: this.cryptoService.decryptString(draft.name,),
				...(draft.resident ?
					{resident: this.cryptoService.decryptString(draft.resident,),} :
					{}),
				...(draft.taxResident ?
					{taxResident: this.cryptoService.decryptString(draft.taxResident,),} :
					{}),
			}
		},)
		const encryptedPortfolios = portfoliosWithTotalAssets.map((portfolio,) => {
			return {
				...portfolio,
				name: this.cryptoService.decryptString(portfolio.name,),
				...(portfolio.resident ?
					{resident: this.cryptoService.decryptString(portfolio.resident,),} :
					{}),
				...(portfolio.taxResident ?
					{taxResident: this.cryptoService.decryptString(portfolio.taxResident,),} :
					{}),
			}
		},)
		return {
			list:      [...encryptedDrafts, ...encryptedPortfolios,],
		}
	}

	/**
	 	* CR - 114/138
		* Computes and returns the full details of a given portfolio with total asset values.
		* @remarks
		* This method enriches the provided portfolio entity with calculated total asset values
		* for its related entities, banks, accounts, and assets. It uses pre-fetched third-party
		* data to compute the totals synchronously.
		* @param portfolio - The portfolio object with its related entities already loaded.
		* @param data - Pre-fetched third-party data required for calculating total values.
		* @returns A PortfolioWithRelations object containing enriched related data with total asset values.
	*/
	// New Version
	public syncGetPortfolioDetailsById(portfolio: PortfolioWithExtendedRelations, data: IPortfolioDetailedThirdPartyListCBondsParted,): PortfolioWithRelations {
		const {
			entitiesWithTotalAssetsValue,
			banksWithTotalAssetsValue,
			accountsWithTotalAssetsValue,
			assetsWithTotalAssetsValue,
		} = this.portfolioRepository.syncGetInstancesTotalAssetsOfPortfolio(portfolio, data,)
		return {
			...portfolio,
			name:        this.cryptoService.decryptString(portfolio.name,),
			...(portfolio.resident ?
				{resident:    this.cryptoService.decryptString(portfolio.resident,),} :
				{}),
			...(portfolio.taxResident ?
				{taxResident:    this.cryptoService.decryptString(portfolio.taxResident,),} :
				{}),
			client: {
				lastName:  this.cryptoService.decryptString(portfolio.client.lastName,),
				firstName: this.cryptoService.decryptString(portfolio.client.firstName,),
			},
			entities: entitiesWithTotalAssetsValue.map((entity,) => {
				return {
					...entity,
					name:                    this.cryptoService.decryptString(entity.name,),
					country:                 this.cryptoService.decryptString(entity.country,),
					authorizedSignatoryName: this.cryptoService.decryptString(entity.authorizedSignatoryName,),
					...(entity.firstName ?
						{firstName:               this.cryptoService.decryptString(entity.firstName,),} :
						{}),
					...(entity.lastName ?
						{lastName:               this.cryptoService.decryptString(entity.lastName,),} :
						{}),
					...(entity.email ?
						{email:               this.cryptoService.decryptString(entity.email,),} :
						{}),
				}
			},),
			banks:    banksWithTotalAssetsValue.map((bank,) => {
				return {
					...bank,
					country:    this.cryptoService.decryptString(bank.country,),
					branchName: this.cryptoService.decryptString(bank.branchName,),
					firstName:  bank.firstName ?
						this.cryptoService.decryptString(bank.firstName,) :
						null,
					lastName:   bank.lastName ?
						this.cryptoService.decryptString(bank.lastName,) :
						null,
					email:     bank.email ?
						this.cryptoService.decryptString(bank.email,) :
						null,
				}
			},),
			accounts: accountsWithTotalAssetsValue.map((account,) => {
				return {
					...account,
					accountName: this.cryptoService.decryptString(account.accountName,),
				}
			},),
			assets:   assetsWithTotalAssetsValue,
		}
	}
}