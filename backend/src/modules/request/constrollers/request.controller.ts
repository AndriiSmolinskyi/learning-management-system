import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { Request, } from '@prisma/client'

import { RequestService, } from '../services/request.service'
import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { RequestRoutes, SwaggerDescriptions, } from '../request.constants'

import { CreateRequestDto, RequestFilterDto, SourceIdDto, UpdateRequestDto, } from '../dto'
import { Roles, } from '../../../shared/types'
import type { TRequestExtended, TRequestListRes, } from '../request.types'

@Controller(RequestRoutes.REQUEST,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.REQUEST_TAG,)
export class RequestController {
	constructor(
		private readonly requestService: RequestService,
	) {}

	/**
	 * 3.1.1
	  * Creates a new request.
 *
 * @remarks
 * - The request is created based on the provided data in the body.
 * - This route is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
 *
 * @param body - The data required to create a new request.
 * @returns A promise that resolves to the created request object.
 */
	@Post(RequestRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_REQUEST,
		type:        CreateRequestDto,
	},)
	public async createRequest(
		@Body() body: CreateRequestDto,
	): Promise<Request> {
		return this.requestService.createRequest(body,)
	}

	/**
	 * 3.1.2, 3.1.6, 3.1.7
	 * Retrieves a list of all requests.
 *
 * @remarks
 * - This route retrieves all requests.
 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
 *
 * @returns A promise that resolves to an array of all request objects.
 */
	@Get(RequestRoutes.LIST,)
	// @CacheTTL(HOUR_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getRequests(): Promise<Array<Request>> {
		return this.requestService.getRequests()
	}

	/**
	 * 3.1.9
	 * Retrieves a list of requests filtered by the provided source ID.
 *
 * @remarks
 * - This route is used to get requests related to a specific source ID.
 * - The `SourceIdDto` query parameter is used to filter the requests.
 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
 *
 * @param query - The source ID to filter the requests.
 * @returns A promise that resolves to an array of requests filtered by the source ID.
 */
	@Get(RequestRoutes.SOURCE,)
	// @CacheTTL(HOUR_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.SOURCE_ID,
		type:        SourceIdDto,
	},)
	public async getRequestsBySourceId(
		@Query() query: SourceIdDto,
	): Promise<Array<Request>> {
		return this.requestService.getRequestsBySourceId(query,)
	}

	/**
	 * 3.1.2, 3.1.6, 3.1.7
	 * Retrieves a filtered list of requests.
 *
 * @remarks
 * - This route allows filtering of requests based on the criteria defined in `RequestFilterDto`.
 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
 *
 * @param filter - The filter criteria for requests.
 * @returns A promise that resolves to a list of filtered requests.
 */
	@Get(RequestRoutes.FILTER,)
	// @CacheTTL(HOUR_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.FILTER,
		type:        RequestFilterDto,
	},)
	public async getRequestsFiltered(
		@Query() filter: RequestFilterDto,
	): Promise<TRequestListRes> {
		return this.requestService.getRequestsFiltered(filter,)
	}

	/**
	 * 3.1.3
	  * Updates a request based on the provided ID and data.
 *
 * @remarks
 * - This route is used to update an existing request.
 * - The request is identified by its `id`, and the new data is provided in the request body.
 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
 *
 * @param params - The ID of the request to be updated.
 * @param body - The new data to update the request.
 * @returns A promise that resolves to the updated request object.
 */
	@Patch(RequestRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_DRAFT,
		type:        UpdateRequestDto,
	},)
	public async updateRequest(
		@Param('id', ParseIntPipe,) id: number,
		@Body() body: UpdateRequestDto,
	): Promise<TRequestExtended> {
		return this.requestService.updateRequest(id, body,)
	}

	/**
	 * 3.1.2
	 * Retrieves a request by its ID.
 *
 * @remarks
 * - This route is used to get the details of a specific request by its `id`.
 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	*
 * @param params - The ID of the request to retrieve.
 * @returns A promise that resolves to the request object with extended details.
	*/
	@Get(RequestRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	public async getRequestById(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<TRequestExtended> {
		return this.requestService.getRequestExtendedById(id,)
	}

	/**
	* CR - 071
	* Deletes request by its ID.
	*
	* @remarks
	* - This route is used to delete the specific request by its `id`.
	* - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER.
	*
	* @param params - The ID of the request to delete.
	*/
	@Delete(RequestRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        SwaggerDescriptions.ID,
		description: SwaggerDescriptions.ID,
	},)
	public async deleteRequestById(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<void> {
		return this.requestService.deleteRequestById(id,)
	}
}
