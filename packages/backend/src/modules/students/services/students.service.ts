/* eslint-disable complexity */
import * as bcrypt from 'bcrypt'
import * as generatePassword from 'generate-password'
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma, } from '@prisma/client'
import type {
	CreateStudentDto,
} from '../dto/create-student.dto'
import type {
	UpdateStudentDto,
} from '../dto/update-student.dto'
import {
	StudentsSortBy,
	SortOrder,} from '../dto/get-students.dto'
import type {
	GetStudentsDto,
} from '../dto/get-students.dto'
import type {
	CreateStudentReturn,
	StudentItem,
	StudentsListReturn,
} from '../students.types'

@Injectable()
export class StudentsService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async createStudent(body: CreateStudentDto,): Promise<CreateStudentReturn> {
		const existing = await this.prismaService.user.findUnique({
			where:  { email: body.email, },
			select: { id: true, },
		},)

		if (existing) {
			throw new BadRequestException('Email already exists',)
		}

		const temporaryPassword = generatePassword.generate({
			length:    12,
			numbers:   true,
			uppercase: true,
			lowercase: true,
			symbols:   false,
			strict:    true,
		},)

		const passwordHash = await bcrypt.hash(temporaryPassword, 10,)

		const created = await this.prismaService.user.create({
			data: {
				email:    body.email,
				password: passwordHash,
				role:     'STUDENT',

				studentProfile: {
					create: {
						email:       body.email,
						firstName:   body.firstName,
						lastName:    body.lastName,
						phoneNumber: body.phoneNumber ?? null,
						country:     body.country ?? null,
						city:        body.city ?? null,
						comment:        body.comment ?? null,
					},
				},
			},
			select: {
				id:             true,
				email:          true,
				createdAt:      true,
				updatedAt:      true,
				studentProfile: {
					select: {
						firstName:   true,
						lastName:    true,
						phoneNumber: true,
						country:     true,
						city:        true,
						comment:     true,
					},
				},
			},
		},)

		const student: StudentItem = {
			id:          created.id,
			email:       created.email,
			firstName:   created.studentProfile?.firstName ?? '',
			lastName:    created.studentProfile?.lastName ?? '',
			phoneNumber: created.studentProfile?.phoneNumber ?? null,
			country:     created.studentProfile?.country ?? null,
			comment:     created.studentProfile?.comment ?? null,
			city:        created.studentProfile?.city ?? null,
			createdAt:   created.createdAt.toISOString(),
			updatedAt:   created.updatedAt.toISOString(),
		}

