import { ApiProperty, } from '@nestjs/swagger'
import { IsString, IsUUID, Matches, } from 'class-validator'

import { PASSWORD_REGEX, } from '../../../shared/constants'

export class ChangePasswordDto {
	@ApiProperty({
		required:    true,
		description: `Verification token`,
	},)
	@IsUUID(4,)
	public token!: string

	@ApiProperty({
		required:    true,
		description: `New user's password`,
	},)
	@IsString()
	@Matches(PASSWORD_REGEX,)
	public newPassword!: string
}
