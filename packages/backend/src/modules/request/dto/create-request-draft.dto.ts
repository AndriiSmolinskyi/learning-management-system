import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsUUID,
	IsEnum,
	IsNumberString,
	Validate,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { RequestType, } from '@prisma/client'

import { NoMoreThenOneFieldValidator, } from '../../../shared/validator'

export class CreateRequestDraftDto {
	@ApiProperty({
		required:    true,
		description: 'Request type',
	},)
	@IsEnum(RequestType,)
	public type!: RequestType

	@ApiProperty({
		required:    false,
		description: 'Request amount',
	},)
	@IsOptional()
	@IsNumberString()
	public amount?: string

	@ApiProperty({
		required:    false,
		description: 'Asset id',
	},)
	@IsOptional()
	@IsUUID(4,)
	public assetId?: string

	@ApiProperty({
		required:    false,
		description: 'Request comment',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public comment?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related entity',
	},)
	@IsOptional()
	@IsUUID(4,)
	public entityId?: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related bank',
	},)
	@IsOptional()
	@IsUUID(4,)
	public bankId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related 	',
	},)
	@IsOptional()
	@IsUUID(4,)
	public accountId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related portfolio or sub-portfolio',
	},)
	@IsOptional()
	@IsUUID(4,)
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related client',
	},)
	@IsOptional()
	@IsUUID(4,)
	public clientId?: string

	@Validate(NoMoreThenOneFieldValidator, [
		'comment',
		'assetId',
		'amount',
	],)
	public noMorethanOneField?: unknown

	// todo: after asset refactor
	@ApiProperty({
		required:    false,
		description: 'Asset name',
	},)
	@IsOptional()
	@IsString()
	public assetName?: string
}