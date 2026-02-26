import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	UseGuards,
	Delete,
	Put,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import type { ClientDraft, } from '@prisma/client'

import { RolesGuard, JWTAuthGuard, } from '../../../shared/guards'
import { DraftService, } from '../services/draft.service'
import { RolesDecorator, } from '../../../shared/decorators'
import { ClientDraftRoutes, SwaggerDescriptions, } from '../client.constants'
import { UpdateDraftDto, } from '../dto/update-draft.dto'

import {
	AddDraftDto,
	GetByIdDto,
} from '../dto'
import type {
	TDraftsListRes,
} from '../client.types'
import { Roles, } from '../../../shared/types'

@Controller(ClientDraftRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.DRAFT_TAG,)
export class DraftController {
	constructor(private readonly draftService: DraftService,) { }

	/**
	 * @param query - An object containing the pagination parameters (skip, take).
	 * @returns A Promise that resolves to an object containing the list of drafts and pagination metadata.
	 * @remarks
	 * This function is guarded by the JWTAuthGuard to ensure that only authenticated users can access it.
	 * It uses the `@Get` decorator to specify the endpoint for retrieving drafts, and the `@ApiQuery` decorators
	 * to document the pagination parameters.
	 */
	@Get(ClientDraftRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async getDrafts(): Promise<TDraftsListRes> {
		return this.draftService.getDrafts()
	}

	/**
	 * Creates a new draft.
	 * @param body - The data for creating a new draft.
	 * @returns A Promise that resolves to the newly created draft.
	 * @remarks
	 * This function is guarded by the JWTAuthGuard to ensure that only authenticated users can access it.
	 * It uses the `@Post` decorator to specify the endpoint for creating drafts, and the `@ApiBody` decorator
	 * to document the request body.
	*/
	@Post(ClientDraftRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: 'Create Draft',
		type:        AddDraftDto,
	},)
	public async createDraft(
		@Body() body: AddDraftDto,
	): Promise<ClientDraft> {
		return this.draftService.createDraft(body,)
	}

	/**
	 * Retrieves a draft by its ID.
	 * @param params - An object containing the draft ID.
	 * @returns A Promise that resolves to the requested draft.
	 * @remarks
	 * This function is guarded by the JWTAuthGuard to ensure that only authenticated users can access it.
	 * It uses the `@Get` decorator to specify the endpoint for retrieving a draft by its ID, and the `@ApiParam` decorator
	 * to document the draft ID parameter.
				*/
	@Get(ClientDraftRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Draft ID',
	},)
	public async getDraftById(
		@Param() params: GetByIdDto,
	): Promise<ClientDraft> {
		return this.draftService.getDraftById(params.id,)
	}

	@Delete(`${ClientDraftRoutes.DELETE}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async deleteDraft(
		@Param('id',) id: string,
	): Promise<void> {
		return this.draftService.deleteClientDraft(id,)
	}

	/**
 * Updates an existing draft.
 * @param id - The unique identifier of the draft to update.
 * @param body - The updated draft data.
 * @returns A Promise that resolves to the updated draft entity.
 * @remarks
 * This endpoint allows authorized users to modify an existing draft by its ID.
 * The user must have one of the roles: BACK_OFFICE_MANAGER or FAMILY_OFFICE_MANAGER.
 * The updated values should be provided in the request body using the UpdateDraftDto structure.
 */
	@Put(`${ClientDraftRoutes.UPDATE}/:id`,)
	@RolesDecorator({
		roles: [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Draft ID',
	},)
	@ApiBody({
		description: 'Update Draft',
	},)
	public async updateDraft(
    @Param('id',) id: string,
    @Body() body: UpdateDraftDto,
	): Promise<ClientDraft> {
		return this.draftService.updateDraft(id, body,)
	}
}
