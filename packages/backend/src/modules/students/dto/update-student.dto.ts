import {
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator'

export class UpdateStudentDto {
	@IsOptional()
	@IsString()
	@MinLength(1,)
	public firstName?: string

	@IsOptional()
	@IsString()
	@MinLength(1,)
	public lastName?: string

	@IsOptional()
	@IsString()
	public email?: string

	@IsOptional()
	@IsString()
	public phoneNumber?: string

	@IsOptional()
	@IsString()
	public country?: string

	@IsOptional()
	@IsString()
	public city?: string

	@IsOptional()
	@IsString()
	public comment?: string
}