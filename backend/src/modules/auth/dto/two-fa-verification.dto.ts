import {
	ApiProperty,
} from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
} from 'class-validator'

import {
	PASSWORD_REGEX,
} from '../../../shared/constants'

export class TwoFAVerificationDto {
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

	@ApiProperty({
		required:    true,
		description: 'User`s 2FA verification code',
	},)
	@IsNotEmpty()
	@IsString()
	public code!: string

	@ApiProperty({
		required:    false,
		description: 'User`s 2FA secret',
	},)
	@IsOptional()
	@IsString()
	public secret?: string
}