/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import {HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { RequestDraft,} from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'

import { DocumentService, } from '../../../modules/document/document.service'
import { text, } from '../../../shared/text'

import type { TRequestDraftExtended, } from '../request.types'
import { CryptoService, } from '../../../modules/crypto/crypto.service'
import type { CreateRequestDraftDto, } from '../dto'
import { AssetNamesType, } from '../../../modules/asset/asset.types'

@Injectable()
export class RequestDraftService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
	* 3.1.1
	 * Creates a new request draft.
 *
 * @remarks
 * - This method handles the creation of a request draft, allowing the user to provide necessary data in the form of `RequestDraftCreateInput`.
 *
 * @param data - The data required to create a new request draft.
 * @returns A promise that resolves to the newly created request draft object.
 */
	// todo: before asset refactor
	// public async createRequestDraft(data: Prisma.RequestDraftCreateInput,): Promise<RequestDraft> {
	// 	return this.prismaService.requestDraft.create({
	// 		data,
	// 	},)
	// }

	// todo: after asset refactor
	public async createRequestDraft(
		data: CreateRequestDraftDto,
	): Promise<RequestDraft> {
		const { assetId, assetName, ...rest } = data

		return this.prismaService.requestDraft.create({
			data: {
				...rest,
				...(assetId && assetName === AssetNamesType.BONDS ?
					{ assetBondId: assetId, assetEquityId: null, } :
					{}),
				...(assetId && assetName === AssetNamesType.EQUITY_ASSET ?
					{ assetEquityId: assetId, assetBondId: null, } :
					{}),
			},
		},)
	}

	/**
	* 3.1.2
	 * Updates the details of an existing request draft identified by its ID.
 *
 * @remarks
 * - This method allows updating the fields of a request draft based on the provided `id` and `RequestDraftUpdateInput`.
 * - It includes additional related entities like `account`, `client`, `documents`, etc.
 *
 * @param id - The ID of the request draft to update.
 * @param data - The updated data for the request draft.
 * @returns A promise that resolves to the updated request draft object.
 */
	// todo: before asset refactor
	// public async updateRequestDraft(id: number, data: Prisma.RequestDraftUpdateInput,): Promise<TRequestDraftExtended> {
	// 	return this.prismaService.requestDraft.update({
	// 		where: {
	// 			id,
	// 		},
	// 		data,
	// 		include: {
	// 			account:   true,
	// 			client:    true,
	// 			documents: true,
	// 			bank:      true,
	// 			entity:    true,
	// 			portfolio: true,
	// 			asset:     true,
	// 		},
	// 	},)
	// }

	// todo: after asset refactor
	public async updateRequestDraft(
		id: number,
		data: CreateRequestDraftDto,
	): Promise<TRequestDraftExtended> {
		const { assetId, assetName, ...rest } = data

		const updatedDraft = await this.prismaService.requestDraft.update({
			where: {
				id,
			},
			data: {
				...rest,
				...(assetId && assetName === AssetNamesType.BONDS ?
					{ assetBondId: assetId, assetEquityId: null, } :
					{}),
				...(assetId && assetName === AssetNamesType.EQUITY_ASSET ?
					{ assetEquityId: assetId, assetBondId: null, } :
					{}),
			},
			include: {
				account:   true,
				client:    true,
				documents: true,
				bank:      true,
				entity:    true,
				portfolio: true,
				assetBond: {
					select: { id: true, assetName: true, isin: true, security: true, },
				},
				assetEquity: {
					select: { id: true, assetName: true, isin: true, security: true, type: true, },
				},
			},
		},)

		return {
			...updatedDraft,
			asset: updatedDraft.assetBond ?
				updatedDraft.assetBond :
				updatedDraft.assetEquity ?
					updatedDraft.assetEquity :
					null,
		}
	}

	/**
	* 3.1.2
	 * Retrieves a list of all request drafts.
 *
 * @remarks
 * - This method returns all request drafts from the database ordered by `updatedAt` in descending order.
 *
 * @returns A promise that resolves to an array of all request draft objects.
 */
	public async getRequestDrafts(): Promise<Array<RequestDraft>> {
		const requestDrafts = await this.prismaService.requestDraft.findMany({
			orderBy: {
				updatedAt: 'desc',
			},
		},)
		return requestDrafts
	}

	/**
	 * 3.1.2
 * Retrieves a specific request draft by its ID.
 *
 * @remarks
 * - This method returns a request draft by its `id`. If the draft does not exist, an exception is thrown.
 *
 * @param id - The ID of the request draft to retrieve.
 * @returns A promise that resolves to the request draft object.
 * @throws HttpException if the request draft does not exist.
 */
	// todo: before asset refactor
	// public async getRequestDraftById(id: number,): Promise<RequestDraft> {
	// 	const requestDraft = await this.prismaService.requestDraft.findUnique({where: {id,},},)

	// 	if (!requestDraft) {
	// 		throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
	// 	}
	// 	return requestDraft
	// }

	// todo: after asset refactor
	public async getRequestDraftById(id: number,): Promise<TRequestDraftExtended> {
		const requestDraft = await this.prismaService.requestDraft.findUnique({
			where:   { id, },
			include: {
				account:   true,
				client:    true,
				documents: true,
				bank:      true,
				entity:    true,
				portfolio: true,
				assetBond: {
					select: { id: true, assetName: true, isin: true, security: true, },
				},
				assetEquity: {
					select: { id: true, assetName: true, isin: true, security: true, type: true, },
				},
			},
		},)

		if (!requestDraft) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}

		return {
			...requestDraft,
			asset: requestDraft.assetBond ?
				requestDraft.assetBond :
				requestDraft.assetEquity ?
					requestDraft.assetEquity :
					null,
		}
	}

	/**
	* 3.1.2
	 * Retrieves the extended details of a specific request draft identified by its ID.
 *
 * @remarks
 * - This method returns a full set of related entities for the request draft, such as `account`, `bank`, `client`, `documents`, and `portfolio`.
 * - If the request draft with the provided ID does not exist, an error is thrown.
 *
 * @param id - The ID of the request draft to retrieve.
 * @returns A promise that resolves to the extended details of the request draft.
 * @throws HttpException if the request draft does not exist.
 */
	// todo: before asset refactor
	// public async getRequestDraftExtendedById(id: number,): Promise<TRequestDraftExtended> {
	// 	const requestDraft = await this.prismaService.requestDraft.findUnique({
	// 		where:   { id, },
	// 		include: {
	// 			account:   true,
	// 			bank:      true,
	// 			client:    true,
	// 			documents: true,
	// 			entity:    true,
	// 			portfolio: true,
	// 			asset:     true,
	// 		},
	// 	},)

	// 	if (!requestDraft) {
	// 		throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
	// 	}

	// 	return {
	// 		...requestDraft,
	// 		client: {
	// 			...requestDraft.client,
	// 			firstName: requestDraft.client?.firstName && this.cryptoService.decryptString(requestDraft.client.firstName,),
	// 			lastName:  requestDraft.client?.lastName && this.cryptoService.decryptString(requestDraft.client.lastName,),
	// 		},
	// 		portfolio: {
	// 			...requestDraft.portfolio,
	// 			name:     requestDraft.portfolio?.name && this.cryptoService.decryptString(requestDraft.portfolio.name,),
	// 		},
	// 		entity: {
	// 			...requestDraft.entity,
	// 			name:     requestDraft.entity?.name && this.cryptoService.decryptString(requestDraft.entity.name,),
	// 		},
	// 		account: {
	// 			...requestDraft.account,
	// 			accountName:     requestDraft.account?.accountName && this.cryptoService.decryptString(requestDraft.account.accountName,),
	// 		},
	// 		bank: {
	// 			...requestDraft.bank,
	// 		},
	// 	}
	// }

	// todo: after asset refactor
	public async getRequestDraftExtendedById(id: number,): Promise<TRequestDraftExtended> {
		const requestDraft = await this.prismaService.requestDraft.findUnique({
			where:   { id, },
			include: {
				account:   true,
				bank:      true,
				client:    true,
				documents: true,
				entity:    true,
				portfolio: true,
				assetBond: {
					select: { id: true, assetName: true, isin: true, security: true, },
				},
				assetEquity: {
					select: { id: true, assetName: true, isin: true, security: true, type: true, },
				},
			},
		},)

		if (!requestDraft) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}

		return {
			...requestDraft,
			client: {
				...requestDraft.client,
				firstName: requestDraft.client?.firstName &&
				this.cryptoService.decryptString(requestDraft.client.firstName,),
				lastName:  requestDraft.client?.lastName &&
				this.cryptoService.decryptString(requestDraft.client.lastName,),
			},
			portfolio: {
				...requestDraft.portfolio,
				name: requestDraft.portfolio?.name &&
				this.cryptoService.decryptString(requestDraft.portfolio.name,),
			},
			entity: {
				...requestDraft.entity,
				name: requestDraft.entity?.name &&
				this.cryptoService.decryptString(requestDraft.entity.name,),
			},
			account: {
				...requestDraft.account,
				accountName: requestDraft.account?.accountName &&
				this.cryptoService.decryptString(requestDraft.account.accountName,),
			},
			bank: {
				...requestDraft.bank,
				branchName: requestDraft.bank?.branchName &&
				this.cryptoService.decryptString(requestDraft.bank.branchName,),
			},
			asset: requestDraft.assetBond ?
				requestDraft.assetBond :
				requestDraft.assetEquity ?
					requestDraft.assetEquity :
					null,
		}
	}

	/**
	 * 3.1.2
	 * Deletes an existing request draft identified by its ID, along with related documents.
 *
 * @remarks
 * - This method removes the request draft and its related documents from the database.
 * - The associated documents are deleted by invoking `deleteDocumentsByIds`.
 *
 * @param id - The ID of the request draft to delete.
 * @returns A promise that resolves when the request draft and its documents have been successfully deleted.
 */
	public async deleteRequestDraft(id: number,): Promise<void> {
		const requestDraft = await this.getRequestDraftExtendedById(id,)

		const documentIds = requestDraft.documents?.map((doc,) => {
			return doc.id
		},)
		if (documentIds && (documentIds.length > 0)) {
			await this.documentService.deleteDocumentsByIds({id: documentIds,},)
		}

		await this.prismaService.requestDraft.delete({where: {id: requestDraft.id,},},)
	}
}