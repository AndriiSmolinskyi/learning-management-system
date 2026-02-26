/* eslint-disable no-mixed-spaces-and-tabs */
import {
	IsBoolean,
} from 'class-validator'
import { Transform, } from 'class-transformer'
export class GetCategoriesFilterDto {
  @IsBoolean()
  @Transform(({ value, },) => {
  	return value === 'true'
  },)
	public isYearly!: boolean
}
