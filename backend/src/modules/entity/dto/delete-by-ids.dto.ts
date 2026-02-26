import {
	ArrayNotEmpty,
	IsArray,
	IsUUID,
} from 'class-validator'

export class DeleteByIdsDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, {
		each: true,
	},)
	public id!: Array<string>
}