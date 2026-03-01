import {
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator'

export class AddEntityDocumentDto {
	@IsString()
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public id!: string

	@IsString()
	@IsNotEmpty()
	public type!: string
}