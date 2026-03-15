import {
	IsEmail,
	IsEnum,
} from 'class-validator'

import {
	AuthPortal,
} from '../auth.types'

export class ForgotPasswordDto {
	@IsEmail()
	public email: string

	@IsEnum(AuthPortal,)
	public portal: AuthPortal
}
