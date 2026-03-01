import { ApiProperty, } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsArray,
	IsOptional,
	IsUUID,
} from 'class-validator'

export class AccountSourceIdsDto {
	@ApiProperty({
		required:    false,
		description: 'IDs of the related clients',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public clientIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related portfolios',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related portfolio drafts',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioDraftIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related entities',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public entityIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related banks',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public bankIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related banks list',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public bankListIds?: Array<string>
}