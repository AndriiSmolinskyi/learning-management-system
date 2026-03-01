import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator'
import type { CryptoList,} from '@prisma/client'
import { CurrencyDataList, } from '@prisma/client'
import { AssetNamesType,} from '../../asset/asset.types'
import { AssetOperationType, CryptoType, SortOrder, } from '../../../shared/types'
import { TCryptoTableSortVariants, } from '../analytics.types'
import { Transform, } from 'class-transformer'

export class AnalyticsCryptoFilterDto {
	@ApiProperty({
		name:        'type',
		required:    true,
		description: 'Assets type',
	},)
	@IsEnum(AssetNamesType,)
	public type: AssetNamesType

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
	public entitiesIds?: Array<string>

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
		description: 'Crypto product types',
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(CryptoType, {
		each: true,
	},)
	public productTypes?: Array<CryptoType>

	@ApiProperty({
		required:    false,
		description: 'Crypto types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public cryptoTypes?: Array<CryptoList>

	@ApiProperty({
		required:    false,
		description: 'Equity types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public wallets?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Isins',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public isins?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Equity types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public equityTypes?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Securities',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
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

	// @ApiProperty({
	// 	required:    true,
	// 	description: 'Sort by',
	// },)
	// @IsEnum(TCryptoTableSortVariants,)
	// public sortBy: TCryptoTableSortVariants

	// @ApiProperty({
	// 	required:    true,
	// 	description: 'Sort order',
	// },)
	// @IsEnum(SortOrder,)
	// public sortOrder: SortOrder
	@ApiProperty({ required: false, description: 'Sort by', },)
	@IsOptional()
	@IsEnum(TCryptoTableSortVariants,)
	@Transform(({ value, },) => {
		return value ?? TCryptoTableSortVariants.COST_PRICE
	},)
	public sortBy!: TCryptoTableSortVariants

	@ApiProperty({ required: false, description: 'Sort order', },)
	@IsOptional()
	@IsEnum(SortOrder,)
	@Transform(({ value, },) => {
		return value ?? SortOrder.ASC
	},)
	public sortOrder!: SortOrder

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

	@ApiProperty({
		name:        'tradeOperation',
		required:    false,
		description: 'Buy/Sell operation',
	},)
	@IsOptional()
	@IsString()
	@IsEnum(AssetOperationType,)
	public tradeOperation?: AssetOperationType
}

export class CryptoCurrencyFilterDto {
	@ApiProperty({
		name:        'type',
		required:    true,
		description: 'Assets type',
	},)
	@IsEnum(AssetNamesType,)
	public type: AssetNamesType

	@ApiProperty({
		required:    false,
		description: 'Crypto product types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public productTypes?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Crypto types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public cryptoTypes?: Array<CryptoList>

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
	public entitiesIds?: Array<string>

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
		description: 'Loan names',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public wallets?: Array<string>

	// @ApiProperty({
	// 	required:    false,
	// 	description: 'Crypto currencies',
	// },)
	// @IsOptional()
	// @IsArray()
	// @IsString({
	// 	each: true,
	// },)
	// public currencies?: Array<string>
	@ApiProperty({
		name:        'tradeOperation',
		required:    false,
		description: 'Buy/Sell operation',
	},)
	@IsOptional()
	@IsString()
	@IsEnum(AssetOperationType,)
	public tradeOperation?: AssetOperationType

	@ApiProperty({
		required:    false,
		description: 'Isins',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public isins?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Equity types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public equityTypes?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Securities',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
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
		description: 'Asset`s IDs',
	},)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public assetIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string
}