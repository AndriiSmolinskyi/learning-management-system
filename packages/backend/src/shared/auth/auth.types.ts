import type { Request, } from 'express'
import type { Role, } from '@prisma/client'

export type JwtPayload = {
	sub:  string
	role: Role
	tv:   number
}

export type AuthUser = {
	userId: string
	role:   Role
}

export type AuthRequest = Request & {
	user?: AuthUser
}