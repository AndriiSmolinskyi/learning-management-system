import { IsEnum, IsOptional, } from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { OrderType, } from '@prisma/client'
import { OrderStatus, } from '../order.types'
import { Type, } from 'class-transformer'
import {
	ValidateNested,
	IsPositive,
	IsUUID,
	IsInt,
} from 'class-validator'
import { CreateOrderDetailDto, } from './create-order-details.dto'

export class CreateOrderDto {
	@ApiProperty({
		required:    true,
		description: 'Order type',
		enum:        OrderType,
	},)
	@IsEnum(OrderType,)
	public type!: OrderType

	@ApiProperty()
	@IsPositive()
	@IsInt()
	public requestId: number

	@ApiProperty()
	@IsUUID()
	public portfolioId: string

	@ApiProperty({
		required:    false,
		description: 'Status of the order',
		enum:        OrderStatus,
		default:     OrderStatus.IN_PROGRESS,
	},)
	@IsEnum(OrderStatus,)
	@IsOptional()
	public status?: OrderStatus = OrderStatus.IN_PROGRESS

	@ApiProperty({
		type:        [CreateOrderDetailDto,],
		description: 'Array of order details',
	},)
	@ValidateNested({ each: true, },)
	@Type(() => {
		return CreateOrderDetailDto
	},)
	public details: Array<CreateOrderDetailDto> = []
}
