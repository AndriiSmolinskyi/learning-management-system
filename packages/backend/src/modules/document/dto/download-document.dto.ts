import { ApiProperty, } from '@nestjs/swagger'
import {
	IsString,
} from 'class-validator'

export class DownloadDocumentDto {
	@ApiProperty({
		required:    true,
		description: 'Document storage name',
	},)
	@IsString()
	public storageName!:string
}