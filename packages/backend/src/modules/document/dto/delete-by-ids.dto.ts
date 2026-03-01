import { ApiProperty, } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsArray,
	IsUUID,
} from 'class-validator'

export class DeleteByIdsDto {
	@ApiProperty({
		required:    true,
		description: 'Documents ids',
	},)
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public id!: Array<string>
}