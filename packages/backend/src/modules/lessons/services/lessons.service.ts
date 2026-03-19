import {
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type {
	Lesson,
	Prisma,
} from '@prisma/client'

import type {
	CreateLessonDto,
} from '../dto/create-lesson.dto'
import type {
	UpdateLessonDto,
} from '../dto/update-lesson.dto'
import {
	LessonsSortBy,
	SortOrder,
} from '../dto/get-lessons.dto'
import type {
	GetLessonsDto,
} from '../dto/get-lessons.dto'
import type {
	LessonItem,
	LessonsListReturn,
} from '../lessons.types'

@Injectable()
export class LessonsService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async createLesson(body: CreateLessonDto,): Promise<LessonItem> {
		const created = await this.prismaService.lesson.create({
			data: {
				title:   body.title.trim(),
				comment: body.comment?.trim() ?? null,
				payload: body.payload,
			},
		},)

		return this.mapLesson(created,)
	}

	public async updateLesson(id: string, body: UpdateLessonDto,): Promise<LessonItem> {
		await this.ensureLessonExists(id,)

		const updated = await this.prismaService.lesson.update({
			where: { id, },
			data:  {
				...(body.title !== undefined && {
					title: body.title.trim(),
				}),
				...(body.comment !== undefined && {
					comment: body.comment.trim() || null,
				}),
				...(body.payload !== undefined && {
					payload: body.payload,
				}),
			},
		},)

		return this.mapLesson(updated,)
	}

	public async deleteLesson(id: string,): Promise<{ ok: true }> {
		await this.ensureLessonExists(id,)

		await this.prismaService.lesson.delete({
			where: { id, },
		},)

		return { ok: true, }
	}

	public async getLesson(id: string,): Promise<LessonItem> {
		const lesson = await this.prismaService.lesson.findUnique({
			where: { id, },
		},)

		if (!lesson) {
			throw new NotFoundException('Lesson not found',)
		}

		return this.mapLesson(lesson,)
	}

	public async getLessons(query: GetLessonsDto,): Promise<LessonsListReturn> {
		const page = query.page ?? 1
		const pageSize = query.pageSize ?? 20
		const skip = (page - 1) * pageSize

		const rawSearch = query.search?.trim()
		const search = rawSearch ?
			rawSearch :
			undefined

		const where: Prisma.LessonWhereInput = search ?
			{
				OR: [
					{
						title: {
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

		const sortBy = query.sortBy ?? LessonsSortBy.CREATED_AT
		const sortOrder = query.sortOrder ?? SortOrder.DESC
		const orderBy = this.buildOrderBy(sortBy, sortOrder,)

		const [total, items,] = await Promise.all([
			this.prismaService.lesson.count({
				where,
			},),
			this.prismaService.lesson.findMany({
				where,
				skip,
				take: pageSize,
				orderBy,
			},),
		],)

		return {
			items: items.map((lesson,) => {
				return this.mapLesson(lesson,)
			},),
			total,
			page,
			pageSize,
		}
	}

	private async ensureLessonExists(id: string,): Promise<void> {
		const lesson = await this.prismaService.lesson.findUnique({
			where:  { id, },
			select: { id: true, },
		},)

		if (!lesson) {
			throw new NotFoundException('Lesson not found',)
		}
	}

	private mapLesson(lesson: Lesson,): LessonItem {
		return {
			id:        lesson.id,
			title:     lesson.title,
			comment:   lesson.comment,
			payload:   (lesson.payload as Prisma.JsonObject | null) ?? null,
			createdAt: lesson.createdAt.toISOString(),
			updatedAt: lesson.updatedAt.toISOString(),
		}
	}

	private buildOrderBy(
		sortBy: LessonsSortBy,
		sortOrder: SortOrder,
	): Array<Prisma.LessonOrderByWithRelationInput> {
		const order: Prisma.SortOrder = sortOrder === SortOrder.ASC ?
			'asc' :
			'desc'

		if (sortBy === LessonsSortBy.TITLE) {
			return [
				{ title: order, },
				{ createdAt: 'desc', },
				{ id: 'desc', },
			]
		}

		if (sortBy === LessonsSortBy.COMMENT) {
			return [
				{ comment: order, },
				{ title: 'asc', },
				{ id: 'desc', },
			]
		}

		if (sortBy === LessonsSortBy.UPDATED_AT) {
			return [
				{ updatedAt: order, },
				{ id: 'desc', },
			]
		}

		return [
			{ createdAt: order, },
			{ id: 'desc', },
		]
	}
}