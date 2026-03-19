import {
	IsObject,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'
import {
	Prisma,
} from '@prisma/client'

export class CreateLessonDto {
	@IsString()
	@MinLength(1,)
	@MaxLength(150,)
	public title: string

	@IsOptional()
	@IsString()
	@MaxLength(500,)
	public comment?: string

	@IsOptional()
	@IsObject()
	public payload?: Prisma.InputJsonObject
}