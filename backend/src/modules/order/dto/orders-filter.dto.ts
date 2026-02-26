import { ApiProperty, } from '@nestjs/swagger'
import type { Order,} from '@prisma/client'
import { OrderType, Prisma,} from '@prisma/client'
import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsArray,
	ArrayNotEmpty,
	IsEnum,
	IsUUID,
	IsInt,
} from 'class-validator'
import { Transform,} from 'class-transformer'

import { OrderStatus, SortOrderFields, } from '../order.types'

export class OrderFilterDto {
	@ApiProperty({
		name:        'sortBy',
		required:    false,
		description: 'Sort by',
	},)
	@IsOptional()
	@IsEnum(SortOrderFields,)
	public sortBy?: keyof Pick<Order, 'id' | 'updatedAt'>

	@ApiProperty({
		name:        'sortOrder',
		required:    false,
		description: 'Sort order',
	},)
	@IsOptional()
	@IsEnum(Prisma.SortOrder,)
	public sortOrder?: Prisma.SortOrder

	@ApiProperty({
		name:        'search',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public search?: string

	@ApiProperty({
		name:        'type',
		required:    true,
		description: 'Order type',
	},)
	@IsOptional()
	@IsEnum(OrderType,)
	public type?: OrderType

	@ApiProperty({
		name:        'clientIds',
		required:    false,
		description: 'IDs of the clients',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public clientIds?: Array<string>

	@ApiProperty({
		name:        'portfolioIds',
		required:    false,
		description: 'IDs of the portfolios or sub-portfolios',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public portfolioIds?: Array<string>

	@ApiProperty({
		name:        'entityIds',
		required:    false,
		description: 'IDs of the entities',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public entityIds?: Array<string>

	@ApiProperty({
		name:        'bankIds',
		required:    false,
		description: 'IDs of the related banks',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public bankIds?: Array<string>

	@ApiProperty({
		name:        'bankListIds',
		required:    false,
		description: 'IDs of the banks',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public bankListIds?: Array<string>

	@ApiProperty({
		name:        'accoutIds',
		required:    false,
		description: 'IDs of the bank accounts',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public accountIds?: Array<string>

	@ApiProperty({
		name:        'assetIds',
		required:    false,
		description: 'Assets ids',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	public assetIds?: Array<string>

	@ApiProperty({
		name:        'isins',
		required:    false,
		description: 'Isins',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	public isins?: Array<string>

	@ApiProperty({
		name:        'securities',
		required:    false,
		description: 'Securities',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	public securities?: Array<string>

	@ApiProperty({
		name:        'statuses',
		required:    false,
		description: 'statuses name',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsEnum(OrderStatus, {each: true,},)
	public statuses?: Array<OrderStatus>

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
	public id?: number
}