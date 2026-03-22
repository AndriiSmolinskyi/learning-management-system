import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Delete,
	Query,
	UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiTags, } from '@nestjs/swagger'
import { Role, } from '@prisma/client'

import { JwtAuthGuard, } from '../../../shared/auth/jwt-auth.guard'
import { RolesGuard, } from '../../../shared/auth/roles.guard'
import { Roles, } from '../../../shared/auth/roles.decorator'

import { GroupsRoutes, } from '../groups.constants'
import { GroupsService, } from '../services/groups.service'
import { CreateGroupDto, } from '../dto/create-group.dto'
import { UpdateGroupDto, } from '../dto/update-group.dto'
import { GetGroupsDto, } from '../dto/get-groups.dto'

import type {
	GroupItem,
	GroupsListReturn,
} from '../groups.types'

@Controller(GroupsRoutes.MODULE,)
@ApiTags('Groups',)
@UseGuards(JwtAuthGuard, RolesGuard,)
@Roles(Role.ADMIN,)
export class GroupsController {
	constructor(
		private readonly groupsService: GroupsService,
	) {}

	@Post(GroupsRoutes.CREATE,)
	@HttpCode(HttpStatus.CREATED,)
	@ApiBody({
		description: 'Create group',
		type:        CreateGroupDto,
	},)
	public async createGroup(
		@Body() body: CreateGroupDto,
	): Promise<GroupItem> {
		return this.groupsService.createGroup(body,)
	}

	@Get(GroupsRoutes.LIST,)
	public async getGroups(
		@Query() query: GetGroupsDto,
	): Promise<GroupsListReturn> {
		return this.groupsService.getGroups(query,)
	}

	@Patch(GroupsRoutes.BY_ID,)
	@ApiBody({
		description: 'Update group fields',
		type:        UpdateGroupDto,
	},)
	public async updateGroup(
		@Param('id',) id: string,
		@Body() body: UpdateGroupDto,
	): Promise<GroupItem> {
		return this.groupsService.updateGroup(id, body,)
	}

	@Delete(GroupsRoutes.BY_ID,)
	public async deleteGroup(
		@Param('id',) id: string,
	): Promise<{ ok: true }> {
		return this.groupsService.deleteGroup(id,)
	}
}