import { ApiProperty, } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsArray,
	IsUUID,
	IsOptional,
} from 'class-validator'

export class GetPortfoliosByClientsIdsDto {
	@ApiProperty({
		required:    false,
		description: 'Clients ids',
	},)
	@IsArray()
	@IsOptional()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public id!: Array<string>
}