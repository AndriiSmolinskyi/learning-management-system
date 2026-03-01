import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsUUID,
	IsString,
	ArrayNotEmpty,
} from 'class-validator'
import { CurrencyDataList, Prisma, } from '@prisma/client'

import {
	AssetNamesType,
	TPrivateEquityTableSortVariants,
} from '../../asset/asset.types'

export class PrivateEquityFilterDto {
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
		description: 'Assets fund type currencies',
	},)
	@IsOptional()
	@IsArray()
	public fundTypes?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Assets fund name currencies',
	},)
	@IsOptional()
	@IsArray()
	public fundNames?: Array<string>

	// todo: clear if good
	@IsOptional()
	@ApiProperty({
		required:    false,
		description: 'Sort by',
	},)
	@IsEnum(TPrivateEquityTableSortVariants,)
	public sortBy?: TPrivateEquityTableSortVariants

	@IsOptional()
	@ApiProperty({
		required:    false,
		description: 'Sort order',
	},)
	@IsEnum(Prisma.SortOrder,)
	public sortOrder?: Prisma.SortOrder = Prisma.SortOrder.asc

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

export class PrivateEquityFilterSelectsBySourceIdsDto {
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
