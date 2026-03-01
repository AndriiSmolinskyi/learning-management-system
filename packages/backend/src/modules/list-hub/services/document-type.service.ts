import {  PrismaService, } from 'nestjs-prisma'

import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'

import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from '../../../shared/constants'

import type { Message, } from '../../../shared/types'
import type { IListItemBody,} from '../list-hub.types'

@Injectable()
export class DocumentTypeService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * 1.3/1.4
	 * Retrieves all document types from the database.
	 * @returns A promise that resolves to an array of {@link IDocumentTypeBody} objects.
	 * Each object represents a document type with its `value` and `label`.
	 * @throws {HttpException} If there is an error retrieving the document types.
	 * The error message and HTTP status code are provided in the exception.
	 */
	public async getAllDocumentTypes(): Promise<Array<IListItemBody>> {
		try {
			const documentTypes = await this.prismaService.documentType.findMany({
				select: {
					name: true,
				},
			},)
			return documentTypes
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.RETRIEVE_DOCUMENTS_TYPES_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 1.3/1.4
	 * Creates a new document type in the database.
	 * @param body - The body of the request containing the `value` and `label` of the new document type.
	 * @returns A promise that resolves to a {@link Message} object indicating the success of the operation.
	 * @throws {HttpException} If there is an error creating the document type.
	 * The error message and HTTP status code are provided in the exception.
	 */
	public async createDocumentType(data: IListItemBody,): Promise<Message> {
		try {
			await this.prismaService.documentType.create({
				data,
			},)
			return {
				message: SUCCESS_MESSAGES.DOCUMENT_TYPE_ADDED,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DOCUMENT_TYPE_ADD_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}
}