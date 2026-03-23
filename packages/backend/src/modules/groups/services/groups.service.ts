/* eslint-disable complexity */
import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type {
	Group,
	Prisma,
} from '@prisma/client'

import type {
	CreateGroupDto,
} from '../dto/create-group.dto'
import type {
	UpdateGroupDto,
} from '../dto/update-group.dto'
import {
	GroupsSortBy,
	SortOrder,
} from '../dto/get-groups.dto'
import type {
	GetGroupsDto,
} from '../dto/get-groups.dto'
import type {
	GroupItem,
	GroupsListReturn,
	GroupItemExtended,
	StudentGroupItem,
	StudentGroupsListReturn,
} from '../groups.types'

@Injectable()
export class GroupsService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async createGroup(body: CreateGroupDto,): Promise<GroupItem> {
		const created = await this.prismaService.group.create({
			data: {
				groupName:  body.groupName.trim(),
				courseName: body.courseName.trim(),
				comment:    body.comment?.trim() ?? null,
				startDate:  new Date(body.startDate,),
			},
		},)

		return this.mapGroup(created,)
	}

	public async updateGroup(id: string, body: UpdateGroupDto,): Promise<GroupItem> {
		await this.ensureGroupExists(id,)

		const updated = await this.prismaService.group.update({
			where: { id, },
			data:  {
				...(body.groupName !== undefined && {
					groupName: body.groupName.trim(),
				}),
				...(body.courseName !== undefined && {
					courseName: body.courseName.trim(),
				}),
				...(body.comment !== undefined && {
					comment: body.comment.trim() || null,
				}),
				...(body.startDate !== undefined && {
					startDate: new Date(body.startDate,),
				}),
			},
		},)

		return this.mapGroup(updated,)
	}

	public async getGroups(query: GetGroupsDto,): Promise<GroupsListReturn> {
		const page = query.page ?? 1
		const pageSize = query.pageSize ?? 20
		const skip = (page - 1) * pageSize

		const rawSearch = query.search?.trim()
		const search = rawSearch ?
			rawSearch :
			undefined

		const where: Prisma.GroupWhereInput = search ?
			{
				OR: [
					{
						groupName: {
							contains: search,
							mode:     'insensitive',
						},
					},
					{
						courseName: {
							contains: search,
							mode:     'insensitive',
						},
					},
					{
						comment: {
							contains: search,
							mode:     'insensitive',
						},
					},
				],
			} :
			{}

		const sortBy = query.sortBy ?? GroupsSortBy.CREATED_AT
		const sortOrder = query.sortOrder ?? SortOrder.DESC
		const orderBy = this.buildOrderBy(sortBy, sortOrder,)

		const [total, items,] = await Promise.all([
			this.prismaService.group.count({
				where,
			},),
			this.prismaService.group.findMany({
				where,
				skip,
				take: pageSize,
				orderBy,
			},),
		],)

		return {
			items: items.map((group,) => {
				return this.mapGroup(group,)
			},),
			total,
			page,
			pageSize,
		}
	}

	public async deleteGroup(id: string,): Promise<{ ok: true }> {
		await this.ensureGroupExists(id,)

		await this.prismaService.group.delete({
			where: { id, },
		},)

		return { ok: true, }
	}

	public async getGroupById(id: string,): Promise<GroupItemExtended> {
		const group = await this.prismaService.group.findUnique({
			where:  { id, },
			select: {
				id:            true,
				groupName:     true,
				courseName:    true,
				comment:       true,
				startDate:     true,
				activeLessons: true,
				createdAt:     true,
				updatedAt:     true,

				studentProfiles: {
					select: {
						userId:      true,
						firstName:   true,
						lastName:    true,
						email:       true,
						phoneNumber: true,
						country:     true,
						city:        true,
						comment:     true,
					},
					orderBy: [
						{ firstName: 'asc', },
						{ lastName: 'asc', },
					],
				},

				lessons: {
					select: {
						id:        true,
						title:     true,
						comment:   true,
						createdAt: true,
						updatedAt: true,
					},
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
		},)

		if (!group) {
			throw new NotFoundException('Group not found',)
		}

		return {
			id:            group.id,
			groupName:     group.groupName,
			courseName:    group.courseName,
			comment:       group.comment,
			startDate:     group.startDate.toISOString(),
			activeLessons: group.activeLessons,
			createdAt:     group.createdAt.toISOString(),
			updatedAt:     group.updatedAt.toISOString(),

			studentProfiles: group.studentProfiles.map((student,) => {
				return {
					userId:      student.userId,
					firstName:   student.firstName,
					lastName:    student.lastName,
					email:       student.email,
					phoneNumber: student.phoneNumber,
					country:     student.country,
					city:        student.city,
					comment:     student.comment,
				}
			},),

			lessons: group.lessons.map((lesson,) => {
				return {
					id:        lesson.id,
					title:     lesson.title,
					comment:   lesson.comment,
					createdAt: lesson.createdAt.toISOString(),
					updatedAt: lesson.updatedAt.toISOString(),
				}
			},),
		}
	}

	public async changeGroupStudents(
		groupId: string,
		studentIds: Array<string>,
	): Promise<GroupItemExtended> {
		await this.ensureGroupExists(groupId,)

		const uniqueStudentIds = Array.from(new Set(studentIds,),)

		const users = await this.prismaService.user.findMany({
			where: {
				id:   { in: uniqueStudentIds, },
				role: 'STUDENT',
			},
			select: {
				id: true,
			},
		},)

		if (users.length !== uniqueStudentIds.length) {
			throw new BadRequestException('Some students were not found',)
		}

		const studentProfiles = await this.prismaService.studentProfile.findMany({
			where: {
				userId: { in: uniqueStudentIds, },
			},
			select: {
				userId: true,
			},
		},)

		if (studentProfiles.length !== uniqueStudentIds.length) {
			throw new BadRequestException('Some student profiles were not found',)
		}

		await this.prismaService.group.update({
			where: { id: groupId, },
			data:  {
				users: {
					set: uniqueStudentIds.map((id,) => {
						return { id, }
					},),
				},
				studentProfiles: {
					set: uniqueStudentIds.map((userId,) => {
						return { userId, }
					},),
				},
			},
		},)

		return this.getGroupById(groupId,)
	}

	public async changeGroupLessons(
		groupId: string,
		lessonIds: Array<string>,
		activeLessons: number,
	): Promise<GroupItemExtended> {
		await this.ensureGroupExists(groupId,)

		const uniqueLessonIds = Array.from(new Set(lessonIds,),)

		const lessons = await this.prismaService.lesson.findMany({
			where: {
				id: { in: uniqueLessonIds, },
			},
			select: {
				id: true,
			},
		},)

		if (lessons.length !== uniqueLessonIds.length) {
			throw new BadRequestException('Some lessons were not found',)
		}

		if (activeLessons > uniqueLessonIds.length) {
			throw new BadRequestException('Active lessons cannot be greater than total lessons count',)
		}

		await this.prismaService.group.update({
			where: { id: groupId, },
			data:  {
				activeLessons,
				lessons: {
					set: uniqueLessonIds.map((id,) => {
						return { id, }
					},),
				},
			},
		},)

		return this.getGroupById(groupId,)
	}

	public async getMyGroups(userId: string,): Promise<StudentGroupsListReturn> {
		const groups = await this.prismaService.group.findMany({
			where: {
				users: {
					some: {
						id: userId,
					},
				},
			},
			select: {
				id:            true,
				groupName:     true,
				courseName:    true,
				startDate:     true,
				activeLessons: true,
				createdAt:     true,
				updatedAt:     true,
			},
			orderBy: [
				{ createdAt: 'desc', },
				{ id: 'desc', },
			],
		},)

		return {
			items: groups.map((group,) => {
				return {
					id:            group.id,
					groupName:     group.groupName,
					courseName:    group.courseName,
					startDate:     group.startDate.toISOString(),
					activeLessons: group.activeLessons,
					createdAt:     group.createdAt.toISOString(),
					updatedAt:     group.updatedAt.toISOString(),
				}
			},),
		}
	}

	public async getMyGroupById(
		userId: string,
		groupId: string,
	): Promise<StudentGroupItem> {
		const group = await this.prismaService.group.findFirst({
			where: {
				id:    groupId,
				users: {
					some: {
						id: userId,
					},
				},
			},
			select: {
				id:            true,
				groupName:     true,
				courseName:    true,
				startDate:     true,
				activeLessons: true,
				createdAt:     true,
				updatedAt:     true,
				lessons:       {
					select: {
						id:        true,
						title:     true,
						comment:   true,
						payload:   true,
						createdAt: true,
						updatedAt: true,
					},
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
		},)

		if (!group) {
			throw new NotFoundException('Group not found',)
		}

		const visibleLessons = group.lessons.slice(0, group.activeLessons,)

		return {
			id:            group.id,
			groupName:     group.groupName,
			courseName:    group.courseName,
			startDate:     group.startDate.toISOString(),
			activeLessons: group.activeLessons,
			createdAt:     group.createdAt.toISOString(),
			updatedAt:     group.updatedAt.toISOString(),
			lessons:       visibleLessons.map((lesson,) => {
				return {
					id:        lesson.id,
					title:     lesson.title,
					comment:   lesson.comment,
					payload:   lesson.payload as Record<string, unknown> | null,
					createdAt: lesson.createdAt.toISOString(),
					updatedAt: lesson.updatedAt.toISOString(),
				}
			},),
		}
	}

	private async ensureGroupExists(id: string,): Promise<void> {
		const group = await this.prismaService.group.findUnique({
			where:  { id, },
			select: { id: true, },
		},)

		if (!group) {
			throw new NotFoundException('Group not found',)
		}
	}

	private mapGroup(group: Group,): GroupItem {
		return {
			id:         group.id,
			groupName:  group.groupName,
			courseName: group.courseName,
			comment:    group.comment,
			startDate:  group.startDate.toISOString(),
			createdAt:  group.createdAt.toISOString(),
			updatedAt:  group.updatedAt.toISOString(),
		}
	}

	private buildOrderBy(
		sortBy: GroupsSortBy | 'groupName' | 'courseName' | 'startDate' | 'createdAt',
		sortOrder: SortOrder | 'asc' | 'desc',
	): Array<Record<string, Prisma.SortOrder>> {
		const order: Prisma.SortOrder = sortOrder === 'asc' ?
			'asc' :
			'desc'

		if (sortBy === 'groupName') {
			return [
				{ groupName: order, },
				{ createdAt: 'desc', },
				{ id: 'desc', },
			]
		}

		if (sortBy === 'courseName') {
			return [
				{ courseName: order, },
				{ createdAt: 'desc', },
				{ id: 'desc', },
			]
		}

		if (sortBy === 'startDate') {
			return [
				{ startDate: order, },
				{ id: 'desc', },
			]
		}

		if (sortBy === 'createdAt') {
			return [
				{ createdAt: order, },
				{ id: 'desc', },
			]
		}

		return [
			{ createdAt: 'desc', },
			{ id: 'desc', },
		]
	}
}