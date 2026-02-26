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
import type { ReportDraft, } from '@prisma/client'

import { ReportDraftService, } from '../services/report-draft.service'
import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { ReportRoutes, SwaggerDescriptions, } from '../report.constants'

import { CreateReportDraftDto, } from '../dto'
import { Roles, } from '../../../shared/types'
import type { TReportDraftExtended, } from '../report.types'

@Controller(ReportRoutes.DRAFT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.DRAFT_TAG,)
export class ReportDraftController {
	constructor(
		private readonly reportDraftService: ReportDraftService,
	) {}

	/**
	* 4.1
	 * Creates a new report draft.
 *
 * @param body - The data required to create a report draft.
 * @returns A promise that resolves to the created ReportDraft object.
 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
 */
	@Post(ReportRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_DRAFT,
		type:        CreateReportDraftDto,
	},)
	public async createReportDraft(
		@Body() body: CreateReportDraftDto,
	): Promise<ReportDraft> {
		return this.reportDraftService.createReportDraft(body,)
	}

	/**
	* 4.1
	 * Retrieves a list of all report drafts.
 *
 * @returns A promise that resolves to an array of ReportDraft objects.
 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
 */
	@Get(ReportRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	public async getReportDrafts(): Promise<Array<ReportDraft>> {
		return this.reportDraftService.getReportDrafts()
	}

	/**
	* 4.1
	 * Updates an existing report draft by its ID.
 *
 * @param id - The ID of the report draft to update.
 * @param body - The new data for the report draft.
 * @returns A promise that resolves to the updated ReportDraft object.
 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
 */
	@Patch(ReportRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_DRAFT,
		type:        CreateReportDraftDto,
	},)
	public async updateReportDraft(
		@Param('id', ParseIntPipe,) id: number,
		@Body() body: CreateReportDraftDto,
	): Promise<ReportDraft> {
		return this.reportDraftService.updateReportDraft(id, body,)
	}

	/**
	 * 4.1
	 * Retrieves a report draft by its ID.
 *
 * @param id - The ID of the report draft.
 * @returns A promise that resolves to the extended report draft object.
 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
 */
	@Get(ReportRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	public async getReportDraftById(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<TReportDraftExtended> {
		return this.reportDraftService.getReportDraftById(id,)
	}

	/**
	 * 4.1
	 * Deletes a report draft by its ID.
 *
 * @param id - The ID of the report draft to delete.
 * @returns A promise that resolves when the draft is deleted.
 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
 */
	@Delete(ReportRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async deleteReportDraft(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<void> {
		await this.reportDraftService.deleteReportDraft(id,)
	}
}
