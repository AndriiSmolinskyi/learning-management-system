import {
	IsNotEmpty,
	IsString,
	MaxLength,
	IsOptional,
	IsPositive,
	IsUUID,
	IsNumber,
	IsDateString,
	IsJSON,
	IsInt,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'

export class CreateTransactionDraftDto {
	@ApiProperty({
		required:    false,
		description: 'ID of the related transaction type',
	},)
   @IsOptional()
   @IsUUID(4,)
	public transactionTypeId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related client',
	},)
   @IsOptional()
   @IsUUID(4,)
	public clientId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related portfolio',
	},)
   @IsOptional()
   @IsUUID(4,)
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related enntity',
	},)
   @IsOptional()
   @IsUUID(4,)
	public entityId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related account',
	},)
	@IsOptional()
	@IsUUID(4,)
	public accountId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related bank',
	},)
   @IsOptional()
   @IsUUID(4,)
	public bankId?: string

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
   @IsNotEmpty()
   @MaxLength(50,)
	public serviceProvider?: string

	@ApiProperty({
		required:    false,
		description: 'Transaction currency',
	},)
   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @MaxLength(10,)
	public currency?: string

	@ApiProperty({
		required:    false,
		description: 'Transaction amount',
	},)
   @IsOptional()
	@IsNumber(
		{ maxDecimalPlaces: 2, },
		{ message: 'Amount must be a number with maximum 2 decimal places', },
	)
	public amount?: string

	@ApiProperty({
		required:    false,
		description: 'Transaction date',
	},)
	@IsOptional()
	@IsDateString()
	public transactionDate?: Date

	@ApiProperty({
		required:    false,
		description: 'Transaction comment',
	},)
   @IsOptional()
   @IsString()
   @IsNotEmpty()
	public comment?: string

	@ApiProperty({
		required:    false,
		description: 'Custom fields',
	},)
	@IsOptional()
	@IsJSON()
	public customFields: string
}