import { CurrencyDataList, } from '@prisma/client'
import {
	IsEnum,
	IsOptional,
	IsUUID,
} from 'class-validator'

export class GetEmissionsDto {
	@IsOptional()
	@IsUUID(4,)
	@IsEnum(CurrencyDataList,)
	public currency?: CurrencyDataList
}