import type {
	Request,
} from 'express'

export type AuthRequest = Request & {
	auth: boolean
	id: string
	roles: Array<string>
	clientId?: string
}

export type AuthCheckReturn = {
	auth: boolean
}

export type MsUser = {
	displayName: string | null,
	mail: string | null,
	id: string
}

export type MsGroups = {
	value?: Array<{id: string}>
}

export type TLoginReturn = {
	has2FASetup: boolean
	secret?: string
	qrCodeDataURL?: string
}

export type GenerateSecretReturn = {
	secret: string
	otpauth: string
}