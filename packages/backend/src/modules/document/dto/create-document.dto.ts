import { ApiProperty, } from '@nestjs/swagger'
import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Validate,
} from 'class-validator'
import { OnlyOneFieldValidator, } from '../../../shared/validator'
import { Transform, } from 'class-transformer'

export class CreateDocumentDto {
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
		description: 'ID of the related portfolio asset',
	},)
	@IsOptional()
	@IsUUID(4,)
	public assetId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related request',
	},)
	@IsOptional()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	@IsInt()
	public requestId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related request draft',
	},)
	@IsOptional()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	@IsInt()
	public requestDraftId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related transaction',
	},)
	@IsOptional()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	@IsInt()
	public transactionId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related transaction draft',
	},)
	@IsOptional()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	@IsInt()
	public transactionDraftId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related report',
	},)
	@IsOptional()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	@IsInt()
	public reportId?: number

	@ApiProperty({
		required:    false,
		description: 'ID of the related report draft',
	},)
	@IsOptional()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
	@IsInt()
	public reportDraftId?: number

	@ApiProperty({
		required:    true,
		description: 'The document type',
	},)
	@IsString()
	@IsNotEmpty()
	public type!: string

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
		'reportId',
		'reportDraftId',
	],)
	public onlyOneField?: unknown
}