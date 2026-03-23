import {
	ArrayUnique,
	IsArray,
	IsInt,
	IsUUID,
	Min,
} from 'class-validator'

export class ChangeGroupLessonsDto {
	@IsArray()
	@ArrayUnique()
	@IsUUID('4', {
		each: true,
	},)
	public lessonIds: Array<string>

	@IsInt()
	@Min(0,)
	public activeLessons: number
}