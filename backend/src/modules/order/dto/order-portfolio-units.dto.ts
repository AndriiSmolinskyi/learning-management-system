import { ApiProperty, } from '@nestjs/swagger'
import { Type, } from 'class-transformer'
import {
	IsString,
	IsUUID,
} from 'class-validator'
import { AssetNamesType, } from 'src/modules/asset/asset.types'

export class OrderPortfolioUnitsDto {
	@ApiProperty({
		required:    true,
		description: 'Asset name',
	},)
	@IsString()
	@Type(() => {
		return String
	},)
	public assetName: AssetNamesType

	@ApiProperty({
		required:    true,
		description: 'ISIN',
	},)
	@IsString()
	@Type(() => {
		return String
	},)
	public isin: string

	@ApiProperty({
		required:    true,
		description: 'Portfolio id',
	},)
	@IsUUID()
	@Type(() => {
		return String
	},)
	public portfolioId: string
}