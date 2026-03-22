import {
	IsDateString,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator'

export class CreateGroupDto {
	@IsString()
	@MinLength(1,)
	public groupName: string

	@IsString()
	@MinLength(1,)
	public courseName: string

	@IsDateString()
	public startDate: string

	@IsOptional()
	@IsString()
	public comment?: string
}