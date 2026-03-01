import { ApiProperty, } from '@nestjs/swagger'
import {
	IsOptional,
	IsUUID,
} from 'class-validator'

export class SourceIdDto {
	@ApiProperty({
		required:    false,
		description: 'ID of the related portfolio draft',
	},)
	@IsOptional()
	@IsUUID(4,)
	public portfolioDraftId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related portfolio',
	},)
	@IsOptional()
	@IsUUID(4,)
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related entity',
	},)
	@IsOptional()
	@IsUUID(4,)
	public entityId?: string
}