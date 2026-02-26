import {
	IsString,
	IsOptional,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'

export class CreateOrderDraftDetailDto {
	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public security?: string

	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public isin?: string

	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public units?: string

	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public priceType?: string

	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public price?: string

	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 10,
	},)
	@IsString()
	@IsOptional()
	public currency?: string

	@ApiProperty({
		required:  false,
		type:      String,
		default:   '0',
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public unitExecuted?: string

	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public priceExecuted?: string

	@ApiProperty({
		required:  false,
		type:      String,
		maxLength: 50,
	},)
	@IsString()
	@IsOptional()
	public yield?: string
}
