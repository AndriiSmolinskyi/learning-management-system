/* eslint-disable max-lines */
/* eslint-disable no-nested-ternary */
import { DocumentService, } from './../../document/document.service'
import {  HttpException, HttpStatus, Injectable, Logger, NotFoundException, } from '@nestjs/common'
import {  PrismaService, } from 'nestjs-prisma'
import type { CurrencyDataList, Prisma, } from '@prisma/client'
import type { IFilterProps, TAsyncClientsListRes, } from '../client.types'
import { ClientRepository, } from '../../../repositories/client/client.repository'
import { EmailRepository, } from '../../../repositories/email/email.repository'
import { PhoneRepository, } from '../../../repositories/phone/phone.repository'
import { CryptoService, } from '../../../modules/crypto/crypto.service'
import { MailService, } from '../../../modules/mail/mail.service'
import { AssetService, } from '../../asset/asset.service'
import {
	CBondsCurrencyService,
} from '../../../modules/apis/cbonds-api/services'
import { PortfolioRepository, } from '../../../repositories/portfolio/portfolio.repository'
import { BudgetService, } from '../../../modules/budget/services'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import type {
	TClientRes, TClientsListRes,
} from '../client.types'
import type {
	ActivateClientDto,
	AddClientDto,
	UpdateClientDto,
} from '../dto'
import { PortfolioService, } from '../../../modules/portfolio/services'
import { AssetOperationType, } from '../../../shared/types'
import { ClientRoutes, cacheKeysToDeleteClient, } from '../client.constants'
import type {TClientListCache, } from '../../../modules/common/cache-sync/cache-sync.types'
import { EventEmitter2, } from '@nestjs/event-emitter'
import { ComputationsService, } from '../../../modules/common/computations/computations.service'
import { v4 as uuid4, } from 'uuid'

@Injectable()
export class ClientService {
	private readonly logger = new Logger(ClientService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly clientRepository: ClientRepository,
		private readonly emailRepository: EmailRepository,
		private readonly phoneRepository: PhoneRepository,
		private readonly cryptoService: CryptoService,
		private readonly mailService: MailService,
		private readonly assetService: AssetService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly documentService: DocumentService,
		private readonly portfolioRepository: PortfolioRepository,
		private readonly budgetService: BudgetService,
		private readonly portfolioService: PortfolioService,
		private readonly cacheService: RedisCacheService,
		private readonly eventEmitter: EventEmitter2,
		private readonly computationsService: ComputationsService,
	) {}

