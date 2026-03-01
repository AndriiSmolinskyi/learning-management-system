import {
	IsNotEmpty,
	IsNumber,
	IsEnum,
} from 'class-validator'
import { CurrencyDataList, } from '@prisma/client'

export class ExchangeCurrencyToUSDDto {
	@IsNotEmpty({
		message: 'Currency is mantadory',
	},)
	@IsEnum(CurrencyDataList,)
	public currency!: CurrencyDataList

	@IsNotEmpty({
		message: 'Currency value is mantadory',
	},)
	@IsNumber()
	public currencyValue!: number
}