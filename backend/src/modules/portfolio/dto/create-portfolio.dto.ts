import {
	IsNotEmpty,
	IsString,
	MaxLength,
	IsOptional,
} from 'class-validator'

import { ApiProperty, } from '@nestjs/swagger'

import { MAX_INPUT_LENGTH, } from '../portfolio.constants'

export class CreatePortfolioDto {
	@ApiProperty({
		required:    false,
		description: 'Main portfolio id, if sub creating',
	},)
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	public mainPortfolioId?: string

	@ApiProperty({
		required:    true,
		description: 'Related clients id',
	},)
	@IsString()
	@IsNotEmpty()
	public clientId!: string

	@ApiProperty({
		required:    true,
		description: 'Portfolio name',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Portfolio name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public name!: string

	@ApiProperty({
		required:    true,
		description: 'Portfolio type',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Portfolio name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public type!: string

	@ApiProperty({
		required:    false,
		description: 'Portfolio resident',
	},)
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	public resident?: string

	@ApiProperty({
		required:    false,
		description: 'Portfolio tax resident',
	},)
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	public taxResident?: string
}