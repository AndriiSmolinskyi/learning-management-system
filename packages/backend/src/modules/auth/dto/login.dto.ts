import {
	IsEmail,
	IsEnum,
	IsString,
	MinLength,
} from 'class-validator'
import { AuthPortal, } from '../auth.types'

export class LoginDto {
	@IsEmail()
	public email: string

	@IsString()
	@MinLength(6,)
	public password: string

	@IsEnum(AuthPortal,)
	public portal: AuthPortal
}