	/**
	 * Creates a new client in the database.
	 * @param body - The data for creating a new client.
	 * @returns A promise that resolves to the newly created client.
	 * @remarks
	 * This function uses the `clientRepository` to interact with the database.
	 * It calls the `createClient` method of the `clientRepository` with the provided `body` parameter.
	 */
	public async createClient(body: AddClientDto,): Promise<TClientRes> {
		const newClient = await this.clientRepository.createClient(body,)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.CLIENT_LIST_UPDATED,{client: newClient, clientId: newClient.id,},)
		return this.clientRepository.findClientById(newClient.id,)
	}

	/**
	 * Retrieves a list of clients from the database based on the provided parameters.
	 * @param params - The parameters for filtering and sorting the clients.
	 * @returns A promise that resolves to the list of clients matching the given parameters.
	 * @remarks
	 * This function uses the `clientRepository` to interact with the database.
	 * It calls the `getAllClients` method of the `clientRepository` with the provided `params` parameter.
	 */
	// Old version todo: To be removed
	// public async getClients(filters: IFilterProps,): Promise<TClientsListRes> {
	// 	const log = this.getTimestampLogger()
	// 	log('getClients','Start',)
	// 	const [clientsList, currencyList, cryptoList,bonds, equities, etfs, metalList,] = await Promise.all([
	// 		this.clientRepository.getAllClients(filters,),
	// 		this.cBondsCurrencyService.getAllCurrencies(),
	// 		this.prismaService.cryptoData.findMany(),
	// 		this.prismaService.bond.findMany(),
	// 		this.prismaService.equity.findMany(),
	// 		this.prismaService.etf.findMany(),
	// 		this.cBondsCurrencyService.getAllMetalsWithHistory(),
	// 	],)
	// 	log('getClients','After DB query',)

	// 	const clientsWithAssets = clientsList.list.map((client,) => {
	// 		const portfolios = client.portfolios ?? []
	// 		const totalAssetsPerPortfolio = portfolios.map((portfolio,) => {
	// 			const assetMap = new Map<string,{
	// 	totalAssets: number
	//    totalUnits: number
	//    hasUnitsInPayload: boolean
	//    assets: Array<typeof portfolio.assets[number]>
	//    }
	//  >()
	// 			portfolio.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)
	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units ?? 0
	// 				const hasUnitsInPayload = parsedPayload?.units !== undefined
	// 				const isin = parsedPayload?.isin
	// 				const metalType = parsedPayload?.metalType
	// 				const currency = parsedPayload?.currency
	// 				const key = isin ?
	// 					`${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`

	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, {
	// 						totalAssets: 0,
	// 						totalUnits:  0,
	// 						hasUnitsInPayload,
	// 						assets:      [],
	// 					},)
	// 				}
	// 				const entry = assetMap.get(key,)!
	// 				entry.assets.push(asset,)
	// 				if (operation === AssetOperationType.SELL) {
	// 					entry.totalAssets = entry.totalAssets - totalAssets
	// 					entry.totalUnits = entry.totalUnits - units
	// 				} else {
	// 					entry.totalAssets = entry.totalAssets + totalAssets
	// 					entry.totalUnits = entry.totalUnits + units
	// 				}
	// 			},)
	// 			const filteredAssetGroups = Array.from(assetMap.values(),).filter(
	// 				(entry,) => {
	// 					return !entry.hasUnitsInPayload || entry.totalUnits > 0
	// 				},
	// 			)
	// 			const totalFilteredAssets = filteredAssetGroups.reduce(
	// 				(sum, group,) => {
	// 					return sum + group.totalAssets
	// 				},
	// 				0,
	// 			)
	// 			const totalTransactionsAssets = portfolio.transactions.reduce((sum, transaction,) => {
	// 				return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 					currency:      transaction.currency as CurrencyDataList,
	// 					currencyValue: Number(transaction.amount,),
	// 					currencyList,
	// 				},)
	// 			},0,)
	// 			return totalFilteredAssets + totalTransactionsAssets
	// 		},)
	// 		const clientTotalAssets = totalAssetsPerPortfolio.reduce((a, b,) => {
	// 			return a + b
	// 		}, 0,)
	// 		return {
	// 			...client,
	// 			totalAssets: clientTotalAssets,
	// 		}
	// 	},)
	// 	const sortBy = filters.sortBy ?? []
	// 	const sortOrder = filters.sortOrder ?? []

	// 	if (sortBy.includes('totalAssets',)) {
	// 		const orderIndex = sortBy.indexOf('totalAssets',)
	// 		const order = sortOrder[orderIndex]?.toLowerCase() ?? 'asc'

	// 		clientsWithAssets.sort((a, b,) => {
	// 			if (order === 'asc' || order === 'a') {
	// 				return b.totalAssets - a.totalAssets
	// 			}
	// 			return a.totalAssets - b.totalAssets
	// 		},)
	// 	}

	// 	const { range, } = filters
	// 	const filteredClients = (range && range.length === 2) ?
	// 		clientsWithAssets.filter((client,) => {
	// 			const [min, max,] = range.map(Number,)
	// 			return client.totalAssets >= min && client.totalAssets <= max
	// 		},) :
	// 		clientsWithAssets

	// 	filteredClients.sort((a, b,) => {
	// 		if (a.isActivated === b.isActivated) {
	// 			return 0
	// 		}
	// 		return a.isActivated ?
	// 			-1 :
	// 			1
	// 	},)
	// 	log('getClients','After computing (map)',)

	// 	return {
	// 		total: clientsList.total,
	// 		list:  filteredClients,
	// 	}
	// }

	// New version
	public async getClients(filters: IFilterProps,): Promise<TAsyncClientsListRes> {
		const [clientsList,] = await Promise.all([
			this.clientRepository.getAllClients(filters,),
		],)
		clientsList.list.sort((a, b,) => {
			if (a.isActivated === b.isActivated) {
				return 0
			}
			return a.isActivated ?
				-1 :
				1
		},)
		return {
			total: clientsList.total,
			list:  clientsList.list,
		}
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetClients(data: TClientListCache, filters: IFilterProps,): TClientsListRes {
		const {clientsList, currencyList, cryptoList, bonds, equities, etfs, metalList,} = data
		const clientsWithAssets = clientsList.list.map((client,) => {
			const portfolios = client.portfolios ?? []
			const totalAssetsPerPortfolio = portfolios.map((portfolio,) => {
				const assetMap = new Map<
      string,
      {
        totalAssets: number
        totalUnits: number
        hasUnitsInPayload: boolean
        assets: Array<typeof portfolio.assets[number]>
      }
    >()
				portfolio.assets.forEach((asset,) => {
					const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
						currencyList,
						cryptoList,
						bonds,
						equities,
						etfs,
						metalList,
					},)
					const parsedPayload = JSON.parse(asset.payload as string,)
					const operation = parsedPayload?.operation
					const units = parsedPayload?.units ?? 0
					const hasUnitsInPayload = parsedPayload?.units !== undefined
					const isin = parsedPayload?.isin
					const metalType = parsedPayload?.metalType
					const currency = parsedPayload?.currency
					const key = isin ?
						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
						metalType ?
							`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
							`${asset.id}`

					if (!assetMap.has(key,)) {
						assetMap.set(key, {
							totalAssets: 0,
							totalUnits:  0,
							hasUnitsInPayload,
							assets:      [],
						},)
					}
					const entry = assetMap.get(key,)!
					entry.assets.push(asset,)
					if (operation === AssetOperationType.SELL) {
						entry.totalAssets = entry.totalAssets - totalAssets
						entry.totalUnits = entry.totalUnits - units
					} else {
						entry.totalAssets = entry.totalAssets + totalAssets
						entry.totalUnits = entry.totalUnits + units
					}
				},)
				const filteredAssetGroups = Array.from(assetMap.values(),).filter(
					(entry,) => {
						return !entry.hasUnitsInPayload || entry.totalUnits > 0
					},
				)
				const totalFilteredAssets = filteredAssetGroups.reduce(
					(sum, group,) => {
						return sum + group.totalAssets
					},
					0,
				)
				const totalTransactionsAssets = portfolio.transactions.reduce((sum, transaction,) => {
					return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
					},)
				},
				0,
				)
				return totalFilteredAssets + totalTransactionsAssets
			},)
			const clientTotalAssets = totalAssetsPerPortfolio.reduce((a, b,) => {
				return a + b
			}, 0,)
			return {
				...client,
				totalAssets: clientTotalAssets,
			}
		},)
		const sortBy = filters.sortBy ?? []
		const sortOrder = filters.sortOrder ?? []

		if (sortBy.includes('totalAssets',)) {
			const orderIndex = sortBy.indexOf('totalAssets',)
			const order = sortOrder[orderIndex]?.toLowerCase() ?? 'asc'

			clientsWithAssets.sort((a, b,) => {
				if (order === 'asc' || order === 'a') {
					return b.totalAssets - a.totalAssets
				}
				return a.totalAssets - b.totalAssets
			},)
		}

		const { range, } = filters
		const filteredClients = (range && range.length === 2) ?
			clientsWithAssets.filter((client,) => {
				const [min, max,] = range.map(Number,)
				return client.totalAssets >= min && client.totalAssets <= max
			},) :
			clientsWithAssets

		filteredClients.sort((a, b,) => {
			if (a.isActivated === b.isActivated) {
				return 0
			}
			return a.isActivated ?
				-1 :
				1
		},)
		return {
			total: clientsList.total,
			list:  filteredClients,
		}
	}

	/**
	 * Retrieves a client from the database by its unique identifier.
	 * @param id - The unique identifier of the client to retrieve.
	 * @returns A promise that resolves to the client with the given `id`.
	 * @remarks
	 * This function uses the `clientRepository` to interact with the database.
	 * It calls the `findClientById` method of the `clientRepository` with the provided `id` parameter.
	 * @throws Will throw an error if the client with the given `id` does not exist in the database.
	 */
	public async getClientById(id: string,): Promise<TClientRes> {
		return this.clientRepository.findClientById(id,)
	}

	/**
	 * Updates a client's full information in the database.
	 * This function uses a transaction to update the client's data, emails, and contacts.
	 * It first extracts the `emails` and `contacts` from the `data` parameter and updates the client's data using the `clientRepository`.
	 * Then, if `emails` are provided, it updates the client's emails using the `emailRepository`.
	 * Finally, if `contacts` are provided, it updates the client's contacts using the `phoneRepository`.
	 * @param id - The unique identifier of the client to update.
	 * @param data - The updated data for the client, including emails and contacts.
	 * @returns A promise that resolves to the updated client.
	 * @remarks
	 * This function assumes that the `prismaService` is properly configured and available for use.
	 * It also assumes that the `clientRepository`, `emailRepository`, and `phoneRepository` are properly implemented and available for use.
	 */
	public async updateClientFull(
		id: string,
		data: UpdateClientDto,
	): Promise<TClientRes> {
		await this.prismaService.$transaction(async(tx,) => {
			const { emails, contacts, ...clientData } = data
			await this.clientRepository.updateClientById(tx, id, clientData as Prisma.ClientUpdateInput,)
			if (emails) {
				await this.emailRepository.updateClientEmails(tx, id, emails,)
			}
			if (contacts) {
				await this.phoneRepository.updateClientContacts(tx, id, contacts,)
			}
		},)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.CLIENT_LIST_UPDATED,{clientId: id,},)
		await this.cacheService.deleteByUrl([`/${ClientRoutes.MODULE}/${id}`,],)
		return this.clientRepository.findClientById(id,)
	}

	/**
	 * Activates a client in the database by updating its status.
	 * @param id - The unique identifier of the client to activate.
	 * @param data - The data containing the new status for the client.
	 * @returns A promise that resolves to the activated client.
	 * @remarks
	 * This function uses the `clientRepository` to interact with the database.
	 * It first updates the client's status using the `updateClient` method of the `clientRepository` with the provided `id` and `data` parameters.
	 * Then, it retrieves the activated client using the `findClientById` method of the `clientRepository` with the provided `id`.
	 * @throws Will throw an error if the client with the given `id` does not exist in the database.
	 */
	public async activateClient(id: string, data: ActivateClientDto,): Promise<TClientRes> {
		await this.clientRepository.updateClient(id, data,)
		await this.clientRepository.updateClientPortfolios(id, data.isActivated,)
		await this.cacheService.deleteByUrl([`/${ClientRoutes.MODULE}/${id}`, ...cacheKeysToDeleteClient,],)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.CLIENT_LIST_UPDATED, {clientId: id,},)
		return this.clientRepository.findClientById(id,)
	}

	/**
 * Retrieves a simplified list of clients for use in dropdown/select UI components.
 * @returns A Promise that resolves to an array of objects containing `value` and `label` fields for each client.
 * @remarks
 * This method is typically used for populating select inputs in the UI, where `value` is the client ID and `label` is the display name.
 */
	public async getClientsForSelect(): Promise<Array<{value: string, label: string}>> {
		return this.clientRepository.getClientsForSelect()
	}

	/**
	 * CR-013
	 * Deletes a client by ID, including their associated budget plans and documents.
 * @param id - The ID of the client to be deleted.
 * @returns A Promise that resolves when the client and their associated data are successfully deleted.
 * @remarks
 * This method performs the following:
 * - Retrieves all document IDs related to the client's portfolios and deletes the documents.
 * - Deletes all budget plans associated with the client.
 * - Deletes the client entity itself from the database.
 * It ensures that all related data is removed to maintain database integrity.
 */
	public async deleteClientById(id: string,): Promise<void> {
		const client = await this.prismaService.client.findUnique({
			where:  { id, },
			select: {
				portfolios:      { select: { id: true, }, },
				portfolioDrafts: { select: { id: true, }, },
				budgetPlan:      { select: { id: true, }, },
				budgetPlanDraft: { select: { id: true, }, },
			},
		},)

		if (!client) {
			throw new NotFoundException(`Client with id ${id} not found`,)
		}

		const allDocumentIds = await this.portfolioRepository.getAllDocumentIdsOfPortfoliosByClientId(id,)
		if (allDocumentIds.length > 0) {
			await this.documentService.deleteDocumentsByIds({ id: allDocumentIds, },)
		}
		await this.budgetService.deleteBudgetPlansByClientId(id,)
		await this.prismaService.client.delete({
			where: { id, },
		},)
		// todo: Remove after asset refactor approved
		// const portfolioIds = [
		// 	...client.portfolios.map((p,) => {
		// 		return p.id
		// 	},),
		// 	...client.portfolioDrafts.map((p,) => {
		// 		return p.id
		// 	},),
		// ]
		// const budgetIds = [
		// 	...(client.budgetPlan ?
		// 		[client.budgetPlan.id,] :
		// 		[]),
		// 	...(client.budgetPlanDraft ?
		// 		[client.budgetPlanDraft.id,] :
		// 		[]),
		// ]
		// this.eventEmitter.emit(eventNames.CLIENT_DELETED, {clientId: id, portfolioIds, budgetIds,},)
		await this.cacheService.deleteByUrl([`/${ClientRoutes.MODULE}/${id}`, ...cacheKeysToDeleteClient,],)
	}

	/**
	 * CR-017
	 /**
 * Resends a confirmation email to the client.
 * @param clientId - The unique identifier of the client to whom the confirmation email should be sent.
 * @returns A Promise that resolves when the confirmation email is successfully sent.
 * @remarks
 * This method checks whether the client has a registered email. If so, it triggers the `MailService` to resend the confirmation.
 * It is useful for clients who may have missed the initial confirmation or require reactivation.
 */
	public async sendConfirmation(clientId: string,): Promise<void> {
		const userInfo = await this.prismaService.email.findFirst({
			where: {
				clientId,
			},
		},)
		if (userInfo) {
			await this.mailService.sendConfirmation(clientId,)
		}
	}

	/**
	 * CR - 173
	 * Sends a password reset email to the client.
	 * @param email - The email address of the client requesting a password reset.
	 * @returns A Promise that resolves when the password reset email is successfully sent.
	 * @remarks
	 * This method generates a unique reset token and updates the corresponding record in the database.
	 * It then triggers the `MailService` to send a password reset email containing a secure link.
	 * If the provided email does not exist in the system, an HTTP 404 error is thrown.
	 * The email field is decrypted for comparison to ensure proper matching with stored encrypted values.
	 */
	public async resetPassword(email: string,): Promise<void> {
		const token: string = uuid4()
		const allEmails = await this.prismaService.email.findMany()
		const emailToUpdate = allEmails.find((item,) => {
			return this.cryptoService.decryptString(item.email,) === email
		},)
		if (!emailToUpdate) {
			throw new HttpException('Email not found!', HttpStatus.NOT_FOUND,)
		}
		await this.prismaService.email.update({
			where: { email: emailToUpdate.email, },
			data:  {
				token,
			},
		},)

		await this.mailService.sendForgot({
			email,
			token,
		},)
	}

	/**
	 * CR - 167
	 * Updates total asset values for a specific client.
	 * @param clientId - The unique identifier of the client whose asset totals need to be recalculated.
	 * @returns A Promise that resolves when the client's totals are successfully updated.
	 * @remarks
	 * This method triggers a recalculation of asset totals for the given client by calling
	 * the `ComputationsService`. It is typically used after data refactoring or adjustments
	 * to ensure totals remain consistent and accurate.
	 */
	public async updateClientTotals(clientId: string,): Promise<void> {
		try {
			await this.computationsService.updateClientTotals(clientId,)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	/**
	 * CR - 167
	 * Updates total asset values for all clients.
	 * @returns A Promise that resolves when totals for all clients have been successfully updated.
	 * @remarks
	 * This method triggers a global recalculation of all clients' asset totals
	 * using the `ComputationsService`. It is intended for bulk synchronization after
	 * system-wide refactoring, data migration, or asset recalculations.
	 */
	public async updateAllClientsTotals(): Promise<void> {
		try {
			await Promise.all([
				this.computationsService.updateAssetBonds(),
				this.computationsService.updateAssetEquities(),
				this.computationsService.updateAssetCryptos(),
				this.computationsService.updateAssetDeposits(),
				this.computationsService.updateAssetMetals(),
				this.computationsService.updateAssetLoans(),
				this.computationsService.updateAssetOptions(),
				this.computationsService.updateAssetRealEstate(),
				this.computationsService.updateAssetOthers(),
				this.computationsService.updateAssetPrivateEquity(),
			],)
			await	this.computationsService.updateAllClientsTotals()
		} catch (error) {
			this.logger.error(error,)
		}
	}

	public async updateAllClientsAndPortfolioTotals(): Promise<void> {
		try {
			await	this.computationsService.updateAllClientsTotals()
		} catch (error) {
			this.logger.error(error,)
		}
	}
}