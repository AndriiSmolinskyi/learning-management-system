import {
	IsNotEmpty,
	IsNumber,
	IsEnum,
} from 'class-validator'
import { CryptoList, MetalDataList, } from '@prisma/client'

export class ExchangeMetalToUSDDto {
	@IsNotEmpty({
		message: 'Token is mantadory',
	},)
	@IsEnum(CryptoList,)
	public metalType!: MetalDataList

	@IsNotEmpty({
		message: 'Metal value is mantadory',
	},)
	@IsNumber()
	public units!: number
}