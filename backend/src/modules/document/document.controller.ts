import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Get,
	Param,
	Query,
	Patch,
	Delete,
	HttpCode,
	HttpStatus,
	Res,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor, } from '@nestjs/platform-express'
import type { Document, } from '@prisma/client'
import { Express, Response,} from 'express'

import { JWTAuthGuard, RolesGuard,} from '../../shared/guards'
import { DocumentService, } from './document.service'
import { RolesDecorator, } from '../../shared/decorators'
import { DocumentsRoutes, SwaggerDescriptions, } from './document.constants'

import { Roles, type Message, } from '../../shared/types'
import { CreateDocumentDto, DeleteByIdsDto, IdDto, SourceIdDto, UpdateDocumentDto, DownloadDocumentDto, GetAllByClientDto,} from './dto'
import type { IComplianceCheckResponse, IComplianceCheckTotalResponse, } from './document.types'

@Controller(DocumentsRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('Documents',)
export class DocumentController {
	constructor(
		private readonly documentService: DocumentService,
	) { }

	/**
		* 1.4/2.1.9
		* Retrieves all documents associated with a specific client and documents of his inner entities.
		* @param id - The unique identifier of the client.
		* @param status - An optional parameter to filter documents by their status.
		* @returns A Promise that resolves to an array of Document objects.
		* @throws Will throw an error if the client does not exist or if there is a problem with the database connection.
	*/
	@Get(`${DocumentsRoutes.GET_DOCUMENTS_FOR_COMPLIANCE_CHECK}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.GET_ALL_CLIENT_DOCUMENTS,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.GET_ALL_CLIENT_DOCUMENTS,
		type:        GetAllByClientDto,
	},)
	public async getDocumentsForComplianceCheck(
			@Param() params: IdDto,
			@Query() query: GetAllByClientDto,
	): Promise<IComplianceCheckResponse> {
		return this.documentService.getDocumentsForComplianceCheck(params.id, query,)
	}

	/**
		* 1.4/2.1.9
		* Retrieves all documents associated with a specific client and documents of his inner entities.
		* @param id - The unique identifier of the client.
		* @param status - An optional parameter to filter documents by their status.
		* @returns A Promise that resolves to an array of Document objects.
		* @throws Will throw an error if the client does not exist or if there is a problem with the database connection.
	*/
	@Get(`${DocumentsRoutes.GET_TOTALS_FOR_COMPLIANCE_CHECK}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.GET_ALL_CLIENT_DOCUMENTS,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.GET_ALL_CLIENT_DOCUMENTS,
		type:        GetAllByClientDto,
	},)
	public async getTotalsForComplianceCheck(
			@Param() params: IdDto,
	): Promise<IComplianceCheckTotalResponse> {
		return this.documentService.getTotalsForComplianceCheck(params.id,)
	}

	/**
		* 2.3
		* Retrieves a list of documents associated with portfolio details based on the portfolio ID.
		* @param params - The `IdDto` object containing the portfolio ID (`id`) to fetch associated documents.
		* @returns A promise that resolves to an array of `Document` objects associated with the specified portfolio.
		*
		* This method is exposed via a GET request to the `DocumentsRoutes.GET_DOCUMENTS_FOR_PORTFOLIO_DETAILS` endpoint.
		* It retrieves a list of documents associated with the portfolio using the provided `id`, by calling the `getDocumentsForPortfolioDetails` method of the `documentService`.
		* Access to this endpoint is restricted to users with the roles `BACK_OFFICE_MANAGER` and `FAMILY_OFFICE_MANAGER`.
		*
		* Swagger Documentation:
		* - The `id` parameter is required and represents the portfolio ID for which the documents will be fetched.
		*
		* Error Handling:
		* - If an error occurs during the data retrieval, it will be handled by the `documentService` or the controller.
	*/
	@Get(`${DocumentsRoutes.GET_DOCUMENTS_FOR_PORTFOLIO_DETAILS}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.GET_DOCUMENTS_FOR_PORTFOLIO_DETAILS,
	},)
	public async getDocumentsForPortfolioDetails(
			@Param() params: IdDto,
	): Promise<Array<Document>> {
		return this.documentService.getDocumentsForPortfolioDetails(params.id,)
	}

	/**
		* 1.4/2.1.9
		* Retrieves all documents associated with a specific client.
		* @param id - The unique identifier of the client.
		* @param status - An optional parameter to filter documents by their status.
		* @returns A Promise that resolves to an array of Document objects.
		* @throws Will throw an error if the client does not exist or if there is a problem with the database connection.
	*/
	@Get(`${DocumentsRoutes.GET_ALL_CLIENT_DOCUMENTS}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.GET_ALL_CLIENT_DOCUMENTS,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.GET_ALL_CLIENT_DOCUMENTS,
		type:        GetAllByClientDto,
	},)
	public async getAllClientDocuments(
		@Param() params: IdDto,
		@Query() query: GetAllByClientDto,
	): Promise<Array<Document>> {
		return this.documentService.getAllClientDocuments(params.id, query,)
	}

	/**
	* 1.4/2.1.9
		* Retrieves a list of documents associated with a specific source ID.
		* @param query - The `SourceIdDto` object containing the `sourceId` to fetch associated documents.
		* @returns A promise that resolves to an array of `Document` objects associated with the specified source ID.
		*
		* This method is exposed via a GET request to the `DocumentsRoutes.SOURCE` endpoint.
		* It retrieves a list of documents associated with the provided `sourceId` by calling the `getDocumentsBySourceId` method of the `documentService`.
		* Access to this endpoint is restricted to users with the roles `BACK_OFFICE_MANAGER`, `FAMILY_OFFICE_MANAGER`, and `INVESTMEN_ANALYST`.
		*
		* Swagger Documentation:
		* - The `sourceId` query parameter is required and represents the ID of the source for which the documents will be fetched.
		*
		* Error Handling:
		* - If an error occurs during the data retrieval, it will be handled by the `documentService` or the controller.
	*/
	@Get(DocumentsRoutes.SOURCE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.SOURCE_ID,
		type:        SourceIdDto,
	},)
	public async getDocumentsBySourceId(
		@Query() query: SourceIdDto,
	): Promise<Array<Document>> {
		return this.documentService.getDocumentsBySourceId(query,)
	}

	/**
		* 1.4/2.1.9
		* Handles the creation of new documents.
		* @param body - The request body containing the document data.
		* @param file - The uploaded file associated with the document.
		* @throws Will throw an error if there is a problem with the database connection or if the file upload fails.
		* @returns A Promise that resolves to void when the document is successfully created.
	*/
	@Post(DocumentsRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_DOCUMENT,
		type:        CreateDocumentDto,
	},)
	@UseInterceptors(FileInterceptor('file',),)
	public async createDocument(
		@Body() body: CreateDocumentDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Document> {
		return this.documentService.createDocument(body, file,)
	}

	/**
		* 1.4/2.1.9
		* Updates the status of a document.
		* @remarks
		* This function is used to change the status of a document in the system.
		* It requires a valid JWT token for authentication and authorization.
		* @param body - The request body containing the updated document status.
		* @returns A Promise that resolves to a Message object indicating the success of the operation.
		* @throws Will throw an error if there is a problem with the database connection or if the JWT token is invalid.
	*/
	@Patch(DocumentsRoutes.UPDATE_STATUS,)
	@RolesDecorator({
		roles:        [Roles.FAMILY_OFFICE_MANAGER, Roles.BACK_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_DOCUMENT_STATUS,
		type:        UpdateDocumentDto,
	},)
	public async updateDocumentStatus(
		@Body() body: UpdateDocumentDto,
	): Promise<Message> {
		return this.documentService.updateDocumentStatus(body,)
	}

	/**
		* 1.4/2.1.9
		* Handles the download of a document by generating a temporary URL for the file stored in the cloud storage.
		* @remarks
		* This function is used to provide a temporary URL for downloading a document from the cloud storage.
		* It requires a valid JWT token for authentication and authorization.
		* @param body - The request body containing the storage name of the document.
		* @param body.storageName - The unique identifier of the document in the cloud storage.
		* @returns A Promise that resolves to an object containing the temporary download URL.
		* @returns.url - The temporary URL for downloading the document.
		* @throws Will throw an error if there is a problem with the database connection or if the JWT token is invalid.
	*/
	// todo: Remove after is no need confiramtion, service for not encrypted document upload
	// @Post(DocumentsRoutes.DOWNLOAD_DOCUMENT,)
	// @RolesDecorator({
	// 	roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	// },)
	// @ApiBody({
	// 	description: SwaggerDescriptions.DOWNLOAD_DOCUMENT,
	// 	type:        DownloadDocumentDto,
	// },)
	// public async downloadDocument(
	// 	@Body()  body: DownloadDocumentDto,
	// ): Promise<{url: string}> {
	// 	return this.documentService.downloadDocument(body,)
	// }
	@Post(DocumentsRoutes.DOWNLOAD_DOCUMENT,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.DOWNLOAD_DOCUMENT,
		type:        DownloadDocumentDto,
	},)
	public async downloadDocument(
		@Res() res: Response,
		@Body()  body: DownloadDocumentDto,
	): Promise<void> {
		const { buffer, filename, contentType, } = await this.documentService.downloadDocumentWithDecryption(body,)
		res.set({
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Type':        contentType,
		},)
		res.send(buffer,)
	}

	/**
 		* 1.4/2.1.9
 		* Deletes documents by their IDs.
 		* @remarks
 		* This function is used to delete one or more documents from the system based on their IDs.
 		* It requires a valid JWT token for authentication and authorization.
 		* The function is guarded by the `JWTAuthGuard` and `RolesGuard` to ensure that only users with appropriate roles (`BACK_OFFICE_MANAGER`, `FAMILY_OFFICE_MANAGER`) can access it.
 		* @param args - The `DeleteByIdsDto` object containing the `ids` of the documents to be deleted.
 		* @returns A `Promise` that resolves when the documents are successfully deleted, with no content returned.
 		* @throws Will throw an error if there is a problem with the database connection or if the user does not have the necessary roles to delete the documents.
 	*/
	@Delete(DocumentsRoutes.DELETE_DOCUMENTS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiQuery({
		name:        'id',
		type:        DeleteByIdsDto,
		description: SwaggerDescriptions.DELETE_DOCUMENT,
	},)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async deleteDocumentsByIds(
		@Query() args: DeleteByIdsDto,
	): Promise<void> {
		await this.documentService.deleteDocumentsByIds(args,)
	}

	/**
		* 1.4/2.1.9
		* Deletes a document from the system.
		* @remarks
		* This function is used to remove a document from the system.
		* It requires a valid JWT token for authentication and authorization.
		* The function is guarded by the `JWTAuthGuard` and `RolesGuard` to ensure that only authorized users can access it.
		* @param id - The unique identifier of the document to be deleted.
		* @returns A Promise that resolves to a `Message` object indicating the success of the operation.
		* @throws Will throw an error if there is a problem with the database connection or if the JWT token is invalid.
	*/
	@Delete(DocumentsRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DOCUMENT_ID,
	},)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async deleteDocument(
		@Param() params: IdDto,
	): Promise<void> {
		await this.documentService.deleteDocument(params.id,)
	}
}
