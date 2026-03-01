import { ApiProperty, } from '@nestjs/swagger'
import { Prisma, } from '@prisma/client'
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator'
import { SortFields, } from '../transaction.types'

export class BudgetTransactionDto {
	@IsUUID()
	public clientId!: string

	@ApiProperty({
		required:    false,
		name:        'sortBy',
		description: 'Sort by',
	},)
	@IsOptional()
	@IsEnum(SortFields,)
	public sortBy: SortFields

	@ApiProperty({
		required:    false,
		name:        'sortOrder',
		description: 'Sort order',
	},)
	@IsOptional()
	@IsEnum(Prisma.SortOrder,)
	public sortOrder: Prisma.SortOrder

	@ApiProperty({
		required:    false,
		name:        'search',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public search?: string

	@IsOptional()
	@IsArray()
	@IsString({each: true,},)
	@IsNotEmpty()
	public transactionNames?: Array<string>

	@IsOptional()
	@IsArray()
	@IsString({each: true,},)
	@IsNotEmpty()
	public categories?: Array<string>

	@IsOptional()
	@IsArray()
	@IsString({each: true,},)
	@IsNotEmpty()
	public currencies?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Date range',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public dateRange?: Array<string>
}