import {
	IsString,
	IsEnum,
	IsUUID,
	IsOptional,
	IsArray,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { CashFlow, PlType, } from '../settings.types'

export class CreateTransactionTypeDto {
	@ApiProperty({
		required:    true,
		description: 'Transaction name',
	},)
	@IsString()
	public name: string

	@ApiProperty({
		required:    true,
		description: 'Transaction category',
	},)
	@IsUUID(4,)
	public categoryId: string

	@ApiProperty({
		required:    true,
		description: 'Cash flow',
	},)
	@IsEnum(CashFlow,)
	public cashFlow: CashFlow

	@ApiProperty({
		required:    true,
		description: 'PL',
	},)
	@IsEnum(PlType,)
	public pl: PlType

	@IsArray()
	@IsOptional()
	@ApiProperty({
		required:    false,
		description: 'Annual assets',
	},)
	public annualAssets?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Comment',
	},)
	public comment?: string

	@ApiProperty({
		required:    false,
		description: 'Draft id',
	},)
	@IsOptional()
	@IsUUID(4,)
	public draftId?: string

	@ApiProperty({ required: true, description: 'Initiator user name for audit', },)
	@IsString()
	public userName: string

	@ApiProperty({ required: true, description: 'Initiator user role for audit', },)
	@IsString()
	public userRole: string
}