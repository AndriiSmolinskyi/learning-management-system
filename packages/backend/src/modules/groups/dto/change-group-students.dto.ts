import {
	ArrayUnique,
	IsArray,
	IsUUID,
} from 'class-validator'

export class ChangeGroupStudentsDto {
	@IsArray()
	@ArrayUnique()
	@IsUUID('4', {
		each: true,
	},)
	public studentIds: Array<string>
}