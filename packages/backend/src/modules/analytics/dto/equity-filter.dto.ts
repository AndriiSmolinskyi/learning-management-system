import { ApiProperty, } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator'
import { Transform, } from 'class-transformer'
import { AssetNamesType,} from '../../asset/asset.types'
import { CurrencyDataList, } from '@prisma/client'
import { AssetOperationType, SortOrder, } from '../../../shared/types'
import { TEquityTableSortVariants, } from '../analytics.types'

export class AnalyticsEquityFilterDto {
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

	// todo: clear if good
	// @ApiProperty({
	// 	required:    true,
	// 	description: 'Sort by',
	// },)
	// @IsEnum(TEquityTableSortVariants,)
	// public sortBy: TEquityTableSortVariants

	// @ApiProperty({
	// 	required:    true,
	// 	description: 'Sort order',
	// },)
	// @IsEnum(SortOrder,)
	// public sortOrder: SortOrder
	@ApiProperty({ required: false, description: 'Sort by', },)
	@IsOptional()
	@IsEnum(TEquityTableSortVariants,)
	@Transform(({ value, },) => {
		return value ?? undefined
	},)
	public sortBy!: TEquityTableSortVariants

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

export class EquityCurrencyFilterDto {
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

export class EquitySelectBySourceIdsDto {
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
	@ArrayNotEmpty()
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
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related portfolio drafts',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioDraftIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related entities',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
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
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public bankIds?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related banks list',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
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
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public accountIds?: Array<string>
}