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

export type SelectOptionType = {
	id: string
	name: string
}

export type SelectValueType<T = string> =
	SingleValue<IOptionType<T>> |
	MultiValue<IOptionType<T>> |
	undefined

// groups

export type GroupLessonStudentItem = {
	id: string
	title: string
	comment?: string | null
	payload?: Record<string, unknown> | null
	createdAt: string
	updatedAt: string
}

export type StudentGroupListItem = {
	id: string
	groupName: string
	courseName: string
	startDate: string
	activeLessons: number
	createdAt: string
	updatedAt: string
}

export type StudentGroupsListReturn = {
	items: Array<StudentGroupListItem>
}

export type StudentGroupItem = {
	id: string
	groupName: string
	courseName: string
	startDate: string
	activeLessons: number
	createdAt: string
	updatedAt: string
	lessons: Array<GroupLessonStudentItem>
}
