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
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiTags,
} from '@nestjs/swagger'
import { Role, } from '@prisma/client'

import { JwtAuthGuard, } from '../../../shared/auth/jwt-auth.guard'
import { RolesGuard, } from '../../../shared/auth/roles.guard'
import { Roles, } from '../../../shared/auth/roles.decorator'

import { LessonsRoutes, } from '../lessons.constants'
import { LessonsService, } from '../services/lessons.service'
import { CreateLessonDto, } from '../dto/create-lesson.dto'
import { UpdateLessonDto, } from '../dto/update-lesson.dto'
import { GetLessonsDto, } from '../dto/get-lessons.dto'

import type {
	LessonItem,
	LessonsListReturn,
} from '../lessons.types'

@Controller(LessonsRoutes.MODULE,)
@ApiTags('Lessons',)
@UseGuards(JwtAuthGuard, RolesGuard,)
@Roles(Role.ADMIN,)
export class LessonsController {
	constructor(
		private readonly lessonsService: LessonsService,
	) {}

	@Post(LessonsRoutes.CREATE,)
	@HttpCode(HttpStatus.CREATED,)
	@ApiBody({
		description: 'Create lesson',
		type:        CreateLessonDto,
	},)
	public async createLesson(
		@Body() body: CreateLessonDto,
	): Promise<LessonItem> {
		return this.lessonsService.createLesson(body,)
	}

	@Get(LessonsRoutes.LIST,)
	public async getLessons(
		@Query() query: GetLessonsDto,
	): Promise<LessonsListReturn> {
		return this.lessonsService.getLessons(query,)
	}

	@Get(LessonsRoutes.BY_ID,)
	public async getLesson(
		@Param('id',) id: string,
	): Promise<LessonItem> {
		return this.lessonsService.getLesson(id,)
	}

	@Patch(LessonsRoutes.BY_ID,)
	@ApiBody({
		description: 'Update lesson',
		type:        UpdateLessonDto,
	},)
	public async updateLesson(
		@Param('id',) id: string,
		@Body() body: UpdateLessonDto,
	): Promise<LessonItem> {
		return this.lessonsService.updateLesson(id, body,)
	}

	@Delete(LessonsRoutes.BY_ID,)
	public async deleteLesson(
		@Param('id',) id: string,
	): Promise<{ ok: true }> {
		return this.lessonsService.deleteLesson(id,)
	}
}