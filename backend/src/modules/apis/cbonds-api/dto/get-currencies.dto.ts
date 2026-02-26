import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsUUID,
} from 'class-validator'
import { AssetNamesType, } from '../../../asset/asset.types'
import { CryptoType, MetalType, } from '../../../../shared/types'

export class CurrencyFilterDto {
	@ApiProperty({
		name:        'type',
		required:    true,
		description: 'Assets type',
	},)
	@IsEnum(AssetNamesType,)
	public assetName: AssetNamesType

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
		description: 'Metal product type',
	},)
	@IsOptional()
	@IsEnum(MetalType,)
	public metalProductType?: MetalType

	@ApiProperty({
		required:    false,
		description: 'Crypto product type',
	},)
	@IsOptional()
	@IsEnum(CryptoType,)
	public cryptoProductType?:  CryptoType
}