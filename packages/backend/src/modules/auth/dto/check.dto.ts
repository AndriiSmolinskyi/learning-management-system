import { IsEnum, } from 'class-validator'
import { AuthPortal, } from '../auth.types'

export class CheckDto {
	@IsEnum(AuthPortal,)
	public portal: AuthPortal
}