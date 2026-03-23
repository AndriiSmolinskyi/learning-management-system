import {
	IsEmail,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator'

export class CreateStudentDto {
	@IsEmail()
	public email: string

	@IsString()
	@MinLength(1,)
	public firstName: string

	@IsString()
	@MinLength(1,)
	public lastName: string

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