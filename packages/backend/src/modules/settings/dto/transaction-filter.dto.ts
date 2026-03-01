
import { ApiProperty, } from '@nestjs/swagger'
import { Prisma, } from '@prisma/client'
import {
	IsOptional, IsEnum, IsString, IsNotEmpty, IsArray, IsUUID, IsBooleanString,
} from 'class-validator'
import { TransactionTypeSortBy, CashFlow, PlType, } from '../settings.types'

export class TransactionTypeFilterDto {
	@ApiProperty({ name: 'sortBy', required: false, enum: TransactionTypeSortBy, },)
	@IsOptional()
	@IsEnum(TransactionTypeSortBy,)
	public sortBy?: TransactionTypeSortBy

	@ApiProperty({ name: 'sortOrder', required: false, enum: Prisma.SortOrder, },)
	@IsOptional()
	@IsEnum(Prisma.SortOrder,)
	public sortOrder?: Prisma.SortOrder

	@ApiProperty({ name: 'search', required: false, type: String, },)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public search?: string

	@ApiProperty({ required: false, type: [String,], description: 'Assets', },)
	@IsOptional()
	@IsArray()
	@IsString({ each: true, },)
	public assets?: Array<string>

	@ApiProperty({ required: false, type: [String,], description: 'Category IDs (UUID v4)', },)
	@IsOptional()
	@IsArray()
	@IsUUID(4, { each: true, },)
	public categoryIds?: Array<string>

	@ApiProperty({ required: false, isArray: true, enum: CashFlow, },)
	@IsOptional()
	@IsArray()
	@IsEnum(CashFlow, { each: true, },)
	public cashFlows?: Array<CashFlow>

	@ApiProperty({ required: false, isArray: true, enum: PlType, },)
	@IsOptional()
	@IsArray()
	@IsEnum(PlType, { each: true, },)
	public pls?: Array<PlType>

  @ApiProperty({ required: false, type: String, description: `'true' | 'false'`, },)
  @IsOptional()
  @IsBooleanString()
	public isActivated?: string

  @ApiProperty({ required: false, type: String, description: `'true' | 'false'`, },)
  @IsOptional()
  @IsBooleanString()
  public isDeactivated?: string
}