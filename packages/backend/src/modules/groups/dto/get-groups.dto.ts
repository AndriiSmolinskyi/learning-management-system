import {
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator'
import {
	Type,
} from 'class-transformer'

export enum GroupsSortBy {
	GROUP_NAME = 'groupName',
	COURSE_NAME = 'courseName',
	START_DATE = 'startDate',
	CREATED_AT = 'createdAt',
}

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class GetGroupsDto {
	@IsOptional()
	@IsString()
	public search?: string

	@IsOptional()
	@IsEnum(GroupsSortBy,)
	public sortBy?: GroupsSortBy

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
	@Max(100,)
	public pageSize?: number
}