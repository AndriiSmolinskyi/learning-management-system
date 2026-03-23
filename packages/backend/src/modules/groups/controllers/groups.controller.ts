import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiTags, } from '@nestjs/swagger'
import { Role, } from '@prisma/client'
import type {
	Request,
} from 'express'

import { JwtAuthGuard, } from '../../../shared/auth/jwt-auth.guard'
import { RolesGuard, } from '../../../shared/auth/roles.guard'
import { Roles, } from '../../../shared/auth/roles.decorator'

import { GroupsRoutes, } from '../groups.constants'
import { GroupsService, } from '../services/groups.service'
import { CreateGroupDto, } from '../dto/create-group.dto'
import { UpdateGroupDto, } from '../dto/update-group.dto'
import { GetGroupsDto, } from '../dto/get-groups.dto'
import { ChangeGroupStudentsDto, } from '../dto/change-group-students.dto'
import { ChangeGroupLessonsDto, } from '../dto/change-group-lessons.dto'

import type {
	GroupItem,
	GroupItemExtended,
	GroupsListReturn,
	StudentGroupItem,
	StudentGroupsListReturn,
} from '../groups.types'

@Controller(GroupsRoutes.MODULE,)
@ApiTags('Groups',)
@UseGuards(JwtAuthGuard, RolesGuard,)
export class GroupsController {
	constructor(
		private readonly groupsService: GroupsService,
	) {}

	@Post(GroupsRoutes.CREATE,)
	@Roles(Role.ADMIN,)
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
	@Roles(Role.ADMIN,)
	public async getGroups(
		@Query() query: GetGroupsDto,
	): Promise<GroupsListReturn> {
		return this.groupsService.getGroups(query,)
	}

	@Get(GroupsRoutes.BY_ID,)
	@Roles(Role.ADMIN,)
	public async getGroupById(
		@Param('id',) id: string,
	): Promise<GroupItemExtended> {
		return this.groupsService.getGroupById(id,)
	}

	@Get(GroupsRoutes.MY_GROUPS,)
	@Roles(Role.STUDENT,)
	public async getMyGroups(
		@Req() req: Request & { user: { userId: string, role: Role } },
	): Promise<StudentGroupsListReturn> {
		return this.groupsService.getMyGroups(req.user.userId,)
	}

	@Get(GroupsRoutes.MY_BY_ID,)
	@Roles(Role.STUDENT,)
	public async getMyGroupById(
		@Param('id',) id: string,
		@Req() req: Request & { user: { userId: string, role: Role } },
	): Promise<StudentGroupItem> {
		return this.groupsService.getMyGroupById(req.user.userId, id,)
	}

	@Patch(GroupsRoutes.BY_ID,)
	@Roles(Role.ADMIN,)
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

	@Patch(GroupsRoutes.STUDENTS,)
	@Roles(Role.ADMIN,)
	@ApiBody({
		description: 'Replace group students by student ids',
		type:        ChangeGroupStudentsDto,
	},)
	public async changeGroupStudents(
		@Param('id',) id: string,
		@Body() body: ChangeGroupStudentsDto,
	): Promise<GroupItemExtended> {
		return this.groupsService.changeGroupStudents(id, body.studentIds,)
	}

	@Patch(GroupsRoutes.LESSONS,)
	@Roles(Role.ADMIN,)
	@ApiBody({
		description: 'Replace group lessons and set active lessons count',
		type:        ChangeGroupLessonsDto,
	},)
	public async changeGroupLessons(
		@Param('id',) id: string,
		@Body() body: ChangeGroupLessonsDto,
	): Promise<GroupItemExtended> {
		return this.groupsService.changeGroupLessons(
			id,
			body.lessonIds,
			body.activeLessons,
		)
	}

	@Delete(GroupsRoutes.BY_ID,)
	@Roles(Role.ADMIN,)
	public async deleteGroup(
		@Param('id',) id: string,
	): Promise<{ ok: true }> {
		return this.groupsService.deleteGroup(id,)
	}
}