import { ApiProperty, } from '@nestjs/swagger'

import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	IsDateString,
	IsJSON,
	IsPositive,
	IsInt,
} from 'class-validator'

export class CreateTransactionDto {
	@ApiProperty({
		required:    true,
		description: 'ID of the related transaction type',
	},)
	@IsUUID(4,)
	public transactionTypeId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related client',
	},)
   @IsUUID(4,)
	public clientId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related portfolio or sub-portfolio',
	},)
	@IsUUID(4,)
	public portfolioId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related account',
	},)
	@IsUUID(4,)
	public entityId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related account',
	},)
	@IsUUID(4,)
	public accountId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related bank',
	},)
	@IsUUID(4,)
	public bankId!: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related order',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	public orderId?: number

	@ApiProperty({
		required:    false,
		description: 'ISIN number',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(50,)
	public isin?: string

	@ApiProperty({
		required:    false,
		description: 'Security',
	},)
	@IsOptional()
	@IsString()
	@MaxLength(50,)
	public security?: string

	@ApiProperty({
		required:    false,
		description: 'Service provider',
	},)
	@IsOptional()
	@IsString()
	public serviceProvider?: string

	@ApiProperty({
		required:    true,
		description: 'Transaction currency',
	},)
   @IsString()
   @IsNotEmpty()
   @MaxLength(10,)
	public currency!: string

	@ApiProperty({
		required:    true,
		description: 'Transaction amount',
	},)
	@IsNumber(
		{ maxDecimalPlaces: 2, },
		{ message: 'Amount must be a number with maximum 2 decimal places', },
	)
    @IsNotEmpty()
	public amount!: number

	@ApiProperty({
		required:    true,
		description: 'Transaction date',
	},)
	@IsDateString()
	public transactionDate: Date

	@ApiProperty({
		required:    false,
		description: 'Transaction comment',
	},)
   @IsOptional()
   @IsString()
	public comment?: string

	@ApiProperty({
		required:    false,
		description: 'Custom fields',
	},)
	@IsOptional()
	@IsJSON()
	public customFields?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related transaction draft',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	public transactionDraftId?: number
}