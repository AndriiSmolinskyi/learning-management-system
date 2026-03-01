import { ApiProperty, } from '@nestjs/swagger'
import { Prisma, } from '@prisma/client'
import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsEnum,
	IsIn,
} from 'class-validator'

import {
	ReportCategory,
	ReportType,
	TSortReportFields,
} from '../report.types'

export class ReportFilterDto {
	@ApiProperty({
		name:        'sortBy',
		required:    false,
		description: 'Sort by',
	},)
	@IsOptional()
	@IsIn(['id', 'updatedAt', 'createdAt', 'name',],)
	public sortBy?: TSortReportFields

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
		required:    false,
		description: 'Report type',
	},)
	@IsOptional()
	@IsEnum(ReportType,)
	public type?: ReportType

	@ApiProperty({
		required:    false,
		description: 'Report category',
	},)
	@IsOptional()
	@IsEnum(ReportCategory,)
	public category?: ReportCategory
}