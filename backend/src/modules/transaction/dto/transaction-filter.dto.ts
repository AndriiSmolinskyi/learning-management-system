import { ApiProperty, } from '@nestjs/swagger'
import { Prisma,} from '@prisma/client'
import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsEnum,
	IsUUID,
	IsArray,
	ArrayNotEmpty,
} from 'class-validator'
import { SortFields, } from '../transaction.types'

export class TransactionFilterDto {
	@ApiProperty({
		required:    false,
		name:        'skip',
		description: 'Number of records to skip',
	},)
	@IsOptional()
	public skip?: number

	@ApiProperty({
		required:    false,
		name:        'take',
		description: 'Number of records to take',
	},)
	@IsOptional()
	public take?: number

	@ApiProperty({
		required:    false,
		name:        'sortBy',
		description: 'Sort by',
	},)
	@IsOptional()
	@IsEnum(SortFields,)
	public sortBy?: SortFields

	@ApiProperty({
		required:    false,
		name:        'sortOrder',
		description: 'Sort order',
	},)
	@IsOptional()
	@IsEnum(Prisma.SortOrder,)
	public sortOrder?: Prisma.SortOrder

	@ApiProperty({
		required:    false,
		name:        'search',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public search?: string

	@ApiProperty({
		name:        'clientIds',
		required:    false,
		description: 'IDs of the clients',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public clientIds?: Array<string>

	@ApiProperty({
		name:        'portfolioIds',
		required:    false,
		description: 'IDs of the portfolios or sub-portfolios',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioIds?: Array<string>

	@ApiProperty({
		name:        'entityIds',
		required:    false,
		description: 'IDs of the entities',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public entityIds?: Array<string>

	@ApiProperty({
		name:        'bankIds',
		required:    false,
		description: 'IDs of the related banks	',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public bankIds?: Array<string>

	@ApiProperty({
		name:        'bankListIds',
		required:    false,
		description: 'IDs of the banks',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public bankListIds?: Array<string>

	@ApiProperty({
		name:        'accountIds',
		required:    false,
		description: 'IDs of the bank accounts',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public accountIds?: Array<string>

	@ApiProperty({
		required:    false,
		name:        'transaction name',
		description: 'Transaction name',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	public transactionNames?: Array<string>

	@ApiProperty({
		required:    false,
		name:        'currencies',
		description: 'Currencies',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	public currencies?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'ISINs',
	},)
	@IsOptional()
	public isins?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Securities',
	},)
   @IsOptional()
	public securities?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Date range for filtering',
	},)
	@IsOptional()
   @IsArray()
	@IsString({ each: true, },)
	public dateRange?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

	@ApiProperty({
		required:    false,
		description: 'Transaction types',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public transactionTypes?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Service providers',
	},)
   @IsOptional()
	public serviceProviders?: Array<string>
}