import type { Role, } from '@prisma/client'

export type AuthCheckReturn = {
	auth: boolean
	role?: Role
	userId?: string
}

export type LoginReturn = {
	ok: true
}

export enum AuthPortal {
	STUDENT = 'STUDENT',
	ADMIN = 'ADMIN',
}