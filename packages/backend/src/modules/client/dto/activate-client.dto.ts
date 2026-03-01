import {
	IsBoolean,
} from 'class-validator'

export class ActivateClientDto {
	@IsBoolean()
	public isActivated!: boolean
}