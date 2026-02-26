import {
	IsOptional,
	IsUUID,
	IsEnum,
	IsArray,
	IsNotEmpty,
	IsString,
	IsPositive,
	IsInt,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import {
	ReportType,
	ReportCategory,
} from '../report.types'

export class CreateReportDto {
	@ApiProperty({
		required:    true,
		description: 'Report type',
		enum:        ReportType,
	},)
	@IsEnum(ReportType,)
	public type!: ReportType

	@ApiProperty({
		required:    true,
		description: 'Report category',
	},)
	@IsEnum(ReportCategory,)
	public category!: ReportCategory

	@ApiProperty({
		required:    false,
		description: 'ID of the related client',
	},)
	@IsOptional()
	@IsUUID(4,)
	public clientId?: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related portfolio or sub-portfolio',
	},)
	@IsOptional()
	@IsUUID(4,)
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'Array of ISINs',
	},)
	@IsOptional()
	@IsArray()
	@IsNotEmpty({
		each: true,
	},)
	public isins?: Array<string>

	@ApiProperty({
		required:    false,
		description: 'Report`s author',
	},)
	@IsOptional()
	@IsString()
	public createdBy?: string

	@ApiProperty({
		required:    true,
		description: 'Report`s name',
	},)
	@IsString()
	public name!: string

	@ApiProperty({
		required:    false,
		description: 'ID of the related report draft',
	},)
	@IsOptional()
	@IsPositive()
	@IsInt()
	public reportDraftId?: number

	@ApiProperty({
		required:    false,
		description: 'Report payload',
	},)
	@IsString()
	@IsOptional()
	public payload?: string
}