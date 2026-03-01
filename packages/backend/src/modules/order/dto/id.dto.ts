import {
	IsNotEmpty,
	IsString,
} from 'class-validator'

export class GetByIdDto {
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsString()
	public id!: string
}