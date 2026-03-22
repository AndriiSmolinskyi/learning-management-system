import {
	IsDateString,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator'

export class UpdateGroupDto {
	@IsOptional()
	@IsString()
	@MinLength(1,)
	public groupName?: string

	@IsOptional()
	@IsString()
	@MinLength(1,)
	public courseName?: string

	@IsOptional()
	@IsDateString()
	public startDate?: string

	@IsOptional()
	@IsString()
	public comment?: string
}