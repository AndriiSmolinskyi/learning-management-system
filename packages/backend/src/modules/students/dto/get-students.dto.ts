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

export enum StudentsSortBy {
	FIRST_NAME = 'firstName',
	LAST_NAME  = 'lastName',
	EMAIL      = 'email',
	CREATED_AT = 'createdAt',
}

export enum SortOrder {
	ASC  = 'asc',
	DESC = 'desc',
}

export class GetStudentsDto {
	@IsOptional()
	@IsString()
	public search?: string

	@IsOptional()
	@IsEnum(StudentsSortBy,)
	public sortBy?: StudentsSortBy

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