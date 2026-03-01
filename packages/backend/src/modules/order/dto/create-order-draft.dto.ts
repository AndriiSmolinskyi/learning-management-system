import {
	IsEnum,
	ValidateNested,
	ArrayNotEmpty,
	IsOptional,
	IsPositive,
	IsInt,
	IsUUID,
} from 'class-validator'
import { Type, } from 'class-transformer'
import { ApiProperty, } from '@nestjs/swagger'
import { OrderType, } from '@prisma/client'
import { CreateOrderDraftDetailDto, } from './create-order-draft-detail.dto'

export class CreateOrderDraftDto {
	@IsOptional()
	@IsPositive()
	@IsInt()
	public requestId?: number

	@ApiProperty({
		required: false,
		type:     String,
	},)
	@IsUUID(4,)
	@IsOptional()
	public portfolioId?: string

	@ApiProperty({
		required: true,
		enum:     OrderType,
	},)
	@IsEnum(OrderType,)
	public type!: OrderType

	@ApiProperty({
		required: false,
		type:     [CreateOrderDraftDetailDto,],
	},)
	@ValidateNested({ each: true, },)
	@ArrayNotEmpty()
	@Type(() => {
		return CreateOrderDraftDetailDto
	},)
	public details!: Array<CreateOrderDraftDetailDto>
}
