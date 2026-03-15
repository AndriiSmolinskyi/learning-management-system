import {
	IsEmail,
	IsEnum,
	IsString,
	MinLength,
} from 'class-validator'

import {
	AuthPortal,
} from '../auth.types'

export class ResetPasswordDto {
	@IsEmail()
	public email: string

	@IsEnum(AuthPortal,)
	public portal: AuthPortal

	@IsString()
	public token: string

	@IsString()
	@MinLength(8,)
	public newPassword: string
}