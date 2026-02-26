import { ApiProperty, } from '@nestjs/swagger'
import { IsString, Matches, } from 'class-validator'

import { PASSWORD_REGEX, } from '../../../shared/constants'
import { IsNotEqual, } from '../../../shared/validator'

export class ConfirmEmailDto {
	@ApiProperty({
		required:    true,
		description: `Old user's password`,
	},)
	@IsString()
	@Matches(PASSWORD_REGEX,)
	public oldPassword!: string

	@ApiProperty({
		required:    true,
		description: `New user's password`,
	},)
	@IsString()
	@Matches(PASSWORD_REGEX,)
	@IsNotEqual('oldPassword', {
		message: 'New password must not be the same as the old password',
	},)
	public newPassword!: string
}
