// import {
// 	IsString,
// 	IsEnum,
// 	IsUUID,
// } from 'class-validator'
// import { ApiProperty, } from '@nestjs/swagger'
// import { CashFlow, PlType, } from '../settings.types'

// export class CreateTransactionTypeDraftDto {
// 	@ApiProperty({
// 		required:    false,
// 		description: 'Transaction name',
// 	},)
// 	@IsString()
// 	public name: string

// 	@ApiProperty({
// 		required:    false,
// 		description: 'Transaction category',
// 	},)
// 	@IsUUID(4,)
// 	public categoryId: string

// 	@ApiProperty({
// 		required:    false,
// 		description: 'Cash flow',
// 	},)
// 	@IsEnum(CashFlow,)
// 	public cashFlow: CashFlow

// 	@ApiProperty({
// 		required:    false,
// 		description: 'PL',
// 	},)
// 	@IsEnum(PlType,)
// 	public pl: PlType

// 	@ApiProperty({
// 		required:    false,
// 		description: 'Annual assets',
// 	},)
// 	public annualAssets?: Array<string>

// 	@ApiProperty({
// 		required:    false,
// 		description: 'Comment',
// 	},)
// 	public comment?: string
// }
import {
	IsString,
	IsEnum,
	IsUUID,
	IsOptional,
	IsArray,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { CashFlow, PlType, } from '../settings.types'

export class CreateTransactionTypeDraftDto {
	@ApiProperty({
		required:    false,
		description: 'Transaction name',
	},)
	@IsOptional()
	@IsString()
	public name?: string

	@ApiProperty({
		required:    false,
		description: 'Transaction category',
	},)
	@IsOptional()
	@IsUUID(4,)
	public categoryId?: string

	@ApiProperty({
		required:    false,
		description: 'Cash flow',
		enum:        CashFlow,
	},)
	@IsOptional()
	@IsEnum(CashFlow,)
	public cashFlow?: CashFlow

	@ApiProperty({
		required:    false,
		description: 'PL',
		enum:        PlType,
	},)
	@IsOptional()
	@IsEnum(PlType,)
	public pl?: PlType

	@ApiProperty({
		required:    false,
		description: 'Annual assets',
		type:        [String,],
	},)
	@IsOptional()
	@IsArray()
	@IsString({ each: true, },)
	public annualAssets?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Comment',
	},)
	@IsOptional()
	@IsString()
	public comment?: string
}
