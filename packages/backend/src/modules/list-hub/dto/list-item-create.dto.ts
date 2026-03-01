import { ApiProperty, } from '@nestjs/swagger'
import {
	IsString,
} from 'class-validator'

export class ListItemCreateDto {
	@ApiProperty({
		required:    true,
		description: 'New list item name',
	},)
	@IsString()
	public name!: string
}