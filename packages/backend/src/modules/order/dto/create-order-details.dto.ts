import { ApiProperty, } from '@nestjs/swagger'
import {
	IsOptional,
	IsString,
} from 'class-validator'

export class CreateOrderDetailDto {
	@ApiProperty()
	@IsString()
	public security: string

	@ApiProperty()
	@IsString()
	public isin: string

	@ApiProperty()
	@IsString()
	public units: string

	@ApiProperty()
	@IsString()
	public priceType: string

	@ApiProperty()
	@IsString()
	public price: string

	@ApiProperty()
	@IsString()
	public currency: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	public unitExecuted?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	public priceExecuted?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	public yield?: string
}