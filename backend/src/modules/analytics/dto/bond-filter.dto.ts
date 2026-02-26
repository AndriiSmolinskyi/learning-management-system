/* eslint-disable max-lines */
/* eslint-disable complexity */
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
import { AssetNamesType,
} from '../../asset/asset.types'
import { CurrencyDataList, } from '@prisma/client'
import { AssetOperationType, SortOrder, } from '../../../shared/types'
import { TBondTableSortVariants, TBondTableSortVariants2, } from '../analytics.types'

export class NewAnalyticsBondFilterDto {
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
		description: 'Sort by',
	},)
	@IsOptional()
	@IsEnum(TBondTableSortVariants2,)
	@Transform(({ value, },) => {
		return (value === undefined || value === null || value === '' || value === 'undefined' ?
			undefined :
			value)
	},
	)
	public sortBy!: TBondTableSortVariants2

	@ApiProperty({
		required:    false,
		description: 'Sort order (defaults to ASC when sortBy is provided)',
		default:     SortOrder.ASC,
	},)
	@IsEnum(SortOrder,)
	@Transform(({ value, obj, },) => {
		if (value === undefined || value === null || value === '' || value === 'undefined') {
			return obj?.sortBy ?
				SortOrder.ASC :
				SortOrder.ASC
		}
		const v = typeof value === 'string' ?
			value.toUpperCase() :
			value
		if (v === 'ASC' || v === SortOrder.ASC) {
			return SortOrder.ASC
		}
		if (v === 'DESC' || v === SortOrder.DESC) {
			return SortOrder.DESC
		}
		return SortOrder.ASC
	},)
	public sortOrder: SortOrder = SortOrder.ASC

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

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
		name:        'tradeOperation',
		required:    false,
		description: 'Buy/Sell operation',
	},)
	@IsOptional()
	@IsString()
	@IsEnum(AssetOperationType,)
	public tradeOperation?: AssetOperationType
}

export class AnalyticsBondFilterDto {
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
	// @IsEnum(TBondTableSortVariants,)
	// public sortBy: TBondTableSortVariants

	// @ApiProperty({
	// 	required:    true,
	// 	description: 'Sort order',
	// },)
	// @IsEnum(SortOrder,)
	// public sortOrder: SortOrder
	@ApiProperty({
		required:    false,
		description: 'Sort by',
	},)
	@IsOptional()
	@IsEnum(TBondTableSortVariants,)
	@Transform(({ value, },) => {
		return (value === undefined || value === null || value === '' || value === 'undefined' ?
			undefined :
			value)
	},
	)
	public sortBy!: TBondTableSortVariants

	@ApiProperty({
		required:    false,
		description: 'Sort order (defaults to ASC when sortBy is provided)',
		default:     SortOrder.ASC,
	},)
	@IsEnum(SortOrder,)
	@Transform(({ value, obj, },) => {
		if (value === undefined || value === null || value === '' || value === 'undefined') {
			return obj?.sortBy ?
				SortOrder.ASC :
				SortOrder.ASC
		}
		const v = typeof value === 'string' ?
			value.toUpperCase() :
			value
		if (v === 'ASC' || v === SortOrder.ASC) {
			return SortOrder.ASC
		}
		if (v === 'DESC' || v === SortOrder.DESC) {
			return SortOrder.DESC
		}
		return SortOrder.ASC
	},)
	public sortOrder: SortOrder = SortOrder.ASC

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

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
		name:        'tradeOperation',
		required:    false,
		description: 'Buy/Sell operation',
	},)
	@IsOptional()
	@IsString()
	@IsEnum(AssetOperationType,)
	public tradeOperation?: AssetOperationType
}

export class BondsCurrencyFilterDto {
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

export class BondIsinsSecuritiesBySourceIdsDto {
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