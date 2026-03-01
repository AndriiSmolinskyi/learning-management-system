import { ApiProperty, } from '@nestjs/swagger'
import {
	IsOptional,
	IsUUID,
	Validate,
} from 'class-validator'

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

	@Validate(OnlyOneFieldValidator, [
		'clientId',
		'portfolioId',
		'entityId',
		'bankId',
		'accountId',
	],)
	public onlyOneField?: unknown
}