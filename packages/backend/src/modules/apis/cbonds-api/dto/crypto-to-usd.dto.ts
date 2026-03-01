import {
	IsNotEmpty,
	IsNumber,
	IsEnum,
} from 'class-validator'
import { CryptoList, } from '@prisma/client'

export class ExchangeCryptoToUSDDto {
	@IsNotEmpty({
		message: 'Token is mantadory',
	},)
	@IsEnum(CryptoList,)
	public token!: CryptoList

	@IsNotEmpty({
		message: 'Crypto value is mantadory',
	},)
	@IsNumber()
	public cryptoAmount!: number
}