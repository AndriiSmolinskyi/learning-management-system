import type {
	MultiValue, SingleValue,
} from 'react-select'

export type TExcelSheetType = Array<Array<string | number | Date>>

export enum AuthPortal {
	STUDENT = 'STUDENT',
	ADMIN = 'ADMIN',
}

enum Role {
   STUDENT = 'STUDENT',
   ADMIN = 'ADMIN'
}

export type LoginBody = {
	email: string
	password: string
	portal: AuthPortal
}

export type LoginReturn = {
	ok: true
}

export type AuthCheckReturn = {
	auth: boolean
	role?: Role
	userId?: string
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
