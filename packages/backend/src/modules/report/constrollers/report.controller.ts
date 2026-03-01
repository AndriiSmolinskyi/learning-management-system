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
	Query,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { Report, } from '@prisma/client'
import { CacheTTL, } from '@nestjs/cache-manager'

import { ReportService, } from '../services/report.service'
import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { ReportRoutes, SwaggerDescriptions, } from '../report.constants'
import { HOUR_CACHE_TIME, RedisCacheInterceptor, } from '../../redis-cache'

import { CreateReportDto, ReportFilterDto, } from '../dto'
import { Roles, } from '../../../shared/types'
import type { TReportExtended, TReportListRes, } from '../report.types'

@Controller(ReportRoutes.REPORT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.REPORT_TAG,)
export class ReportController {
	constructor(
		private readonly reportService: ReportService,
	) {}

	/**
	* 4.1
		 * Creates a new report.
	 *
	 * @param body - The data required to create a report.
	 * @returns A promise that resolves to the created Report object.
	 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
	 */
	@Post(ReportRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_REPORT,
		type:        CreateReportDto,
	},)
	public async createReport(
		@Body() body: CreateReportDto,
	): Promise<Report> {
		return this.reportService.createReport(body,)
	}

	/**
	 * 4.1
	 	 * Retrieves a list of reports filtered by specific criteria.
	 *
	 * @param filter - Filter options such as date range, client, etc.
	 * @returns A promise that resolves to a filtered list of reports with pagination.
	 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
	 */
	@Get(ReportRoutes.FILTER,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@CacheTTL(HOUR_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.FILTER,
		type:        ReportFilterDto,
	},)
	public async getReportsFiltered(
		@Query() filter: ReportFilterDto,
	): Promise<TReportListRes> {
		return this.reportService.getReportsFiltered(filter,)
	}

	/**
	* 4.1
		 * Updates an existing report by its ID.
	 *
	 * @param id - The ID of the report to update.
	 * @param body - The new data for the report.
	 * @returns A promise that resolves to the updated Report object.
	 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
	 */
	@Patch(ReportRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_REPORT,
		type:        CreateReportDto,
	},)
	public async updateReport(
		@Param('id', ParseIntPipe,) id: number,
		@Body() body: CreateReportDto,
	): Promise<Report> {
		return this.reportService.updateReport(id, body,)
	}

	/**
	 * 4.1
		 * Retrieves a single report by its ID.
	 *
	 * @param id - The ID of the report.
	 * @returns A promise that resolves to the extended report object with related data.
	 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
	 */
	@Get(ReportRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@CacheTTL(HOUR_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	public async getReportById(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<TReportExtended> {
		return this.reportService.getReportExtendedById(id,)
	}

	/**
	 * 4.1
		 * Deletes a report by its ID.
	 *
	 * @param id - The ID of the report to delete.
	 * @returns A promise that resolves when the report is successfully deleted.
	 * @access Roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST, BOOKKEEPER
	 */
	@Delete(ReportRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST, Roles.BOOKKEEPER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async deleteReport(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<void> {
		await this.reportService.deleteReport(id,)
	}
}
