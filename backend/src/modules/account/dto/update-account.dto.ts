import {
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'

import { MAX_INPUT_LENGTH, } from '../../../shared/constants'

export class UpdateAccountDto {
	@ApiProperty({
		required:    false,
		description: 'Name of the account',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Account name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public accountName?: string

	@ApiProperty({
		required:    false,
		description: 'Management fee as a string',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public managementFee?: string

	@ApiProperty({
		required:    false,
		description: 'Hold fee as a string',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public holdFee?: string

	@ApiProperty({
		required:    false,
		description: 'Sell fee as a string',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public sellFee?: string

	@ApiProperty({
		required:    false,
		description: 'Buy fee as a string',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public buyFee?: string

	@ApiProperty({
		required:    false,
		description: 'Optional description of the account',
	},)
	@IsOptional()
	@IsString()
	public description?: string

	@ApiProperty({
		required:    false,
		description: 'Creation date in ISO format',
		example:     '2024-12-18T00:00:00Z',
	},)
	@IsDateString()
	@IsOptional()
	public dataCreated?: string

	@ApiProperty({
		required:    false,
		description: 'IBAN of the account',
	},)
	@IsOptional()
	@IsString()
	public iban?: string

	@ApiProperty({
		required:    false,
		description: 'Account number',
	},)
	@IsOptional()
	@IsString()
	public accountNumber?: string

	@ApiProperty({
		required:    false,
		description: 'Additional comments about the account',
	},)
	@IsOptional()
	@IsString()
	public comment?: string
}