import { ApiProperty, } from '@nestjs/swagger'
import {
	Equals,
	IsArray,
	IsEnum,
	IsOptional,
	IsUUID,
	IsString,
	IsBoolean,
} from 'class-validator'

import { AssetNamesType, } from '../../asset/asset.types'
import { CurrencyDataList, } from '@prisma/client'
import { Transform, } from 'class-transformer'

export class CashFilterDto {
	@ApiProperty({
		name:        'type',
		required:    true,
		description: 'Asset`s type',
	},)
	@Equals(AssetNamesType.CASH,)
	public type!: AssetNamesType.CASH

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
		description: 'IDs of the related accounts',
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
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

		@ApiProperty({
			required:    false,
			description: 'Transaction creation status',
		},)
		@IsOptional()
		@IsBoolean()
		@Transform(({ value, },) => {
			return value === 'true' || value === true
		},)
	public transactionCreation?: boolean
}