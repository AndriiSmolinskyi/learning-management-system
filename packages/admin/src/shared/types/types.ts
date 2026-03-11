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