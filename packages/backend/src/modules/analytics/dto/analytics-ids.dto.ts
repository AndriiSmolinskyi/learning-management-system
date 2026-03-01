import { ApiProperty, } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsArray,
	IsUUID,
	IsOptional,
} from 'class-validator'

export class AnalyticsSelectsGetByIdsDto {
	@ApiProperty({
		required:    false,
		description: 'Analytics source ids',
	},)
	@IsArray()
	@ArrayNotEmpty()
	@IsOptional()
	@IsUUID(4, {
		each: true,
	},)
	public id?: Array<string>
}