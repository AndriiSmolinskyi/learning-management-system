import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsUUID,
	IsEnum,
	IsNumberString,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { RequestType, } from '@prisma/client'

import { RequestStatusType, } from '../request.types'

export class UpdateRequestDto {
	@ApiProperty({
		required:    true,
		description: 'Request type',
	},)
	@IsOptional()
	@IsEnum(RequestType,)
	public type!: RequestType

	@ApiProperty({
		required:    false,
		description: 'Request status type',
	},)
	@IsOptional()
	@IsEnum(RequestStatusType,)
	public status?: string

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

	@IsOptional()
	@ApiProperty({
		required:    true,
		description: 'ID of the related entity',
	},)
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
		required:    true,
		description: 'ID of the related bank account',
	},)
	@IsOptional()
	@IsUUID(4,)
	public accountId?: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related portfolio or sub-portfolio',
	},)
	@IsOptional()
	@IsUUID(4,)
	public portfolioId?: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related client',
	},)
	@IsOptional()
	@IsUUID(4,)
	public clientId?: string

	// todo: after asset refactor
	@ApiProperty({
		required:    false,
		description: 'Asset name',
	},)
	@IsOptional()
	@IsString()
	public assetName?: string
}