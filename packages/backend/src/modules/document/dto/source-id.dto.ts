import { ApiProperty, } from '@nestjs/swagger'
import {
	IsOptional,
	IsUUID,
	Validate,
	IsPositive,
	IsInt,
} from 'class-validator'
import { Transform, } from 'class-transformer'
import { OnlyOneFieldValidator, } from '../../../shared/validator'

export class SourceIdDto {
	@ApiProperty({
		required:    false,
		description: 'ID of the related client',
	},)
	@IsOptional()
	@IsUUID(4,)
	public clientId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related client draft',
	},)
	@IsOptional()
	@IsUUID(4,)
	public clientDraftId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related portfolio',
	},)
	@IsOptional()
	@IsUUID(4,)
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related portfolio draft',
	},)
	@IsOptional()
	@IsUUID(4,)
	public portfolioDraftId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related entity',
	},)
	@IsOptional()
	@IsUUID(4,)
	public entityId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related asset',
	},)
	@IsOptional()
	@IsUUID(4,)
	public assetId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related request',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	@Transform(({ value, },) => {
		return value ?
			parseInt(value, 10,) :
			undefined
	},)
	public requestId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related request draft',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	@Transform(({ value, },) => {
		return value ?
			parseInt(value, 10,) :
			undefined
	},)
	public requestDraftId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related transaction',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	public transactionId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related transaction draft',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	public transactionDraftId?: number

	@Validate(OnlyOneFieldValidator, [
		'clientId',
		'clientDraftId',
		'portfolioId',
		'portfolioDraftId',
		'entityId',
		'assetId',
		'requestId',
		'requestDraftId',
		'transactionId',
		'transactionDraftId',
	],)
	public onlyOneField?: unknown
}