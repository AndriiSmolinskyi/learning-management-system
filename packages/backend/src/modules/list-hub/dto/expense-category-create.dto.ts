import { ApiProperty, } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator'

export class ExpenseCategoryCreateDto {
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
		@IsUUID(4,)
	public clientId!: string

	@ApiProperty({
		required:    true,
		description: 'New list item name',
	},)
	@IsString()
	public name!: string
}