		return {
			student,
			temporaryPassword,
		}
	}

	public async updateStudent(id: string, body: UpdateStudentDto,): Promise<StudentItem> {
		const user = await this.prismaService.user.findUnique({
			where:  { id, },
			select: {
				id:             true,
				email:          true,
				role:           true,
				createdAt:      true,
				updatedAt:      true,
				studentProfile: {
					select: {
						userId:      true,
						firstName:   true,
						lastName:    true,
						phoneNumber: true,
						country:     true,
						city:        true,
					},
				},
			},
		},)

		if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
			throw new NotFoundException('Student not found',)
		}

		const updated = await this.prismaService.studentProfile.update({
			where: { userId: id, },
			data:  {
				firstName:   body.firstName,
				lastName:    body.lastName,
				phoneNumber: body.phoneNumber,
				country:     body.country,
				city:        body.city,
				comment:     body.comment,
			},
			select: {
				firstName:   true,
				lastName:    true,
				phoneNumber: true,
				country:     true,
				city:        true,
				comment:     true,
			},
		},)

		return {
			id:          user.id,
			email:       user.email,
			firstName:   updated.firstName,
			lastName:    updated.lastName,
			phoneNumber: updated.phoneNumber,
			country:     updated.country,
			city:        updated.city,
			comment:     updated.comment,
			createdAt:   user.createdAt.toISOString(),
			updatedAt:   user.updatedAt.toISOString(),
		}
	}

	public async deleteStudent(id: string,): Promise<{ ok: true }> {
		const user = await this.prismaService.user.findUnique({
			where:  { id, },
			select: { id: true, role: true, },
		},)

		if (!user || user.role !== 'STUDENT') {
			throw new NotFoundException('Student not found',)
		}

		await this.prismaService.user.delete({
			where: { id, },
		},)

		return { ok: true, }
	}

	public async getStudent(id: string,): Promise<StudentItem> {
		const user = await this.prismaService.user.findUnique({
			where:  { id, },
			select: {
				id:             true,
				email:          true,
				role:           true,
				createdAt:      true,
				updatedAt:      true,
				studentProfile: {
					select: {
						firstName:   true,
						lastName:    true,
						phoneNumber: true,
						country:     true,
						city:        true,
						comment:     true,
					},
				},
			},
		},)

		if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
			throw new NotFoundException('Student not found',)
		}

		return {
			id:          user.id,
			email:       user.email,
			firstName:   user.studentProfile.firstName,
			lastName:    user.studentProfile.lastName,
			phoneNumber: user.studentProfile.phoneNumber,
			country:     user.studentProfile.country,
			city:        user.studentProfile.city,
			comment:     user.studentProfile.comment,
			createdAt:   user.createdAt.toISOString(),
			updatedAt:   user.updatedAt.toISOString(),
		}
	}

	public async getStudents(query: GetStudentsDto,): Promise<StudentsListReturn> {
		const page = query.page ?? 1
		const pageSize = query.pageSize ?? 20
		const skip = (page - 1) * pageSize

		const rawSearch = query.search?.trim()
		const search = rawSearch ?
			rawSearch :
			undefined

		const where: Prisma.StudentProfileWhereInput = search ?
			{
				user: { role: 'STUDENT', },
				OR:   [
					{ email: { contains: search, mode: 'insensitive', }, },
					{ firstName: { contains: search, mode: 'insensitive', }, },
					{ lastName: { contains: search, mode: 'insensitive', }, },
				],
			} :
			{
				user: { role: 'STUDENT', },
			}

		const sortBy = query.sortBy ?? StudentsSortBy.CREATED_AT
		const sortOrder = query.sortOrder ?? SortOrder.DESC
		const orderBy = this.buildOrderBy(sortBy, sortOrder,)

		const [total, items,] = await Promise.all([
			this.prismaService.studentProfile.count({
				where,
			},),
			this.prismaService.studentProfile.findMany({
				where,
				skip,
				take:   pageSize,
				orderBy,
				select: {
					userId:      true,
					email:       true,
					firstName:   true,
					lastName:    true,
					phoneNumber: true,
					country:     true,
					city:        true,
					user:        {
						select: {
							email:     true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
			},),
		],)

		return {
			items: items.map((s,) => {
				return {
					id:          s.userId,
					email:       s.user.email,
					firstName:   s.firstName,
					lastName:    s.lastName,
					phoneNumber: s.phoneNumber,
					country:     s.country,
					city:        s.city,
					createdAt:   s.user.createdAt.toISOString(),
					updatedAt:   s.user.updatedAt.toISOString(),
				}
			},),
			total,
			page,
			pageSize,
		}
	}

	private buildOrderBy(
		sortBy: StudentsSortBy | 'createdAt' | 'firstName' | 'lastName' | 'email',
		sortOrder: SortOrder | 'asc' | 'desc',
	): Array<Record<string, unknown>> {
		const order = sortOrder === 'asc' ?
			'asc' :
			'desc'

		if (sortBy === 'createdAt') {
			return [
				{ user: { createdAt: order, }, },
				{ userId: 'desc', },
			]
		}

		if (sortBy === 'email') {
			return [
				{ email: order, },
				{ userId: 'desc', },
			]
		}

		if (sortBy === 'firstName') {
			return [
				{ firstName: order, },
				{ lastName: 'asc', },
				{ userId: 'desc', },
			]
		}

		if (sortBy === 'lastName') {
			return [
				{ lastName: order, },
				{ firstName: 'asc', },
				{ userId: 'desc', },
			]
		}

		return [
			{ user: { createdAt: 'desc', }, },
			{ userId: 'desc', },
		]
	}
}