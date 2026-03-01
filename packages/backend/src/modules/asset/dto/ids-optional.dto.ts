import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsOptional,
	IsUUID,
} from 'class-validator'

export class GetOptionalByIdsDto {
	@ApiProperty({
		required:    false,
		description: 'IDs of the related banks',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public id?: Array<string>
}