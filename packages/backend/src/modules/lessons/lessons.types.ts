import type {
	Prisma,
} from '@prisma/client'

export type LessonItem = {
	id: string
	title: string
	comment?: string | null
	payload?: Prisma.JsonObject | null
	createdAt: string
	updatedAt: string
}

export type LessonsListReturn = {
	items: Array<LessonItem>
	total: number
	page: number
	pageSize: number
}