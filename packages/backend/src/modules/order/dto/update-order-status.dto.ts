import { IsEnum, IsInt,} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'

import { OrderStatus, } from '../order.types'

export class UpdateOrderStatusDto {
	@ApiProperty({
		required:    true,
		description: 'ID of the related request',
	},)
   @IsInt()
	public orderId: number

	@ApiProperty({
		description: 'New status of the order',
		enum:        OrderStatus,
		example:     OrderStatus.APPROVED,
	},)
	@IsEnum(OrderStatus,)
	public status!: OrderStatus
}
