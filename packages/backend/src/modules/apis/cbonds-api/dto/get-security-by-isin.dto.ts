import {
	IsNotEmpty,
	IsString,
} from 'class-validator'

export class GetSecurityByIsinDto {
	@IsNotEmpty({
		message: 'ISIN is mantadory',
	},)
	@IsString()
	public isin!: string
}