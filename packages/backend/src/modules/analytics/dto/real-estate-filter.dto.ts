import { ApiProperty, } from '@nestjs/swagger'
import {
	Equals,
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsUUID,
	IsString,
	ArrayNotEmpty,
} from 'class-validator'
import { CurrencyDataList, } from '@prisma/client'

import { AssetNamesType, TRealEstateSortVariants, } from '../../asset/asset.types'
import { Transform, } from 'class-transformer'
import { SortOrder, } from '../../../shared/types'

export class RealEstateFilterDto {
	@ApiProperty({
		name:        'type',
		required:    true,
		description: 'Asset`s type',
	},)
	@Equals(AssetNamesType.REAL_ESTATE,)
	public type!: AssetNamesType.REAL_ESTATE

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
		description: 'Real estate currencies',
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(CurrencyDataList, {each: true,},)
	public currencies?: Array<CurrencyDataList>

	@ApiProperty({
		required:    false,
		description: 'Real estate operations',
	},)
	@IsOptional()
	@IsArray()
	@IsNotEmpty({each: true,},)
	public operations?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Real estate project transactions',
	},)
	@IsOptional()
	@IsArray()
	@IsNotEmpty({each: true,},)
	public projectTransactions?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Real estate countries',
	},)
	@IsOptional()
	@IsArray()
	@IsNotEmpty({each: true,},)
	public countries?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Real estate cities',
	},)
	@IsOptional()
	@IsArray()
	@IsNotEmpty({each: true,},)
	public cities?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Asset IDs',
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

		@ApiProperty({ required: false, description: 'Sort by', },)
	@IsOptional()
	@IsEnum(TRealEstateSortVariants,)
	@Transform(({ value, },) => {
		return value ?? TRealEstateSortVariants.DATE
	},)
	public sortBy?: TRealEstateSortVariants

	@ApiProperty({ required: false, description: 'Sort order', },)
	@IsOptional()
	@IsEnum(SortOrder,)
	@Transform(({ value, },) => {
		return value ?? SortOrder.ASC
	},)
		public sortOrder?: SortOrder
}

export class RealEstateFilterSelectsBySourceIdsDto {
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