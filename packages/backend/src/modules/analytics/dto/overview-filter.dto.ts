import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsUUID,
	IsString,
	IsNotEmpty,
} from 'class-validator'
import {  CurrencyDataList,CryptoList, MetalDataList, } from '@prisma/client'
import { AssetNamesType, } from '../../asset/asset.types'
import { IsOneOfEnums, } from '../../../shared/validator'
import { AssetOperationType, } from '../../../shared/types'

export class OverviewFilterDto {
	@ApiProperty({
		name:        'type',
		required:    false,
		description: 'Asset`s types',
	},)
	@IsOptional()
	@IsEnum(AssetNamesType, {
		each: true,
	},)
	public assetNames?: Array<AssetNamesType>

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
	@IsOneOfEnums([CurrencyDataList, MetalDataList, CryptoList,],)
	public currencies?: Array<CurrencyDataList | MetalDataList | CryptoList>

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string
}

export class OverviewAvailabilityFilterDto {
	@ApiProperty({
		name:        'type',
		required:    false,
		description: 'Asset`s types',
	},)
	@IsOptional()
	@IsEnum(AssetNamesType, {
		each: true,
	},)
	public assetNames?: Array<AssetNamesType>

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
	@IsOneOfEnums([CurrencyDataList, MetalDataList, CryptoList,],)
	public currencies?: Array<CurrencyDataList | MetalDataList | CryptoList>

	@ApiProperty({
		required:    false,
		description: 'Date for history view',
	},)
	@IsOptional()
	@IsString()
	public date?: string

	@ApiProperty({
		required:    false,
		description: 'Isins',
	},)
	@IsOptional()
	@IsArray()
	public isins?: Array<string>

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
		description: 'Service providers',
	},)
   @IsOptional()
	public serviceProviders?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Crypto types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public cryptoTypes?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Product types',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public productTypes?: Array<string>

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
		description: 'Loan names',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public loanNames?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Metals',
	},)
   @IsOptional()
	public metals?: Array<string>

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

	@ApiProperty({
		required:    false,
		description: 'Investment asset names',
	},)
   @IsOptional()
	public investmentAssetNames?: Array<string>

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
		description: 'Pairs',
	},)
	@IsOptional()
	@IsArray()
	@IsNotEmpty({each: true,},)
	public pairs?: Array<string>
}