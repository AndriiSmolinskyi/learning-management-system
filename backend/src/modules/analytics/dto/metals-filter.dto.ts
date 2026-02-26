import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	Equals,
} from 'class-validator'
import { CurrencyDataList, MetalDataList, } from '@prisma/client'
import {
	AssetNamesType,
	MetalsSortVariants,
} from '../../asset/asset.types'
import { AssetOperationType, MetalType, SortOrder, } from '../../../shared/types'

export class MetalsFilterDto {
	@ApiProperty({
		required:    true,
		name:        'type',
		description: 'Assets type',
	},)
	@Equals(AssetNamesType.METALS,)
	public type: AssetNamesType.METALS

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
		description: 'Crypto product types',
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(MetalType, {
		each: true,
	},)
	public productTypes?: Array<MetalType>

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
		description: 'Metals',
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(MetalDataList, {
		each: true,
	},)
	public metals?: Array<MetalDataList>

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

	@ApiProperty({
		required:    false,
		description: 'Sort by',
	},)
	@IsOptional()
	@IsEnum(MetalsSortVariants,)
	public sortBy!: MetalsSortVariants

	@ApiProperty({
		required:    true,
		description: 'Sort order',
	},)
	@IsOptional()
	@IsEnum(SortOrder,)
	public sortOrder!: SortOrder

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