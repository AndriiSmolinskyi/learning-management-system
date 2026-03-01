import { ApiProperty, } from '@nestjs/swagger'
import { DocumentStatus, } from '@prisma/client'
import {
	IsEnum,
	IsOptional,
} from 'class-validator'

export class GetAllByClientDto {
	@ApiProperty({
		required:    true,
		description: 'Get all client documents',
	},)
	@IsOptional()
	@IsEnum(DocumentStatus,)
	public status?: DocumentStatus
}