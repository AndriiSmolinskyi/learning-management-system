/* eslint-disable complexity */
import { Injectable, InternalServerErrorException,} from '@nestjs/common'
import type { ClientDraft, } from '@prisma/client'
import { ClientRepository, } from '../../../repositories/client/client.repository'
import { PrismaService, } from 'nestjs-prisma'
import type { TDraftsListRes, } from '../client.types'
import type { AddDraftDto, } from '../dto'
import type { UpdateDraftDto, } from '../dto/update-draft.dto'
import { DocumentService, } from '../../../modules/document/document.service'
import { CryptoService, } from '../../../modules/crypto/crypto.service'

@Injectable()
export class DraftService {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
	 * Creates a new draft for a client.
	 * @param body - The data required to create a new draft.
	 * @returns A promise that resolves to the newly created draft.
	 * @remarks
	 * The `AddDraftDto` type should define the structure of the data required to create a new draft.
	 * The `createDraft` method calls the `createDraft` method of the `ClientRepository` to persist the new draft.
	 */
	public async createDraft(body: AddDraftDto,): Promise<ClientDraft> {
		return this.clientRepository.createDraft(body,)
	}

	/**
	 * Retrieves a list of drafts from the database based on the provided parameters.
	 * @param params - The parameters for filtering and sorting the drafts.
	 * @returns A promise that resolves to the list of drafts matching the given parameters.
	 * @remarks
	 * This function uses the `clientRepository` to interact with the database.
	 * It calls the `getAllDrafts` method of the `clientRepository` with the provided `params` parameter.
	 */
	public async getDrafts(): Promise<TDraftsListRes> {
		return this.clientRepository.getAllDrafts()
	}

	/**
	 * Retrieves a draft from the database by its unique identifier.
	 *
	 * @param id - The unique identifier of the draft to retrieve.
	 * @returns A promise that resolves to the draft with the given `id`.
	 * @remarks
	 * This function uses the `clientRepository` to interact with the database.
	 * It calls the `findDraftById` method of the `clientRepository` with the provided `id` parameter.
	 * @throws Will throw an error if the draft with the given `id` does not exist in the database.
	 */
	public async getDraftById(id: string,): Promise<ClientDraft> {
		return this.clientRepository.findDraftById(id,)
	}

	/**
 * Deletes a client draft by its ID along with all associated documents.
 * @param id - The unique identifier of the draft to delete.
 * @returns A promise that resolves when the draft and its documents have been successfully deleted.
 * @throws InternalServerErrorException if the draft or documents cannot be deleted.
 * @remarks
 * This method ensures that all related documents are also removed to prevent orphaned records.
 */
	public async deleteClientDraft(id: string,): Promise<void> {
		try {
			const client = await this.prismaService.clientDraft.delete({
				where:   { id, },
				include: {
					documents: {
						select: {
							id: true,
						},
					},
				},
			},)
			const documentIds = client.documents.map((doc,) => {
				return doc.id
			},)
			await this.documentService.deleteDocumentsByIds({id: documentIds,},)
		} catch (error) {
			throw new InternalServerErrorException('Failed to delete order draft',)
		}
	}

	/**
 * Updates an existing client draft with new data.
 * @param id - The ID of the draft to update.
 * @param body - The updated draft data.
 * @returns A promise that resolves to the updated draft.
 * @throws InternalServerErrorException if the update fails.
 * @remarks
 * This method performs a safe update and handles errors gracefully.
 */
	public async updateDraft(
		id: string,
		body: UpdateDraftDto,
	): Promise<ClientDraft> {
		try {
			return await this.prismaService.clientDraft.update({
				where: { id, },
				data:  {
					...body,
					...(body.firstName ?
						{firstName: this.cryptoService.encryptString(body.firstName,),} :
						{}),
					...(body.lastName ?
						{lastName: this.cryptoService.encryptString(body.lastName,),} :
						{}),
					...(body.residence ?
						{residence: this.cryptoService.encryptString(body.residence,),} :
						{}),
					...(body.country ?
						{country: this.cryptoService.encryptString(body.country,),} :
						{}),
					...(body.region ?
						{region: this.cryptoService.encryptString(body.region,),} :
						{}),
					...(body.city ?
						{city: this.cryptoService.encryptString(body.city,),} :
						{}),
					...(body.streetAddress ?
						{streetAddress: this.cryptoService.encryptString(body.streetAddress,),} :
						{}),
					...(body.buildingNumber ?
						{buildingNumber: this.cryptoService.encryptString(body.buildingNumber,),} :
						{}),
					...(body.postalCode ?
						{postalCode: this.cryptoService.encryptString(body.postalCode,),} :
						{}),
				},
			},)
		} catch (error) {
			throw new InternalServerErrorException('Failed to update draft',)
		}
	}
}
