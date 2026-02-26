import {
	IsEnum,
	IsOptional,
	IsUUID,
	IsArray,
	ValidateNested,
	ArrayNotEmpty,
} from 'class-validator'
import { Type, } from 'class-transformer'
import { ApiProperty, } from '@nestjs/swagger'
import { OrderType, } from '@prisma/client'
import { CreateOrderDraftDetailDto, } from './create-order-draft-detail.dto'

export class UpdateOrderDraftDetailDto extends CreateOrderDraftDetailDto {
	@ApiProperty({
		required:    false,
		description: 'ID of the order draft detail to update. If not provided, a new one will be created.',
	},)
	@IsUUID(4,)
	@IsOptional()
	public id?: string
}

export class UpdateOrderDraftDto {
	@ApiProperty({
		required: true,
		enum:     OrderType,
	},)
	@IsEnum(OrderType,)
	public type!: OrderType

	@ApiProperty({
		required: false,
		type:     [UpdateOrderDraftDetailDto,],
	},)
	@IsArray()
	@ValidateNested({ each: true, },)
	@ArrayNotEmpty()
	@Type(() => {
		return UpdateOrderDraftDetailDto
	},)
	public details!: Array<UpdateOrderDraftDetailDto>
}
