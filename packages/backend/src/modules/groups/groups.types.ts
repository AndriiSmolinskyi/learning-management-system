import type {
	Lesson,
	StudentProfile,
} from '@prisma/client'

export type GroupItem = {
	id: string
	groupName: string
	courseName: string
	comment?: string | null
	startDate: string
	createdAt: string
	updatedAt: string
}

export type GroupsListReturn = {
	items: Array<GroupItem>
	total: number
	page: number
	pageSize: number
}

export type GroupStudentProfileItem = Pick<
	StudentProfile,
	'userId' | 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'country' | 'city' | 'comment'
>

export type GroupLessonItem = Pick<
	Lesson,
	'id' | 'title' | 'comment'
> & {
	createdAt: string
	updatedAt: string
}

export type GroupItemExtended = GroupItem & {
	activeLessons?: number
	studentProfiles: Array<GroupStudentProfileItem>
	lessons: Array<GroupLessonItem>
}