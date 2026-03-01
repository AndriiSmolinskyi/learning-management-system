import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'
import { CurrencyDataList, IsinType,} from '@prisma/client'

export class CreateIsinDto {
	@IsNotEmpty({
		message: 'ISIN is mantadory',
	},)
	@IsString()
	public name!: string

	@IsNotEmpty({
		message: 'Currency is mantadory',
	},)
	@IsString()
	@IsEnum(CurrencyDataList,)
	public currency!: CurrencyDataList

	@IsNotEmpty({
		message: 'ISIN type is optional',
	},)
	@IsString()
	@IsOptional()
	@IsEnum(IsinType,)
	public isinType?: IsinType
}