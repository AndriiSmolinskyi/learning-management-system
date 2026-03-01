import { ApiProperty, } from '@nestjs/swagger'
import { Prisma, CurrencyDataList,} from '@prisma/client'
import {
	IsOptional,
	IsEnum,
	IsString,
	IsUUID,
	IsArray,
	IsInt,
} from 'class-validator'
import { Type, } from 'class-transformer'
import { Transform, } from 'class-transformer'
import { SortFields, } from '../../transaction/transaction.types'

export class TransactionFilterDto {
	@ApiProperty({
		required:    false,
		description: 'IDs of the transactions',
	},)
	@IsOptional()
	@IsArray()
	@IsInt({each: true,},)
	@Type(() => {
		return Number
	},)
	public transactionIds?: Array<number>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related clients',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public clientIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related portfolios',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related entities',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public entityIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related banks',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public bankIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the banks',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public bankListIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related bank accounts',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public accountIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Service providers',
	},)
   @IsOptional()
	public serviceProviders?: Array<string>

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
		description: 'Assets currencies',
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(CurrencyDataList, {
		each: true,
	},)
	public currencies?: Array<CurrencyDataList>

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

	@ApiProperty({
		required:    false,
		description: 'Date range for filtering',
	},)
	@IsOptional()
   @IsArray()
	@IsString({ each: true, },)
	public dateRange?: Array<string>

	// todo: clear if good
	// @ApiProperty({
	// 	required:    false,
	// 	name:        'sortBy',
	// 	description: 'Sort by',
	// },)
	// @IsOptional()
	// public sortBy?: SortFields

	// @ApiProperty({
	// 	required:    false,
	// 	name:        'sortOrder',
	// 	description: 'Sort order',
	// },)
	// @IsOptional()
	// @IsEnum(Prisma.SortOrder,)
	// public sortOrder?: Prisma.SortOrder
	@ApiProperty({ required: false, description: 'Sort by', },)
	@IsOptional()
	@IsEnum(SortFields,)
	@Transform(({ value, },) => {
		return value ?? SortFields.TRANSACTION_DATE
	},)
	public sortBy!: SortFields

	@ApiProperty({ required: false, description: 'Sort order', },)
	@IsOptional()
	@IsEnum(Prisma.SortOrder,)
	@Transform(({ value, },) => {
		return value ?? Prisma.SortOrder.asc
	},)
	public sortOrder!: Prisma.SortOrder

	@ApiProperty({
		required:    false,
		name:        'skip',
		description: 'Number of records to skip',
	},)
	@IsOptional()
	@Type(() => {
		return Number
	},)
	@IsInt()
	public skip?: number

	@ApiProperty({
		required:    false,
		name:        'take',
		description: 'Number of records to take',
	},)
	@IsOptional()
	@Type(() => {
		return Number
	},)
	@IsInt()
	public take?: number
}