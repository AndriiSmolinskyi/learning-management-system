import { ApiProperty, } from '@nestjs/swagger'
import type { Request,} from '@prisma/client'
import { RequestType, Prisma,} from '@prisma/client'
import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsArray,
	ArrayNotEmpty,
	IsEnum,
	IsUUID,
} from 'class-validator'

import { RequestStatusType, SortRequestFields, } from '../request.types'

export class RequestFilterDto {
	@ApiProperty({
		name:        'sortBy',
		required:    false,
		description: 'Sort by',
	},)
	@IsOptional()
	@IsEnum(SortRequestFields,)
	public sortBy?: keyof Pick<Request, 'id' | 'updatedAt'>

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
		description: 'Request type',
	},)
	@IsOptional()
	@IsEnum(RequestType,)
	public type!: RequestType

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
		description: 'IDs of the related banks	',
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
		name:        'accountIds',
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
		name:        'statuses',
		required:    false,
		description: 'Asset name',
	},)
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsEnum(RequestStatusType, {each: true,},)
	public statuses?: Array<RequestStatusType>
}