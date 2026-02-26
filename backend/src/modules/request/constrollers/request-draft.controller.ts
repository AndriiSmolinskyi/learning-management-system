import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import type { RequestDraft, } from '@prisma/client'

import { RequestDraftService, } from '../services/request-draft.service'
import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { RequestRoutes, SwaggerDescriptions, } from '../request.constants'

import { CreateRequestDraftDto,} from '../dto'
import { Roles, } from '../../../shared/types'
import type { TRequestDraftExtended, } from '../request.types'

@Controller(RequestRoutes.DRAFT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.DRAFT_TAG,)
export class RequestDraftController {
	constructor(
		private readonly requestDraftService: RequestDraftService,
	) { }

	/**
	 * 3.1.1
	 * Creates a new request draft.
 *
 * @remarks
 * - This method handles the creation of a request draft, allowing the user to provide necessary data in the form of `CreateRequestDraftDto`.
 *
 * @param body - The data required to create a new request draft.
 * @returns A promise that resolves to the newly created request draft object.
 */
	@Post(RequestRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_DRAFT,
		type:        CreateRequestDraftDto,
	},)
	public async createRequestDraft(
		@Body() body: CreateRequestDraftDto,
	): Promise<RequestDraft> {
		return this.requestDraftService.createRequestDraft(body,)
	}

	/**
	 * 3.1.2
	 * Retrieves a list of all request drafts.
 *
 * @remarks
 * - This method returns all request drafts from the database.
 *
 * @returns A promise that resolves to an array of all request draft objects.
 */
	@Get(RequestRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getRequestDrafts(): Promise<Array<RequestDraft>> {
		return this.requestDraftService.getRequestDrafts()
	}

	/**
	 * 3.1.2
	  * Updates the details of an existing request draft identified by its ID.
 *
 * @remarks
 * - This method allows updating the fields of a request draft based on the provided `id` and `CreateRequestDraftDto`.
 *
 * @param params - The ID of the request draft to update.
 * @param body - The updated data for the request draft.
 * @returns A promise that resolves to the updated request draft object.
 */
	@Patch(RequestRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_DRAFT,
		type:        CreateRequestDraftDto,
	},)
	public async updateRequestDraft(
		@Param('id', ParseIntPipe,) id: number,
		@Body() body: CreateRequestDraftDto,
	): Promise<RequestDraft> {
		return this.requestDraftService.updateRequestDraft(id, body,)
	}

	/**
	 * 3.1.2
	 * Retrieves the extended details of a specific request draft identified by its ID.
 *
 * @remarks
 * - This method returns a full set of related entities for the request draft.
 * - If the request draft with the provided ID does not exist, an error is thrown.
 *
 * @param params - The ID of the request draft to retrieve.
 * @returns A promise that resolves to the extended details of the request draft.
 * @throws HttpException if the request draft does not exist.
 */
	@Get(RequestRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	public async getRequestDraftById(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<TRequestDraftExtended> {
		return this.requestDraftService.getRequestDraftExtendedById(id,)
	}

	/**
	 * 3.1.2
	 * Deletes an existing request draft identified by its ID.
 *
 * @remarks
 * - This method removes the request draft from the database.
 *
 * @param params - The ID of the request draft to delete.
 * @returns A promise that resolves when the request draft has been successfully deleted.
 */
	@Delete(RequestRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async deleteRequestDraft(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<void> {
		await this.requestDraftService.deleteRequestDraft(id,)
	}
}
