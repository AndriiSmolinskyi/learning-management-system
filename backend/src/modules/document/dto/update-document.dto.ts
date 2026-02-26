import {
	IsString,
	IsArray,
	ArrayNotEmpty,
	IsOptional,
	IsUUID,
	IsEnum,
} from 'class-validator'
import { DocumentStatus, } from '@prisma/client'

export class UpdateDocumentDto {
	@IsEnum(DocumentStatus,)
	public status!: DocumentStatus

	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {each: true,},)
	public documentsIds!: Array<string>

	@IsOptional()
	@IsString()
	public comment?: string
}