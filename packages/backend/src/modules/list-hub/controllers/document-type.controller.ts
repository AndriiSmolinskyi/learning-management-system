import {
	Body,
	Controller,
	Post,
	UseGuards,
	Get,
} from '@nestjs/common'
import {
	ApiBody,
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { DocumentTypeService, } from '../services/document-type.service'
import { DocumentTypeRoutes, } from '../list-hub.constants'
import { DocumentTypeApiBodyDescriptions, } from '../list-hub.constants'
import { RolesDecorator, } from '../../../shared/decorators'

import { Roles, type Message, } from '../../../shared/types'
import type {IListItemBody, } from '../list-hub.types'
import { ListItemCreateDto, } from '../dto/list-item-create.dto'

@Controller(DocumentTypeRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('DocumentTypes',)
export class DocumentTypeController {
	constructor(
		private readonly documentTypeService: DocumentTypeService,
	) { }

	/**
	 * 1.3/1.4
	 * Retrieves all document types from the database.
	 * @returns A promise that resolves to an array of document type objects.
	 * Each object contains the properties defined in the IDocumentTypeBody interface.
	 */
	@Get(DocumentTypeRoutes.GET_ALL_DOCUMENT_TYPES,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getAllDocumentTypes(): Promise<Array<IListItemBody>> {
		return this.documentTypeService.getAllDocumentTypes()
	}

	/**
	 * 1.3/1.4
	 * Creates a new document type in the database.
	 * @param body - The body of the request containing the details of the new document type.
	 * The body should be validated with the DocumentTypeCreateDto dto.
	 * @returns A promise that resolves to a Message object.
	 * The Message object contains a success message indicating that the document type was created.
	 * @throws Will throw an error if the document type creation fails.
	*/
	@Post(DocumentTypeRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: DocumentTypeApiBodyDescriptions.CREATE_DOCUMENT_TYPE,
		type:        ListItemCreateDto,
	},)
	public async createDocumentType(
		@Body() body: ListItemCreateDto,
	): Promise<Message> {
		return this.documentTypeService.createDocumentType(body,)
	}
}
