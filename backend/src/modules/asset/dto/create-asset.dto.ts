import {
	IsNotEmpty,
	IsString,
	MaxLength,
	IsJSON,
	IsOptional,
	Validate,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'

import { MAX_INPUT_LENGTH, } from '../../../shared/constants'

import { AssetPayloadValidator, } from '../../../shared/validator/asset-payload.validator'

export class CreateAssetDto {
	@ApiProperty({
		required:    true,
		description: 'Asset name',
	},)
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Asset name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public assetName!: string

	@ApiProperty({
		required:    true,
		description: 'Asset variable form payload',
	},)
	@IsJSON()
	@IsNotEmpty()
	@Validate(AssetPayloadValidator, [
		'assetName',
		'payload',
	],)
	public payload!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related entity',
	},)
	@IsString()
	@IsNotEmpty()
	public entityId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related bank',
	},)
	@IsString()
	@IsNotEmpty()
	public bankId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related account',
	},)
	@IsString()
	@IsNotEmpty()
	public accountId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related client',
	},)
	@IsString()
	@IsNotEmpty()
	public clientId!: string

	@ApiProperty({
		required:    false,
		description: 'ID of the portfolio',
	},)
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the portfolio draft',
	},)
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	public portfolioDraftId?: string
}