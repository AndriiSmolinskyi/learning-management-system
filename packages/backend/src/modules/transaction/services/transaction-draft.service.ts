/* eslint-disable complexity */
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { TransactionDraft, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'

import { text, } from '../../../shared/text'
import { DocumentService, } from '../../document/document.service'

import type { TransactionDraftExtended, } from '../transaction.types'
import { CryptoService, } from '../../crypto/crypto.service'
import type { UpdateTransactionDto, CreateTransactionDraftDto,} from '../dto'

@Injectable()

export class TransactionDraftService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
	* 3.4
	* Creates a new transaction draft in the database.
	* @param data - The input data for creating a new transaction draft.
	* @returns A promise that resolves to the newly created transaction draft.
	*/
	public async createTransactionDraft(data: CreateTransactionDraftDto,): Promise<TransactionDraft> {
		const currentVersion = await this.prismaService.transactionTypeVersion.findFirst({
			where:  { typeId: data.transactionTypeId, isCurrent: true, },
			select: { id: true, },
		},)
		if (!currentVersion) {
			throw new Error('Current transaction type version not found',)
		}
		return this.prismaService.transactionDraft.create({
			data: {
				...data,
				...(data.serviceProvider ?
					{serviceProvider: this.cryptoService.encryptString(data.serviceProvider,),} :
					{}),
				...(data.comment ?
					{comment: this.cryptoService.encryptString(data.comment,),} :
					{}),
				transactionTypeVersionId: currentVersion.id,
			},
		},)
	}

	/**
	* 3.4
	* Retrieves all transaction drafts.
	* @returns A promise that resolves to an array of transaction drafts, ordered by most recently updated.
	*/
	public async getTransactionDrafts(): Promise<Array<TransactionDraft>> {
		const transactions = await this.prismaService.transactionDraft.findMany({
			orderBy: {
				updatedAt: 'desc',
			},
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
	* 3.4
	* Retrieves a specific transaction draft by its unique identifier.
	* @param id - The unique identifier of the transaction draft.
	* @returns A promise that resolves to the transaction draft with all related entities.
	* @throws HttpException if the transaction draft is not found.
	*/
	public async getTransactionDraftById(id: number,): Promise<TransactionDraftExtended> {
		const transactionDraft = await this.prismaService.transactionDraft.findUnique({
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
				typeVersion:     true,
			},
		},)

		if (!transactionDraft) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}

		return {
			...transactionDraft,
			...(transactionDraft.serviceProvider ?
				{serviceProvider: this.cryptoService.decryptString(transactionDraft.serviceProvider,),} :
				{}),
			...(transactionDraft.comment ?
				{comment: this.cryptoService.decryptString(transactionDraft.comment,),} :
				{}),
			...(transactionDraft.portfolio ?
				{portfolio: {
					...transactionDraft.portfolio,
					name: this.cryptoService.decryptString(transactionDraft.portfolio.name,),
				},} :
				{}),
			...(transactionDraft.entity ?
				{entity: {
					...transactionDraft.entity,
					name: this.cryptoService.decryptString(transactionDraft.entity.name,),
				},} :
				{}),
			...(transactionDraft.account ?
				{account: {
					...transactionDraft.account,
					accountName: this.cryptoService.decryptString(transactionDraft.account.accountName,),
				},} :
				{}),
			...(transactionDraft.client ?
				{client: {
					...transactionDraft.client,
					firstName: this.cryptoService.decryptString(transactionDraft.client.firstName,),
					lastName:  this.cryptoService.decryptString(transactionDraft.client.lastName,),
				},} :
				{}),
		}
	}

	/**
	* 3.4
	* Updates an existing transaction draft in the database.
	* @param id - The unique identifier of the transaction draft to update.
	* @param data - The updated data for the transaction draft.
	* @returns A promise that resolves to the updated transaction draft with all related entities.
	*/
	public async updateTransactionDraft(id: number, data: UpdateTransactionDto,): Promise<TransactionDraftExtended> {
		return this.prismaService.transactionDraft.update({
			where: {
				id,
			},
			data: {
				...data,
				...(data.serviceProvider && typeof data.serviceProvider === 'string' ?
					{serviceProvider: this.cryptoService.encryptString(data.serviceProvider,),} :
					{}),
				...(data.comment && typeof data.comment === 'string' ?
					{comment: this.cryptoService.encryptString(data.comment,),} :
					{}),
				transactionTypeId: data.transactionTypeId ?? null,
				clientId:          data.clientId ?? null,
				portfolioId:       data.portfolioId ?? null,
				entityId:          data.entityId ?? null,
				bankId:            data.bankId ?? null,
				accountId:         data.accountId ?? null,
				transactionDate:   data.transactionDate ?? null,
				amount:            data.amount ?? null,
				comment:           data.comment ?? null,
				orderId:           data.orderId ?? null,
				isin:              data.isin ?? null,
				security:          data.security ?? null,
				currency:          data.currency ?? null,
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
		},)
	}

	/**
	 * 3.4
	 *  Deletes a transaction draft and its associated documents.
	 * @param id - The unique identifier of the transaction draft to delete.
	 * @returns A promise that resolves when the transaction draft and its documents are deleted.
	*/
	public async deleteTransactionDraft(id: number,): Promise<void> {
		const transactionDraft = await this.getTransactionDraftById(id,)
		const documentIds = transactionDraft.documents.map((doc,) => {
			return doc.id
		},)

		await this.documentService.deleteDocumentsByIds({id: documentIds,},)
		await this.prismaService.transactionDraft.delete({where: {id: transactionDraft.id,},},)
	}
}