import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator'

export class CurrencyAmountDto {
	@IsUUID()
	@IsNotEmpty()
	public accountId!: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public currency!: string
}