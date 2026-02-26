import {
	IsNotEmpty,
	IsString,
	IsUUID,
	IsNumber,
	MaxLength,
	IsOptional,
	IsPositive,
	IsDateString,
	IsJSON,
	IsInt,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'

export class UpdateTransactionDto {
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
		description: 'ID of the related entity',
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
		description: 'ID of the related asset',
	},)
   @IsOptional()
   @IsUUID(4,)
	public assetId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related order',
	},)
   @IsOptional()
	@IsPositive()
	@IsInt()
	public orderId?: number  | null

	@ApiProperty({
		required:    false,
		description: 'ISIN number',
	},)
   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @MaxLength(50,)
	public isin?: string  | null

	@ApiProperty({
		required:    false,
		description: 'Security',
	},)
   @IsOptional()
   @IsString()
   @MaxLength(50,)
	public security?: string  | null

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
	public comment?: string | null

	@ApiProperty({
		required:    false,
		description: 'Transaction expense category id',
	},)
   @IsOptional()
   @IsString()
   @IsNotEmpty()
	public expenseCategoryId?: string | null

	@ApiProperty({
		required:    false,
		description: 'Custom fields',
	},)
	@IsOptional()
	@IsJSON()
	public customFields: string

	// todo: after asset refactor
	@ApiProperty({
		required:    false,
		description: 'Asset name',
	},)
	@IsOptional()
	@IsString()
	public assetName?: string
}