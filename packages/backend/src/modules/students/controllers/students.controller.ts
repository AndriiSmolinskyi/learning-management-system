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
import { ApiBody, ApiTags, } from '@nestjs/swagger'
import { Role, } from '@prisma/client'

import { JwtAuthGuard, } from '../../../shared/auth/jwt-auth.guard'
import { RolesGuard, } from '../../../shared/auth/roles.guard'
import { Roles, } from '../../../shared/auth/roles.decorator'

import { StudentsRoutes, } from '../students.constants'
import { StudentsService, } from '../services/students.service'
import { CreateStudentDto, } from '../dto/create-student.dto'
import { UpdateStudentDto, } from '../dto/update-student.dto'
import { GetStudentsDto, } from '../dto/get-students.dto'

import type {
	CreateStudentReturn,
	StudentItem,
	StudentsListReturn,
} from '../students.types'

@Controller(StudentsRoutes.MODULE,)
@ApiTags('Students',)
@UseGuards(JwtAuthGuard, RolesGuard,)
@Roles(Role.ADMIN,)
export class StudentsController {
	constructor(
		private readonly studentsService: StudentsService,
	) {}

	@Post(StudentsRoutes.CREATE,)
	@HttpCode(HttpStatus.CREATED,)
	@ApiBody({
		description: 'Create student + user with random password',
		type:        CreateStudentDto,
	},)
	public async createStudent(
		@Body() body: CreateStudentDto,
	): Promise<CreateStudentReturn> {
		return this.studentsService.createStudent(body,)
	}

	@Get(StudentsRoutes.LIST,)
	public async getStudents(
		@Query() query: GetStudentsDto,
	): Promise<StudentsListReturn> {
		return this.studentsService.getStudents(query,)
	}

	@Get(StudentsRoutes.BY_ID,)
	public async getStudent(
		@Param('id',) id: string,
	): Promise<StudentItem> {
		return this.studentsService.getStudent(id,)
	}

	@Patch(StudentsRoutes.BY_ID,)
	@ApiBody({
		description: 'Update student profile fields',
		type:        UpdateStudentDto,
	},)
	public async updateStudent(
		@Param('id',) id: string,
		@Body() body: UpdateStudentDto,
	): Promise<StudentItem> {
		return this.studentsService.updateStudent(id, body,)
	}

	@Delete(StudentsRoutes.BY_ID,)
	public async deleteStudent(
		@Param('id',) id: string,
	): Promise<{ ok: true }> {
		return this.studentsService.deleteStudent(id,)
	}
}