import {
	IsUUID,
} from 'class-validator'

export class TokenDto {
	@IsUUID(4,)
	public token!: string
}