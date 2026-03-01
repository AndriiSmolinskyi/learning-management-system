import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { Entity, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../shared/guards'
import { EntityService, } from './entity.service'
import { EntityRoutes, SwaggerDescriptions, } from './entity.constants'
import { RolesDecorator, } from '../../shared/decorators'

import {
	AddEntityDto,
	GetByIdDto,
	SourceIdDto,
	UpdateEntityDto,
} from './dto'
import { Roles, } from '../../shared/types'
import { AuthRequest, } from '../auth'

@Controller(EntityRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('Entity',)
export class EntityController {
	constructor(
		private readonly entityService: EntityService,
	) {}

	/**
	 * 1.5.1/1.5.2/2.1.3
	 * Creates a new entity.
	 * @param body - The data for creating a new entity.
	 * @returns A promise that resolves to the newly created entity.
	 */
	@Post(EntityRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_ENTITY,
		type:        AddEntityDto,
	},)
	public async createEntity(
		@Body() body: AddEntityDto,
	): Promise<Entity> {
		return this.entityService.createEntity(body,)
	}

	/**
 * Retrieves a list of entities by source identifier.
 * @remarks
 * This endpoint fetches entities filtered by the provided source ID.
 * Requires roles: BACK_OFFICE_MANAGER or FAMILY_OFFICE_MANAGER.
 *
 * @param query - DTO containing the source ID (e.g., accountId).
 * @returns A promise resolving to an array of Entity objects.
 */
	@Get(EntityRoutes.SOURCE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.SOURCE_ID,
		type:        SourceIdDto,
	},)
	public async getEntitiesBySourceId(
		@Query() query: SourceIdDto,
	): Promise<Array<Entity>> {
		return this.entityService.getEntitiesBySourceIds(query,)
	}

	/**
	 * 1.5.1/1.5.2/2.1.3
	 * Retrieves a list of entities associated with a specific portfolio ID.
	 * @remarks
	 * This function retrieves a list of entities based on the provided portfolio ID.
	 * It requires the user to have the necessary permissions (back office manager or family office manager).
	 * @param params - The parameters containing the portfolio ID.
	 * @param params.id - The ID of the portfolio for which to retrieve entities.
	 * @returns A promise that resolves to an array of entities associated with the specified portfolio ID.
	 * @throws Will throw an error if the user does not have the required permissions or if the retrieval fails.
	 */
	@Get(EntityRoutes.BY_PORTFOLIO_ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.PORTFOLIO_ID,
	},)
	public async getEntityListByPortfolioId(
		@Param() params: GetByIdDto,
	): Promise<Array<Entity>>  {
		return this.entityService.getEntityListByPortfolioId(params.id,)
	}

	/**
	 * 3.5.3
	 * Retrieves a list of entities based on multiple portfolio IDs.
	 * @remarks
	 * This function retrieves a list of entities associated with multiple portfolio IDs.
	 * It requires the user to have the necessary permissions (back office manager or family office manager).
	 * @param args - The query parameters containing an array of portfolio IDs.
	 * @param args.id - An array of portfolio IDs to retrieve entities for.
	 * @returns A promise that resolves to an array of entities associated with the specified portfolio IDs.
	 * @throws Will throw an error if the user does not have the required permissions or if the retrieval fails.
	*/
		@Get(EntityRoutes.ENTITY_LIST_BY_IDS,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
			clientAccess: true,
		},)
		@ApiQuery({
			name:        'id',
			type:        SourceIdDto,
			description: SwaggerDescriptions.ENTITY_LIST_BY_IDS,
		},)
	public async getEntityListBSourceIds(
			@Query() args: SourceIdDto,
			@Req() req: AuthRequest,
	): Promise<Array<Entity>> {
		return this.entityService.getEntityListBySourceIds(args, req.clientId,)
	}

		/**
		 * 1.5.1/1.5.2/2.1.3
		 * Updates an existing entity by its ID.
		 * @param params - The parameters containing the entity ID.
		 * @param body - The data for updating the entity.
		 * @returns A promise that resolves to the updated entity.
		 */
		@Patch(EntityRoutes.ID,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		},)
		@ApiParam({
			name:        'id',
			description: SwaggerDescriptions.ENTITY_ID,
		},)
		@ApiBody({
			description: SwaggerDescriptions.UPDATE_ENTITY,
			type:        UpdateEntityDto,
		},)
		public async updateEntity(
			@Param() params: GetByIdDto,
			@Body() body: UpdateEntityDto,
		): Promise<Entity> {
			return this.entityService.updateEntity(params.id, body,)
		}
}
