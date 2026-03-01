import {
	IsNotEmpty,
	IsUUID,
} from 'class-validator'

export class GetByIdDto {
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public id!: string
}