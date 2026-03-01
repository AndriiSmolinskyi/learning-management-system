import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsUUID,
	IsEnum,
	IsNumberString,
	IsPositive,
	IsInt,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { RequestType, } from '@prisma/client'

export class CreateRequestDto {
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
		required:    true,
		description: 'ID of the related entity',
	},)
	@IsUUID(4,)
	public entityId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related bank',
	},)
	@IsUUID(4,)
	public bankId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related bank account',
	},)
	@IsUUID(4,)
	public accountId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related portfolio or sub-portfolio',
	},)
	@IsUUID(4,)
	public portfolioId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related client',
	},)
	@IsUUID(4,)
	public clientId!: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related request draft',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	public requestDraftId?: number

	// todo: after asset refactor
	@ApiProperty({
		required:    false,
		description: 'Asset name',
	},)
	@IsOptional()
	@IsString()
	public assetName?: string
}