import { ApiProperty, } from '@nestjs/swagger'
import {
	IsOptional,
	IsUUID,
} from 'class-validator'

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
		description: 'ID of the related bank',
	},)
	@IsOptional()
	@IsUUID(4,)
	public bankId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related bank account',
	},)
	@IsOptional()
	@IsUUID(4,)
	public accountId?: string
}