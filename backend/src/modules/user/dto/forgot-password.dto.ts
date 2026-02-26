import { ApiProperty, } from '@nestjs/swagger'
import { IsEmail, } from 'class-validator'

export class ForgotPasswordDto {
	@ApiProperty({
		required:    true,
		description: `User's email`,
	},)
	@IsEmail()
	public email!: string
}
