import {
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from 'class-validator'

import { MAX_INPUT_LENGTH, } from '../../../shared/constants'
import { ApiProperty, } from '@nestjs/swagger'

export class AddAccountDto {
	@ApiProperty({
		required:    false,
		description: 'ID of the portfolio',
	},)
	@IsOptional()
	@IsNotEmpty({ message: 'ID cannot be empty', },)
	@IsUUID(4,)
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the portfolio draft',
	},)
	@IsOptional()
	@IsNotEmpty({ message: 'ID cannot be empty', },)
	@IsUUID(4,)
	public portfolioDraftId?: string

	@ApiProperty({
		description: 'ID of the entity',
	},)
	@IsString()
	@IsNotEmpty({ message: 'ID cannot be empty', },)
	@IsUUID(4,)
	public entityId!: string

	@ApiProperty({
		description: 'ID of the bank',
	},)
	@IsString()
	@IsNotEmpty({ message: 'ID cannot be empty', },)
	@IsUUID(4,)
	public bankId!: string

	@ApiProperty({
		description: 'Name of the account',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Account name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public accountName!: string

	@ApiProperty({
		description: 'Management fee as a string',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public managementFee!: string

	@ApiProperty({
		description: 'Hold fee as a string',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public holdFee!: string

	@ApiProperty({
		description: 'Sell fee as a string',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public sellFee!: string

	@ApiProperty({
		description: 'Buy fee as a string',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH,)
	public buyFee!: string

	@ApiProperty({
		required:    false,
		description: 'Optional description of the account',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
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
	@IsNotEmpty()
	public iban?: string

	@ApiProperty({
		required:    false,
		description: 'Account number',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public accountNumber?: string

	@ApiProperty({
		required:    false,
		description: 'Additional comments about the account',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public comment?: string
}