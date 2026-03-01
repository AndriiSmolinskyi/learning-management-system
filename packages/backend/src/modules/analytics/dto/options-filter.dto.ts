import { ApiProperty, } from '@nestjs/swagger'
import {
	Equals,
	IsArray,
	IsNotEmpty,
	IsNumberString,
	IsOptional,
	IsUUID,
	IsString,
	ArrayNotEmpty,
	IsEnum,
} from 'class-validator'

import { AssetNamesType, TOptionsSortVariants, } from '../../asset/asset.types'
import { Transform, } from 'class-transformer'
import { SortOrder, } from '../../../shared/types'

export class OptionsFilterDto {
	@ApiProperty({
		name:        'type',
		required:    true,
		description: 'Asset`s type',
	},)
	@Equals(AssetNamesType.OPTIONS,)
	public type!: AssetNamesType.OPTIONS

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
	@IsNotEmpty({each: true,},)
	public pairs?: Array<string>

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
		description: 'Maturity year',
	},)
	@IsOptional()
	@IsNumberString()
	public maturityYear?: number

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

			@ApiProperty({ required: false, description: 'Sort by', },)
	@IsOptional()
	@IsEnum(TOptionsSortVariants,)
	@Transform(({ value, },) => {
		return value ?? TOptionsSortVariants.START_DATE
	},)
	public sortBy?: TOptionsSortVariants

	@ApiProperty({ required: false, description: 'Sort order', },)
	@IsOptional()
	@IsEnum(SortOrder,)
	@Transform(({ value, },) => {
		return value ?? SortOrder.ASC
	},)
			public sortOrder?: SortOrder
}

export class OptionPairsBySourceIdsDto {
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