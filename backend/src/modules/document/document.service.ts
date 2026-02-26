/* eslint-disable no-await-in-loop */
/* eslint-disable max-depth */
import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { UploadService, } from '../upload/upload.service'
import { DocumentStatus, } from '@prisma/client'
import type { Document, Prisma, } from '@prisma/client'
import type { IDecryptedDocument, IUploadFileToAWS, } from '../upload/upload.types'
import { ERROR_MESSAGES, SUCCESS_MESSAGES, } from '../../shared/constants/messages.constants'
import type { Message, } from '../../shared/types'
import type { CreateDocumentDto, DeleteByIdsDto, DownloadDocumentDto, GetAllByClientDto, UpdateDocumentDto, } from './dto'
import type { IComplianceCheckResponse, IComplianceCheckTotalResponse,} from './document.types'
import { CryptoService, } from '../crypto/crypto.service'

@Injectable()
export class DocumentService {
	constructor(
		private readonly uploadService: UploadService,
		private readonly prismaService: PrismaService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
	 * 1.4/2.1.9
	 * Retrieves all documents associated with a specific client and documents of his inner entities.
	 * @param clientId - The unique identifier of the client.
	 * @param status - An optional parameter to filter documents by their status.
	 * @returns A Promise that resolves to an array of Document objects.
	 * @throws HttpException - If there is an error retrieving the documents.
	 */
	public async getDocumentsForComplianceCheck(clientId: string, query: GetAllByClientDto,): Promise<IComplianceCheckResponse> {
		const portfolios = await this.prismaService.portfolio.findMany({
			where: {
				clientId,
			},
			include: {
				documents: {
					where: {
						status: query.status,
					},
					orderBy: {
						updatedAt: 'desc',
					},
				},
				entities:  {
					include: {
						documents: {
							where: {
								status: query.status,
							},
							orderBy: {
								updatedAt: 'desc',
							},
						},
						assets:    {
							include: {
								documents: {
									where: {
										status: query.status,
									},
									orderBy: {
										updatedAt: 'desc',
									},
								},
							},
						},
					},
				},
			},
		},)
		const decryptedPortfolios = portfolios.map((portfolio,) => {
			const decryptedEntities = portfolio.entities.map((entity,) => {
				const decryptedAssets = entity.assets.map((asset,) => {
					const decryptedDocuments = asset.documents.map((document,) => {
						return {
							...document,
							name: this.cryptoService.decryptString(document.name,),
						}
					},)
					return {
						...asset,
						documents: decryptedDocuments,
					}
				},)
				const decryptedDocuments = entity.documents.map((document,) => {
					return {
						...document,
						name: this.cryptoService.decryptString(document.name,),
					}
				},)
				return {
					...entity,
					name:      this.cryptoService.decryptString(entity.name,),
					assets:    decryptedAssets,
					documents: decryptedDocuments,
				}
			},)
			const decryptedDocuments = portfolio.documents.map((document,) => {
				return {
					...document,
					name: this.cryptoService.decryptString(document.name,),
				}
			},)
			return {
				...portfolio,
				name:      this.cryptoService.decryptString(portfolio.name,),
				entities:  decryptedEntities,
				documents: decryptedDocuments,
			}
		},)
		const clientDocuments = await this.prismaService.document.findMany({
			where: {
				clientId,
				status: query.status,
			},
			orderBy: {
				updatedAt: 'desc',
			},
		},)
		const decryptedClientDocuments = clientDocuments.map((document,) => {
			return {
				...document,
				name: this.cryptoService.decryptString(document.name,),
			}
		},)
		return {
			clientDocuments: decryptedClientDocuments,
			portfolios:      decryptedPortfolios,
		}
	}

	/**
 * Calculates the total number of client-related documents grouped by compliance status.
 *
 * @param clientId - The unique identifier of the client whose documents are being analyzed.
 * @returns A promise that resolves to an object containing the count of documents in each compliance status:
 * `pending`, `approved`, and `declined`.
 *
 * @remarks
 * This method aggregates document counts from:
 * - The client level.
 * - Portfolios belonging to the client.
 * - Entities within those portfolios.
 * - Assets under the entities.
 *
 * It fetches counts for each of the three statuses: 'PENDING', 'APPROVED', and 'DECLINED'.
 */

	public async getTotalsForComplianceCheck(clientId: string,): Promise<IComplianceCheckTotalResponse> {
		const statuses = ['PENDING', 'APPROVED', 'DECLINED',] as const

		const totals = {
			pending:  0,
			approved: 0,
			declined: 0,
		}
		for (const status of statuses) {
			const clientDocsCount = await this.prismaService.document.count({
				where: { clientId, status, },
			},)

			const portfolioDocs = await this.prismaService.portfolio.findMany({
				where:   { clientId, },
				include: {
					documents: { where: { status, }, },
					entities:  {
						include: {
							documents: { where: { status, }, },
							assets:    {
								include: {
									documents: { where: { status, }, },
								},
							},
						},
					},
				},
			},)

			let portfolioDocsCount = 0

			for (const portfolio of portfolioDocs) {
				portfolioDocsCount = portfolioDocsCount + portfolio.documents.length
				for (const entity of portfolio.entities) {
					portfolioDocsCount = portfolioDocsCount + entity.documents.length
					for (const asset of entity.assets) {
						portfolioDocsCount = portfolioDocsCount + asset.documents.length
					}
				}
			}

			if (status === 'PENDING') {
				totals.pending = clientDocsCount + portfolioDocsCount
			}
			if (status === 'APPROVED') {
				totals.approved = clientDocsCount + portfolioDocsCount
			}
			if (status === 'DECLINED') {
				totals.declined = clientDocsCount + portfolioDocsCount
			}
		}

		return totals
	}

	/**
	 * 2.3
 * Retrieves documents associated with a specific portfolio and includes additional asset and entity information.
 * @remarks
 * This function fetches all documents linked to a given portfolio, either directly or through related assets and entities.
 * It returns the documents along with their associated asset and entity names if available.
 * The result is sorted by the creation date in descending order.
 *
 * @param id - The unique identifier of the portfolio for which documents are to be retrieved.
 * @returns A `Promise` that resolves to an array of `Document` objects, which includes additional properties `assetName` and `entityName` if available.
 * @throws Will throw an error if there is a problem with retrieving the data from the database.
 */
	public async getDocumentsForPortfolioDetails(id: string,): Promise<Array<Document & { assetName?: string; entityName?: string }>> {
		const allDocuments = await this.prismaService.document.findMany({
			where: {
				OR: [
					{ portfolioId: id, },
					{ entity: { portfolioId: id, }, },
					{ asset: { portfolioId: id, }, },
				],
			},
			include: {
				entity: true,
				asset:  true,
			},
		},)
		return allDocuments
			.map((doc,) => {
				return {
					...doc,
					name:       this.cryptoService.decryptString(doc.name,),
					entityName: doc.entity?.name ?? '',
					assetName:  doc.asset?.assetName ?? '',
				}
			},)
			.sort((a, b,) => {
				return new Date(b.createdAt,).getTime() - new Date(a.createdAt,).getTime()
			},)
	}

	/**
	 * 1.4/2.1.9
	 * Retrieves all documents associated with a specific client.
	 * @param clientId - The unique identifier of the client.
	 * @param status - An optional parameter to filter documents by their status.
	 * @returns A Promise that resolves to an array of Document objects.
	 * @throws HttpException - If there is an error retrieving the documents.
	 */
	public async getAllClientDocuments(clientId: string, query: GetAllByClientDto,): Promise<Array<Document>> {
		const documents = await this.prismaService.document.findMany({
			where: {
				clientId,
				status: query.status,
			},
			orderBy: {
				updatedAt: 'desc',
			},
		},)
		return documents.map((document,) => {
			return {
				...document,
				name:       this.cryptoService.decryptString(document.name,),
			}
		},)
	}

	/**
	* 1.4/2.1.9
 * Retrieves documents based on a specific source ID.
 * @remarks
 * This function fetches documents that match the criteria provided in the `query` parameter.
 * It uses the Prisma client to query the database and retrieve the documents that meet the conditions defined in the input.
 *
 * @param query - The filter criteria, represented by a `Prisma.DocumentWhereInput` object, used to retrieve documents based on source ID or other attributes.
 * @returns A `Promise` that resolves to an array of `Document` objects that match the specified criteria.
 * @throws Will throw an error if there is a problem with querying the database.
 */
	public async getDocumentsBySourceId(query: Prisma.DocumentWhereInput,): Promise<Array<Document>> {
		const documents = await this.prismaService.document.findMany({
			where: query,
		},)
		return documents.map((document,) => {
			return {
				...document,
				name:       this.cryptoService.decryptString(document.name,),
			}
		},)
	}

	/**
	* 1.4/2.1.9
 * Creates a new document in the system and uploads the associated file to AWS.
 * @remarks
 * This function handles the creation of a new document by first uploading the provided file to AWS.
 * Once the file is successfully uploaded, it creates a new document entry in the database with the provided details and the uploaded file's metadata.
 * The document is initially marked with a `PENDING` status.
 *
 * @param body - The details of the document to be created, including metadata such as title, description, etc., represented by a `CreateDocumentDto`.
 * @param file - The file to be uploaded, represented by an `IUploadFileToAWS` object, which contains information about the file to be stored.
 * @returns A `Promise` that resolves once the document has been successfully created.
 * @throws Will throw an error if there is an issue with the file upload process or document creation, with a predefined error message (`ERROR_MESSAGES.CREATE_DOCUMENT_ERROR`).
 */
	public async createDocument(body: CreateDocumentDto, file: IUploadFileToAWS,): Promise<Document> {
		try {
			const isNotToBeEncypted = body.reportId ?? body.reportDraftId
			const uploadedFile = await this.uploadService.uploadDocument(file, Boolean(isNotToBeEncypted,),)
			return this.prismaService.document.create({
				data: {
					...body,
					name:        this.cryptoService.encryptString(uploadedFile.storageName,),
					size:        uploadedFile.size,
					format:      uploadedFile.format,
					storageName: uploadedFile.storageName,
					status:      DocumentStatus.PENDING,
					preview:     uploadedFile.url,
				},
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CREATE_DOCUMENT_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,)
		}
	}

	/**
	 * 1.4/2.1.9
	 * Updates the status of multiple documents in the database.
	 * @param body - An object containing the IDs of the documents to update and the new status.
	 * @param body.documentsIds - An array of strings representing the unique IDs of the documents to update.
	 * @param body.status - The new status to set for the documents.
	 * @returns A Promise that resolves to a `Message` object indicating the success of the update operation.
	 * @throws HttpException - If there is an error updating the documents.
	 * @remarks
	 * This function takes an array of document IDs and a new status as input.
	 * It updates the status of all documents with the given IDs in the database to the new status.
	 * If any error occurs during the update operation, an `HttpException` is thrown with an appropriate error message.
	 */
	public async updateDocumentStatus(body: UpdateDocumentDto,): Promise<Message> {
		const {documentsIds, ...data} = body
		try {
			await this.prismaService.document.updateMany({
				where: {
					id: {
						in: documentsIds,
					},
				},
				data,
			},)
			return {
				message: SUCCESS_MESSAGES.DOCUMENT_UPDATED,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.UPDATE_DOCUMENT_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 1.4/2.1.9
	 * Downloads a document from the storage service.
	 * @param storageName - The unique identifier of the document's storage file.
	 * @returns A Promise that resolves to an object containing the presigned URL for the document.
	 * @throws HttpException - If there is an error retrieving the presigned URL or the document does not exist.
	 */
	public downloadDocument = async(body: DownloadDocumentDto,): Promise<{url: string}> => {
		try {
			const file = await this.prismaService.document.findFirst({
				where: {
					storageName: body.storageName,
				},
			},)
			if (!file) {
				throw new HttpException(ERROR_MESSAGES.DOCUMENT_NOT_FOUND, HttpStatus.BAD_REQUEST,)
			}
			const {url,} = await this.uploadService.getPresignedUrl(file.storageName,)
			return {url,}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DOCUMENT_NOT_FOUND, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	   *
 		* Downloads and decrypts a document from storage by its storage name.
 		* @param body - DTO containing the storageName of the document to download.
 		* @returns A Promise resolving to an object with:
 		*   - buffer: The decrypted file data as a Buffer.
 		*   - filename: The original filename.
 		*   - contentType: The MIME type of the file.
 		* @throws HttpException - Throws BAD_REQUEST if the document is not found or any other error occurs.
 		* @remarks
 		*  - First, the document is fetched from the database by its storageName.
 		*  - Then, the file data is retrieved and decrypted via the uploadService.
 		*  - Errors are caught and rethrown as HttpException for consistent API error handling.
 	*/
	public downloadDocumentWithDecryption = async(body: DownloadDocumentDto,): Promise<IDecryptedDocument> => {
		try {
			const file = await this.prismaService.document.findFirst({
				where: {
					storageName: body.storageName,
				},
			},)
			if (!file) {
				throw new HttpException(ERROR_MESSAGES.DOCUMENT_NOT_FOUND, HttpStatus.BAD_REQUEST,)
			}
			return this.uploadService.downloadDocumentWithDecryption(file.storageName,)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DOCUMENT_NOT_FOUND, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	* 1.4/2.1.9
 * Deletes a document from the system and removes the associated file from AWS.
 * @remarks
 * This function handles the deletion of a document from the system. It first removes the file from AWS using the file's identifier.
 * After successfully deleting the file, the function proceeds to delete the document entry from the database.
 * If any step of the process fails, it throws an error with a predefined message (`ERROR_MESSAGES.DOCUMENT_NOT_FOUND`).
 *
 * @param id - The unique identifier of the document to be deleted.
 * @returns A `Promise` that resolves once the document and the associated file have been successfully deleted.
 * @throws Will throw an error if the document or file cannot be found or if there is a problem during the deletion process.
 */
	public async deleteDocument(id: string,): Promise<void> {
		try {
			await this.uploadService.deleteFileFromAWS(id,)
			await this.prismaService.document.delete({
				where: { id, },
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DOCUMENT_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR,)
		}
	}

	/**
	* 1.4/2.1.9
 * Deletes multiple documents from the system and removes the associated files from AWS.
 * @remarks
 * This function handles the deletion of multiple documents. It first removes each file associated with the documents from AWS using their identifiers.
 * Once all files are successfully deleted, it proceeds to delete the documents from the database.
 * If any error occurs during the deletion process, an exception with the message (`ERROR_MESSAGES.DOCUMENT_NOT_FOUND`) is thrown.
 *
 * @param id - An array of document IDs to be deleted.
 * @returns A `Promise` that resolves once all specified documents and their associated files have been successfully deleted.
 * @throws Will throw an error if any document or file cannot be found or if there is an issue during the deletion process.
 */
	public async deleteDocumentsByIds({id,}: DeleteByIdsDto,): Promise<void> {
		try {
			const documents = await this.prismaService.document.findMany({
				where: {
					id: {in: id,},
				},
				select: {
					storageName: true,
				},
			},)
			await Promise.all(
				documents.map(async(document,) => {
					await this.uploadService.deleteFileFromAWS(document.storageName,)
				},),
			)
			await this.prismaService.document.deleteMany({
				where: {
					id: {
						in: id,
					},
				},
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DOCUMENT_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR,)
		}
	}
}