import { ApiProperty, } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, } from 'class-validator'

import { PASSWORD_REGEX, } from '../../../shared/constants'

export class LoginDto {
	@ApiProperty({
		required:    true,
		description: 'User email',
	},)
   @IsEmail()
	public email!: string

	@ApiProperty({
		required:    true,
		description: 'User password',
	},)
	@IsString()
	@Matches(PASSWORD_REGEX,)
	public password!: string
}