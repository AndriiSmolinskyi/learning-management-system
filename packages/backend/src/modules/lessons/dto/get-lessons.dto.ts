import {
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Min,
} from 'class-validator'
import {
	Type,
} from 'class-transformer'

export enum LessonsSortBy {
	TITLE = 'title',
	COMMENT = 'comment',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class GetLessonsDto {
	@IsOptional()
	@IsString()
	public search?: string

	@IsOptional()
	@IsEnum(LessonsSortBy,)
	public sortBy?: LessonsSortBy

	@IsOptional()
	@IsEnum(SortOrder,)
	public sortOrder?: SortOrder

	@IsOptional()
	@Type(() => {
		return Number
	},)
	@IsInt()
	@Min(1,)
	public page?: number

	@IsOptional()
	@Type(() => {
		return Number
	},)
	@IsInt()
	@Min(1,)
	public pageSize?: number
}