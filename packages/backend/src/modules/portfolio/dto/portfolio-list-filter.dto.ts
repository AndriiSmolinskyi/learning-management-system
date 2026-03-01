import { ApiProperty, } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsArray,
	ArrayNotEmpty,
} from 'class-validator'

export class GetPortfolioFilterDto {
	@ApiProperty({
		required:    false,
		description: 'Clients IDs for filter',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	public clients?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Portfolio types for filter',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	public types?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Portfolio activation status',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public isActivated?: string

	@ApiProperty({
		required:    false,
		description: 'Portfolio activation status',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public isDeactivated?: string

	@ApiProperty({
		required:    false,
		description: 'Portfolio name search value',
	},)
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty({
		required:    false,
		description: 'Total assets range value',
	},)
	@IsOptional()
	@IsArray()
	public range?: Array<string>
}