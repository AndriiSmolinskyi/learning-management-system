import type {
	MultiValue, SingleValue,
} from 'react-select'

export type TExcelSheetType = Array<Array<string | number | Date>>

export interface IProgressBarStep {
	labelTitle: string
	labelDesc: string
}

export interface IOptionType<T = string> {
	label: string
	value: T
}

export type SelectOptionType = {
	id: string
	name: string
}

export type SelectValueType<T = string> =
	SingleValue<IOptionType<T>> |
	MultiValue<IOptionType<T>> |
	undefined

// auth types

export enum AuthPortal {
	STUDENT = 'STUDENT',
	ADMIN = 'ADMIN',
}

enum Role {
	STUDENT = 'STUDENT',
	ADMIN = 'ADMIN',
}

export type OkResponse = {
	ok: true
}

export type LoginBody = {
	email: string
	password: string
	portal: AuthPortal
}

export type LoginReturn = OkResponse

export type AuthCheckReturn = {
	auth: boolean
	role?: Role
	userId?: string
}

export type ForgotPasswordBody = {
	email: string
	portal: AuthPortal
}

export type ForgotPasswordReturn = OkResponse

export type ResetPasswordBody = {
	email: string
	portal: AuthPortal
	token: string
	newPassword: string
}

export type ResetPasswordReturn = OkResponse

export type LogoutReturn = OkResponse

// students types

export type CreateStudentReturn = {
	student: StudentItem
	temporaryPassword: string
}

export enum StudentsSortBy {
	FIRST_NAME = 'firstName',
	LAST_NAME = 'lastName',
	EMAIL = 'email',
	CREATED_AT = 'createdAt',
}

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export type GetStudentsQuery = {
	search?: string
	sortBy?: StudentsSortBy
	sortOrder?: SortOrder
	page?: number
	pageSize?: number
}

export type StudentsListReturn = {
	items: Array<StudentItem>
	total: number
	page: number
	pageSize: number
}

export interface IStudentFormValues {
	firstName: string
	lastName: string
	email: string
	phoneNumber?: string | null
	country?: string | null
	city?: string | null
	comment?: string | null
}

export type StudentItem = {
	id: string
	email: string
	firstName: string
	lastName: string
	phoneNumber?: string | null
	country?: string | null
	city?: string | null
	comment?: string | null
	createdAt: string
	updatedAt: string
}

export type CreateStudentBody = {
	email: string
	firstName: string
	lastName: string
	phoneNumber?: string
	country?: string
	city?: string
	comment?: string
}

export type UpdateStudentBody = {
	firstName?: string
	lastName?: string
	email?: string
	phoneNumber?: string
	country?: string
	city?: string
	comment?: string
}

export enum LessonsSortBy {
	TITLE = 'title',
	COMMENT = 'comment',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}

export type LessonPayload = Record<string, unknown>

export type LessonItem = {
	id: string
	title: string
	comment?: string | null
	payload?: LessonPayload | null
	createdAt: string
	updatedAt: string
}

export type CreateLessonBody = {
	title: string
	comment?: string
	payload?: LessonPayload
}

export type UpdateLessonBody = {
	title?: string
	comment?: string
	payload?: LessonPayload
}

export type GetLessonsQuery = {
	search?: string
	sortBy?: LessonsSortBy
	sortOrder?: SortOrder
	page?: number
	pageSize?: number
}

export type LessonsListReturn = {
	items: Array<LessonItem>
	total: number
	page: number
	pageSize: number
}

// groups

export enum GroupsSortBy {
	GROUP_NAME = 'groupName',
	COURSE_NAME = 'courseName',
	START_DATE = 'startDate',
	CREATED_AT = 'createdAt',
}

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

export type GetGroupsQuery = {
	search?: string
	sortBy?: GroupsSortBy
	sortOrder?: SortOrder
	page?: number
	pageSize?: number
}

export type CreateGroupBody = {
	groupName: string
	courseName: string
	startDate: string
	comment?: string
}

export type UpdateGroupBody = {
	groupName?: string
	courseName?: string
	startDate?: string
	comment?: string
}