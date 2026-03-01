import { ApiProperty, } from '@nestjs/swagger'
import {
	IsString,
	IsNotEmpty,
} from 'class-validator'

export class SignInDto {
	@ApiProperty({
		required:    true,
		description: 'MS Entra access token',
	},)
	@IsString()
	@IsNotEmpty()
	public accessToken!: string
}