import {
	IsOptional,
	IsUUID,
} from 'class-validator'

export class GetExpenseCategoriesDto {
	@IsOptional()
	@IsUUID(4,)
	public clientId!: string
}