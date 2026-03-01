import { ApiProperty, } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsArray,
	IsOptional,
	IsUUID,
} from 'class-validator'

export class GetBanksBySourceIdsDto {
	@ApiProperty({
		required:    false,
		description: 'Client ids',
	},)
	@IsArray()
	@ArrayNotEmpty()
	@IsOptional()
	@IsUUID(4, {
		each: true,
	},)
	public clientIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Portfolio ids',
	},)
	@IsArray()
	@ArrayNotEmpty()
	@IsOptional()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Entity ids',
	},)
	@IsArray()
	@IsOptional()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public entityIds?: Array<string>
}