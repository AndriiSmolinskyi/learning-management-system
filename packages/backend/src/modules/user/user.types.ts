import type {
	User,
} from '@prisma/client'

export type CreateUserProps = {
    email: string
    password: string
}

export type CreateUserReturn = {
    user: User
}

export type CreateUserWithOauthProvider = {
    email: string
}

export type ForgotPasswordCheckRes = {
    available: boolean
}

export type ChangeEmailConfirmPlainCodes = {
    oldEmailCode: string
    newEmailCode: string
}

export type ChangeEmailConfirmReturn = {
    isValid: boolean
    newEmail: string
}

export type CreateChangeEmail = {
    oldEmailCode: string
    newEmailCode: string
    newEmail: string
    userId: string
}
