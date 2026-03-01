import {
	IsOptional,
	IsUUID,
} from 'class-validator'

export class GetCashCurrenciesDto {
	@IsOptional()
	@IsUUID(4,)
	public accountId?: string
}