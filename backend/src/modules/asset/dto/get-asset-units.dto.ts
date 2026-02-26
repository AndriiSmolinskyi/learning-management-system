import { MetalDataList, } from '@prisma/client'
import { ApiProperty, } from '@nestjs/swagger'
import { CurrencyDataList, } from '@prisma/client'
import {
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator'

export const CombinedEnum = {
	...CurrencyDataList,
	...MetalDataList,
} as const

export class GetAssetUnitsDto {
	@ApiProperty({
		required:    true,
		description: 'Asset name',
	},)
	@IsString()
	public assetName!: string

	@ApiProperty({
		required:    true,
		description: 'Currency',
	},)
	@IsEnum(CurrencyDataList,)
	@IsString()
	public currency!: CurrencyDataList

	@ApiProperty({
		required:    false,
		description: 'MetalType',
	},)
	@IsOptional()
	@IsEnum(MetalDataList,)
	@IsString()
	public metalType?: MetalDataList

	@ApiProperty({
		required:    true,
		description: 'ISIN',
	},)
	@IsOptional()
	@IsString()
	public isin?: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related bank account',
	},)
	@IsUUID(4,)
	public accountId!: string
}