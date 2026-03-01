import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	Equals,
	ArrayNotEmpty,
} from 'class-validator'
import { CurrencyDataList, } from '@prisma/client'
import {
	AssetNamesType,
	OtherInvestmentsSortVariants,
} from '../../asset/asset.types'
import { Transform, } from 'class-transformer'
import { SortOrder, } from '../../../shared/types'

export class OtherInvestmentsFilterDto {
	@ApiProperty({
		required:    true,
		name:        'type',
		description: 'Assets type',
	},)
	@Equals(AssetNamesType.OTHER,)
	public type: AssetNamesType.OTHER

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
		description: 'Investment asset names',
	},)
   @IsOptional()
	public investmentAssetNames?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Service providers',
	},)
   @IsOptional()
	public serviceProviders?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'IDs of the related banks',
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

	// todo: clear if good
	// @ApiProperty({
	// 	required:    false,
	// 	description: 'Sort by',
	// },)
	// @IsOptional()
	// @IsEnum(OtherInvestmentsSortVariants,)
	// public sortBy?: OtherInvestmentsSortVariants

	// @ApiProperty({
	// 	required:    false,
	// 	description: 'Sort order',
	// },)
	// @IsOptional()
	// @IsEnum(SortOrder,)
	// public sortOrder?: SortOrder
	@ApiProperty({ required: false, description: 'Sort by', },)
	@IsOptional()
	@IsEnum(OtherInvestmentsSortVariants,)
	@Transform(({ value, },) => {
		return value ?? OtherInvestmentsSortVariants.INVESTMENT_DATE
	},)
	public sortBy?: OtherInvestmentsSortVariants

	@ApiProperty({ required: false, description: 'Sort order', },)
	@IsOptional()
	@IsEnum(SortOrder,)
	@Transform(({ value, },) => {
		return value ?? SortOrder.ASC
	},)
	public sortOrder?: SortOrder
}

export class OtherInvestmentsFilterSelectsBySourceIdsDto {
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