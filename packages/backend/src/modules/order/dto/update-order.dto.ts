import { ApiProperty, } from '@nestjs/swagger'
import {
	IsEnum,
	IsString,
	ValidateNested,
	IsOptional,
	IsInt,
} from 'class-validator'
import { Type, Transform,} from 'class-transformer'
import { OrderType, } from '@prisma/client'

export class UpdateOrderDetailDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	public id?: string

	@ApiProperty()
	@IsString()
	public security!: string

	@ApiProperty()
	@IsString()
	public isin!: string

	@ApiProperty()
	@IsString()
	public units!: string

	@ApiProperty()
	@IsString()
	public priceType!: string

	@ApiProperty()
	@IsString()
	public price!: string

	@ApiProperty()
	@IsString()
	public currency!: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	public unitExecuted?: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	public priceExecuted?: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	public yield?: string
}

export class UpdateOrderDto {
	@ApiProperty({
		required:    false,
		description: 'ID of the related request',
	},)
   @IsOptional()
	@Transform(({ value, },) => {
		return (value ?
			parseInt(value,) :
			undefined)
	},)
   @IsInt()
	public id: number

	@ApiProperty({
		description: 'Type of the order',
		enum:        OrderType,
	},)
	@IsEnum(OrderType,)
	public type!: OrderType

	@ApiProperty({
		description: 'Array of updated order details',
		type:        [UpdateOrderDetailDto,],
	},)
	@ValidateNested({ each: true, },)
	@Type(() => {
		return UpdateOrderDetailDto
	},)
	public details!: Array<UpdateOrderDetailDto>
}
